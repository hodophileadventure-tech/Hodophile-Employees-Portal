// app/(dashboard)/employee/profile/page.tsx
'use client'

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

export default function EmployeeProfile() {
  const employee = {
    fullName: 'Ahmed Hassan',
    employeeId: 'EMP001',
    email: 'ahmed@hodophile.com',
    phone: '03001234567',
    address: 'Karachi, Pakistan',
    cnic: '12345-6789012-3',
    emergency: {
      name: 'Fatima Hassan',
      phone: '03009876543',
    },
    designation: 'Senior Developer',
    department: 'Engineering',
    joiningDate: '2023-01-15',
    monthlySalary: 75000,
    status: 'ACTIVE',
  }

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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Your personal and employment information
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Card */}
        <motion.div
          className="lg:col-span-1 card-lg bg-white dark:bg-slate-900 p-8 flex flex-col items-center"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
          {/* Profile Picture */}
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">AH</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">
            {employee.fullName}
          </h2>

          <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold mt-1">
            {employee.designation}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {employee.department} • {employee.employeeId}
          </p>

          {/* Status Badge */}
          <div className="mt-6 w-full">
            <span className="inline-block px-3 py-1 bg-success/20 text-success rounded-full text-xs font-semibold">
              ● {employee.status}
            </span>
          </div>

          {/* Joining Date */}
          <div className="mt-6 w-full pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
              Joining Date
            </p>
            <p className="font-semibold text-slate-900 dark:text-white">
              {new Date(employee.joiningDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </motion.div>

        {/* Information Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <motion.div
            className="card-lg bg-white dark:bg-slate-900 p-6"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Contact Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Mail size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Email Address
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {employee.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Phone size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Phone Number
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {employee.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <MapPin size={20} className="text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Address
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {employee.address}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Employment Information */}
          <motion.div
            className="card-lg bg-white dark:bg-slate-900 p-6"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Employment Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Hash size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Employee ID
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {employee.employeeId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Briefcase size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Designation
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {employee.designation}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Briefcase size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Department
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {employee.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Calendar size={20} className="text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Joining Date
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {new Date(employee.joiningDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div
            className="card-lg bg-white dark:bg-slate-900 p-6"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Emergency Contact
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <AlertCircle size={20} className="text-warning flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Name
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {employee.emergency.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Phone size={20} className="text-warning flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Phone Number
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {employee.emergency.phone}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
