// components/layout/TopNavigation.tsx
'use client'

import { Menu, Bell, User as UserIcon, LogOut } from 'lucide-react'
import { AuthUser } from '@/types/auth'
import { useState } from 'react'
import Link from 'next/link'

interface TopNavigationProps {
  user: AuthUser
  onMenuClick: () => void
}

export default function TopNavigation({ user, onMenuClick }: TopNavigationProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const dashboardLink = user.role === 'ADMIN' 
    ? '/admin/dashboard' 
    : '/employee/dashboard'

  const profileLink = user.role === 'ADMIN'
    ? '/admin/settings'
    : '/employee/profile'

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between">
      {/* Left: Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Menu size={20} className="text-slate-600 dark:text-slate-400" />
      </button>

      {/* Center: Title */}
      <div className="hidden lg:block text-sm font-semibold text-slate-600 dark:text-slate-400">
        Welcome, {user.email}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
          <Bell size={20} className="text-slate-600 dark:text-slate-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <UserIcon size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 hidden sm:inline">
              {user.email.split('@')[0]}
            </span>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
              <button
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <UserIcon size={16} />
                <span>Profile</span>
              </button>

              <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
