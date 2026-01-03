import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departments.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getDepartments);
router.post('/', authenticate, requireAdmin, createDepartment);
router.put('/:id', authenticate, requireAdmin, updateDepartment);
router.delete('/:id', authenticate, requireAdmin, deleteDepartment);

export default router;

