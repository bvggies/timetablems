import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import * as adminToolsController from '../controllers/admin-tools.controller';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/health', adminToolsController.getSystemHealth);
router.get('/activity', adminToolsController.getActivityLogs);
router.get('/stats', adminToolsController.getSystemStats);

export default router;

