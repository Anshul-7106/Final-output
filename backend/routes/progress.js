import express from 'express';
import {
  getCourseProgress,
  markLessonComplete,
  updateWatchTime,
  getAllProgress,
  getCertificates,
  getCertificate,
  verifyCertificate
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes (for certificate verification)
router.get('/certificates/verify/:certificateId', verifyCertificate);

// Protected routes
router.get('/', protect, getAllProgress);
router.get('/certificates', protect, getCertificates);
router.get('/certificates/:id', getCertificate); // Public for verification
router.get('/:courseId', protect, getCourseProgress);
router.post('/:courseId/lessons/:lessonId/complete', protect, markLessonComplete);
router.put('/:courseId/lessons/:lessonId/watch-time', protect, updateWatchTime);

export default router;
