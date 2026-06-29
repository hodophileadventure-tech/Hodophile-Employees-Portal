// app/(dashboard)/employee/profile/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Hash,
  AlertCircle,
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
}

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    fetch('/api/employee/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEmployee(data.data)
      })
      .catch((e) => console.error('Failed to load profile', e))
      .finally(() => setLoading(false))
  }, [])

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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Your personal and employment information</p>
      </div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="lg:col-span-1 card-lg bg-white dark:bg-slate-900 p-8 flex flex-col items-center" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">{employee.fullName.split(' ').map(p => p[0]).join('')}</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">{employee.fullName}</h2>

          <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold mt-1">{employee.designation}</p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{employee.department} • {employee.employeeId}</p>

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
