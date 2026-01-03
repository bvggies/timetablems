import { Router } from 'express';
import {
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
} from '../controllers/venues.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getVenues);
router.post('/', authenticate, requireAdmin, createVenue);
router.put('/:id', authenticate, requireAdmin, updateVenue);
router.delete('/:id', authenticate, requireAdmin, deleteVenue);

export default router;

