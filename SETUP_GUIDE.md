# Hodophile Employee Portal - Setup Guide

## Quick Start Guide

### Prerequisites
- Node.js v18 or higher
- PostgreSQL v12 or higher
- npm or yarn package manager

### 5-Minute Setup

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Setup environment
cp .env.example .env.local

# 3. Create database
createdb hodophile_portal

# 4. Setup Prisma
npx prisma generate
npx prisma db push

# 5. Seed database (optional)
npm run prisma:seed

# 6. Run development server
npm run dev

# 7. Open in browser
# Navigate to http://localhost:3000
```

---

## Detailed Setup Instructions

### Step 1: Prerequisites Installation

#### Install Node.js
- Download from [nodejs.org](https://nodejs.org/)
- Verify installation:
```bash
node --version  # v18.x or higher
npm --version   # v9.x or higher
```

#### Install PostgreSQL

**Windows:**
- Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run the installer and follow prompts
- Remember the superuser password

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Step 2: Clone Repository

```bash
git clone <repository-url>
cd hodophile-employee-portal
```

### Step 3: Install Dependencies

```bash
npm install --legacy-peer-deps
```

This will install:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- And all other required packages

### Step 4: Configure Environment

Create `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/hodophile_portal"

# JWT Configuration
JWT_SECRET="hodophile-employee-portal-secret-key-min-32-characters-long"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"
API_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

**Important:**
- Replace `your_password` with your PostgreSQL password
- Keep `JWT_SECRET` secure and long (min 32 chars)
- Never commit `.env.local` to version control

### Step 5: Setup PostgreSQL Database

#### Create Database

**Using PostgreSQL CLI:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hodophile_portal;

# Exit
\q
```

**Using pgAdmin GUI:**
- Open pgAdmin
- Right-click "Databases"
- Create Database
- Name: `hodophile_portal`
- Click Save

#### Initialize Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Verify with Prisma Studio
npx prisma studio
```

This will create all tables:
- users
- employees
- attendance
- salary_records

### Step 6: Seed Demo Data (Optional)

```bash
npm run prisma:seed
```

This creates:
- 1 Admin account
- 5 Employee accounts
- Sample attendance records
- Sample salary records

**Default Credentials:**
- Admin: `admin@hodophile.com` / `admin123`
- Employees: `[firstname]@hodophile.com` / `emp123`

### Step 7: Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

### Step 8: Access Application

1. Open browser to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Use demo credentials to login
4. Explore admin or employee dashboard

---

## Troubleshooting

### Issue: "DATABASE_URL is not set"

**Solution:**
```bash
# Make sure .env.local exists in root directory
ls -la .env.local

# If missing, create it:
cp .env.example .env.local

# Edit with your database details
```

### Issue: "connect ECONNREFUSED 127.0.0.1:5432"

**Solution:**
```bash
# Check if PostgreSQL is running

# macOS
brew services list

# Linux
sudo service postgresql status

# Windows
# Check Services app or use:
pg_isrunning
```

### Issue: "error: role 'postgres' does not exist"

**Solution:**
```bash
# List all roles
psql -U postgres -l

# Create missing role
createuser hodophile_user
```

### Issue: "Port 3000 is already in use"

**Solution:**
```bash
# Use different port
PORT=3001 npm run dev

# Or kill process using port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Prisma Client generation fails"

**Solution:**
```bash
# Clear cache and regenerate
rm -rf node_modules/.prisma
npx prisma generate --force

# If still failing, check schema:
npx prisma validate
```

### Issue: "bcryptjs compilation error"

**Solution:**
```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps --save bcryptjs

# Or use pre-built version
npm install --legacy-peer-deps
```

---

## Development Workflow

### Running Tests

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Building for Production

```bash
# Build
npm run build

# Start production server
npm start
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_field

# Apply pending migrations
npx prisma migrate deploy

# View database in studio
npx prisma studio
```

### Adding New Dependencies

```bash
# Always use --legacy-peer-deps for compatibility
npm install --legacy-peer-deps package-name
```

---

## Project Structure

```
hodophile-employee-portal/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Auth routes
│   │   └── login/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── admin/
│   │   ├── employee/
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   └── auth/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable React components
│   ├── layout/
│   ├── premium/
│   └── ui/
├── lib/                          # Utility functions
│   ├── auth.ts
│   ├── prisma.ts
│   └── utils.ts
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   └── useApi.ts
├── types/                        # TypeScript types
│   └── auth.ts
├── prisma/                       # Database schema
│   ├── schema.prisma
│   └── seed.ts
├── public/                       # Static assets
├── .env.example                  # Environment template
├── .env.local                    # Environment variables (git ignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build -- --analyze

# Check page performance
npm run build
npm start
```

### Database Optimization

```bash
# Use Prisma Studio for queries
npx prisma studio

# Enable query logging
// In lib/prisma.ts, uncomment log option
```

### Frontend Optimization

- Images are optimized with Next.js Image component
- CSS is minified with Tailwind CSS
- JavaScript is code-split and lazy-loaded
- Animations use Framer Motion with GPU acceleration

---

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - DATABASE_URL
# - JWT_SECRET
```

### Deploy to AWS

```bash
# Create Elastic Beanstalk environment
eb create hodophile-portal-prod

# Set environment variables
eb setenv DATABASE_URL=... JWT_SECRET=...

# Deploy
eb deploy
```

### Deploy to Heroku

```bash
# Install Heroku CLI
npm i -g heroku

# Create app
heroku create hodophile-portal

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Set environment
heroku config:set JWT_SECRET=...

# Deploy
git push heroku main
```

---

## Development Tips

### Useful VS Code Extensions

- **Prisma** - Prisma schema syntax highlighting
- **Tailwind CSS IntelliSense** - Tailwind class autocomplete
- **TypeScript Vue Plugin** - Better TypeScript support
- **ESLint** - Linting integration
- **Prettier** - Code formatter

### Debug Mode

```bash
# Run with debugging
DEBUG=* npm run dev

# Or in VS Code, use built-in debugger
# Launch configuration in .vscode/launch.json
```

### Prisma Tips

```bash
# Reset database (careful!)
npx prisma migrate reset

# Generate types only
npx prisma generate --only

# View raw SQL
npx prisma studio
```

---

## Security Notes

1. **Never commit `.env.local`** - It contains sensitive data
2. **JWT_SECRET should be:**
   - At least 32 characters long
   - Cryptographically random
   - Unique per environment
   - Never shared publicly

3. **Password hashing:** Uses bcryptjs with salt rounds = 10
4. **API authentication:** JWT tokens with 7-day expiry
5. **HTTPS:** Enable in production only
6. **CORS:** Configure based on frontend domain

---

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## FAQ

### Q: Can I use MySQL instead of PostgreSQL?

**A:** Yes, update `DATABASE_URL` in `.env.local`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/hodophile_portal"
```

### Q: How do I change the port?

**A:** 
```bash
PORT=3001 npm run dev
```

### Q: How do I add a new database table?

**A:**
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_migration_name`
3. Schema will be updated

### Q: Can I run this with yarn instead of npm?

**A:** Yes, but use consistent package manager throughout:
```bash
yarn install
yarn dev
```

### Q: How do I backup the database?

**A:**
```bash
# PostgreSQL backup
pg_dump hodophile_portal > backup.sql

# Restore from backup
psql hodophile_portal < backup.sql
```

---

**Last Updated:** June 2024
**Version:** 1.0.0
