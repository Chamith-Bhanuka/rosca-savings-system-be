import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  acceptJoinRequest,
  createGroup,
  declineJoinRequest,
  getAllGroups,
  joinGroup,
  getGroupDetails,
  triggerManualDraw,
} from '../controllers/group.controller';

const router = Router();

router.post('/create', authenticate, createGroup);

router.get('/', authenticate, getAllGroups);

router.get('/:groupId', authenticate, getGroupDetails);

router.post('/:groupId/join', authenticate, joinGroup);

router.post(
  '/:groupId/pending/:userId/accept',
  authenticate,
  acceptJoinRequest
);

router.post(
  '/:groupId/pending/:userId/decline',
  authenticate,
  declineJoinRequest
);

router.post('/:groupId/draw', authenticate, triggerManualDraw);

export default router;
