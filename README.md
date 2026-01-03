# PUG Timetable Management System

A comprehensive, production-ready timetable management system built for PUG (Presbyterian University of Ghana) with support for Students, Lecturers, and Administrators.

## 🎯 Features

### Core Functionality
- **User Management**: Registration, login, role-based access (Student, Lecturer, Admin)
- **Timetable Management**: Daily/Weekly/Semester views with auto-generation and conflict detection
- **Course Management**: Course registration, allocation, and academic structure
- **Venue Management**: Room booking with capacity checks
- **Notifications**: In-app, email (SendGrid), SMS (Twilio), and web push
- **Reporting & Analytics**: Occupancy, workload, and usage analytics
- **Export**: PDF, Excel, CSV, and ICS calendar files
- **PWA Support**: Offline access with service worker caching
- **Dark Mode**: Full theme support with light/dark modes

### Advanced Features
- Automatic timetable generation with constraint-based algorithm
- Real-time conflict detection (venue, lecturer, student overlaps)
- Exam timetable module
- Support ticket system
- Audit logging
- Academic calendar integration
- Bulk data import (CSV/Excel)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Create React App (CRA)
- **UI Library**: Material UI (MUI) v5
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Export**: jsPDF, xlsx, ics

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Neon Postgres
- **ORM**: Prisma
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Email**: SendGrid
- **SMS**: Twilio (optional)

## 📁 Project Structure

```
timetablems/
├── frontend/          # React frontend application
├── backend/           # Express API backend
├── ARCHITECTURE.md    # Detailed architecture documentation
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Neon Postgres database account
- (Optional) SendGrid account for emails
- (Optional) Twilio account for SMS

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd timetablems
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your:
# - DATABASE_URL (from Neon)
# - JWT_SECRET and JWT_REFRESH_SECRET (generate strong secrets)
# - SENDGRID_API_KEY (if using email)
# - TWILIO credentials (if using SMS)

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

### 4. Demo Accounts

After seeding, you can login with:

- **Admin**: `admin@pug.edu` / `admin123`
- **Lecturer**: `lecturer1@pug.edu` / `lecturer123`
- **Student**: `student1@pug.edu` / `student123`

## 🗄️ Database Setup (Neon Postgres)

### 1. Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

### 2. Get Connection String
1. In your Neon dashboard, go to your project
2. Copy the connection string (it looks like: `postgresql://user:password@host/database?sslmode=require`)
3. Add it to `backend/.env` as `DATABASE_URL`

### 3. Run Migrations
```bash
cd backend
npm run prisma:migrate
```

This will create all tables in your Neon database.

## 🚀 Deployment to Vercel

### Backend Deployment

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Deploy Backend**:
```bash
cd backend
vercel
```

3. **Set Environment Variables in Vercel**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all variables from `backend/.env.example`:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `JWT_REFRESH_SECRET`
     - `JWT_EXPIRES_IN`
     - `JWT_REFRESH_EXPIRES_IN`
     - `SENDGRID_API_KEY`
     - `SENDGRID_FROM_EMAIL`
     - `TWILIO_ACCOUNT_SID` (optional)
     - `TWILIO_AUTH_TOKEN` (optional)
     - `TWILIO_PHONE_NUMBER` (optional)
     - `FRONTEND_URL` (your frontend URL)
     - `NODE_ENV=production`

4. **Run Migrations on Production**:
```bash
# Set DATABASE_URL in your environment
export DATABASE_URL="your-neon-connection-string"
cd backend
npx prisma migrate deploy
```

### Frontend Deployment

1. **Build Frontend**:
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**:
```bash
cd frontend
vercel
```

3. **Set Environment Variables**:
   - `REACT_APP_API_URL` = your backend API URL (e.g., `https://your-backend.vercel.app/api`)

4. **Update Backend CORS**:
   - In Vercel backend settings, update `FRONTEND_URL` to your frontend URL

### GitHub Integration

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect and deploy both frontend and backend

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@pug.edu
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Rate limiting on auth endpoints
- CORS protection
- Helmet.js security headers
- Input validation with Zod

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users (Admin)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Academic
- `GET /api/departments` - List departments
- `GET /api/levels` - List levels
- `GET /api/semesters` - List semesters
- `GET /api/courses` - List courses

### Timetable
- `GET /api/timetable` - Get timetable
- `POST /api/timetable/sessions` - Create session (Admin)
- `PUT /api/timetable/sessions/:id` - Update session (Admin)
- `DELETE /api/timetable/sessions/:id` - Delete session (Admin)
- `POST /api/timetable/generate` - Auto-generate (Admin)
- `POST /api/timetable/publish` - Publish timetable (Admin)

## 🧪 Development

### Running Tests
```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Management
```bash
# Open Prisma Studio (database GUI)
cd backend
npm run prisma:studio

# Create new migration
npm run prisma:migrate -- --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
```

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/build/
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure Neon database is running
- Check SSL mode is set to `require`

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check CORS settings in `backend/src/server.ts`

### Authentication Issues
- Clear browser localStorage
- Verify JWT secrets are set correctly
- Check token expiration settings

## 📚 Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- API documentation (coming soon)
- User guide (in-app)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Create an issue in the GitHub repository
- Use the in-app support ticket system
- Contact: support@pug.edu

## 🎉 Acknowledgments

Built with modern web technologies for PUG (Presbyterian University of Ghana).

---

**Status**: Production Ready ✅
**Last Updated**: 2024

