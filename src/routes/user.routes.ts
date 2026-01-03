import { authenticate } from '../middleware/auth.middleware';
import {
  deleteAccount,
  getWalletData,
  updateProfile,
} from '../controllers/user.controller';
import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller';
import { getUserAnalytics } from '../controllers/analytics.controller';
import { upload } from '../middleware/upload.middleware';
import { getLeaderboard } from '../controllers/leaderboard.controller';
import { getTrustProfile } from '../controllers/trust.controller';

const router = Router();

router.get('/wallet', authenticate, getWalletData);

router.get('/dashboard', authenticate, getDashboardData);

router.get('/analytics', authenticate, getUserAnalytics);

router.put('/profile', authenticate, upload.single('image'), updateProfile);

router.delete('/profile', authenticate, deleteAccount);

router.get('/leaderboard', authenticate, getLeaderboard);

router.get('/trust-profile', authenticate, getTrustProfile);

export default router;
