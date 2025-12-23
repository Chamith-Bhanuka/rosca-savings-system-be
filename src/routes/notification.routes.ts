import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  listNotifications,
  markRead,
} from '../controllers/notification.controller';

const router = Router();

router.get('/', authenticate, listNotifications);

router.patch('/:id/read', authenticate, markRead);

export default router;
