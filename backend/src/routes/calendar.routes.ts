import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import * as calendarController from '../controllers/calendar.controller';

const router = Router();

// Get calendar events (all authenticated users)
router.get('/events', authenticate, calendarController.getCalendarEvents);

// Admin only routes
router.post('/events', authenticate, requireAdmin, calendarController.createCalendarEvent);
router.put('/events/:id', authenticate, requireAdmin, calendarController.updateCalendarEvent);
router.delete('/events/:id', authenticate, requireAdmin, calendarController.deleteCalendarEvent);

export default router;

