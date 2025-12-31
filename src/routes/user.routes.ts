import { authenticate } from '../middleware/auth.middleware';
import { getWalletData } from '../controllers/user.controller';
import router from './payment.routes';
import { getDashboardData } from '../controllers/dashboard.controller';

router.get('/wallet', authenticate, getWalletData);

router.get('/dashboard', authenticate, getDashboardData);

export default router;
