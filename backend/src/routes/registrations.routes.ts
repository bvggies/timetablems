import { Router } from 'express';
import {
  getRegistrations,
  registerCourse,
  dropCourse,
} from '../controllers/registrations.controller';
import { authenticate } from '../middleware/auth';
import { requireStudent } from '../middleware/rbac';

const router = Router();

router.use(authenticate);
router.use(requireStudent);

router.get('/', getRegistrations);
router.post('/', registerCourse);
router.delete('/:id', dropCourse);

export default router;

