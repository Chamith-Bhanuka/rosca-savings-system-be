import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  confirmStripePayment,
  createPaymentIntent,
  getContributions,
  releasePayout,
} from '../controllers/payment.controller';
import { authorizeRoles } from '../middleware/role.middleware';
import { Role } from '../model/user.model';

const router = Router();

router.post('/create-intent', authenticate, createPaymentIntent);

router.post('/confirm', authenticate, confirmStripePayment);

router.get('/:groupId/contributions/:cycle', authenticate, getContributions);

router.post(
  '/payout/release',
  authenticate,
  authorizeRoles(Role.Moderator),
  releasePayout
);

export default router;
