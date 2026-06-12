# 🚀 Getting Started with Railway Deployment

Welcome! Your Hodophile Employee Portal is now ready to deploy to Railway. This guide will walk you through everything step-by-step.

---

## 📚 Which Guide Should I Read?

### ⚡ Quick (5 mins) - RAILWAY_QUICK_START.md
**For:** Experienced users who know what they're doing
**Contains:** 5-step deployment, minimal explanation

### 📖 Complete (30 mins) - RAILWAY_DEPLOYMENT.md
**For:** Most users deploying for the first time
**Contains:** Detailed steps, 3 migration methods, troubleshooting

### ✅ Verification - DEPLOYMENT_CHECKLIST.md
**For:** Verifying everything is configured correctly
**Contains:** Pre-deployment checks, security verification, testing steps

### 📋 Reference - DEPLOYMENT_SUMMARY.md
**For:** Overview and detailed reference
**Contains:** All changes made, next steps, timeline

### 📁 File Reference - FILES_OVERVIEW.md
**For:** Understanding which file does what
**Contains:** File manifest, Git workflow, commands

---

## 🎯 Three Ways to Deploy

### 🟢 **Easiest: GitHub Auto-Deploy (Recommended)**

```bash
# 1. Commit and push your code
git add .
git commit -m "Deploy to Railway"
git push origin main

# 2. Go to https://railway.app
# 3. Create project from your GitHub repo
# 4. Railway auto-builds and deploys!
# 5. Set environment variables in dashboard
# 6. Done! Access at your Railway domain
```

**Time**: 5-10 minutes  
**Requires**: GitHub account  
**Best for**: Automated deployments with CI/CD

---

### 🟡 **Flexible: Docker Desktop + Railway**

```bash
# 1. Test locally with Docker
docker-compose up
# Access at http://localhost:3000

# 2. Push to GitHub
git push origin main

# 3. Create Railway project as above
```

**Time**: 10-15 minutes  
**Requires**: Docker installed  
**Best for**: Testing before deploying

---

### 🔵 **Advanced: Railway CLI**

```bash
# 1. Install Railway CLI
npm install -g railway

# 2. Login and link project
railway login
railway link

# 3. Deploy
railway up

# 4. Run migrations
railway run npx prisma migrate deploy
```

**Time**: 10-15 minutes  
**Requires**: Railway CLI knowledge  
**Best for**: Local development workflow

---

## 🛠️ What You Need

- [ ] GitHub account (for pushing code)
- [ ] Railway account (free at https://railway.app)
- [ ] Your repository connected to GitHub
- [ ] (Optional) Docker Desktop for local testing

---

## 📝 Your Deployment Roadmap

### Phase 1: Preparation (You Are Here!)
- [x] Database configured (PostgreSQL)
- [x] Docker files created
- [x] Documentation written
- [x] Environment template created
- [ ] **Next**: Commit and push code

### Phase 2: Railway Setup (5 minutes)
- [ ] Create Railway.app account
- [ ] Create new project from Git
- [ ] Configure environment variables
- [ ] **Next**: Monitor build

### Phase 3: Database Setup (5 minutes)
- [ ] PostgreSQL service created (automatic)
- [ ] Run migrations
- [ ] (Optional) Seed test data
- [ ] **Next**: Test application

### Phase 4: Verification (5 minutes)
- [ ] Access application in browser
- [ ] Test login with admin account
- [ ] Check dashboard loads
- [ ] Verify database works
- [ ] **Status**: Live! 🎉

**Total Time**: ~20-30 minutes

---

## 🚦 Step-by-Step (Quick Version)

### Step 1: Commit Your Code
```bash
git add .
git commit -m "chore: prepare for Railway deployment"
git push origin main
```

### Step 2: Create Railway Project
1. Go to https://railway.app
2. Log in with GitHub
3. Click "Create New" → "From Git Repo"
4. Select your repository
5. Railway auto-detects and builds

### Step 3: Add Database
1. Click "Add Service"
2. Select "PostgreSQL"
3. Done! (Railway auto-links it)

### Step 4: Set Environment Variables
Click your **Next.js service** → **Variables**:

```
DATABASE_URL=<auto-filled>
JWT_SECRET=use_generate_command_below
NODE_ENV=production
NEXT_PUBLIC_API_URL=<your_railway_domain>
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Run Migrations
```bash
npm install -g railway
railway login
railway link
railway run npx prisma migrate deploy
```

### Step 6: Test Your App
1. Click "View Domain" in Railway
2. Login with: `admin@hodophile.com` / `admin123`
3. Check admin dashboard
4. ✅ Done!

---

## 🔍 What Gets Deployed

Your app includes:

✅ **Next.js 15** - Modern React framework  
✅ **PostgreSQL** - Database with automatic backups  
✅ **Prisma ORM** - Type-safe database queries  
✅ **JWT Auth** - Secure token-based authentication  
✅ **Admin Dashboard** - Analytics and management  
✅ **Employee Portal** - Self-service portal  
✅ **Attendance System** - Check-in/check-out tracking  
✅ **Salary Processing** - Automated calculations  
✅ **Sales Management** - Lead tracking system  
✅ **Dark Mode** - Automatic theme support  
✅ **Responsive UI** - Works on all devices  

---

## 🧪 Local Testing (Optional but Recommended)

Before deploying to Railway, test locally:

```bash
# Option 1: With Docker Compose (Recommended)
docker-compose up
# Access at http://localhost:3000

# Option 2: Without Docker (requires local PostgreSQL)
npm install
npx prisma migrate deploy
npm run dev
```

Test these features:
- [ ] Admin login
- [ ] Employee login
- [ ] View attendance records
- [ ] Check salary information
- [ ] Create new employee
- [ ] Process attendance

---

## 🚨 Common Issues & Solutions

### Build Fails
```
❌ Problem: Build fails in Railway
✅ Solution: Check build logs in Railway dashboard
           → Usually missing dependencies or syntax errors
```

### Can't Connect to Database
```
❌ Problem: "DATABASE_URL is not set"
✅ Solution: Add DATABASE_URL in Railway Variables
           → Ensure PostgreSQL service is created
```

### App Shows 502/503 Error
```
❌ Problem: Bad Gateway error
✅ Solution: App may still be starting (wait 1-2 mins)
           → Check application logs
           → Verify npm start works locally
```

### Login Doesn't Work
```
❌ Problem: Authentication fails
✅ Solution: Verify JWT_SECRET is set
           → Check database is running
           → Try admin@hodophile.com / admin123
```

For more solutions, see **RAILWAY_DEPLOYMENT.md** → Troubleshooting

---

## 📊 Monitoring After Deployment

### View Application Logs
```bash
railway logs --tail 100
```

### Check Database
```bash
railway run npx prisma studio
# Opens visual database editor
```

### Monitor Performance
In Railway dashboard:
- CPU usage
- Memory usage
- Network usage
- Cost tracking

---

## 🔐 Security Reminders

Before going live:
- [ ] Set strong JWT_SECRET (32+ random characters)
- [ ] Set NODE_ENV to "production"
- [ ] Never commit `.env.local` or `.env`
- [ ] Use strong passwords for admin accounts
- [ ] Enable Railway's domain SSL (automatic)
- [ ] Monitor logs for suspicious activity
- [ ] Regular database backups (Railway auto-backs up)

---

## 📞 Need Help?

| Resource | Link |
|----------|------|
| **Railway Docs** | https://docs.railway.app |
| **Railway Discord** | https://discord.gg/railway |
| **Next.js Docs** | https://nextjs.org/docs |
| **Prisma Docs** | https://www.prisma.io/docs |

---

## ✨ What's Included

### Documentation Files
- `RAILWAY_QUICK_START.md` - 5-minute guide
- `RAILWAY_DEPLOYMENT.md` - Complete guide
- `DEPLOYMENT_CHECKLIST.md` - Verification steps
- `DEPLOYMENT_SUMMARY.md` - Changes summary
- `FILES_OVERVIEW.md` - File reference
- `GETTING_STARTED.md` - This file

### Configuration Files
- `Dockerfile` - Production image
- `docker-compose.yml` - Local testing
- `railway.json` - Railway config
- `.env.example` - Environment template
- `.dockerignore` - Image optimization

### Code Files
- `lib/apiClient.ts` - API client utility
- `scripts/deploy.sh` - Migration script
- `.github/workflows/deploy.yml` - CI/CD

---

## 🎯 Success Criteria

You've successfully deployed when:

✅ Railway shows "Healthy" status  
✅ You can access the app via Railway domain  
✅ Login page loads without errors  
✅ Can log in with admin credentials  
✅ Dashboard displays employee data  
✅ Database operations work  
✅ Logs show no errors  

---

## 🎉 You're Ready!

Everything is configured and ready to deploy. Choose your path:

- **Quick Deploy**: Jump to Step 1 above
- **Learn More**: Read RAILWAY_DEPLOYMENT.md
- **Verify Setup**: Use DEPLOYMENT_CHECKLIST.md
- **See Changes**: Check DEPLOYMENT_SUMMARY.md

---

**Next Action**: `git push origin main` and create Railway project!

**Questions?** Check the documentation files or Railway Discord.

**Status**: ✅ Ready for Deployment

---

*Last Updated: June 12, 2026*  
*Hodophile Employee Portal v1.0.0*
