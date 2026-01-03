import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import * as attendanceController from '../controllers/attendance.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Mark attendance (Lecturer/Admin)
router.post('/sessions/:sessionId/attendance', requireRole(['LECTURER', 'ADMIN']), attendanceController.markAttendance);

// Bulk mark attendance
router.post('/sessions/:sessionId/attendance/bulk', requireRole(['LECTURER', 'ADMIN']), attendanceController.bulkMarkAttendance);

// Get attendance for a session
router.get('/sessions/:sessionId/attendance', attendanceController.getSessionAttendance);

// Get student's attendance records
router.get('/students/:studentId/attendance', attendanceController.getStudentAttendance);

export default router;

