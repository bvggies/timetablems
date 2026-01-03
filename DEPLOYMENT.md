# Deployment Guide - PUG Timetable Management System

This guide provides step-by-step instructions for deploying the Timetable Management System to Vercel with Neon Postgres.

## Prerequisites

1. **GitHub Account** - For code repository
2. **Vercel Account** - For hosting (free tier available)
3. **Neon Account** - For PostgreSQL database (free tier available)
4. **SendGrid Account** (Optional) - For email notifications
5. **Twilio Account** (Optional) - For SMS notifications

## Step 1: Database Setup (Neon Postgres)

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project (e.g., "pug-timetable")

### 1.2 Get Connection String
1. In your Neon dashboard, select your project
2. Go to "Connection Details"
3. Copy the connection string (format: `postgresql://user:password@host/database?sslmode=require`)
4. Save this for later use

### 1.3 Run Initial Migrations
```bash
cd backend
# Set your DATABASE_URL
export DATABASE_URL="your-neon-connection-string"
# Or create .env file with DATABASE_URL

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed
```

## Step 2: GitHub Repository Setup

### 2.1 Initialize Git Repository
```bash
# In the project root
git init
git add .
git commit -m "Initial commit: PUG Timetable Management System"
```

### 2.2 Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Create a new repository (e.g., "pug-timetable-ms")
3. **DO NOT** initialize with README, .gitignore, or license

### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/yourusername/pug-timetable-ms.git
git branch -M main
git push -u origin main
```

## Step 3: Backend Deployment (Vercel)

### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Deploy Backend
```bash
cd backend
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **pug-timetable-backend** (or your choice)
- Directory? **./backend**
- Override settings? **No**

### 3.3 Configure Environment Variables

Go to your Vercel project dashboard:
1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables:

```
DATABASE_URL=your-neon-connection-string
JWT_SECRET=generate-a-strong-random-secret-here
JWT_REFRESH_SECRET=generate-another-strong-random-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SENDGRID_API_KEY=your-sendgrid-api-key (optional)
SENDGRID_FROM_EMAIL=noreply@pug.edu
TWILIO_ACCOUNT_SID=your-twilio-sid (optional)
TWILIO_AUTH_TOKEN=your-twilio-token (optional)
TWILIO_PHONE_NUMBER=your-twilio-number (optional)
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate JWT Secrets:**
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use an online generator
```

### 3.4 Run Production Migrations
```bash
# Set DATABASE_URL
export DATABASE_URL="your-neon-connection-string"

cd backend
npx prisma migrate deploy
```

### 3.5 Redeploy Backend
After setting environment variables, redeploy:
```bash
cd backend
vercel --prod
```

Or trigger a redeploy from Vercel dashboard.

### 3.6 Note Your Backend URL
After deployment, note your backend URL (e.g., `https://pug-timetable-backend.vercel.app`)

## Step 4: Frontend Deployment (Vercel)

### 4.1 Create Frontend Environment File
```bash
cd frontend
echo "REACT_APP_API_URL=https://your-backend-url.vercel.app/api" > .env.production
```

Replace `your-backend-url` with your actual backend URL from Step 3.6.

### 4.2 Deploy Frontend
```bash
cd frontend
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **pug-timetable-frontend** (or your choice)
- Directory? **./frontend**
- Override settings? **No**

### 4.3 Configure Frontend Environment Variables

In Vercel dashboard for frontend project:
1. Go to **Settings** → **Environment Variables**
2. Add:
```
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
```

### 4.4 Update Backend CORS

Update the backend environment variable:
1. Go to backend project in Vercel
2. **Settings** → **Environment Variables**
3. Update `FRONTEND_URL` to your frontend URL (e.g., `https://pug-timetable-frontend.vercel.app`)
4. Redeploy backend

### 4.5 Redeploy Frontend
```bash
cd frontend
vercel --prod
```

## Step 5: Connect GitHub for Auto-Deployment

### 5.1 Connect Repository
1. In Vercel dashboard, go to your project
2. **Settings** → **Git**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend` (for backend) or `frontend` (for frontend)
   - **Build Command**: 
     - Backend: `npm run build` (or leave default)
     - Frontend: `npm run build`
   - **Output Directory**: 
     - Backend: `dist` (or leave default)
     - Frontend: `build`
   - **Install Command**: `npm install`

### 5.2 Enable Auto-Deploy
- Enable automatic deployments on push to `main` branch
- Production deployments will trigger on every push

## Step 6: Verify Deployment

### 6.1 Test Backend
```bash
# Health check
curl https://your-backend-url.vercel.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 6.2 Test Frontend
1. Visit your frontend URL
2. Try logging in with demo accounts:
   - Admin: `admin@pug.edu` / `admin123`
   - Lecturer: `lecturer1@pug.edu` / `lecturer123`
   - Student: `student1@pug.edu` / `student123`

### 6.3 Test API
```bash
# Test login
curl -X POST https://your-backend-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pug.edu","password":"admin123"}'
```

## Step 7: Optional Services Setup

### 7.1 SendGrid (Email)
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Add to backend environment variables:
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`

### 7.2 Twilio (SMS)
1. Sign up at [twilio.com](https://twilio.com)
2. Get Account SID and Auth Token
3. Get a phone number
4. Add to backend environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct in Vercel
- Check Neon dashboard to ensure database is active
- Ensure SSL mode is `require` in connection string

### CORS Errors
- Verify `FRONTEND_URL` in backend matches your frontend URL exactly
- Check for trailing slashes
- Ensure CORS is configured in `backend/src/server.ts`

### Build Failures
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version (should be 18+)

### Environment Variables Not Working
- Ensure variables are set for correct environment (Production)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Migration Issues
- Run `npx prisma migrate deploy` locally with production DATABASE_URL
- Check Prisma schema is up to date
- Verify database connection

## Production Checklist

- [ ] Database migrations run successfully
- [ ] Seed data loaded
- [ ] All environment variables set
- [ ] Backend health check passes
- [ ] Frontend loads correctly
- [ ] Login works with demo accounts
- [ ] CORS configured correctly
- [ ] GitHub auto-deploy enabled
- [ ] SSL certificates active (automatic with Vercel)
- [ ] Error logging configured (optional: Sentry)

## Monitoring

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor API usage and performance

### Database Monitoring
- Use Neon dashboard to monitor database usage
- Set up alerts for connection limits

### Error Tracking
- Consider adding Sentry for error tracking
- Monitor Vercel function logs

## Backup Strategy

### Database Backups
Neon provides automatic backups, but you can also:

```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Code Backups
- GitHub repository serves as code backup
- Tag releases for version control

## Scaling Considerations

- **Database**: Neon free tier includes 0.5GB storage, upgrade as needed
- **Vercel**: Free tier includes 100GB bandwidth, upgrade for more
- **API Limits**: Monitor rate limiting settings
- **Caching**: Consider adding Redis for session storage (future)

## Support

For issues:
1. Check Vercel deployment logs
2. Check Neon database logs
3. Review GitHub issues
4. Contact support via in-app ticket system

---

**Last Updated**: 2024
**Version**: 1.0.0

