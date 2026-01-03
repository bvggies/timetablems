import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import * as announcementsController from '../controllers/announcements.controller';

const router = Router();

router.use(authenticate);

router.post('/', requireRole(['ADMIN']), announcementsController.createAnnouncement);
router.get('/', announcementsController.getAnnouncements);
router.put('/:id', requireRole(['ADMIN']), announcementsController.updateAnnouncement);
router.delete('/:id', requireRole(['ADMIN']), announcementsController.deleteAnnouncement);

export default router;

