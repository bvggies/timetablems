import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireLecturer, requireAdmin } from '../middleware/rbac';
import * as attendanceController from '../controllers/attendance.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get students for a session (for marking attendance)
router.get('/sessions/:sessionId/students', requireLecturer, attendanceController.getSessionStudents);

// Mark attendance (Lecturer/Admin)
router.post('/sessions/:sessionId/attendance', requireLecturer, attendanceController.markAttendance);

// Bulk mark attendance
router.post('/sessions/:sessionId/attendance/bulk', requireLecturer, attendanceController.bulkMarkAttendance);

// Get attendance for a session
router.get('/sessions/:sessionId/attendance', attendanceController.getSessionAttendance);

// Get student's attendance records
router.get('/students/:studentId/attendance', attendanceController.getStudentAttendance);

// Get attendance history (all for admin, only lecturer's for lecturer)
router.get('/history', attendanceController.getAttendanceHistory);

// Update attendance (Admin only)
router.put('/:id', requireAdmin, attendanceController.updateAttendance);

// Get attendance analytics
router.get('/analytics', attendanceController.getAttendanceAnalytics);

export default router;

