// components/premium/ProgressRing.tsx
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ProgressRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  icon?: ReactNode
  color?: string
}

export default function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  icon,
  color = 'var(--color-primary)',
}: ProgressRingProps) {
  const percentage = (value / max) * 100
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0 transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-700"
          />

          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            strokeDasharray={circumference}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && <div className="text-2xl mb-1">{icon}</div>}
          {label && (
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {value}/{max}
              </p>
              {sublabel && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {sublabel}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
