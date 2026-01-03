# Timetable Management System - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (CRA + MUI)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Student    │  │   Lecturer   │  │    Admin     │      │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  React Query (TanStack Query) for Server State               │
│  MUI Theme (Light/Dark)                                      │
│  PWA Support (Service Worker)                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/REST API
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Backend (Express + Vercel)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth API   │  │  Business    │  │  Notification│      │
│  │  (JWT)       │  │  Logic API   │  │  Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  Express Middleware:                                          │
│  - Authentication (JWT)                                        │
│  - Authorization (RBAC)                                        │
│  - Validation (Zod)                                           │
│  - Rate Limiting                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Prisma ORM
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Database (Neon Postgres)                        │
│  - Users, Roles, Permissions                                 │
│  - Academic Data (Departments, Levels, Courses)             │
│  - Timetable Sessions                                        │
│  - Notifications, Audit Logs                                 │
└─────────────────────────────────────────────────────────────┘

External Services:
- SendGrid (Email)
- Twilio (SMS - Optional)
- Web Push API (Browser)
```

## Folder Structure

```
timetablems/
├── frontend/                    # Create React App
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json       # PWA manifest
│   │   └── service-worker.js   # PWA service worker
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Topbar.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── timetable/
│   │   │   │   ├── TimetableView.tsx
│   │   │   │   ├── TimetableGrid.tsx
│   │   │   │   └── ConflictIndicator.tsx
│   │   │   ├── forms/
│   │   │   └── common/
│   │   ├── pages/              # Page components
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   ├── lecturer/
│   │   │   ├── admin/
│   │   │   └── shared/
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API clients
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   ├── store/              # React Query setup
│   │   ├── theme/              # MUI theme configuration
│   │   │   ├── theme.ts
│   │   │   └── palette.ts
│   │   ├── utils/              # Utility functions
│   │   │   ├── validation.ts
│   │   │   └── export.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── .env.example
│
├── backend/                    # Express API
│   ├── src/
│   │   ├── config/             # Configuration
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── rbac.ts
│   │   │   ├── validation.ts
│   │   │   └── rateLimit.ts
│   │   ├── routes/             # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── courses.routes.ts
│   │   │   ├── timetable.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   └── ...
│   │   ├── controllers/        # Business logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── timetable.controller.ts
│   │   │   └── ...
│   │   ├── services/           # Service layer
│   │   │   ├── auth.service.ts
│   │   │   ├── timetable.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── ...
│   │   ├── utils/              # Utilities
│   │   │   ├── jwt.ts
│   │   │   ├── bcrypt.ts
│   │   │   └── logger.ts
│   │   ├── validators/         # Zod schemas
│   │   │   ├── auth.validator.ts
│   │   │   ├── user.validator.ts
│   │   │   └── ...
│   │   └── server.ts           # Express app entry
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma schema
│   │   └── migrations/         # Database migrations
│   ├── scripts/
│   │   └── seed.ts             # Seed script
│   ├── vercel.json             # Vercel serverless config
│   ├── package.json
│   └── .env.example
│
├── docs/                       # Documentation
│   ├── API.md
│   └── DEPLOYMENT.md
│
└── README.md                    # Main README
```

## Technology Stack Details

### Frontend
- **Framework**: Create React App (CRA)
- **UI Library**: Material UI (MUI) v5+
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: React Router v6
- **Charts**: Recharts
- **Export**: 
  - PDF: jsPDF + html2canvas
  - Excel: xlsx
  - CSV: native
  - ICS: ics library
- **PWA**: Workbox for service worker

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Deployment**: Vercel Serverless Functions
- **ORM**: Prisma
- **Database**: Neon Postgres
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Email**: SendGrid
- **SMS**: Twilio (optional)

## Data Model Overview

### Core Entities
1. **Users**: Students, Lecturers, Admins
2. **Academic**: Departments, Levels, Semesters, Courses
3. **Timetable**: Sessions, Venues, Allocations
4. **Notifications**: In-app, Email, SMS
5. **Support**: Tickets, FAQ
6. **Audit**: Logs for admin actions

### Key Relationships
- User → Department, Level
- Course → Department, Level
- Course → Lecturer (Allocation)
- Student → Course (Registration)
- Session → Course, Lecturer, Venue, Semester
- Notification → User

## API Design

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - List users (Admin)
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/me` - Get current user profile

### Academic
- `/api/departments` - CRUD departments
- `/api/levels` - CRUD levels
- `/api/semesters` - CRUD semesters
- `/api/courses` - CRUD courses + import

### Timetable
- `GET /api/timetable` - Get timetable (filtered by role)
- `POST /api/timetable/sessions` - Create session (Admin)
- `PUT /api/timetable/sessions/:id` - Update session (Admin)
- `DELETE /api/timetable/sessions/:id` - Delete session (Admin)
- `POST /api/timetable/generate` - Auto-generate (Admin)
- `POST /api/timetable/publish` - Publish timetable (Admin)
- `GET /api/timetable/export` - Export (PDF/Excel/ICS)

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `POST /api/announcements` - Create announcement (Admin)

### Reports
- `GET /api/reports/occupancy` - Venue occupancy
- `GET /api/reports/workload` - Lecturer workload
- `GET /api/reports/usage` - Usage analytics

## Implementation Milestones

1. **Phase 1: Foundation**
   - Project setup (CRA + Express)
   - Prisma schema + migrations
   - Auth system (JWT)
   - Basic UI layout

2. **Phase 2: Core Features**
   - User management
   - Academic management (departments, levels, courses)
   - Venue management

3. **Phase 3: Timetable**
   - Course allocation
   - Student registration
   - Timetable CRUD
   - Auto-generation algorithm
   - Conflict detection

4. **Phase 4: Advanced Features**
   - Notifications
   - Reports & analytics
   - Exam timetable
   - Support system

5. **Phase 5: Polish**
   - PWA
   - Accessibility
   - Export features
   - Dark mode
   - Seed data

6. **Phase 6: Deployment**
   - Vercel setup
   - Neon setup
   - Environment variables
   - Documentation

## Color Palette

### Light Theme
- Primary: #1976d2 (Blue)
- Secondary: #dc004e (Pink/Red)
- Success: #2e7d32 (Green)
- Warning: #ed6c02 (Orange)
- Error: #d32f2f (Red)
- Background: #f5f5f5
- Paper: #ffffff

### Dark Theme
- Primary: #90caf9 (Light Blue)
- Secondary: #f48fb1 (Light Pink)
- Success: #81c784 (Light Green)
- Warning: #ffb74d (Light Orange)
- Error: #e57373 (Light Red)
- Background: #121212
- Paper: #1e1e1e

