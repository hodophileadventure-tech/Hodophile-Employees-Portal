// app/(dashboard)/employee/attendance/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface AttendanceRecord {
  id: string
  date: Date
  checkInTime: Date
  checkOutTime?: Date
  workingHours?: number
  status: string
}

interface AttendanceStats {
  presentCount: number
  absentCount: number
  lateCount: number
  halfDayCount: number
  totalHours: number
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState('')

  useEffect(() => {
    // Set current month as default
    const now = new Date()
    const year = now.getFullYear()
    const monthNum = String(now.getMonth() + 1).padStart(2, '0')
    setMonth(`${year}-${monthNum}`)
  }, [])

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        if (!token) {
          toast.error('Please log in first')
          return
        }

        const params = new URLSearchParams()

        if (month) {
          params.append('month', month)
        }

        const response = await fetch(`/api/employee/attendance?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()

        if (data.success) {
          setRecords(data.data.records)
          setStats(data.data.statistics)
        } else {
          toast.error(data.message || 'Failed to load attendance')
        }
      } catch (error) {
        console.error('Error fetching attendance:', error)
        toast.error('Failed to load attendance data')
      } finally {
        setLoading(false)
      }
    }

    if (month) {
      fetchAttendance()
    }
  }, [month])

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(e.target.value)
  }

  const formatTime = (date?: Date) => {
    if (!date) return '--'
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Attendance
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Your attendance and working hours history
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Month:
          </label>
          <input
            type="month"
            value={month}
            onChange={handleMonthChange}
            className="input py-2"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && !loading && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="card-lg bg-white dark:bg-slate-900 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Present</p>
            <p className="text-2xl font-bold text-success mt-1">{stats.presentCount}</p>
          </div>
          <div className="card-lg bg-white dark:bg-slate-900 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Late</p>
            <p className="text-2xl font-bold text-warning mt-1">{stats.lateCount}</p>
          </div>
          <div className="card-lg bg-white dark:bg-slate-900 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Half Day</p>
            <p className="text-2xl font-bold text-primary-600 mt-1">{stats.halfDayCount}</p>
          </div>
          <div className="card-lg bg-white dark:bg-slate-900 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Absent</p>
            <p className="text-2xl font-bold text-danger mt-1">{stats.absentCount}</p>
          </div>
          <div className="card-lg bg-white dark:bg-slate-900 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Total Hours</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalHours}h</p>
          </div>
        </motion.div>
      )}

      {/* Attendance Table */}
      <motion.div
        className="card-lg bg-white dark:bg-slate-900 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Attendance Records
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">Loading attendance data...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">No attendance records for this month</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-700">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Working Hours
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr
                      key={record.id}
                      className={`border-b border-slate-200 dark:border-slate-700 transition-colors ${
                        index % 2 === 0
                          ? 'bg-white dark:bg-slate-900'
                          : 'bg-slate-50 dark:bg-slate-800/50'
                      } hover:bg-slate-100 dark:hover:bg-slate-700`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {formatDate(new Date(record.date))}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {formatTime(record.checkInTime)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {formatTime(record.checkOutTime)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {record.workingHours ? `${record.workingHours.toFixed(2)} hrs` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            record.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                              : record.status === 'ABSENT'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                              : record.status === 'LATE'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                          }`}
                        >
                          {record.status === 'PRESENT'
                            ? '✓ Present'
                            : record.status === 'ABSENT'
                            ? '✗ Absent'
                            : record.status === 'LATE'
                            ? '⚠ Late'
                            : '◐ Half Day'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
