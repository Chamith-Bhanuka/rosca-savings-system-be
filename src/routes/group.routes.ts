import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createGroup } from '../controllers/group.controller';

const router = Router();

router.post('/create', authenticate, createGroup);

export default router;
