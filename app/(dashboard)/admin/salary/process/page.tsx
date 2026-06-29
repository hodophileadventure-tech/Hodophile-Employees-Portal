// app/(dashboard)/admin/salary/process/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, RefreshCcw, Users, Clock } from 'lucide-react'

interface EmployeeOption {
  id: string
  fullName: string
  monthlySalary: number
}

interface SalaryRecord {
  id: string
  month: string
  employee: {
    fullName: string
    employeeId: string
  }
  status: string
}

export default function ProcessSalaryPage() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesResponse, salaryResponse] = await Promise.all([
          fetch('/api/admin/employees', { cache: 'no-store' }),
          fetch('/api/admin/salary/records', { cache: 'no-store' }),
        ])

        const employeesData = await employeesResponse.json()
        const salaryData = await salaryResponse.json()

        if (employeesData.success) {
          const activeEmployees = employeesData.data as EmployeeOption[]
          setEmployees(activeEmployees)
          setSelectedEmployeeId(activeEmployees[0]?.id ?? '')
        }

        if (salaryData.success) {
          setSalaryRecords(salaryData.data)
        }
      } catch (error) {
        console.error('Failed to fetch salary processing data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleProcess = async () => {
    if (!selectedEmployeeId) return
    setActionLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/salary/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId: selectedEmployeeId, month }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Salary calculated successfully.')
        setSalaryRecords((current) => {
          const updated = current.filter((record) => record.id !== data.data.id)
          return [data.data, ...updated]
        })
      } else {
        setMessage(data.message || 'Failed to calculate salary.')
      }
    } catch (error) {
      console.error('Failed to process salary:', error)
      setMessage('Failed to process salary.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Process Salary
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Calculate salary records for employees and review pending payroll.
        </p>
      </div>

      <motion.div
        className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 mb-6 text-slate-900 dark:text-white">
            <DollarSign size={24} />
            <div>
              <h2 className="text-lg font-semibold">Quick Salary Process</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select an employee and month to generate or recalculate a salary record.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Employee
              </span>
              <select
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName} - Rs. {employee.monthlySalary.toLocaleString()}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Month
              </span>
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>

            <button
              type="button"
              onClick={handleProcess}
              disabled={actionLoading || !selectedEmployeeId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? 'Processing…' : 'Calculate Salary'}
            </button>

            {message ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
            ) : null}
          </div>
        </div>

        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-3 mb-6 text-slate-900 dark:text-white">
            <RefreshCcw size={24} />
            <div>
              <h2 className="text-lg font-semibold">Pending Payroll</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                See recent salary records and process the latest payroll items.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-slate-500 dark:text-slate-400">Loading payroll status…</p>
          ) : salaryRecords.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              No salary records found yet.
            </p>
          ) : (
            <div className="space-y-3">
              {salaryRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="font-medium text-slate-900 dark:text-white">{record.employee.fullName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(record.month).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${record.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-200/20 dark:text-amber-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200/20 dark:text-emerald-200'}`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
