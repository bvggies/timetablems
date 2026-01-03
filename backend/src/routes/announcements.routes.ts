import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import * as announcementsController from '../controllers/announcements.controller';

const router = Router();

router.use(authenticate);

router.post('/', requireAdmin, announcementsController.createAnnouncement);
router.get('/', announcementsController.getAnnouncements);
router.put('/:id', requireAdmin, announcementsController.updateAnnouncement);
router.delete('/:id', requireAdmin, announcementsController.deleteAnnouncement);

export default router;
