import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import * as integrationsController from '../controllers/integrations.controller';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/status', integrationsController.getIntegrationStatus);
router.post('/lms/sync', integrationsController.syncLMS);
router.post('/sis/sync', integrationsController.syncSIS);
router.post('/configure', integrationsController.configureIntegration);

export default router;

