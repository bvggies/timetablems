import { Router } from 'express';
import {
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
} from '../controllers/semesters.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getSemesters);
router.post('/', authenticate, requireAdmin, createSemester);
router.put('/:id', authenticate, requireAdmin, updateSemester);
router.delete('/:id', authenticate, requireAdmin, deleteSemester);

export default router;

