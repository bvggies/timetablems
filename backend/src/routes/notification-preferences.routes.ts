import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as notificationPreferencesController from '../controllers/notification-preferences.controller';

const router = Router();

router.use(authenticate);

router.get('/preferences', notificationPreferencesController.getPreferences);
router.put('/preferences', notificationPreferencesController.updatePreferences);

export default router;


