import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  getMyDisputes,
  raiseDispute,
  resolveDispute,
} from '../controllers/dispute.controller';

const router = Router();

router.post('/', authenticate, upload.single('image'), raiseDispute);

router.get('/', authenticate, getMyDisputes);

router.put('/resolve', authenticate, resolveDispute);

export default router;
