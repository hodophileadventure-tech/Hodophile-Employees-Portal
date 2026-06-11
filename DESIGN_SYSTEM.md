# Hodophile Employee Portal - Design System

## Brand Identity

**Portal Name:** Hodophile Employee Portal
**Target:** Corporate HR Management for Enterprises
**Design Philosophy:** Premium, modern, minimal, and professional (inspired by Linear, Stripe, Notion)

---

## Color Palette

### Primary Colors
- **Primary Blue:** `#2563EB` (rgb: 37, 99, 235) - Main brand color
- **Primary Dark:** `#1E40AF` (rgb: 30, 64, 175) - Hover/active state
- **Primary Light:** `#3B82F6` (rgb: 59, 130, 246) - Secondary usage

### Secondary Colors
- **Success Green:** `#10B981` (rgb: 16, 185, 145) - Check-in, present
- **Warning Orange:** `#F59E0B` (rgb: 245, 158, 11) - Pending, absent
- **Danger Red:** `#EF4444` (rgb: 239, 68, 68) - Errors, critical
- **Info Cyan:** `#06B6D4` (rgb: 6, 182, 212) - Information

### Neutral Colors
- **Slate-900:** `#0F172A` (rgb: 15, 23, 42) - Text primary (dark mode)
- **Slate-800:** `#1E293B` (rgb: 30, 41, 59) - Text secondary (dark mode)
- **Slate-700:** `#334155` (rgb: 51, 65, 85) - Text tertiary (dark mode)
- **Slate-200:** `#E2E8F0` (rgb: 226, 232, 240) - Border (dark mode)
- **Slate-100:** `#F1F5F9` (rgb: 241, 245, 249) - Background (dark mode)
- **White:** `#FFFFFF` - Background primary (light mode)
- **Gray-50:** `#F9FAFB` (rgb: 249, 250, 251) - Background secondary (light mode)

### Light Mode (Default)
- Background: White
- Text Primary: Slate-900
- Text Secondary: Slate-600
- Border: Slate-200
- Surface: Gray-50

### Dark Mode
- Background: Slate-950 (`#030712`)
- Text Primary: Slate-50
- Text Secondary: Slate-400
- Border: Slate-700
- Surface: Slate-900 (`#0F172A`)

---

## Typography System

### Font Family
- **Primary:** Inter (system font stack fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI')
- **Monospace:** JetBrains Mono (for code, IDs)

### Typography Scale

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Heading 1 | 32px | 700 | 40px | -0.02em | Page titles |
| Heading 2 | 28px | 700 | 36px | -0.02em | Section titles |
| Heading 3 | 24px | 600 | 32px | -0.01em | Subsection titles |
| Heading 4 | 20px | 600 | 28px | -0.01em | Card titles |
| Body Large | 16px | 400 | 24px | 0em | Body text |
| Body Base | 14px | 400 | 20px | 0em | Base text |
| Body Small | 12px | 400 | 18px | 0em | Secondary text |
| Label | 12px | 500 | 16px | 0.02em | Labels, badges |
| Caption | 11px | 500 | 16px | 0.02em | Captions, help text |
| Code | 13px | 400 | 20px | 0em | Code blocks |

---

## Spacing System

```
2px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 56px, 64px
```

### Common Spacing Usage
- **Component Padding:** 16px
- **Card Padding:** 24px
- **Section Gap:** 32px
- **Page Gap:** 40px

---

## Shadow System

```
// Elevation shadows (Tailwind)
shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1)
shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

// Elevation system
Elevation 1: shadow-sm (Hover cards, borders)
Elevation 2: shadow-md (Interactive elements)
Elevation 3: shadow-lg (Modals, dropdowns)
Elevation 4: shadow-xl (Important modals)
Elevation 5: shadow-2xl (Critical modals)
```

---

## Border Radius

```
2px - Sharp corners (tables, code blocks)
4px - Subtle (form inputs, small components)
6px - Standard (buttons, badges)
8px - Cards (cards, medium components)
12px - Large (modals, drawers)
16px - Extra large (hero sections)
9999px - Rounded (pills, avatars)
```

---

## Component Sizes

### Button Sizes
- **Small:** 32px height, 12px padding
- **Medium:** 40px height, 16px padding (default)
- **Large:** 48px height, 20px padding

### Input Sizes
- **Small:** 32px height
- **Medium:** 40px height (default)
- **Large:** 48px height

### Avatar Sizes
- **XS:** 24px
- **SM:** 32px
- **MD:** 40px
- **LG:** 56px
- **XL:** 80px

---

## Animation & Motion

### Timing Functions
- **Fast:** 150ms (micro-interactions)
- **Normal:** 300ms (standard transitions)
- **Slow:** 500ms (page transitions)
- **Slower:** 800ms (complex animations)

### Easing
- **Ease In:** `cubic-bezier(0.4, 0, 1, 1)`
- **Ease Out:** `cubic-bezier(0, 0, 0.2, 1)`
- **Ease In Out:** `cubic-bezier(0.4, 0, 0.2, 1)` (default)
- **Spring:** `cubic-bezier(0.16, 1, 0.3, 1)`

### Animation Patterns
1. **Page Entry:** Fade in + subtle slide up (300ms)
2. **Card Hover:** Scale 1.02 + shadow increase (150ms)
3. **Button Click:** Scale 0.98 (100ms)
4. **Loading:** Smooth spinner rotation (2s)
5. **Toast:** Slide in from bottom + fade (300ms)
6. **Modal:** Fade backdrop + scale content (300ms)
7. **Sidebar Toggle:** Slide animation (200ms)
8. **Counter Animation:** Number scroll (600ms)

---

## Responsive Breakpoints

```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: 1024px - 1440px
Large Desktop: > 1440px
```

### Mobile-First Approach
- Base styles for mobile
- `sm:` for 640px+
- `md:` for 768px+
- `lg:` for 1024px+
- `xl:` for 1280px+
- `2xl:` for 1536px+

---

## Component Library Architecture

### Core Components
1. **Layout**
   - Sidebar Navigation
   - Top Navigation
   - Main Container
   - Responsive Grid

2. **Forms**
   - Input (with validation)
   - Select (with search)
   - Textarea
   - Checkbox
   - Radio Button
   - Date Picker

3. **Data Display**
   - DataTable (with sorting, filtering, pagination)
   - Card
   - Badge
   - Progress Bar
   - Progress Ring
   - Stat Card

4. **Feedback**
   - Button (variants: primary, secondary, ghost, danger)
   - Toast Notification
   - Modal Dialog
   - Confirm Dialog
   - Alert
   - Skeleton Loader

5. **Navigation**
   - Sidebar Link
   - Breadcrumb
   - Tabs
   - Dropdown Menu

6. **Premium Components**
   - Animated Stat Card
   - Chart Container
   - Timeline
   - Activity Feed
   - Employee Card
   - Attendance Widget
   - Salary Widget

---

## Dashboard Layout Plan

### Admin Dashboard
```
┌─────────────────────────────────────┐
│        Top Navigation Bar           │
├────────────┬──────────────────────────┤
│  Sidebar   │                         │
│ Navigation │   Main Content Area      │
│            │                         │
│            │  Metrics Row (4 cards)   │
│            │  ├─ Total Employees    │
│            │  ├─ Present Today      │
│            │  ├─ Absent Today       │
│            │  └─ Monthly Salary Exp │
│            │                         │
│            │  Charts & Widgets Row   │
│            │  ├─ Attendance Chart   │
│            │  ├─ Salary Chart       │
│            │  └─ Dept Distribution  │
│            │                         │
│            │  Recent Activity       │
│            │  └─ Activity Timeline  │
└────────────┴──────────────────────────┘
```

### Employee Dashboard
```
┌─────────────────────────────────────┐
│        Top Navigation Bar           │
├────────────┬──────────────────────────┤
│  Sidebar   │                         │
│ Navigation │   Main Content Area      │
│            │                         │
│            │  Welcome Section        │
│            │  ├─ Greeting           │
│            │  └─ Quick Actions      │
│            │                         │
│            │  Key Metrics (4 cards)  │
│            │  ├─ Monthly Salary     │
│            │  ├─ Earned Till Today  │
│            │  ├─ Present Days       │
│            │  └─ Absent Days        │
│            │                         │
│            │  Today's Status        │
│            │  ├─ Check-in Status    │
│            │  ├─ Working Hours      │
│            │  └─ Quick Action       │
│            │                         │
│            │  Monthly Progress      │
│            │  └─ Progress Rings     │
└────────────┴──────────────────────────┘
```

---

## Premium Design Principles

1. **Whitespace:** Generous spacing for clarity
2. **Hierarchy:** Clear visual hierarchy with typography
3. **Color:** Minimal, purposeful use of color
4. **Micro-interactions:** Smooth, subtle animations
5. **Consistency:** Unified design language
6. **Accessibility:** WCAG 2.1 AA compliance
7. **Performance:** Optimized animations and assets
8. **States:** Clear visual states (hover, active, disabled, loading)

---

## Implementation Guidelines

### Development Priorities
1. Mobile responsiveness first
2. Accessible semantics
3. Performance optimization
4. Dark mode support
5. Animation smoothness
6. Consistent spacing

### Code Quality
- TypeScript strict mode
- Reusable component patterns
- Custom hooks for logic
- Organized file structure
- Clear naming conventions
- Comprehensive comments

---

## File Structure

```
hodophile-employee-portal/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   ├── employee/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── employees/
│   │   ├── attendance/
│   │   └── salary/
│   └── globals.css
├── components/
│   ├── ui/ (ShadCN components)
│   ├── layout/
│   ├── forms/
│   ├── data-display/
│   ├── feedback/
│   └── premium/
├── lib/
│   ├── auth.ts
│   ├── api.ts
│   └── utils.ts
├── hooks/
├── types/
├── styles/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/
```

---

## Next Steps

1. Set up Next.js 15 project with TypeScript
2. Install and configure Tailwind CSS
3. Set up ShadCN UI components
4. Configure Prisma with PostgreSQL
5. Create database schema
6. Implement authentication
7. Build layout components
8. Create reusable component library
9. Build admin dashboard
10. Build employee dashboard
11. Implement all features
12. Add animations and polish
