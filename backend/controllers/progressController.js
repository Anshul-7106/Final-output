import Progress from '../models/Progress.js';
import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Get course progress
// @route   GET /api/progress/:courseId
// @access  Private
export const getCourseProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    }).populate('course', 'title lessons');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found. Are you enrolled in this course?'
      });
    }

    res.status(200).json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress'
    });
  }
};

// @desc    Mark lesson as completed
// @route   POST /api/progress/:courseId/lessons/:lessonId/complete
// @access  Private
export const markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { watchedDuration } = req.body;

    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found. Are you enrolled in this course?'
      });
    }

    // Find the lesson progress
    const lessonProgress = progress.lessonsProgress.find(
      lp => lp.lessonId.toString() === lessonId
    );

    if (!lessonProgress) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found in progress'
      });
    }

    // Update lesson progress
    if (!lessonProgress.isCompleted) {
      lessonProgress.isCompleted = true;
      lessonProgress.lastWatchedAt = new Date();
      progress.completedLessons += 1;
    }

    if (watchedDuration) {
      lessonProgress.watchedDuration = watchedDuration;
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    // Check if course is completed and issue certificate
    let certificate = null;
    if (progress.isCompleted) {
      // Check if certificate already exists
      const existingCert = await Certificate.findOne({
        user: req.user._id,
        course: courseId
      });

      if (!existingCert) {
        certificate = await Certificate.create({
          user: req.user._id,
          course: courseId,
          completionDate: progress.completedAt
        });
      } else {
        certificate = existingCert;
      }
    }

    res.status(200).json({
      success: true,
      message: lessonProgress.isCompleted ? 'Lesson marked as complete' : 'Progress updated',
      data: {
        progress: {
          completedLessons: progress.completedLessons,
          totalLessons: progress.totalLessons,
          percentageComplete: progress.percentageComplete,
          isCompleted: progress.isCompleted
        },
        certificate: certificate ? {
          id: certificate._id,
          certificateId: certificate.certificateId
        } : null
      }
    });
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress'
    });
  }
};

// @desc    Update lesson watch time
// @route   PUT /api/progress/:courseId/lessons/:lessonId/watch-time
// @access  Private
export const updateWatchTime = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { watchedDuration } = req.body;

    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    const lessonProgress = progress.lessonsProgress.find(
      lp => lp.lessonId.toString() === lessonId
    );

    if (lessonProgress) {
      lessonProgress.watchedDuration = watchedDuration;
      lessonProgress.lastWatchedAt = new Date();
      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: 'Watch time updated'
    });
  } catch (error) {
    console.error('Update watch time error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating watch time'
    });
  }
};

// @desc    Get all progress for user
// @route   GET /api/progress
// @access  Private
export const getAllProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({ user: req.user._id })
      .populate('course', 'title thumbnail slug')
      .sort('-lastAccessedAt');

    res.status(200).json({
      success: true,
      data: { progress: progressList }
    });
  } catch (error) {
    console.error('Get all progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress'
    });
  }
};

// @desc    Get certificates
// @route   GET /api/certificates
// @access  Private
export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate('course', 'title thumbnail instructor')
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' }
      })
      .sort('-issueDate');

    res.status(200).json({
      success: true,
      data: { certificates }
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates'
    });
  }
};

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Public (for verification)
export const getCertificate = async (req, res) => {
  try {
    // Support lookup by _id or certificateId
    const query = req.params.id.startsWith('CERT-')
      ? { certificateId: req.params.id }
      : { _id: req.params.id };

    const certificate = await Certificate.findOne(query)
      .populate('user', 'name email')
      .populate({
        path: 'course',
        select: 'title instructor',
        populate: { path: 'instructor', select: 'name' }
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { certificate }
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate'
    });
  }
};

// @desc    Verify certificate (public)
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
export const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId
    })
      .populate('user', 'name')
      .populate({
        path: 'course',
        select: 'title instructor',
        populate: { path: 'instructor', select: 'name' }
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Certificate not found or invalid'
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      data: {
        certificateId: certificate.certificateId,
        recipientName: certificate.user.name,
        courseName: certificate.course.title,
        instructorName: certificate.course.instructor.name,
        issueDate: certificate.issueDate,
        completionDate: certificate.completionDate
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying certificate'
    });
  }
};

export default {
  getCourseProgress,
  markLessonComplete,
  updateWatchTime,
  getAllProgress,
  getCertificates,
  getCertificate,
  verifyCertificate
};
