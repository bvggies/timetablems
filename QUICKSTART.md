# Quick Start Guide

Get the PUG Timetable Management System up and running in 5 minutes!

## Prerequisites Check

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Neon Postgres account (free at [neon.tech](https://neon.tech))
- [ ] Git installed (optional, for version control)

## Step 1: Clone/Download Project

```bash
# If using git
git clone <your-repo-url>
cd timetablems

# Or download and extract the project
```

## Step 2: Backend Setup (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the template and fill in your values
# Windows: copy .env.example .env
# Mac/Linux: cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=your-neon-connection-string-here
JWT_SECRET=your-random-secret-here
JWT_REFRESH_SECRET=your-random-refresh-secret-here
FRONTEND_URL=http://localhost:3000
```

Generate secrets:
```bash
# Linux/Mac
openssl rand -base64 32

# Or use: https://randomkeygen.com/
```

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with demo data
npm run prisma:seed

# Start backend server
npm run dev
```

Backend should be running on `http://localhost:5000` ✅

## Step 3: Frontend Setup (2 minutes)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start frontend
npm start
```

Frontend should open at `http://localhost:3000` ✅

## Step 4: Login

Use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pug.edu | admin123 |
| Lecturer | lecturer1@pug.edu | lecturer123 |
| Student | student1@pug.edu | student123 |

## What's Next?

1. **Explore the Dashboard** - See your role-specific view
2. **View Timetable** - Check the timetable page
3. **Manage Courses** - (Admin) Add courses and departments
4. **Create Sessions** - (Admin) Add timetable sessions
5. **Register Courses** - (Student) Register for courses

## Common Issues

### "Cannot connect to database"
- Check your `DATABASE_URL` in `backend/.env`
- Ensure Neon database is active
- Verify SSL mode is `require`

### "CORS error"
- Ensure `FRONTEND_URL` in backend `.env` matches `http://localhost:3000`
- Restart backend after changing `.env`

### "Module not found"
- Run `npm install` in both `backend/` and `frontend/`
- Delete `node_modules` and reinstall if needed

### "Prisma client not generated"
- Run `npm run prisma:generate` in `backend/`

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design

## Project Structure

```
timetablems/
├── backend/          # Express API
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/         # React App
│   ├── src/
│   └── package.json
├── README.md         # Main documentation
├── DEPLOYMENT.md     # Deployment guide
├── ARCHITECTURE.md   # System architecture
└── QUICKSTART.md     # This file
```

## Development Tips

1. **Backend**: Changes auto-reload with `npm run dev` (uses tsx watch)
2. **Frontend**: Hot reload enabled by default
3. **Database**: Use `npm run prisma:studio` to view/edit data
4. **Logs**: Check terminal for backend logs, browser console for frontend

## Next Steps for Production

1. Set up Neon production database
2. Deploy backend to Vercel (see [DEPLOYMENT.md](./DEPLOYMENT.md))
3. Deploy frontend to Vercel
4. Configure environment variables
5. Set up SendGrid for emails (optional)
6. Set up Twilio for SMS (optional)

---

**Happy Coding! 🚀**

