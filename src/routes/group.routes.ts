import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  acceptJoinRequest,
  createGroup,
  declineJoinRequest,
  getAllGroups,
  getGroupDetails,
  joinGroup,
  triggerManualDraw,
} from '../controllers/group.controller';
import { authorizeRoles } from '../middleware/role.middleware';
import { Role } from '../model/user.model';

const router = Router();

router.post('/create', authenticate, createGroup);

router.get('/', authenticate, getAllGroups);

router.get('/:groupId', authenticate, getGroupDetails);

router.post('/:groupId/join', authenticate, joinGroup);

router.post(
  '/:groupId/pending/:userId/accept',
  authenticate,
  authorizeRoles(Role.Moderator),
  acceptJoinRequest
);

router.post(
  '/:groupId/pending/:userId/decline',
  authenticate,
  authorizeRoles(Role.Moderator),
  declineJoinRequest
);

router.post(
  '/:groupId/draw',
  authenticate,
  authorizeRoles(Role.Moderator),
  triggerManualDraw
);

export default router;
