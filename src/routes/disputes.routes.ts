import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAllDisputes,
  getMyDisputes,
  raiseDispute,
  resolveDispute,
} from '../controllers/dispute.controller';
import { authorizeRoles } from '../middleware/role.middleware';
import { Role } from '../model/user.model';

const router = Router();

router.post('/', authenticate, upload.single('image'), raiseDispute);

router.get('/', authenticate, getMyDisputes);

router.put(
  '/resolve',
  authenticate,
  authorizeRoles(Role.Admin),
  resolveDispute
);

router.get(
  '/admin/all',
  authenticate,
  authorizeRoles(Role.Admin),
  getAllDisputes
);

export default router;
