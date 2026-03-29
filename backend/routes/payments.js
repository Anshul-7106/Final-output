import express from 'express';
import {
  createOrder,
  verifyPayment,
  getMyPurchases,
  getPayment,
  getAllPayments,
  webhookHandler
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

// Webhook route (must be before protect middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// Protected routes
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-purchases', protect, getMyPurchases);
router.get('/:id', protect, getPayment);

// Admin routes
router.get('/', protect, isAdmin, getAllPayments);

export default router;
