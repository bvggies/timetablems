import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { logger } from './utils/logger';
import { apiRateLimiter } from './middleware/rateLimit';

// Routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import departmentsRoutes from './routes/departments.routes';
import levelsRoutes from './routes/levels.routes';
import coursesRoutes from './routes/courses.routes';
import venuesRoutes from './routes/venues.routes';
import timetableRoutes from './routes/timetable.routes';
import notificationsRoutes from './routes/notifications.routes';
import registrationsRoutes from './routes/registrations.routes';
import semestersRoutes from './routes/semesters.routes';
import reportsRoutes from './routes/reports.routes';
import examsRoutes from './routes/exams.routes';
import supportRoutes from './routes/support.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiRateLimiter);

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/levels', levelsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/semesters', semestersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/support', supportRoutes);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = env.PORT;

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });
}

export default app;

