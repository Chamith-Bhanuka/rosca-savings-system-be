import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createGroup, getAllGroups } from '../controllers/group.controller';

const router = Router();

router.post('/create', authenticate, createGroup);

router.get('/', getAllGroups);

export default router;
