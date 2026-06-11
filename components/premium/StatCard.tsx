// components/premium/StatCard.tsx
'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'
import clsx from 'clsx'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: {
    direction: 'up' | 'down'
    percentage: number
  }
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  className?: string
  delay?: number
}

const variantColors = {
  primary: 'bg-gradient-to-br from-primary-500 to-primary-600',
  success: 'bg-gradient-to-br from-success to-emerald-600',
  warning: 'bg-gradient-to-br from-warning to-amber-600',
  danger: 'bg-gradient-to-br from-danger to-red-600',
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'primary',
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={clsx('card-lg bg-white dark:bg-slate-900 p-6', className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            {title}
          </p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </h3>
            {trend && (
              <div
                className={clsx(
                  'flex items-center gap-1 text-xs font-semibold mb-1',
                  trend.direction === 'up'
                    ? 'text-success'
                    : 'text-danger'
                )}
              >
                {trend.direction === 'up' ? (
                  <ArrowUp size={14} />
                ) : (
                  <ArrowDown size={14} />
                )}
                {trend.percentage}%
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon */}
        <div
          className={clsx(
            'w-12 h-12 rounded-lg flex items-center justify-center text-white',
            variantColors[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
