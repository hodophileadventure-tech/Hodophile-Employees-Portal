# Railway Deployment Checklist

Use this checklist to ensure your Hodophile Employee Portal is properly configured for Railway deployment.

## Pre-Deployment Checks

### Code & Configuration
- [ ] Prisma schema uses `postgresql` provider (✅ Updated)
- [ ] `.env.example` file exists with all required variables (✅ Created)
- [ ] `package.json` has `postinstall` script for Prisma generation (✅ Updated)
- [ ] `Dockerfile` is present for containerization (✅ Created)
- [ ] `.dockerignore` file is present (✅ Created)
- [ ] `railway.json` configuration file exists (✅ Created)
- [ ] All API routes are in `/app/api` directory
- [ ] No hardcoded API URLs in components (using env vars)
- [ ] `NEXT_PUBLIC_API_URL` is used in hooks and API calls

### Git & Version Control
- [ ] All files committed to Git repository
- [ ] Repository is public (for Railway's free tier)
- [ ] No sensitive information in committed files
- [ ] `.gitignore` includes `.env` and `.env.local`

### Dependencies
- [ ] All dependencies are in `package.json`
- [ ] `@prisma/client` is in `dependencies` (not devDependencies)
- [ ] `prisma` is in `devDependencies`
- [ ] Node.js version 20+ supported

## Railway Setup

### Account & Project
- [ ] Railway account created at https://railway.app
- [ ] New project created
- [ ] Repository connected (GitHub/GitLab)
- [ ] Main/primary branch selected for deployment

### Services Configuration

#### Database Service
- [ ] PostgreSQL service added
- [ ] `DATABASE_URL` environment variable auto-populated
- [ ] Database is running

#### Application Service
- [ ] Next.js service is deployed
- [ ] Service is connected to PostgreSQL

#### Environment Variables
Set these in the **Next.js service Variables**:
- [ ] `DATABASE_URL` (auto-populated from PostgreSQL)
- [ ] `JWT_SECRET` (generate secure random string)
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app`

### Deployment Steps

#### Initial Deployment
1. [ ] Push code to main branch
2. [ ] Railway automatically deploys
3. [ ] Build completes successfully
4. [ ] No build errors in logs

#### Database Migration
1. [ ] Run Prisma migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```
2. [ ] Verify migrations completed
3. [ ] Generate Prisma client:
   ```bash
   railway run npx prisma generate
   ```
4. [ ] (Optional) Seed database:
   ```bash
   railway run npx prisma db seed
   ```

#### Post-Deployment Verification
- [ ] Application is accessible at railway domain
- [ ] Health check endpoint responds (port 3000)
- [ ] Login page loads without errors
- [ ] Able to log in with test credentials
- [ ] Database connection works
- [ ] Attendance records can be viewed
- [ ] Employee records can be accessed
- [ ] Salary calculations work
- [ ] Admin dashboard is accessible

## Security Verification

- [ ] JWT_SECRET is strong (32+ characters, random)
- [ ] No `.env` files in Git history
- [ ] No API keys in code
- [ ] HTTPS is enabled (Railway default)
- [ ] Database is not publicly accessible
- [ ] Authentication tokens are properly validated
- [ ] Password hashing is using bcryptjs

## Monitoring & Maintenance

### Ongoing
- [ ] Set up log monitoring
- [ ] Monitor application metrics
- [ ] Check database usage
- [ ] Monitor costs in Railway billing

### Backup & Recovery
- [ ] Enable automatic PostgreSQL backups
- [ ] Know how to restore from backup
- [ ] Plan backup retention policy

### Updates
- [ ] Plan for dependency updates
- [ ] Document rollback procedure
- [ ] Test updates in development first

## Troubleshooting

If you encounter issues:

1. **Build Fails**
   - [ ] Check Railway build logs
   - [ ] Verify all files are committed
   - [ ] Ensure Node.js version is compatible

2. **Database Connection Error**
   - [ ] Check `DATABASE_URL` is set
   - [ ] Verify PostgreSQL service is running
   - [ ] Try redeploying

3. **Application Won't Start**
   - [ ] Check application logs
   - [ ] Verify `npm start` works locally
   - [ ] Check for missing environment variables

4. **Deployment Stuck**
   - [ ] Check build logs for errors
   - [ ] Try canceling and redeploying
   - [ ] Contact Railway support if issue persists

## Performance Optimization

After deployment is working:

- [ ] Monitor application response times
- [ ] Check database query performance
- [ ] Optimize Prisma queries if needed
- [ ] Consider caching strategies
- [ ] Scale resources if needed

## Final Handoff

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Team has access to Railway dashboard
- [ ] Backup procedures documented
- [ ] Monitoring configured
- [ ] Incident response plan ready

---

**Status**: Ready for Railway Deployment ✅

**Files Prepared**:
- ✅ Prisma schema (PostgreSQL)
- ✅ Environment configuration (.env.example)
- ✅ Dockerfile (multi-stage build)
- ✅ .dockerignore
- ✅ railway.json (configuration)
- ✅ package.json (with postinstall)
- ✅ lib/apiClient.ts (API client utility)
- ✅ RAILWAY_DEPLOYMENT.md (detailed guide)

**Next Steps**:
1. Commit all changes to Git
2. Push to main branch
3. Connect repository to Railway
4. Configure environment variables
5. Run database migrations
6. Test application
