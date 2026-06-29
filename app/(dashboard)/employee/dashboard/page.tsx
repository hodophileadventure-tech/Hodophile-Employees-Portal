// app/(dashboard)/employee/dashboard/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import StatCard from '@/components/premium/StatCard'
import ProgressRing from '@/components/premium/ProgressRing'

interface EmployeeStats {
  monthlySalary: number
  earnedSalary: number
  presentDays: number
  absentDays: number
  checkInTime?: string
  checkOutTime?: string
  workingHours?: number
  totalDaysInMonth: number
}

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<EmployeeStats>({
    monthlySalary: 0,
    earnedSalary: 0,
    presentDays: 0,
    absentDays: 0,
    totalDaysInMonth: 22,
    checkInTime: undefined,
    checkOutTime: undefined,
    workingHours: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attendanceMessage, setAttendanceMessage] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    fetch('/api/employee/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const emp = data.data
          setStats((s) => {
            const monthlySalary = emp.monthlySalary ?? s.monthlySalary
            const presentDays = s.presentDays || 0
            const earnedSalary = Math.round((presentDays / s.totalDaysInMonth) * monthlySalary)
            return { ...s, monthlySalary, earnedSalary }
          })
        }
      })
      .catch((e) => console.error('Failed to load employee stats', e))
      .finally(() => setLoading(false))
  }, [])

  const salaryProgress = (stats.earnedSalary / stats.monthlySalary) * 100
  const attendanceProgress = (stats.presentDays / stats.totalDaysInMonth) * 100

  const handleAttendanceAction = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setAttendanceMessage('Please log in first')
      return
    }

    setIsSubmitting(true)
    setAttendanceMessage(null)

    try {
      const action = !stats.checkInTime ? 'check-in' : stats.checkOutTime ? 'check-in' : 'check-out'
      const response = await fetch('/api/employee/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()
      if (data.success) {
        const record = data.data
        setStats((s) => ({
          ...s,
          checkInTime: record.checkInTime || s.checkInTime,
          checkOutTime: record.checkOutTime || s.checkOutTime,
          workingHours: record.workingHours ?? s.workingHours,
        }))
        setAttendanceMessage(data.message)
      } else {
        setAttendanceMessage(data.message || 'Unable to update attendance')
      }
    } catch (error) {
      console.error('Attendance update failed', error)
      setAttendanceMessage('Unable to update attendance')
    } finally {
      setIsSubmitting(false)
    }
  }

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
      {/* Welcome Section */}
      <motion.div
        className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-900 dark:to-primary-800 rounded-2xl p-8 text-white shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-primary-100 text-lg">
          You&apos;re doing great! Check your progress below.
        </p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          title="Monthly Salary"
          value={`Rs. ${stats.monthlySalary.toLocaleString()}`}
          subtitle="Your fixed salary"
          icon={<DollarSign size={24} />}
          variant="primary"
          delay={0}
        />

        <StatCard
          title="Earned Till Today"
          value={`Rs. ${stats.earnedSalary.toLocaleString()}`}
          subtitle={`${salaryProgress.toFixed(1)}% of monthly`}
          icon={<TrendingUp size={24} />}
          variant="success"
          trend={{ direction: 'up', percentage: 2.3 }}
          delay={0.1}
        />

        <StatCard
          title="Present Days"
          value={stats.presentDays}
          subtitle={`out of ${stats.totalDaysInMonth} days`}
          icon={<CheckCircle size={24} />}
          variant="success"
          delay={0.2}
        />

        <StatCard
          title="Absent Days"
          value={stats.absentDays}
          subtitle="This month"
          icon={<AlertCircle size={24} />}
          variant="warning"
          delay={0.3}
        />
      </motion.div>

      {/* Today's Status & Progress */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Today's Check-in */}
        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Today&apos;s Status
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/10 dark:bg-success/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-success" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Check In
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {stats.checkInTime}
                  </p>
                </div>
              </div>
              <CheckCircle size={24} className="text-success" />
            </div>

            {stats.checkInTime && !stats.checkOutTime ? (
              <div className="flex items-center justify-between p-4 bg-primary-10 dark:bg-primary-20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-primary-600" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Check Out
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {stats.checkOutTime || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <button
              onClick={handleAttendanceAction}
              disabled={isSubmitting || (!!stats.checkInTime && !!stats.checkOutTime)}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting
                ? 'Processing...'
                : !stats.checkInTime
                ? 'Check In'
                : stats.checkOutTime
                ? 'Checked Out Today'
                : 'Check Out'}
            </button>

            {attendanceMessage ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">{attendanceMessage}</p>
            ) : null}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Working Hours
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.workingHours}h
              </p>
            </div>
          </div>
        </div>

        {/* Salary Progress */}
        <div className="card-lg bg-white dark:bg-slate-900 p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 w-full">
            Salary Progress
          </h2>

          <ProgressRing
            value={stats.earnedSalary}
            max={stats.monthlySalary}
            size={140}
            color="#10b981"
            label="Earned"
            sublabel="This Month"
            icon={<DollarSign size={24} className="text-success" />}
          />

          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 text-center">
            Remaining: Rs. {(stats.monthlySalary - stats.earnedSalary).toLocaleString()}
          </p>
        </div>

        {/* Attendance Progress */}
        <div className="card-lg bg-white dark:bg-slate-900 p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 w-full">
            Attendance
          </h2>

          <ProgressRing
            value={stats.presentDays}
            max={stats.totalDaysInMonth}
            size={140}
            color="#2563eb"
            label="Present"
            sublabel="Days"
            icon={<Calendar size={24} className="text-primary-600" />}
          />

          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 text-center">
            Attendance Rate: {((stats.presentDays / stats.totalDaysInMonth) * 100).toFixed(1)}%
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="card-lg bg-white dark:bg-slate-900 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            className="p-4 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg hover:shadow-md transition-shadow text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar size={24} className="text-primary-600 mb-2" />
            <p className="font-semibold text-slate-900 dark:text-white">
              View Attendance
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Check your attendance record
            </p>
          </motion.button>

          <motion.button
            className="p-4 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg hover:shadow-md transition-shadow text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <DollarSign size={24} className="text-success mb-2" />
            <p className="font-semibold text-slate-900 dark:text-white">
              Salary Details
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              View salary breakdown
            </p>
          </motion.button>

          <motion.button
            className="p-4 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg hover:shadow-md transition-shadow text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar size={24} className="text-warning mb-2" />
            <p className="font-semibold text-slate-900 dark:text-white">
              My Profile
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Update your information
            </p>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
