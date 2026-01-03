import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import * as adminToolsController from '../controllers/admin-tools.controller';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/health', adminToolsController.getSystemHealth);
router.get('/activity', adminToolsController.getActivityLogs);
router.get('/stats', adminToolsController.getSystemStats);

export default router;
