import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { submitManualPayment } from '../controllers/contribution.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.post(
  '/manual',
  authenticate,
  upload.single('image'),
  submitManualPayment
);

export default router;
