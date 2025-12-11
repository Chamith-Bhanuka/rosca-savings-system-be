import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createGroup,
  getAllGroups,
  joinGroup,
} from '../controllers/group.controller';

const router = Router();

router.post('/create', authenticate, createGroup);

router.get('/', getAllGroups);

router.post('/:groupId/join', authenticate, joinGroup);

export default router;
