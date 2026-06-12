# Railway Deployment Guide

Complete guide to deploy the Hodophile Employee Portal to Railway.

## Prerequisites

- Railway.app account (free tier available)
- Git repository (GitHub/GitLab)
- Node.js 20+ (for local testing)

## Deployment Steps

### Step 1: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Log in or sign up
3. Click **"Create New Project"**
4. Select **"Deploy from Git"**
5. Authorize and select your repository

---

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"Add Service"**
2. Select **"PostgreSQL"**
3. Railway automatically adds the `DATABASE_URL` environment variable

---

### Step 3: Configure Environment Variables

In your Railway project settings, click on the **Next.js service** and go to **Variables**:

```
DATABASE_URL=postgresql://[auto-populated]
JWT_SECRET=generate-a-secure-random-string-here
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app-name.railway.app
```

**To generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 4: Run Database Migrations

After the initial deployment, you need to migrate your database:

#### Option A: Using Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g railway

# Login to Railway
railway login

# Link to your project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Generate Prisma client
railway run npx prisma generate
```

#### Option B: Using Railway Dashboard

1. Go to your project's **Deployments** tab
2. Click the latest deployment
3. Open the **Service Shell**
4. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

#### Option C: Auto-run with Nixpacks

Add a build script to `package.json`:

```json
{
  "scripts": {
    "build": "next build",
    "postinstall": "prisma generate"
  }
}
```

Then in Railway Variables, add:
```
MIGRATE_ON_START=true
```

Create a `start.sh` script:

```bash
#!/bin/bash
npx prisma migrate deploy || true
npm start
```

Update Dockerfile CMD:
```dockerfile
CMD ["sh", "start.sh"]
```

---

### Step 5: Deploy

1. Push your changes to your Git repository
2. Railway automatically redeploys
3. Monitor the build in the **Deployments** tab
4. Once deployed, click **"View Domain"** to access your app

---

## Verification

After deployment:

1. **Check application**: Visit your Railway domain
2. **Test login**: Try the login functionality
3. **Check database**: Use Prisma Studio
   ```bash
   railway run npx prisma studio
   ```
4. **View logs**: Check Railway dashboard for any errors

---

## Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Ensure `package.json` scripts are correct
- Verify Node.js version compatibility

### Database Connection Error
- Verify `DATABASE_URL` is set in Variables
- Ensure PostgreSQL service is deployed
- Check Prisma schema uses `postgresql` provider

### 502/503 Errors
- App might be starting; wait a moment
- Check application logs in Railway dashboard
- Ensure `npm start` command works locally

### CORS Errors
- Update `NEXT_PUBLIC_API_URL` to your Railway domain
- Check API route configuration

---

## Scaling & Performance

### Memory & CPU
1. Go to your service settings
2. Adjust resource allocation as needed
3. Monitor usage in the **Metrics** tab

### Database Backups
Railway automatically backs up PostgreSQL. View in **PostgreSQL service > Backups**

### Custom Domain
1. Go to **Settings > Domains**
2. Add your custom domain
3. Configure DNS records as instructed

---

## Rollback & Updates

### Rollback to Previous Deployment
1. Go to **Deployments** tab
2. Click the deployment you want to restore
3. Click **"Redeploy"**

### Update Your Application
1. Push changes to your Git repository
2. Railway automatically redeploys
3. Database migrations run if configured

---

## Monitoring

### View Logs
```bash
railway logs --tail 100
```

### View Environment Variables
```bash
railway variables
```

### SSH into Service
```bash
railway shell
```

---

## Cost Management

- **Free tier**: 5GB storage, limited compute
- **Pay-as-you-go**: Scales beyond free tier
- **PostgreSQL**: Charges based on data usage
- Monitor usage in **Billing** section

---

## Security Best Practices

✅ Use strong JWT_SECRET (32+ characters)
✅ Keep environment variables private
✅ Enable Railway's built-in HTTPS
✅ Regularly update dependencies
✅ Use strong passwords for admin accounts
✅ Monitor logs for suspicious activity

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Railway Discord**: Community support

---

**Last Updated**: June 2026
**App**: Hodophile Employee Portal v1.0.0
