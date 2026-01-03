import { Router } from 'express';
import {
  getLevels,
  createLevel,
  updateLevel,
  deleteLevel,
} from '../controllers/levels.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getLevels);
router.post('/', authenticate, requireAdmin, createLevel);
router.put('/:id', authenticate, requireAdmin, updateLevel);
router.delete('/:id', authenticate, requireAdmin, deleteLevel);

export default router;

