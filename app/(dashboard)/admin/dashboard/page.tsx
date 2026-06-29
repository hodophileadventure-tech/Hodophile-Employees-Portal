// app/(dashboard)/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  FileText,
} from 'lucide-react'
import StatCard from '@/components/premium/StatCard'

interface DashboardStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  monthlyExpense: number
  departments: Array<{ name: string; count: number; percentage: number }>
  recentActivity: Array<{ action: string; activity: string; time: string }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    monthlyExpense: 0,
    departments: [],
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Welcome back! Here&apos;s your company overview.
        </p>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          subtitle="Active workforce"
          icon={<Users size={24} />}
          variant="primary"
          trend={{ direction: 'up', percentage: 2.5 }}
          delay={0}
        />

        <StatCard
          title="Present Today"
          value={stats.presentToday}
          subtitle="Currently working"
          icon={<UserCheck size={24} />}
          variant="success"
          trend={{ direction: 'up', percentage: 1.2 }}
          delay={0.1}
        />

        <StatCard
          title="Absent Today"
          value={stats.absentToday}
          subtitle="Not available"
          icon={<UserX size={24} />}
          variant="warning"
          trend={{ direction: 'down', percentage: 0.5 }}
          delay={0.2}
        />

        <StatCard
          title="Monthly Salary"
          value={`Rs. ${(stats.monthlyExpense / 100000).toFixed(1)}L`}
          subtitle="Total expense"
          icon={<TrendingUp size={24} />}
          variant="danger"
          delay={0.3}
        />
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Attendance Chart */}
        <div className="lg:col-span-2 card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Attendance Overview
            </h2>
            <Calendar size={20} className="text-slate-400" />
          </div>

          <div className="grid h-64 grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <p className="text-sm text-slate-500 dark:text-slate-400">Present Today</p>
              <p className="mt-3 text-3xl font-semibold">{stats.presentToday}</p>
              <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${stats.totalEmployees ? (stats.presentToday / stats.totalEmployees) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <p className="text-sm text-slate-500 dark:text-slate-400">Absent Today</p>
              <p className="mt-3 text-3xl font-semibold">{stats.absentToday}</p>
              <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${stats.totalEmployees ? (stats.absentToday / stats.totalEmployees) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Expense</p>
              <p className="mt-3 text-3xl font-semibold">Rs. {(stats.monthlyExpense / 100000).toFixed(1)}L</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <p className="text-sm text-slate-500 dark:text-slate-400">Departments</p>
              <p className="mt-3 text-3xl font-semibold">{stats.departments.length}</p>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Departments
          </h2>

          <div className="space-y-4">
            {stats.departments.length > 0 ? (
              stats.departments.map((dept, index) => (
                <motion.div
                  key={dept.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {dept.name}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {dept.count}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.percentage}%` }}
                      transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No department data yet.</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        className="card-lg bg-white dark:bg-slate-900 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          <FileText size={20} className="text-slate-400" />
        </div>

        <div className="space-y-4">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((item, index) => (
              <motion.div
                key={`${item.action}-${item.time}-${index}`}
                className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700 last:border-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.action}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.activity}
                  </p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {item.time}
                </span>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
