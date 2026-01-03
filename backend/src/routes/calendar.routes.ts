import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import * as calendarController from '../controllers/calendar.controller';

const router = Router();

// Get calendar events (all authenticated users)
router.get('/events', authenticate, calendarController.getCalendarEvents);

// Admin only routes
router.post('/events', authenticate, requireRole(['ADMIN']), calendarController.createCalendarEvent);
router.put('/events/:id', authenticate, requireRole(['ADMIN']), calendarController.updateCalendarEvent);
router.delete('/events/:id', authenticate, requireRole(['ADMIN']), calendarController.deleteCalendarEvent);

export default router;

