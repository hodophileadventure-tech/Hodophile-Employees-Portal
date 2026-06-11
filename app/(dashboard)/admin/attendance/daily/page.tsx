// app/(dashboard)/admin/attendance/daily/page.tsx
'use client'

import { motion } from 'framer-motion'
import { Calendar, Filter } from 'lucide-react'

export default function DailyAttendancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Daily Attendance Report
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Employee attendance for today
        </p>
      </div>

      <motion.div
        className="card-lg bg-white dark:bg-slate-900 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Daily attendance report coming soon
          </p>
        </div>
      </motion.div>
    </div>
  )
}
