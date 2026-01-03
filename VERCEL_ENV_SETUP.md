# Vercel Environment Variables Setup

## Quick Fix for Missing DATABASE_URL Error

Your Vercel deployment is failing because environment variables are not set. Follow these steps:

## Step 1: Add Environment Variables in Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your **timetablems-backend** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required Variables

```
DATABASE_URL=postgresql://neondb_owner:npg_VBI7vyYge9iu@ep-fragrant-shape-ah9b0fui-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Important**: Make sure to:
- Select **Production**, **Preview**, and **Development** environments
- Click **Save** after adding each variable

### Additional Required Variables

Add these as well:

```
JWT_SECRET=IO8XVNEZJ1PABrxvMGwRzjS6TLnfgcmipkUy4bsKdD95hloqH2aC7QuY03FWte
JWT_REFRESH_SECRET=AY6jnfyshRdrwZMGLVEHet8cPBXm2opU53QTqvW4JgIaiF7OCbuz10x9KSNlkD
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

### Optional Variables (if using)

```
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@pug.edu
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 2: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic redeploy

## Step 3: Verify

After redeployment, test:
- `https://timetablems-backend.vercel.app/health` should return `{"status":"ok",...}`
- Check Vercel logs for any errors

## Alternative: Using Vercel CLI

You can also set environment variables using the CLI:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add DATABASE_URL production
# Paste: postgresql://neondb_owner:npg_VBI7vyYge9iu@ep-fragrant-shape-ah9b0fui-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

vercel env add JWT_SECRET production
# Paste: IO8XVNEZJ1PABrxvMGwRzjS6TLnfgcmipkUy4bsKdD95hloqH2aC7QuY03FWte

vercel env add JWT_REFRESH_SECRET production
# Paste: AY6jnfyshRdrwZMGLVEHet8cPBXm2opU53QTqvW4JgIaiF7OCbuz10x9KSNlkD

vercel env add FRONTEND_URL production
# Paste: https://your-frontend-url.vercel.app

# Redeploy
vercel --prod
```

## Troubleshooting

### Still getting errors?

1. **Check variable names**: Make sure they match exactly (case-sensitive)
2. **Check environment scope**: Ensure variables are set for "Production"
3. **Redeploy**: Environment variables only apply to new deployments
4. **Check logs**: Go to Vercel dashboard → Your project → Logs

### Common Issues

- **Variable not found**: Make sure you selected "Production" environment
- **Still failing after redeploy**: Wait a few minutes, Vercel caches deployments
- **Connection timeout**: Check your Neon database is active and connection string is correct

## Security Note

⚠️ **Never commit `.env` files or expose secrets in code!**
- Environment variables in Vercel are encrypted
- They're only available at runtime
- They're not visible in your code repository

---

**After setting these variables, your backend should work!** 🚀

