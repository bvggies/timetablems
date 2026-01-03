import { Router } from 'express';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courses.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getCourses);
router.post('/', authenticate, requireAdmin, createCourse);
router.put('/:id', authenticate, requireAdmin, updateCourse);
router.delete('/:id', authenticate, requireAdmin, deleteCourse);

export default router;

