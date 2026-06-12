# Quick Start Guide - Railway Deployment

Get your Hodophile Employee Portal running on Railway in 5 minutes!

## 1️⃣ Quick Setup (5 minutes)

```bash
# Clone and setup locally (if not already done)
git clone <your-repo-url>
cd Hodophile\ Employee\ Portal
npm install
```

## 2️⃣ Create Railway Project

1. Go to https://railway.app
2. Log in with GitHub
3. Click **"Create New"** → **"From Git Repo"**
4. Select this repository
5. Click **Deploy**

Railway automatically starts building your app ✨

## 3️⃣ Add Database

1. In Railway dashboard, click **"Add Service"**
2. Select **PostgreSQL**
3. That's it! Railway links it automatically

## 4️⃣ Set Variables

Click your **Next.js service** → **Variables** tab:

```
DATABASE_URL=<auto-filled>
JWT_SECRET=<generate random: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app-name.railway.app
```

## 5️⃣ Run Migrations

In your terminal:

```bash
npm install -g railway
railway login
railway link
railway run npx prisma migrate deploy
```

✅ **Done!** Your app is live!

---

## 🧪 Test Your Deployment

1. Get your Railway domain: **Deployments** → **Click domain**
2. Test login: `admin@hodophile.com` / `admin123`
3. Check admin dashboard loads
4. View employee records

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| 502 Error | App may be starting, wait 1-2 minutes |
| Build fails | Check Railway logs for error details |
| Login fails | Verify `DATABASE_URL` is set |
| Blank page | Check browser console for errors |

## 📚 Full Documentation

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed instructions.

## 🆘 Need Help?

1. Check [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
2. Check [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
3. Visit https://docs.railway.app
4. Join Railway Discord: https://discord.gg/railway

---

**Estimated time to live**: 10-15 minutes ⏱️
