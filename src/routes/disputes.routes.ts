import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { raiseDispute } from '../controllers/dispute.controller';

const router = Router();

router.post('/', authenticate, upload.single('image'), raiseDispute);

export default router;
