// app/(dashboard)/employee/salary/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'
import ProgressRing from '@/components/premium/ProgressRing'

export default function SalaryPage() {
  const [salaryData, setSalaryData] = useState({
    monthlySalary: 0,
    earnedSalary: 0,
    presentDays: 0,
    totalDays: 22,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    fetch('/api/employee/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const emp = data.data
          setSalaryData((s) => {
            const monthlySalary = emp.monthlySalary ?? s.monthlySalary
            const earnedSalary = Math.round((s.presentDays / s.totalDays) * monthlySalary)
            return { ...s, monthlySalary, earnedSalary }
          })
        }
      })
      .catch((e) => console.error('Failed to load salary data', e))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Salary</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Your current month salary information</p>
      </div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Current Month Summary */}
        <div className="lg:col-span-2">
          <div className="card-lg bg-white dark:bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Current Month Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Monthly Salary</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">Rs. {salaryData.monthlySalary.toLocaleString()}</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-success/10 to-success/20 dark:from-success/20 dark:to-success/10 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Earned Till Today</p>
                <p className="text-2xl font-bold text-success">Rs. {salaryData.earnedSalary.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Salary Calculation</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Days Worked</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{salaryData.presentDays} / {salaryData.totalDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Daily Salary</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Rs. {(salaryData.monthlySalary / salaryData.totalDays).toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Earned Salary</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Rs. {salaryData.earnedSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="card-lg bg-white dark:bg-slate-900 p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-8 w-full">Salary Progress</h2>

          <ProgressRing value={salaryData.earnedSalary} max={salaryData.monthlySalary} size={140} color="#10b981" label="Earned" sublabel="This Month" icon={<DollarSign size={24} className="text-success" />} />
        </div>
      </motion.div>
    </div>
  )
}
