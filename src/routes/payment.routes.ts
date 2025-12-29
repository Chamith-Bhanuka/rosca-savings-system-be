import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  confirmStripePayment,
  createPaymentIntent,
  getContributions,
  releasePayout,
} from '../controllers/payment.controller';

const router = Router();

router.post('/create-intent', authenticate, createPaymentIntent);

router.post('/confirm', authenticate, confirmStripePayment);

router.get('/:groupId/contributions/:cycle', authenticate, getContributions);

router.post('/payout/release', authenticate, releasePayout);

export default router;
