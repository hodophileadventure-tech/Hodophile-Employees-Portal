// app/(dashboard)/admin/attendance/monthly/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle2, Clock, Users, TrendingUp, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

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

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/attendance/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (data.success) {
        setRecords(records.filter(record => record.id !== id))
        setSummary(prev => prev ? {
          ...prev,
          totalRecords: prev.totalRecords - 1,
          presentCount: prev.presentCount - (records.find(r => r.id === id)?.status === 'PRESENT' ? 1 : 0),
          lateCount: prev.lateCount - (records.find(r => r.id === id)?.status === 'LATE' ? 1 : 0),
        } : null)
        toast.success('Attendance record deleted successfully')
      } else {
        toast.error(data.message || 'Failed to delete attendance record')
      }
    } catch (error) {
      toast.error('Failed to delete attendance record')
      console.error('Error deleting attendance record:', error)
    }
  }

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
        className="card-lg bg-white dark:bg-slate-900 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="p-6">
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
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-700">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Check In</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Check Out</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Hours Worked</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Actions</th>
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
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {record.employee.fullName}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-sm">
                        {record.employee.employeeId}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {record.checkOutTime
                          ? new Date(record.checkOutTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {record.workingHours?.toFixed(2) ?? '—'} hrs
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${record.status === 'LATE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'}`}>
                          {record.status === 'LATE' ? '⚠ LATE' : '✓ PRESENT'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition font-medium"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
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
