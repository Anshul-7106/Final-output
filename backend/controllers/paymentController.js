import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';

// Initialize Razorpay only if keys are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id') {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please contact admin.'
      });
    }

    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const user = await User.findById(req.user._id);
    const isEnrolled = user.enrolledCourses.some(
      ec => ec.course.toString() === course._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Calculate amount (use discount price if available)
    const amount = (course.discountPrice || course.price) * 100; // Razorpay expects amount in paise

    // Create Razorpay order
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: course._id.toString(),
        userId: req.user._id.toString(),
        courseTitle: course.title
      }
    };

    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = await Payment.create({
      user: req.user._id,
      course: course._id,
      razorpayOrderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      status: 'created'
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        course: {
          id: course._id,
          title: course.title,
          thumbnail: course.thumbnail
        },
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order'
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'failed';
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update payment record
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'completed';
    await payment.save();

    // Enroll user in course
    const user = await User.findById(payment.user);
    const course = await Course.findById(payment.course);

    // Check if already enrolled (edge case)
    const isEnrolled = user.enrolledCourses.some(
      ec => ec.course.toString() === course._id.toString()
    );

    if (!isEnrolled) {
      user.enrolledCourses.push({ course: course._id });
      await user.save();

      // Update course enrollment count
      course.enrolledStudents += 1;
      await course.save();

      // Create progress record
      await Progress.create({
        user: user._id,
        course: course._id,
        totalLessons: course.lessons.length,
        lessonsProgress: course.lessons.map(lesson => ({
          lessonId: lesson._id,
          isCompleted: false,
          watchedDuration: 0
        }))
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: payment._id,
        courseId: course._id,
        courseTitle: course.title
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
};

// @desc    Get my purchases
// @route   GET /api/payments/my-purchases
// @access  Private
export const getMyPurchases = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
      status: 'completed'
    })
      .populate('course', 'title thumbnail slug instructor')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: { purchases: payments }
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchases'
    });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('course', 'title thumbnail')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check ownership (unless admin)
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment'
    });
  }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
// @access  Private (Admin)
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find(query)
      .populate('course', 'title')
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    // Calculate totals
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments'
    });
  }
};

// @desc    Razorpay webhook handler
// @route   POST /api/payments/webhook
// @access  Public
export const webhookHandler = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
      case 'payment.captured':
        // Payment was successful
        const paymentEntity = payload.payment.entity;
        await Payment.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          {
            razorpayPaymentId: paymentEntity.id,
            status: 'completed',
            paymentMethod: paymentEntity.method
          }
        );
        break;

      case 'payment.failed':
        // Payment failed
        const failedPayment = payload.payment.entity;
        await Payment.findOneAndUpdate(
          { razorpayOrderId: failedPayment.order_id },
          { status: 'failed' }
        );
        break;

      case 'refund.created':
        // Refund was created
        const refund = payload.refund.entity;
        await Payment.findOneAndUpdate(
          { razorpayPaymentId: refund.payment_id },
          {
            status: 'refunded',
            refundId: refund.id,
            refundAmount: refund.amount / 100
          }
        );
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

export default {
  createOrder,
  verifyPayment,
  getMyPurchases,
  getPayment,
  getAllPayments,
  webhookHandler
};
