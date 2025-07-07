# Deployment Guide

## Vercel Deployment Fix

### Issue
The deployment was failing with the error:
```
Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
```

### Solution Applied

1. **Updated `vercel.json`**:
   - Modified `buildCommand` to include `prisma generate` before the build
   - Now runs: `prisma generate && npm run build`

2. **Added `postinstall` script**:
   - Added `"postinstall": "prisma generate"` to `package.json`
   - Ensures Prisma client is generated after dependencies are installed

3. **Environment Variables**:
   - Ensure `DATABASE_URL` is set in your Vercel project settings
   - This should point to your PostgreSQL database (Neon, Supabase, etc.)

### Steps to Deploy

1. **Set Environment Variables in Vercel**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add: `DATABASE_URL` with your PostgreSQL connection string

2. **Redeploy**:
   - The build process will now automatically generate the Prisma client
   - No manual intervention required

### Verification

After deployment, you can verify the fix by:
1. Checking the build logs for successful Prisma generation
2. Testing the `/api/suggestions` endpoint
3. Ensuring no "Prisma client did not initialize" errors

### Database Setup

If you haven't set up a database yet:

1. **Option 1: Neon (Recommended)**:
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string
   - Set as `DATABASE_URL` in Vercel

2. **Option 2: Supabase**:
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Get the connection string from Settings → Database
   - Set as `DATABASE_URL` in Vercel

3. **Schema Migration**:
   - The Prisma schema is already defined in `prisma/schema.prisma`
   - Vercel will automatically run migrations if needed

### Troubleshooting

If you still encounter issues:

1. **Check Build Logs**: Look for Prisma generation messages
2. **Verify Environment Variables**: Ensure `DATABASE_URL` is set correctly
3. **Database Connectivity**: Test your database connection string locally
4. **Prisma Schema**: Ensure `prisma/schema.prisma` is committed to your repository

### Local Development

For local development, create a `.env` file:
```
DATABASE_URL="your_postgresql_connection_string"
```

Then run:
```bash
npx prisma generate
npm run dev
``` 