// app/(dashboard)/employee/profile/page.tsx
"use client"

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Hash,
  AlertCircle,
  Camera,
} from 'lucide-react'

type Employee = {
  id: string
  fullName: string
  employeeId: string
  email: string
  phoneNumber: string
  address: string
  emergencyContactName?: string
  emergencyContactNumber?: string
  designation: string
  department: string
  joiningDate: string
  monthlySalary: number
  status: string
  profilePicture?: string | null
}

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/employee/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setEmployee(data.data)
      }
    } catch (e) {
      console.error('Failed to load profile', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [])

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setMessage('You need to be signed in to update your photo.')
      return
    }

    const formData = new FormData()
    formData.append('profilePicture', file)

    setUploading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/employee/me', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile picture')
      }

      setEmployee((current) => current ? { ...current, profilePicture: data.data.profilePicture } : current)
      setMessage('Profile picture updated successfully!')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update profile picture')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  if (loading) return <p className="text-slate-600">Loading...</p>
  if (!employee) return <p className="text-slate-600">No profile found.</p>

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
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Your personal and employment information</p>
      </div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="lg:col-span-1 card-lg bg-white dark:bg-slate-900 p-8 flex flex-col items-center" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              {employee.profilePicture ? (
                <img src={employee.profilePicture} alt={employee.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{employee.fullName.split(' ').map((part) => part[0]).join('')}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 rounded-full bg-slate-900 dark:bg-slate-700 p-2 text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Camera size={16} />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">{employee.fullName}</h2>

          <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold mt-1">{employee.designation}</p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{employee.department} • {employee.employeeId}</p>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-full border border-primary-200 px-3 py-1.5 text-sm font-medium text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {uploading ? 'Uploading...' : 'Change photo'}
            </button>
          </div>

          {message ? (
            <p className={`mt-3 text-center text-sm ${message.includes('successfully') ? 'text-success' : 'text-red-500'}`}>
              {message}
            </p>
          ) : null}

          <div className="mt-6 w-full">
            <span className="inline-block px-3 py-1 bg-success/20 text-success rounded-full text-xs font-semibold">● {employee.status}</span>
          </div>

          <div className="mt-6 w-full pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Joining Date</p>
            <p className="font-semibold text-slate-900 dark:text-white">{new Date(employee.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div className="card-lg bg-white dark:bg-slate-900 p-6" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Contact Information</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Mail size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Email Address</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{employee.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Phone size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Phone Number</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{employee.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <MapPin size={20} className="text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Address</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{employee.address}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="card-lg bg-white dark:bg-slate-900 p-6" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Employment Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Hash size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Employee ID</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{employee.employeeId}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Briefcase size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Designation</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{employee.designation}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Briefcase size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Department</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{employee.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Calendar size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Joining Date</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{new Date(employee.joiningDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="card-lg bg-white dark:bg-slate-900 p-6" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Emergency Contact</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <AlertCircle size={20} className="text-warning flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Name</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{employee.emergencyContactName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Phone size={20} className="text-warning flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Phone Number</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{employee.emergencyContactNumber}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
