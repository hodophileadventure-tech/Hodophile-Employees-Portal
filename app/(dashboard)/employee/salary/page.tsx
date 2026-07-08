// app/(dashboard)/employee/salary/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'
import ProgressRing from '@/components/premium/ProgressRing'

interface LeadSummary {
  id: string
  customerName: string
  customerNumber: string
  destination: string
  persons: number
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
  const [customerName, setCustomerName] = useState('')
  const [customerNumber, setCustomerNumber] = useState('')
  const [destination, setDestination] = useState('')
  const [persons, setPersons] = useState('')
  const [leadWorth, setLeadWorth] = useState('')
  const [loading, setLoading] = useState(true)
  const [salesLoading, setSalesLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [refreshing, setRefreshing] = useState(false)

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

  const handleRefreshCommission = async () => {
    if (!salaryData.employeeId) return
    setRefreshing(true)
    try {
      await fetchSalesData(salaryData.employeeId)
      setMessage('Commission data refreshed')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to refresh commission data')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    ;(async () => {
      try {
        const meRes = await fetch('/api/employee/me', { headers: { Authorization: `Bearer ${token}` } })
        const meJson = await meRes.json()
        if (!meJson.success) return
        const emp = meJson.data

        // fetch salary record for current month
        const month = new Date().toISOString().slice(0, 7)
        const salaryRes = await fetch(`/api/employee/salary?month=${month}`, { headers: { Authorization: `Bearer ${token}` } })
        const salaryJson = await salaryRes.json()

        let salaryRecord = null
        if (salaryJson.success) {
          salaryRecord = salaryJson.data.salaryRecord
        }

        setSalaryData((s) => {
          const monthlySalary = emp.monthlySalary ?? s.monthlySalary
          const earnedSalary = salaryRecord?.earnedSalary ?? Math.round((s.presentDays / s.totalDays) * monthlySalary)
          const commission = salaryRecord?.commission ?? s.commissionEarned
          const incentive = salaryRecord?.monthlyIncentive ?? s.monthlyIncentive
          const totalPay = earnedSalary + commission + incentive
          return {
            ...s,
            monthlySalary,
            earnedSalary,
            totalPay,
            commissionEarned: commission,
            monthlyIncentive: incentive,
            employeeId: emp.id,
            designation: emp.designation ?? '',
            presentDays: salaryRecord?.daysWorked ?? s.presentDays,
          }
        })

        if (emp.designation?.toLowerCase().includes('sales executive')) {
          fetchSalesData(emp.id)
        }
      } catch (e) {
        console.error('Failed to load salary data', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleLeadSubmit = async () => {
    if (!salaryData.employeeId || !customerName || !customerNumber || !destination || !persons || !leadWorth) {
      setMessage('Please fill in all sale lead fields.')
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
          customerName,
          customerNumber,
          destination,
          persons: Number(persons),
          leadWorth: Number(leadWorth),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Confirmed sale recorded successfully.')
        setCustomerName('')
        setCustomerNumber('')
        setDestination('')
        setPersons('')
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
    <div className="space-y-8 bg-[#F5F5F5] text-[#2B2B2B] min-h-screen px-6 py-8">
      <div>
        <h1 className="text-3xl font-bold text-[#FCC000]">Salary</h1>
        <p className="text-[#2B2B2B] mt-2">Your current month salary information</p>
      </div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Current Month Summary */}
        <div className="lg:col-span-2">
          <div className="card-lg bg-[#F5F5F5] border border-[#E5E5E5] p-6">
            <h2 className="text-lg font-semibold text-[#FCC000] mb-6">Current Month Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg">
                <p className="text-sm text-[#2B2B2B] mb-2">Monthly Salary</p>
                <p className="text-2xl font-bold text-[#2B2B2B]">Rs. {salaryData.monthlySalary.toLocaleString()}</p>
              </div>

              <div className="p-6 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg">
                <p className="text-sm text-[#2B2B2B] mb-2">Earned Till Today</p>
                <p className="text-2xl font-bold text-[#2B2B2B]">Rs. {salaryData.earnedSalary.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
              <p className="text-sm text-[#2B2B2B] mb-4">Salary Calculation</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#2B2B2B]">Days Worked</span>
                  <span className="font-semibold text-[#2B2B2B]">{salaryData.presentDays} / {salaryData.totalDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#2B2B2B]">Daily Salary</span>
                  <span className="font-semibold text-[#2B2B2B]">Rs. {(salaryData.monthlySalary / salaryData.totalDays).toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#2B2B2B]">Earned Salary</span>
                  <span className="font-semibold text-[#2B2B2B]">Rs. {salaryData.earnedSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="card-lg bg-[#F5F5F5] border border-[#E5E5E5] p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-[#FCC000] mb-8 w-full">Salary Progress</h2>

          <ProgressRing value={salaryData.earnedSalary} max={salaryData.monthlySalary} size={140} color="#FCC000" label="Earned" sublabel="This Month" icon={<DollarSign size={24} className="text-[#2B2B2B]" />} />
        </div>
      </motion.div>

      {salaryData.designation.toLowerCase().includes('sales executive') ? (
        <motion.div className="card-lg bg-[#F5F5F5] border border-[#E5E5E5] p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#FCC000]">Sales Commission</h2>
            <button
              onClick={handleRefreshCommission}
              disabled={refreshing}
              className="px-3 py-1 text-xs font-medium text-[#2B2B2B] bg-[#FCC000] rounded-lg hover:bg-[#e0a800] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
              <p className="text-sm text-[#2B2B2B]">Confirmed Commission</p>
              <p className="mt-3 text-2xl font-semibold text-[#2B2B2B]">Rs. {salaryData.commissionEarned.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
              <p className="text-sm text-[#2B2B2B]">Incentive</p>
              <p className="mt-3 text-2xl font-semibold text-[#2B2B2B]">Rs. {salaryData.monthlyIncentive.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
              <p className="text-sm text-[#2B2B2B]">Estimated Total Pay</p>
              <p className="mt-3 text-2xl font-semibold text-[#2B2B2B]">Rs. {salaryData.totalPay.toLocaleString()}</p>
            </div>
          </div>

          {/* Confirmed Leads Display */}
          <div className="mt-6 rounded-3xl border border-[#E5E5E5] bg-[#F5F5F5] p-6">
            <h3 className="text-base font-semibold text-[#FCC000] mb-4">Confirmed Leads This Month</h3>
            {salesLeads.length === 0 ? (
              <p className="text-sm text-[#2B2B2B]">No confirmed leads yet.</p>
            ) : (
              <div className="space-y-3">
                {salesLeads.map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-[#2B2B2B]">{lead.customerName}</p>
                        <p className="text-xs text-[#666] mt-1">{lead.customerNumber} • {lead.destination} • {lead.persons} person{lead.persons === 1 ? '' : 's'}</p>
                        <p className="text-xs text-[#666] mt-1">Lead Worth: Rs. {lead.leadWorth.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#FCC000]">Rs. {lead.commission.toLocaleString()}</p>
                        <p className="text-xs text-[#666] mt-1">{new Date(lead.confirmedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </motion.div>
      ) : null}
    </div>
  )
}
