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
} from '../controllers/timetable.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getTimetable);
router.get('/next-class', authenticate, getNextClass);
router.post('/sessions', authenticate, requireAdmin, createSession);
router.put('/sessions/:id', authenticate, requireAdmin, updateSession);
router.delete('/sessions/:id', authenticate, requireAdmin, deleteSession);
router.post('/generate', authenticate, requireAdmin, generateTimetableHandler);
router.post('/publish', authenticate, requireAdmin, publishTimetable);
router.post('/check-conflicts', authenticate, requireAdmin, checkSessionConflicts);

export default router;
