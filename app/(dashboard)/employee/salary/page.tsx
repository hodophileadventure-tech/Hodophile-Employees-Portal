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
          <h2 className="text-lg font-semibold text-[#FCC000] mb-6">Sales Commission</h2>

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

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-3xl border border-[#E5E5E5] bg-[#F5F5F5] p-6">
              <h3 className="text-base font-semibold text-[#FCC000] mb-4">Confirm a Sale</h3>
              <p className="text-sm text-[#2B2B2B] mb-4">
                Enter the confirmed lead details to record commission for this month.
              </p>
              <label className="block text-sm text-[#2B2B2B]">
                Customer Name
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] px-4 py-3 text-[#2B2B2B] outline-none transition focus:border-[#FCC000]"
                />
              </label>
              <label className="block text-sm text-[#2B2B2B] mt-4">
                Customer Number
                <input
                  type="text"
                  value={customerNumber}
                  onChange={(event) => setCustomerNumber(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] px-4 py-3 text-[#2B2B2B] outline-none transition focus:border-[#FCC000]"
                />
              </label>
              <label className="block text-sm text-[#2B2B2B] mt-4">
                Destination
                <input
                  type="text"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] px-4 py-3 text-[#2B2B2B] outline-none transition focus:border-[#FCC000]"
                />
              </label>
              <label className="block text-sm text-[#2B2B2B] mt-4">
                No. of Persons
                <input
                  type="number"
                  value={persons}
                  onChange={(event) => setPersons(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] px-4 py-3 text-[#2B2B2B] outline-none transition focus:border-[#FCC000]"
                  min={1}
                />
              </label>
              <label className="block text-sm text-[#2B2B2B] mt-4">
                Confirmed Sale Value
                <input
                  type="number"
                  value={leadWorth}
                  onChange={(event) => setLeadWorth(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] px-4 py-3 text-[#2B2B2B] outline-none transition focus:border-[#FCC000]"
                  min={0}
                />
              </label>
              <button
                type="button"
                onClick={handleLeadSubmit}
                disabled={salesLoading}
                className="mt-4 inline-flex items-center justify-center w-full rounded-xl bg-[#FCC000] px-4 py-3 text-sm font-semibold text-[#2B2B2B] transition hover:bg-[#e0a800] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salesLoading ? 'Submitting…' : 'Confirm Sale'}
              </button>
              {message ? <p className="mt-3 text-sm text-[#2B2B2B]">{message}</p> : null}
            </div>

            <div className="rounded-3xl border border-[#E5E5E5] bg-[#F5F5F5] p-6">
              <h3 className="text-base font-semibold text-[#FCC000] mb-4">Confirmed Leads</h3>
              {salesLeads.length === 0 ? (
                <p className="text-sm text-[#2B2B2B]">No confirmed sales yet.</p>
              ) : (
                <div className="space-y-4">
                  {salesLeads.map((lead) => (
                    <div key={lead.id} className="rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-[#2B2B2B]">{lead.customerName}</p>
                          <p className="text-xs text-[#2B2B2B]">{lead.customerNumber} · {lead.destination} · {lead.persons} person{lead.persons === 1 ? '' : 's'}</p>
                          <p className="text-xs text-[#2B2B2B] mt-1">Rs. {lead.leadWorth.toLocaleString()}</p>
                          <p className="text-xs text-[#2B2B2B]">Commission: Rs. {lead.commission.toLocaleString()}</p>
                        </div>
                        <span className="text-xs text-[#2B2B2B]">{new Date(lead.confirmedAt).toLocaleDateString()}</span>
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
