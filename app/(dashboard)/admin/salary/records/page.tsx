// app/(dashboard)/admin/salary/records/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ClipboardList, Clock } from 'lucide-react'

interface SalaryRecord {
  id: string
  month: string
  totalSalary: number
  earnedSalary: number
  commission: number
  monthlyIncentive: number
  netSalary: number
  status: string
  employee: {
    fullName: string
    employeeId: string
  }
}

export default function SalaryRecordsPage() {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('/api/admin/salary/records', {
          cache: 'no-store',
        })
        const data = await response.json()
        if (data.success) {
          setSalaryRecords(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch salary records:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [])

  const pendingCount = salaryRecords.filter((record) => record.status === 'PENDING').length
  const paidCount = salaryRecords.filter((record) => record.status !== 'PENDING').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Salary Records
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Review employee salary calculations and payout status.
        </p>
      </div>

      <motion.div
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <ClipboardList size={20} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Records</p>
              <p className="text-2xl font-semibold">{loading ? '—' : salaryRecords.length}</p>
            </div>
          </div>
        </div>

        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <DollarSign size={20} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
              <p className="text-2xl font-semibold">{loading ? '—' : pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <Clock size={20} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Processed</p>
              <p className="text-2xl font-semibold">{loading ? '—' : paidCount}</p>
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
          Salary Record Details
        </h2>

        {loading ? (
          <p className="text-slate-500 dark:text-slate-400">Loading salary records...</p>
        ) : salaryRecords.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">
            No salary records available yet.
          </p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 pr-6">Employee</th>
                <th className="py-3 pr-6">Month</th>
                <th className="py-3 pr-6">Net Salary</th>
                <th className="py-3 pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {salaryRecords.map((record) => (
                <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-4 pr-6 text-slate-900 dark:text-slate-100">
                    {record.employee.fullName}
                  </td>
                  <td className="py-4 pr-6 text-slate-600 dark:text-slate-300">
                    {new Date(record.month).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-4 pr-6 text-slate-900 dark:text-slate-100">
                    Rs. {record.netSalary.toLocaleString()}
                  </td>
                  <td className="py-4 pr-6">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${record.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-200/20 dark:text-amber-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200/20 dark:text-emerald-200'}`}>
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
