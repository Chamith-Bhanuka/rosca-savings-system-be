import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  confirmStripePayment,
  createPaymentIntent,
  getContributions,
} from '../controllers/payment.controller';

const router = Router();

router.post('/create-intent', authenticate, createPaymentIntent);

router.post('/confirm', authenticate, confirmStripePayment);

router.get('/:groupId/contributions/:cycle', authenticate, getContributions);

export default router;
