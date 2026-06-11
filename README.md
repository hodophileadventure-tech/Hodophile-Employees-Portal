# Hodophile Employee Portal

A premium, production-ready Employee Management System built with modern technologies. Features role-based access control, attendance tracking, and salary management with a beautiful, responsive user interface.

## 🎯 Features

### Authentication & Authorization
- 🔐 JWT-based authentication
- 👥 Role-based access control (Admin, Employee)
- 🔒 Secure password hashing with bcryptjs
- 📱 Responsive login page

### Admin Dashboard
- 📊 Comprehensive dashboard with key metrics
- 👥 Employee management (Add, Edit, Delete, Activate/Deactivate)
- 📅 Attendance tracking and reporting
- 💰 Salary management and processing
- 📈 Department-wise distribution
- 🎯 Recent activity feed

### Employee Features
- 🏠 Personal dashboard with salary progress
- 👤 Profile management and viewing
- ✅ Attendance history and status
- 💼 Salary information and calculations
- 📊 Performance tracking

### Technical Features
- ✨ Smooth animations with Framer Motion
- 🌙 Dark mode support
- 📱 Fully responsive design
- ♿ Accessible UI components
- 🎨 Premium design inspired by Linear, Stripe, Notion
- ⚡ Fast performance optimization
- 🔄 Real-time data updates

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - Premium UI components
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful icon library
- **Sonner** - Toast notifications
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API
- **Node.js** - JavaScript runtime

### Database
- **PostgreSQL** - Relational database
- **Prisma ORM** - Modern database client

### Authentication
- **JWT** - JSON Web Tokens
- **bcryptjs** - Password hashing
- **LocalStorage** - Token persistence

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hodophile-employee-portal
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hodophile_portal"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"
API_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

### 4. Setup PostgreSQL Database

#### Option A: Using Local PostgreSQL

```bash
# Create database
createdb hodophile_portal

# Setup Prisma
npx prisma db push
```

#### Option B: Using Docker

```bash
# Start PostgreSQL container
docker run --name hodophile-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=hodophile_portal \
  -p 5432:5432 \
  -d postgres:15
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Seed Database (Optional)

```bash
npm run prisma:seed
```

This will create:
- 1 Admin user (admin@hodophile.com / admin123)
- 5 Employee users (sample data)
- Attendance records
- Salary records

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📚 Project Structure

```
hodophile-employee-portal/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── attendance/
│   │   │   ├── salary/
│   │   │   └── reports/
│   │   ├── employee/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── attendance/
│   │   │   └── salary/
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       └── login/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopNavigation.tsx
│   ├── premium/
│   │   ├── StatCard.tsx
│   │   └── ProgressRing.tsx
│   └── ui/ (ShadCN components)
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── utils.ts
├── types/
│   └── auth.ts
├── hooks/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── styles/
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── README.md
```

## 🔐 Demo Credentials

### Admin Account
- **Email:** admin@hodophile.com
- **Password:** admin123

### Employee Accounts
- **Email:** ahmed@hodophile.com / **Password:** emp123
- **Email:** fatima@hodophile.com / **Password:** emp123
- **Email:** muhammad@hodophile.com / **Password:** emp123
- **Email:** saira@hodophile.com / **Password:** emp123
- **Email:** omar@hodophile.com / **Password:** emp123

## 📖 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm start               # Start production server

# Linting
npm run lint            # Run ESLint

# Prisma
npm run prisma          # Access Prisma CLI
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Create and run migrations
npm run prisma:seed     # Seed database
npm run db:push         # Push schema to database
npm run db:studio       # Open Prisma Studio
```

## 🗂️ Database Schema

### Users Table
- id, email, password, role, createdAt, updatedAt

### Employees Table
- id, userId, fullName, profilePicture, cnicNumber, email, phoneNumber, address
- emergencyContactName, emergencyContactNumber
- employeeId, designation, department, joiningDate
- monthlySalary, status, createdAt, updatedAt

### Attendance Table
- id, employeeId, date, checkInTime, checkOutTime, workingHours, status
- createdAt, updatedAt

### Salary Records Table
- id, employeeId, month, daysWorked, totalSalary, earnedSalary
- deductions, netSalary, status, createdAt, updatedAt

## 🎨 Design System

### Color Palette
- **Primary:** #2563EB (Blue)
- **Success:** #10B981 (Green)
- **Warning:** #F59E0B (Orange)
- **Danger:** #EF4444 (Red)

### Typography
- **Heading 1:** 32px, Bold
- **Heading 2:** 28px, Bold
- **Heading 3:** 24px, SemiBold
- **Body:** 14px, Regular

### Components
- StatCard - Animated metric cards
- ProgressRing - Circular progress indicator
- DataTable - Premium data table with sorting/filtering
- Modal - Dialog components
- Toast - Notification system

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Employees (Admin Only)
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Employee check-in
- `POST /api/attendance/checkout` - Employee check-out

### Salary
- `GET /api/salary` - Get salary records
- `POST /api/salary/calculate` - Calculate salary
- `POST /api/salary/process` - Process salary (Admin only)

## 🌙 Dark Mode

The application supports a beautiful dark mode. Toggle dark mode using the theme switcher in the navigation bar.

## 📱 Responsive Design

The application is fully responsive and works perfectly on:
- 📱 Mobile (< 640px)
- 📱 Tablet (640px - 1024px)
- 💻 Desktop (> 1024px)

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t hodophile-portal .

# Run container
docker run -p 3000:3000 hodophile-portal
```

## 📝 Environment Variables

See `.env.example` for all available environment variables.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support, email support@hodophile.com or open an issue in the repository.

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] SMS alerts
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Performance improvements
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit and integration tests
- [ ] CI/CD pipeline

## 🙏 Acknowledgments

- Built with Next.js 15
- Styled with Tailwind CSS
- Animated with Framer Motion
- Icons by Lucide
- Inspired by premium SaaS products (Linear, Stripe, Notion)

---

**Made with ❤️ for professional employee management**
