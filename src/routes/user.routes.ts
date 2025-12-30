import { authenticate } from '../middleware/auth.middleware';
import { getWalletData } from '../controllers/user.controller';
import router from './payment.routes';

router.get('/wallet', authenticate, getWalletData);

export default router;
