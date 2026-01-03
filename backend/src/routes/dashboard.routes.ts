import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/analytics', getDashboardAnalytics);

export default router;

