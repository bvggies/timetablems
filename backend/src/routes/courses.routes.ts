import { Router } from 'express';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getLecturerCourseStudents,
} from '../controllers/courses.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireLecturer } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getCourses);
router.get('/lecturer/students', authenticate, requireLecturer, getLecturerCourseStudents);
router.post('/', authenticate, requireAdmin, createCourse);
router.put('/:id', authenticate, requireAdmin, updateCourse);
router.delete('/:id', authenticate, requireAdmin, deleteCourse);

export default router;

