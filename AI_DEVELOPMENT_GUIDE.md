# Hodophile Employee Portal - AI Development Guide

## Overview

This guide helps AI assistants understand the project structure, conventions, and patterns used in Hodophile Employee Portal for efficient and consistent development.

---

## Project Context

### What is Hodophile Employee Portal?
A production-ready Employee Management System built with Next.js 15, TypeScript, Tailwind CSS, and PostgreSQL. It features premium UI/UX comparable to modern SaaS products with role-based access control (Admin/Employee).

### Key Success Metrics
- Build completes successfully with 18 static pages
- Zero TypeScript errors in strict mode
- ESLint passes all checks
- Responsive across mobile, tablet, desktop
- Dark mode fully implemented
- Smooth animations with Framer Motion

---

## Development Principles

### 1. Code Organization
- **One file, one responsibility:** Each component/util has a single clear purpose
- **Named exports:** Use named exports for utilities, default export for components
- **Type safety:** Enable strict TypeScript mode always
- **File naming:** kebab-case for files (MyComponent.tsx), PascalCase for components

### 2. Code Quality
- **Comments for "why":** Explain intent, not implementation
- **Self-documenting code:** Use clear variable/function names
- **Error handling:** Always handle API errors gracefully
- **Loading states:** Provide feedback during data fetching
- **Validation:** Validate input before processing

### 3. User Experience
- **Instant feedback:** Toast notifications for actions
- **Smooth transitions:** Use animations for state changes
- **Accessibility:** Semantic HTML, ARIA labels, keyboard nav
- **Responsive:** Mobile-first, test at 320px, 768px, 1024px
- **Dark mode:** Always support dark mode

### 4. Performance
- **Lazy load:** Use dynamic imports for heavy components
- **Optimize images:** Use Next.js Image component
- **Memoize:** Use useMemo/useCallback for expensive operations
- **Bundle size:** Keep vendor bundles small
- **Database:** Use indexes for common queries

---

## Code Patterns & Conventions

### Component Pattern

```typescript
'use client' // For interactive components

import { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface MyComponentProps {
  title: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

/**
 * MyComponent provides a reusable component with premium styling.
 * 
 * @example
 * <MyComponent title="Hello" variant="primary">
 *   Content here
 * </MyComponent>
 */
export default function MyComponent({
  title,
  children,
  variant = 'primary',
}: MyComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg ${
        variant === 'primary' ? 'bg-primary-500' : 'bg-slate-200'
      }`}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </motion.div>
  )
}
```

### Hook Pattern

```typescript
'use client'

import { useState, useCallback } from 'react'

interface UseMyHookReturn {
  state: string
  setState: (value: string) => void
  reset: () => void
}

/**
 * Custom hook for managing specific state with utilities.
 */
export function useMyHook(): UseMyHookReturn {
  const [state, setState] = useState('')

  const reset = useCallback(() => {
    setState('')
  }, [])

  return { state, setState, reset }
}
```

### Utility Function Pattern

```typescript
/**
 * Calculates the working hours between check-in and check-out.
 * 
 * @param checkIn - Check-in datetime
 * @param checkOut - Check-out datetime
 * @returns Working hours rounded to 2 decimals
 * 
 * @example
 * calculateWorkingHours(new Date('09:00'), new Date('17:30')) // 8.5
 */
export function calculateWorkingHours(
  checkIn: Date,
  checkOut: Date,
): number {
  const ms = checkOut.getTime() - checkIn.getTime()
  const hours = ms / (1000 * 60 * 60)
  return Math.round(hours * 100) / 100
}
```

### API Endpoint Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/employees
 * Retrieve list of employees with optional filtering
 * 
 * Query params:
 * - department?: string (filter by department)
 * - page?: number (pagination, default 1)
 * - limit?: number (per page, default 10)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const department = searchParams.get('department')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '10')

    // Build query
    const where = department ? { department } : {}
    const skip = (page - 1) * limit

    // Fetch data
    const employees = await prisma.employee.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        email: true,
        designation: true,
        department: true,
      },
    })

    const total = await prisma.employee.count({ where })

    return NextResponse.json({
      success: true,
      employees,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        perPage: limit,
      },
    })
  } catch (error) {
    console.error('GET /api/employees error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employees' },
      { status: 500 },
    )
  }
}
```

### Page Pattern

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { toast } from 'sonner'

export default function EmployeesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { get: fetchEmployees, loading } = useApi()
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState<string | null>(null)

  // Authorization check
  useEffect(() => {
    if (!authLoading && user?.role !== 'ADMIN') {
      router.push('/employee/dashboard')
    }
  }, [user, authLoading, router])

  // Fetch data
  useEffect(() => {
    if (!authLoading && user?.id) {
      loadEmployees()
    }
  }, [user, authLoading])

  async function loadEmployees() {
    try {
      const response = await fetchEmployees('/api/employees')
      setEmployees(response.employees)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load'
      setError(message)
      toast.error(message)
    }
  }

  if (authLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Employees</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage and view all employees
        </p>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 text-danger-700">
          {error}
        </div>
      )}

      {/* Your content here */}
    </div>
  )
}
```

---

## Common Tasks & How To

### Adding a New Page

1. **Create the directory structure:**
   ```
   app/(dashboard)/admin/new-feature/page.tsx
   ```

2. **Create the page component:**
   ```typescript
   'use client'
   
   export default function NewFeaturePage() {
     return <div>New Feature</div>
   }
   ```

3. **Add navigation in Sidebar.tsx:**
   ```typescript
   // In admin menu array
   {
     label: 'New Feature',
     href: '/admin/new-feature',
     icon: <IconName className="w-5 h-5" />,
   }
   ```

### Adding a New Component

1. **Create component file:**
   ```
   components/premium/MyNewComponent.tsx
   ```

2. **Create with TypeScript interface:**
   ```typescript
   interface MyNewComponentProps {
     prop1: string
     prop2?: number
   }
   
   export default function MyNewComponent({ prop1, prop2 }: MyNewComponentProps) {
     return <div>{prop1}</div>
   }
   ```

3. **Use in pages:**
   ```typescript
   import MyNewComponent from '@/components/premium/MyNewComponent'
   
   <MyNewComponent prop1="value" />
   ```

### Adding a New API Endpoint

1. **Create route file:**
   ```
   app/api/feature/route.ts
   ```

2. **Implement with proper error handling:**
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   
   export async function GET(request: NextRequest) {
     try {
       // Your logic
       return NextResponse.json({ success: true })
     } catch (error) {
       return NextResponse.json(
         { success: false, message: 'Error' },
         { status: 500 }
       )
     }
   }
   ```

### Styling Components

1. **Use Tailwind utilities:**
   ```tsx
   <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-md">
     Content
   </div>
   ```

2. **For complex styles, create utility CSS:**
   ```css
   @layer components {
     .card-premium {
       @apply p-6 rounded-xl bg-white dark:bg-slate-800 shadow-lg;
     }
   }
   ```

3. **Use custom colors consistently:**
   - Primary: `primary-500` for main actions
   - Success: `success` for positive states
   - Warning: `warning` for cautions
   - Danger: `danger` for errors/deletions

### Adding Animations

1. **Page entrance:**
   ```typescript
   import { motion } from 'framer-motion'
   
   <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.4 }}
   >
     Content
   </motion.div>
   ```

2. **Hover effects:**
   ```typescript
   <motion.button
     whileHover={{ scale: 1.05 }}
     whileTap={{ scale: 0.95 }}
   >
     Click me
   </motion.button>
   ```

3. **Staggered items:**
   ```typescript
   const container = {
     hidden: { opacity: 0 },
     visible: {
       opacity: 1,
       transition: { staggerChildren: 0.1 },
     },
   }
   
   <motion.div variants={container}>
     {items.map((item) => <Item key={item.id} />)}
   </motion.div>
   ```

### Working with Authentication

1. **Check if user is authenticated:**
   ```typescript
   const { user, isAuthenticated } = useAuth()
   
   if (!isAuthenticated) return <Redirect />
   ```

2. **Check user role:**
   ```typescript
   if (user?.role !== 'ADMIN') {
     return <UnauthorizedPage />
   }
   ```

3. **Make authenticated API calls:**
   ```typescript
   const { post } = useApi()
   const response = await post('/api/endpoint', { data })
   ```

### Handling Forms

1. **Create form with validation:**
   ```typescript
   const [formData, setFormData] = useState({
     email: '',
     password: '',
   })

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setFormData(prev => ({
       ...prev,
       [e.target.name]: e.target.value,
     }))
   }

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     // Validate and submit
   }
   ```

2. **Show validation errors:**
   ```typescript
   {error && (
     <div className="text-danger-600 text-sm">
       {error}
     </div>
   )}
   ```

### Database Queries

1. **In Prisma:**
   ```typescript
   // Single record
   const user = await prisma.user.findUnique({
     where: { email: 'user@example.com' },
   })

   // Multiple records
   const employees = await prisma.employee.findMany({
     where: { department: 'Engineering' },
     take: 10,
     skip: 0,
   })

   // With relations
   const user = await prisma.user.findUnique({
     where: { id: 'user-id' },
     include: { employee: true },
   })
   ```

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `lib/auth.ts` | JWT and password utilities |
| `lib/prisma.ts` | Prisma client singleton |
| `lib/utils.ts` | Formatting and calculation helpers |
| `hooks/useAuth.ts` | Auth state management |
| `hooks/useApi.ts` | API request helper |
| `prisma/schema.prisma` | Database schema definition |
| `tailwind.config.ts` | Tailwind customization |
| `app/globals.css` | Global styles and components |
| `.env.local` | Environment variables |

---

## Debugging Tips

### Issue: Component not rendering
- Check if it's a server component vs client component ('use client')
- Check if all imports are correct
- Verify TypeScript types match

### Issue: Styles not applying
- Check if Tailwind CSS is configured correctly
- Verify dark mode classes are used
- Check CSS specificity conflicts
- Clear Next.js cache: `rm -rf .next`

### Issue: API not working
- Check API route path matches import
- Verify JWT token is being sent
- Check database connection
- Review error logs in console

### Issue: Build fails
- Run `npm run lint` to check ESLint
- Run `npx tsc --noEmit` to check TypeScript
- Check for circular imports
- Verify all dependencies are installed

---

## Testing Workflow

### Before committing code:
```bash
# Check types
npx tsc --noEmit

# Check linting
npm run lint

# Build to verify
npm run build
```

### Manual testing checklist:
- [ ] Component renders without errors
- [ ] Responsive design works (test at 320px, 768px, 1024px)
- [ ] Dark mode looks correct
- [ ] Animations are smooth
- [ ] Forms validate properly
- [ ] API calls succeed
- [ ] Error states display correctly
- [ ] Loading states show feedback

---

## Performance Optimization Guidelines

### Frontend
- Use dynamic imports for large components
- Memoize expensive computations
- Optimize re-renders with React.memo
- Use proper image dimensions

### Backend
- Use database indexes
- Implement pagination
- Select only needed fields
- Use eager loading (include) wisely
- Cache common queries

### API
- Compress responses with gzip
- Set appropriate Cache-Control headers
- Limit response payload size
- Use pagination for large datasets

---

## Common Gotchas

1. **'use client' is required for interactive features**
   - Event handlers, state, hooks need 'use client'
   - Server components can't use useState/useEffect

2. **Environment variables need NEXT_PUBLIC_ prefix for frontend**
   - Backend: `DATABASE_URL=...`
   - Frontend: `NEXT_PUBLIC_API_URL=...`

3. **Apostrophes in JSX need escaping**
   - ❌ `You're approved`
   - ✅ `You&apos;re approved`

4. **Toast notifications need Toaster provider**
   - Already in root layout
   - Just import and use: `toast.success('Message')`

5. **Protected routes need authentication checks**
   - Use useAuth hook to verify
   - Redirect to /login if not authenticated

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run lint            # Check code style
npm run build           # Build for production

# Database
npx prisma studio      # View database GUI
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to database
npm run prisma:seed    # Seed with sample data

# Debugging
DEBUG=* npm run dev    # Run with debug logs
```

---

## Git Workflow

### Before making changes:
```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
```

### After making changes:
```bash
npm run lint -- --fix   # Fix lint issues
npm run build           # Verify build passes
git add .
git commit -m "feat: Add my feature"
git push origin feature/my-feature
```

---

## Code Review Checklist

When reviewing code, verify:
- [ ] TypeScript types are correct
- [ ] No console.log/debugger statements
- [ ] Error handling is present
- [ ] Loading states work
- [ ] Responsive design maintained
- [ ] Dark mode works
- [ ] Animations are smooth
- [ ] No performance issues
- [ ] Accessibility is maintained
- [ ] Comments explain complex logic

---

## Resources for AI Assistants

### Documentation Files
- [README.md](README.md) - Project overview
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Installation instructions
- [FEATURES.md](FEATURES.md) - Feature list
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - Design specifications
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Technical architecture

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Framer Motion Docs](https://www.framer.com/motion)

---

## Project Statistics

- **Total Files:** 40+
- **Total Lines of Code:** 5000+
- **Components:** 10+
- **Pages:** 18
- **API Endpoints:** 1 (expandable)
- **Database Tables:** 4
- **Styles:** 500+ Tailwind utilities

---

## Support

If you encounter issues or need clarification:
1. Check the relevant documentation file
2. Review similar implementations in the codebase
3. Check TypeScript error messages
4. Review console error logs
5. Check .env.local configuration

---

**Guide Version:** 1.0
**Last Updated:** June 2024
**Maintained By:** Development Team
