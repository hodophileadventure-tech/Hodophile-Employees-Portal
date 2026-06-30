// components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  LayoutDashboard,
  Users,
  Clock,
  DollarSign,
  Settings,
  LogOut,
  ChevronDown,
  User,
  FileText,
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import BrandLogo from '@/components/layout/BrandLogo'

interface SidebarProps {
  isOpen: boolean
  role: 'ADMIN' | 'EMPLOYEE'
  onClose?: () => void
}

export default function Sidebar({ isOpen, role, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard'])

  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menu)
        ? prev.filter((m) => m !== menu)
        : [...prev, menu]
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const isActive = (path: string) => pathname === path

  const adminMenus = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      label: 'Employees',
      icon: Users,
      submenu: [
        { label: 'All Employees', path: '/admin/employees' },
        { label: 'Add Employee', path: '/admin/employees/add' },
      ],
    },
    {
      label: 'Attendance',
      icon: Clock,
      submenu: [
        { label: 'Daily Report', path: '/admin/attendance/daily' },
        { label: 'Monthly Report', path: '/admin/attendance/monthly' },
      ],
    },
    {
      label: 'Salary',
      icon: DollarSign,
      submenu: [
        { label: 'Salary Records', path: '/admin/salary/records' },
        { label: 'Process Salary', path: '/admin/salary/process' },
      ],
    },
    {
      label: 'Reports',
      icon: FileText,
      path: '/admin/reports',
    },
  ]

  const employeeMenus = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/employee/dashboard',
    },
    {
      label: 'Profile',
      icon: User,
      path: '/employee/profile',
    },
    {
      label: 'Attendance',
      icon: Clock,
      path: '/employee/attendance',
    },
    {
      label: 'Salary',
      icon: DollarSign,
      path: '/employee/salary',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/employee/settings',
    },
  ]

  const menus = role === 'ADMIN' ? adminMenus : employeeMenus

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link href={role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard'}>
            <BrandLogo compact />
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-slate-600 hover:text-slate-900"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {menus.map((menu: any) => (
            <div key={menu.label}>
              {menu.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(menu.label)}
                    className={clsx(
                      'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      expandedMenus.includes(menu.label)
                        ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <menu.icon size={18} />
                      <span>{menu.label}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={clsx(
                        'transition-transform',
                        expandedMenus.includes(menu.label) ? 'rotate-180' : ''
                      )}
                    />
                  </button>

                  {/* Submenu */}
                  {expandedMenus.includes(menu.label) && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                      {menu.submenu.map((item: any) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={clsx(
                            'block px-3 py-2 rounded-lg text-sm transition-colors',
                            isActive(item.path)
                              ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-medium'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                          )}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={menu.path}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive(menu.path)
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <menu.icon size={18} />
                  <span>{menu.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}
