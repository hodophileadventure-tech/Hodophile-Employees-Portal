'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

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

export default function EditSalaryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [record, setRecord] = useState<SalaryRecord | null>(null)
  const [formData, setFormData] = useState({
    totalSalary: 0,
    earnedSalary: 0,
    commission: 0,
    monthlyIncentive: 0,
    netSalary: 0,
    status: 'PENDING',
  })

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/admin/salary/records/${id}`)
        const data = await response.json()
        if (data.success) {
          setRecord(data.data)
          setFormData({
            totalSalary: data.data.totalSalary,
            earnedSalary: data.data.earnedSalary,
            commission: data.data.commission,
            monthlyIncentive: data.data.monthlyIncentive,
            netSalary: data.data.netSalary,
            status: data.data.status,
          })
        }
      } catch (error) {
        console.error('Failed to fetch salary record:', error)
        toast.error('Failed to load salary record')
      } finally {
        setLoading(false)
      }
    }

    fetchRecord()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? value : parseFloat(value) || 0
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/salary/records/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update salary record')
      }

      toast.success('Salary record updated successfully!')
      router.push('/admin/salary/records')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update salary record'
      toast.error(message)
      console.error('Error updating salary record:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600 dark:text-slate-400">Loading salary record...</p>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/salary/records" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Salary Record Not Found
            </h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/salary/records" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Edit Salary Record
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {record.employee.fullName} • {new Date(record.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Salary Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Total Salary
              </label>
              <input
                type="number"
                name="totalSalary"
                value={formData.totalSalary}
                onChange={handleInputChange}
                className="input w-full"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Earned Salary
              </label>
              <input
                type="number"
                name="earnedSalary"
                value={formData.earnedSalary}
                onChange={handleInputChange}
                className="input w-full"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Commission
              </label>
              <input
                type="number"
                name="commission"
                value={formData.commission}
                onChange={handleInputChange}
                className="input w-full"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Monthly Incentive
              </label>
              <input
                type="number"
                name="monthlyIncentive"
                value={formData.monthlyIncentive}
                onChange={handleInputChange}
                className="input w-full"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Net Salary
              </label>
              <input
                type="number"
                name="netSalary"
                value={formData.netSalary}
                onChange={handleInputChange}
                className="input w-full"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input w-full"
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSED">Processed</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/admin/salary/records"
            className="px-6 py-2 bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
