import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  submitManualPayment,
  verifyPayment,
} from '../controllers/contribution.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.post(
  '/manual',
  authenticate,
  upload.single('image'),
  submitManualPayment
);

router.post('/verify/:contributionId', authenticate, verifyPayment);

export default router;
