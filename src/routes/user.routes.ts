import { authenticate } from '../middleware/auth.middleware';
import { getWalletData } from '../controllers/user.controller';
import router from './payment.routes';
import { getDashboardData } from '../controllers/dashboard.controller';
import { getUserAnalytics } from '../controllers/analytics.controller';

router.get('/wallet', authenticate, getWalletData);

router.get('/dashboard', authenticate, getDashboardData);

router.get('/analytics', authenticate, getUserAnalytics);

export default router;
