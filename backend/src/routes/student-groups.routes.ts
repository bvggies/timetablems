import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import * as studentGroupsController from '../controllers/student-groups.controller';

const router = Router();

router.use(authenticate);

router.post('/groups', requireRole(['ADMIN', 'LECTURER']), studentGroupsController.createGroup);
router.get('/groups', studentGroupsController.getGroups);
router.get('/groups/:groupId/timetable', studentGroupsController.getGroupTimetable);
router.post('/groups/:groupId/members', requireRole(['ADMIN', 'LECTURER']), studentGroupsController.addMember);
router.delete('/groups/:groupId/members/:studentId', requireRole(['ADMIN', 'LECTURER']), studentGroupsController.removeMember);

export default router;

