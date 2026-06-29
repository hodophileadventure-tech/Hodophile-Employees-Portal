// app/(dashboard)/employee/salary/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'
import ProgressRing from '@/components/premium/ProgressRing'

interface LeadSummary {
  id: string
  leadWorth: number
  commission: number
  confirmedAt: string
}

export default function SalaryPage() {
  const [salaryData, setSalaryData] = useState({
    monthlySalary: 0,
    earnedSalary: 0,
    presentDays: 0,
    totalDays: 22,
    commissionEarned: 0,
    monthlyIncentive: 0,
    totalPay: 0,
    employeeId: '',
    designation: '',
  })
  const [salesLeads, setSalesLeads] = useState<LeadSummary[]>([])
  const [leadWorth, setLeadWorth] = useState('')
  const [loading, setLoading] = useState(true)
  const [salesLoading, setSalesLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchSalesData = async (employeeId: string) => {
    try {
      const month = new Date().toISOString().slice(0, 7)
      const response = await fetch(`/api/sales/leads?employeeId=${employeeId}&month=${month}`)
      const data = await response.json()
      if (data.success) {
        const stats = data.data.statistics
        setSalesLeads(data.data.leads)
        setSalaryData((current) => {
          const totalCommission = stats.totalCommission ?? 0
          const incentive = stats.monthlyIncentive ?? 0
          const totalPay = current.earnedSalary + totalCommission + incentive
          return {
            ...current,
            commissionEarned: totalCommission,
            monthlyIncentive: incentive,
            totalPay,
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch sales data', error)
    }
  }

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
            const totalPay = earnedSalary + s.commissionEarned + s.monthlyIncentive
            return {
              ...s,
              monthlySalary,
              earnedSalary,
              totalPay,
              employeeId: emp.id,
              designation: emp.designation ?? '',
            }
          })

          if (emp.designation?.toLowerCase().includes('sales executive')) {
            fetchSalesData(emp.id)
          }
        }
      })
      .catch((e) => console.error('Failed to load salary data', e))
      .finally(() => setLoading(false))
  }, [])

  const handleLeadSubmit = async () => {
    if (!salaryData.employeeId || !leadWorth) {
      setMessage('Enter a confirmed sale value first.')
      return
    }

    setSalesLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/sales/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: salaryData.employeeId,
          leadWorth: Number(leadWorth),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Confirmed sale recorded successfully.')
        setLeadWorth('')
        fetchSalesData(salaryData.employeeId)
      } else {
        setMessage(data.message || 'Failed to confirm sale.')
      }
    } catch (error) {
      console.error('Failed to submit lead', error)
      setMessage('Failed to confirm sale.')
    } finally {
      setSalesLoading(false)
    }
  }

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

      {salaryData.designation.toLowerCase().includes('sales executive') ? (
        <motion.div className="card-lg bg-white dark:bg-slate-900 p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Sales Commission</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Confirmed Commission</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Rs. {salaryData.commissionEarned.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Incentive</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Rs. {salaryData.monthlyIncentive.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Estimated Total Pay</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Rs. {salaryData.totalPay.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Confirm a Sale</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Enter the confirmed lead worth to record commission for this month.
              </p>
              <label className="block text-sm text-slate-700 dark:text-slate-300">
                Confirmed Sale Value
                <input
                  type="number"
                  value={leadWorth}
                  onChange={(event) => setLeadWorth(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  min={0}
                />
              </label>
              <button
                type="button"
                onClick={handleLeadSubmit}
                disabled={salesLoading}
                className="mt-4 inline-flex items-center justify-center w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salesLoading ? 'Submitting…' : 'Confirm Sale'}
              </button>
              {message ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message}</p> : null}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Confirmed Leads</h3>
              {salesLeads.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No confirmed sales yet.</p>
              ) : (
                <div className="space-y-4">
                  {salesLeads.map((lead) => (
                    <div key={lead.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">Rs. {lead.leadWorth.toLocaleString()}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Commission: Rs. {lead.commission.toLocaleString()}</p>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(lead.confirmedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  )
}
