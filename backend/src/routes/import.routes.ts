import { Router } from 'express';
import multer from 'multer';
import { importCourses, importVenues, importUsers } from '../controllers/import.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);
router.use(requireAdmin);

router.post('/courses', upload.single('file'), importCourses);
router.post('/venues', upload.single('file'), importVenues);
router.post('/users', upload.single('file'), importUsers);

export default router;

