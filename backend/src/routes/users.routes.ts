import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
} from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

// Profile routes (all authenticated users)
router.get('/me', getCurrentUser);
router.put('/me', updateCurrentUser);

// Admin-only routes
router.use(requireAdmin);
router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

