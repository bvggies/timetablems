import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireLecturer } from '../middleware/rbac';
import * as studentGroupsController from '../controllers/student-groups.controller';

const router = Router();

router.use(authenticate);

router.post('/groups', requireLecturer, studentGroupsController.createGroup);
router.get('/groups', studentGroupsController.getGroups);
router.get('/groups/:groupId/timetable', studentGroupsController.getGroupTimetable);
router.post('/groups/:groupId/members', requireLecturer, studentGroupsController.addMember);
router.delete('/groups/:groupId/members/:studentId', requireLecturer, studentGroupsController.removeMember);

export default router;

