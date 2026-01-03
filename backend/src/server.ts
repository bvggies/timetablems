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
import dashboardRoutes from './routes/dashboard.routes';
import importRoutes from './routes/import.routes';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API (not serving HTML)
}));
// CORS configuration - allow both localhost and production frontend
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'https://timetablems.vercel.app',
  'https://timetablems-frontend.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiRateLimiter);

// Root endpoint - Backend information
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    name: 'Timetable Management System API',
    version: '1.0.0',
    description: 'Backend API for PUG Timetable Management System',
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
      },
      users: 'GET,POST,PUT,DELETE /api/users',
      departments: 'GET,POST,PUT,DELETE /api/departments',
      levels: 'GET,POST,PUT,DELETE /api/levels',
      courses: 'GET,POST,PUT,DELETE /api/courses',
      venues: 'GET,POST,PUT,DELETE /api/venues',
      timetable: {
        list: 'GET /api/timetable',
        create: 'POST /api/timetable',
        generate: 'POST /api/timetable/generate',
        publish: 'POST /api/timetable/publish',
      },
      registrations: 'GET,POST,DELETE /api/registrations',
      semesters: 'GET,POST,PUT,DELETE /api/semesters',
      exams: 'GET,POST,PUT,DELETE /api/exams',
      notifications: 'GET,PUT /api/notifications',
      reports: 'GET /api/reports',
      support: 'GET,POST,PUT,DELETE /api/support',
    },
    documentation: {
      github: 'https://github.com/bvggies/timetablems',
      frontend: env.FRONTEND_URL,
    },
    features: [
      'User Authentication (JWT + Refresh Tokens)',
      'Role-Based Access Control (Student, Lecturer, Admin)',
      'Timetable Generation & Management',
      'Course Registration',
      'Venue Management',
      'Exam Scheduling',
      'Notifications (In-app, Email, SMS)',
      'Reports & Analytics',
      'Support Ticket System',
    ],
  });
});

// API root endpoint - List available API endpoints
app.get('/api', (req: express.Request, res: express.Response) => {
  res.json({
    message: 'Timetable Management System API',
    version: '1.0.0',
    availableEndpoints: {
      auth: {
        base: '/api/auth',
        endpoints: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          refresh: 'POST /api/auth/refresh',
          logout: 'POST /api/auth/logout',
          forgotPassword: 'POST /api/auth/forgot-password',
          resetPassword: 'POST /api/auth/reset-password',
        },
      },
      users: {
        base: '/api/users',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'User management (Admin only)',
      },
      departments: {
        base: '/api/departments',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Department management',
      },
      levels: {
        base: '/api/levels',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Academic level management',
      },
      courses: {
        base: '/api/courses',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Course management',
      },
      venues: {
        base: '/api/venues',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Venue/lecture hall management',
      },
      timetable: {
        base: '/api/timetable',
        endpoints: {
          list: 'GET /api/timetable',
          create: 'POST /api/timetable',
          update: 'PUT /api/timetable/:id',
          delete: 'DELETE /api/timetable/:id',
          generate: 'POST /api/timetable/generate',
          publish: 'POST /api/timetable/publish',
          checkConflicts: 'POST /api/timetable/check-conflicts',
        },
      },
      registrations: {
        base: '/api/registrations',
        methods: ['GET', 'POST', 'DELETE'],
        description: 'Student course registration',
      },
      semesters: {
        base: '/api/semesters',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Semester management',
      },
      exams: {
        base: '/api/exams',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        endpoints: {
          checkConflicts: 'POST /api/exams/check-conflicts',
        },
      },
      notifications: {
        base: '/api/notifications',
        methods: ['GET', 'PUT'],
        description: 'User notifications',
      },
      reports: {
        base: '/api/reports',
        endpoints: {
          occupancy: 'GET /api/reports/occupancy',
          workload: 'GET /api/reports/workload',
          usage: 'GET /api/reports/usage',
        },
        description: 'Analytics and reports (Admin only)',
      },
      support: {
        base: '/api/support',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Support ticket management',
      },
    },
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>',
      note: 'Most endpoints require authentication. Use /api/auth/login to obtain a token.',
    },
  });
});

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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/import', importRoutes);
app.use('/api/search', searchRoutes);

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

