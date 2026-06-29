// app/(dashboard)/admin/reports/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'

interface DashboardStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  monthlyExpense: number
  departments: Array<{ name: string; count: number; percentage: number }>
  recentActivity: Array<{ action: string; activity: string; time: string }>
}

interface SalaryRecordSummary {
  id: string
  month: string
  netSalary: number
  status: string
  employee: {
    fullName: string
  }
}

export default function ReportsPage() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecordSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [dashboardRes, salaryRes] = await Promise.all([
          fetch('/api/admin/dashboard', { cache: 'no-store' }),
          fetch('/api/admin/salary/records', { cache: 'no-store' }),
        ])

        const dashboardJson = await dashboardRes.json()
        const salaryJson = await salaryRes.json()

        if (dashboardJson.success) {
          setDashboardData(dashboardJson.data)
        }

        if (salaryJson.success) {
          setSalaryRecords(salaryJson.data)
        }
      } catch (error) {
        console.error('Failed to fetch reports data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const pendingSalaryCount = salaryRecords.filter((record) => record.status === 'PENDING').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Reports
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Review company performance and payroll summaries.
        </p>
      </div>

      <motion.div
        className="grid gap-6 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <Users size={24} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Employees</p>
              <p className="text-2xl font-semibold">
                {loading ? '—' : dashboardData?.totalEmployees ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <Calendar size={24} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Present Today</p>
              <p className="text-2xl font-semibold">
                {loading ? '—' : dashboardData?.presentToday ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <TrendingUp size={24} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Absent Today</p>
              <p className="text-2xl font-semibold">
                {loading ? '—' : dashboardData?.absentToday ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <DollarSign size={24} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Expense</p>
              <p className="text-2xl font-semibold">
                {loading ? '—' : `Rs. ${(dashboardData?.monthlyExpense ?? 0).toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-6 lg:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="lg:col-span-2 card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Salary Actions</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending payroll records and latest status.</p>
            </div>
            <FileText size={20} className="text-slate-400" />
          </div>

          {loading ? (
            <p className="text-slate-500 dark:text-slate-400">Loading salary report…</p>
          ) : salaryRecords.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No salary records available yet.</p>
          ) : (
            <div className="space-y-3">
              {salaryRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{record.employee.fullName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(record.month).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${record.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-200/20 dark:text-amber-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200/20 dark:text-emerald-200'}`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Department Distribution</h2>
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-500 dark:text-slate-400">Loading department data…</p>
            ) : dashboardData?.departments?.length ? (
              dashboardData.departments.map((department) => (
                <div key={department.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span>{department.name}</span>
                    <span>{department.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                      style={{ width: `${department.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No department summary available.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
