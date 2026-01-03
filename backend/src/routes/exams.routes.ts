import { Router } from 'express';
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  checkExamConflicts,
} from '../controllers/exams.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getExams);
router.post('/', authenticate, requireAdmin, createExam);
router.put('/:id', authenticate, requireAdmin, updateExam);
router.delete('/:id', authenticate, requireAdmin, deleteExam);
router.post('/check-conflicts', authenticate, requireAdmin, checkExamConflicts);

export default router;

