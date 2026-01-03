import { Router } from 'express';
import {
  getOccupancyReport,
  getWorkloadReport,
  getUsageAnalytics,
  getVenueHeatmap,
  getTrends,
} from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/occupancy', getOccupancyReport);
router.get('/workload', getWorkloadReport);
router.get('/usage', getUsageAnalytics);
router.get('/heatmap', getVenueHeatmap);
router.get('/trends', getTrends);

export default router;

