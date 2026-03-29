import express from 'express';
import {
  getDashboardStats,
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getCourses,
  toggleCoursePublish,
  toggleCourseFeatured
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

// All routes require admin role
router.use(protect);
router.use(isAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Users management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Courses management
router.get('/courses', getCourses);
router.put('/courses/:id/publish', toggleCoursePublish);
router.put('/courses/:id/featured', toggleCourseFeatured);

export default router;
