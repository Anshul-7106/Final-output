import api from './api';

const paymentService = {
  // Create Razorpay order
  createOrder: async (courseId) => {
    const response = await api.post('/api/payments/create-order', { courseId });
    return response.data;
  },

  // Verify payment after Razorpay callback
  verifyPayment: async (paymentData) => {
    const response = await api.post('/api/payments/verify-payment', paymentData);
    return response.data;
  },

  // Get user's purchase history
  getPurchases: async () => {
    const response = await api.get('/api/payments/my-purchases');
    return response.data;
  },

  // Get payment details
  getPayment: async (paymentId) => {
    const response = await api.get(`/api/payments/${paymentId}`);
    return response.data;
  },

  // Initialize Razorpay checkout
  initializeRazorpay: (options) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
      document.body.appendChild(script);
    });
  },

  // Open Razorpay checkout
  openCheckout: async (orderData, userInfo, onSuccess, onError) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Encore Ascend',
      description: orderData.description || 'Course Purchase',
      order_id: orderData.orderId,
      prefill: {
        name: userInfo.name || '',
        email: userInfo.email || '',
        contact: userInfo.phone || ''
      },
      theme: {
        color: '#EAB308'
      },
      handler: async function (response) {
        try {
          const verifyData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            courseId: orderData.courseId
          };
          const result = await paymentService.verifyPayment(verifyData);
          onSuccess(result);
        } catch (error) {
          onError(error);
        }
      },
      modal: {
        ondismiss: function () {
          onError(new Error('Payment cancelled by user'));
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }
};

export default paymentService;
