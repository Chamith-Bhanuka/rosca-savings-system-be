import express from 'express';
import {
  contactSupport,
  subscribeNewsletter,
  sendBroadcast,
} from '../controllers/support.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/contact', contactSupport);
router.post('/subscribe', subscribeNewsletter);
router.post('/broadcast', authenticate, sendBroadcast);

export default router;
