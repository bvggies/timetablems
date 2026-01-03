import { Router } from 'express';
import {
  getTimetable,
  createSession,
  updateSession,
  deleteSession,
  generateTimetableHandler,
  publishTimetable,
  checkSessionConflicts,
  getNextClass,
  getTimetableVersions,
  rollbackTimetable,
} from '../controllers/timetable.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireLecturer } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getTimetable);
router.get('/next-class', authenticate, getNextClass);
router.get('/versions', authenticate, requireAdmin, getTimetableVersions);
router.post('/rollback', authenticate, requireAdmin, rollbackTimetable);
// Allow lecturers to create/update/delete their own sessions
router.post('/sessions', authenticate, requireLecturer, createSession);
router.put('/sessions/:id', authenticate, requireLecturer, updateSession);
router.delete('/sessions/:id', authenticate, requireLecturer, deleteSession);
// Admin-only routes
router.post('/generate', authenticate, requireAdmin, generateTimetableHandler);
router.post('/publish', authenticate, requireAdmin, publishTimetable);
router.post('/check-conflicts', authenticate, requireLecturer, checkSessionConflicts);

export default router;
