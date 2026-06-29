// app/(dashboard)/admin/attendance/monthly/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle2, Clock, Users, TrendingUp } from 'lucide-react'

interface AttendanceRecord {
  id: string
  date: string
  checkInTime: string
  checkOutTime?: string
  workingHours?: number
  status: string
  employee: {
    fullName: string
    employeeId: string
  }
}

interface AttendanceSummary {
  totalEmployees: number
  presentCount: number
  lateCount: number
  totalRecords: number
}

export default function MonthlyAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendance = async () => {
      const currentMonth = new Date().toISOString().slice(0, 7)
      try {
        const response = await fetch(
          `/api/admin/attendance?mode=monthly&month=${currentMonth}`,
          {
            cache: 'no-store',
          }
        )
        const data = await response.json()
        if (data.success) {
          setRecords(data.data.records)
          setSummary(data.data.summary)
        }
      } catch (error) {
        console.error('Failed to fetch monthly attendance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [])

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Monthly Attendance Report
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Employee attendance for the current month.
        </p>
      </div>

      <motion.div
        className="grid gap-4 md:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <Users size={20} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active Employees</p>
              <p className="text-2xl font-semibold">
                {loading ? '—' : summary?.totalEmployees ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <TrendingUp size={20} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Attendance Records</p>
              <p className="text-2xl font-semibold">
                {loading ? '—' : summary?.totalRecords ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <CheckCircle2 size={20} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Present</p>
              <p className="text-2xl font-semibold">
                {loading ? '—' : summary?.presentCount ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <Clock size={20} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Late</p>
              <p className="text-2xl font-semibold">
                {loading ? '—' : summary?.lateCount ?? 0}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="card-lg bg-white dark:bg-slate-900 p-6 overflow-x-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Monthly Attendance Records
        </h2>

        {loading ? (
          <p className="text-slate-500 dark:text-slate-400">Loading attendance...</p>
        ) : records.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">
            No attendance records found for the current month.
          </p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 pr-6">Date</th>
                <th className="py-3 pr-6">Employee</th>
                <th className="py-3 pr-6">Check In</th>
                <th className="py-3 pr-6">Check Out</th>
                <th className="py-3 pr-6">Hours</th>
                <th className="py-3 pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-4 pr-6 text-slate-900 dark:text-slate-100">
                    {formatDate(record.date)}
                  </td>
                  <td className="py-4 pr-6 text-slate-900 dark:text-slate-100">
                    {record.employee.fullName}
                  </td>
                  <td className="py-4 pr-6 text-slate-600 dark:text-slate-300">
                    {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </td>
                  <td className="py-4 pr-6 text-slate-600 dark:text-slate-300">
                    {record.checkOutTime
                      ? new Date(record.checkOutTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : '—'}
                  </td>
                  <td className="py-4 pr-6 text-slate-600 dark:text-slate-300">
                    {record.workingHours?.toFixed(2) ?? '—'}
                  </td>
                  <td className="py-4 pr-6">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${record.status === 'LATE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-200/20 dark:text-amber-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200/20 dark:text-emerald-200'}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  )
}
