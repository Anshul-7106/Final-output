import express from 'express';
import {
  getCourses,
  getCourse,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadThumbnail,
  addLesson,
  uploadLessonVideo,
  deleteLesson,
  enrollCourse,
  addReview,
  getEnrolledCourses
} from '../controllers/courseController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorize, isInstructorOrAdmin } from '../middleware/role.js';
import { uploadImage, uploadVideo } from '../config/multer.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/slug/:slug', getCourseBySlug);

// Protected routes
router.get('/enrolled', protect, getEnrolledCourses);
router.get('/:id', optionalAuth, getCourse);
router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/reviews', protect, addReview);

// Instructor/Admin routes
router.post('/', protect, isInstructorOrAdmin, createCourse);
router.put('/:id', protect, isInstructorOrAdmin, updateCourse);
router.delete('/:id', protect, isInstructorOrAdmin, deleteCourse);
router.post('/:id/thumbnail', protect, isInstructorOrAdmin, uploadImage.single('thumbnail'), uploadThumbnail);
router.post('/:id/lessons', protect, isInstructorOrAdmin, addLesson);
router.post('/:id/lessons/:lessonId/video', protect, isInstructorOrAdmin, uploadVideo.single('video'), uploadLessonVideo);
router.delete('/:id/lessons/:lessonId', protect, isInstructorOrAdmin, deleteLesson);

export default router;
