import { Router } from 'express';
import {
  register,
  login,
  getMe,
  refreshToken,
  logout,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);

router.post('/login', login);

// Protected Route
router.get('/me', authenticate, getMe);

router.post('/logout', authenticate, logout);

router.post('/refresh', refreshToken);
export default router;
