import { authenticate } from '../middleware/auth.middleware';
import {
  deleteAccount,
  getWalletData,
  updateProfile,
} from '../controllers/user.controller';
import router from './payment.routes';
import { getDashboardData } from '../controllers/dashboard.controller';
import { getUserAnalytics } from '../controllers/analytics.controller';
import { upload } from '../middleware/upload.middleware';

router.get('/wallet', authenticate, getWalletData);

router.get('/dashboard', authenticate, getDashboardData);

router.get('/analytics', authenticate, getUserAnalytics);

router.put('/profile', authenticate, upload.single('image'), updateProfile);

router.delete('/profile', authenticate, deleteAccount);

export default router;
