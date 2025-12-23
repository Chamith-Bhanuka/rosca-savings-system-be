import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { listNotifications } from '../controllers/notification.controller';

const router = Router();

router.get('/', authenticate, listNotifications);

export default router;
