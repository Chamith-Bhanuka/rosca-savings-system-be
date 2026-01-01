import { authenticate } from '../middleware/auth.middleware';
import { getWalletData, updateProfile } from '../controllers/user.controller';
import router from './payment.routes';
import { getDashboardData } from '../controllers/dashboard.controller';
import { getUserAnalytics } from '../controllers/analytics.controller';
import { upload } from '../middleware/upload.middleware';

router.get('/wallet', authenticate, getWalletData);

router.get('/dashboard', authenticate, getDashboardData);

router.get('/analytics', authenticate, getUserAnalytics);

router.put('/profile', authenticate, upload.single('image'), updateProfile);

export default router;
