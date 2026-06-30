'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

interface Employee {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  cnicNumber: string
  address: string
  emergencyContactName?: string
  emergencyContactNumber?: string
  designation: string
  department: string
  monthlySalary: number
  joiningDate?: string
  reportingTime?: string | null
  logoutTime?: string | null
  workingDays?: string | null
  status: string
  user: {
    id: string
    email: string
    role: string
  }
  profilePicture?: string | null
}

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    designation: '',
    department: '',
    monthlySalary: 0,
    status: 'ACTIVE',
    reportingTime: '',
    logoutTime: '',
    workingDays: '',
  })

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`/api/admin/employees/${id}`)
        const data = await response.json()
        if (data.success) {
          setEmployee(data.data)
          setFormData({
            fullName: data.data.fullName,
            phoneNumber: data.data.phoneNumber,
            address: data.data.address,
            emergencyContactName: data.data.emergencyContactName || '',
            emergencyContactNumber: data.data.emergencyContactNumber || '',
            designation: data.data.designation,
            department: data.data.department,
            monthlySalary: data.data.monthlySalary,
            status: data.data.status,
            reportingTime: data.data.reportingTime || '',
            logoutTime: data.data.logoutTime || '',
            workingDays: data.data.workingDays || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch employee:', error)
        toast.error('Failed to load employee')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlySalary' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/employees/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update employee')
      }

      toast.success('Employee updated successfully!')
      router.push('/admin/employees')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update employee'
      toast.error(message)
      console.error('Error updating employee:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600 dark:text-slate-400">Loading employee...</p>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/employees" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Employee Not Found
            </h1>
          </div>
        </div>
      </div>
    )
  }

  const departments = ['Engineering', 'Product', 'Design', 'Quality Assurance', 'Operations']

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/employees" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Edit Employee
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Update employee information for {employee.fullName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Personal Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                {employee?.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={employee.profilePicture} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">{employee?.fullName?.split(' ').map(p=>p[0]).join('')}</div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Profile Picture</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null
                    if (photoPreviewUrl) {
                      URL.revokeObjectURL(photoPreviewUrl)
                    }
                    setPhotoFile(file)
                    setPhotoPreviewUrl(file ? URL.createObjectURL(file) : null)
                  }}
                />

                {photoPreviewUrl ? (
                  <div className="mt-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Preview</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreviewUrl} alt="Preview" className="h-24 w-24 rounded-full object-cover" />
                  </div>
                ) : null}

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!photoFile) return
                      setUploading(true)
                      try {
                        const fd = new FormData()
                        fd.append('file', photoFile)
                        const res = await fetch(`/api/admin/employees/${id}/photo`, { method: 'POST', body: fd })
                        const json = await res.json()
                        if (json.success) {
                          const updatedUrl = json.data.url || json.data.employee?.profilePicture
                          setEmployee(prev => prev ? { ...prev, profilePicture: updatedUrl } : prev)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                          toast.success('Profile picture uploaded successfully')
                        } else {
                          toast.error(json.message || 'Upload failed')
                        }
                      } catch (e) {
                        console.error('Upload error', e)
                        toast.error('Upload failed')
                      } finally {
                        setUploading(false)
                        setPhotoFile(null)
                        if (photoPreviewUrl) {
                          URL.revokeObjectURL(photoPreviewUrl)
                          setPhotoPreviewUrl(null)
                        }
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="input w-full"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email (Read-only)
                </label>
                <input
                  type="email"
                  value={employee.email}
                  className="input w-full bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                CNIC Number
              </label>
              <input
                type="text"
                name="cnicNumber"
                value={(employee && (employee as any).cnicNumber) || ''}
                disabled
                className="input w-full bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact name"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Emergency Contact Number
                </label>
                <input
                  type="tel"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact number"
                  className="input w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-lg bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Employment Information
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Enter designation"
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Reporting Time
                </label>
                <input
                  type="time"
                  name="reportingTime"
                  value={formData.reportingTime}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Logout Time
                </label>
                <input
                  type="time"
                  name="logoutTime"
                  value={formData.logoutTime}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Working Days
                </label>
                <select
                  name="workingDays"
                  value={formData.workingDays}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="">Select working days</option>
                  <option value="MON-FRI">MON to FRI</option>
                  <option value="MON-SAT">MON to SAT</option>
                  <option value="MON-SUN">MON to SUN</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Monthly Salary
                </label>
                <input
                  type="number"
                  name="monthlySalary"
                  value={formData.monthlySalary}
                  onChange={handleInputChange}
                  placeholder="Enter monthly salary"
                  className="input w-full"
                  step="0.01"
                  required
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
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
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
            href="/admin/employees"
            className="px-6 py-2 bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
