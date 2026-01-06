import express from 'express';
import {
  contactSupport,
  subscribeNewsletter,
  sendBroadcast,
} from '../controllers/support.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { Role } from '../model/user.model';

const router = express.Router();

router.post('/contact', contactSupport);
router.post('/subscribe', subscribeNewsletter);
router.post(
  '/broadcast',
  authenticate,
  authorizeRoles(Role.Admin),
  sendBroadcast
);

export default router;
