'use client'

import { useState, useEffect } from 'react'
import { Coffee, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface BreakData {
  activeBreak: any
  totalBreakMinutes: number
}

export default function BreakButton() {
  const [breakData, setBreakData] = useState<BreakData>({
    activeBreak: null,
    totalBreakMinutes: 0,
  })
  const [loading, setLoading] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [breakTimer, setBreakTimer] = useState(0)

  // Fetch break status on mount and at intervals
  useEffect(() => {
    const fetchBreakStatus = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const response = await fetch('/api/employee/break', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (data.success) {
          setBreakData(data.data)
          setIsOnBreak(!!data.data.activeBreak)
        }
      } catch (error) {
        console.error('Failed to fetch break status:', error)
      }
    }

    fetchBreakStatus()
    const interval = setInterval(fetchBreakStatus, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Update break timer if on break
  useEffect(() => {
    if (!isOnBreak || !breakData.activeBreak) return

    const interval = setInterval(() => {
      const startTime = new Date(breakData.activeBreak.breakStart).getTime()
      const now = new Date().getTime()
      const seconds = Math.floor((now - startTime) / 1000)
      setBreakTimer(seconds)
    }, 1000)

    return () => clearInterval(interval)
  }, [isOnBreak, breakData.activeBreak])

  const handleBreakToggle = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please log in first')
      return
    }

    setLoading(true)
    try {
      const action = isOnBreak ? 'end' : 'start'
      const response = await fetch('/api/employee/break', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()
      if (data.success) {
        setBreakData({
          ...breakData,
          activeBreak: data.data,
        })
        setIsOnBreak(action === 'start')
        setBreakTimer(0)
        toast.success(data.message)

        // Fetch updated break status
        const statusResponse = await fetch('/api/employee/break', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const statusData = await statusResponse.json()
        if (statusData.success) {
          setBreakData(statusData.data)
        }
      } else {
        toast.error(data.message || 'Failed to manage break')
      }
    } catch (error) {
      console.error('Error managing break:', error)
      toast.error('Failed to manage break')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const remainingBreakTime = 60 - breakData.totalBreakMinutes

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg p-4 border-2 border-slate-200 dark:border-slate-700">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Break Status</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {isOnBreak ? (
              <span className="flex items-center gap-2 text-orange-600">
                <Coffee size={24} />
                On Break
              </span>
            ) : (
              <span className="flex items-center gap-2 text-green-600">
                <Coffee size={24} />
                Ready to Work
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleBreakToggle}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 ${
            isOnBreak
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {loading ? 'Loading...' : isOnBreak ? 'End Break' : 'Start Break'}
        </button>
      </div>

      {isOnBreak && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">Current Break Duration</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {formatTime(breakTimer)}
              </p>
            </div>
            <Clock className="text-orange-500" size={32} />
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Total Break Time Today</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {breakData.totalBreakMinutes} / 60 minutes
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Remaining: {remainingBreakTime} minutes
            </p>
          </div>
          <div className="w-16 h-16">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e0e7ff"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#2563eb"
                strokeWidth="8"
                strokeDasharray={`${(breakData.totalBreakMinutes / 60) * 283} 283`}
                transform="rotate(-90 50 50)"
                className="transition-all duration-300"
              />
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dy="0.3em"
                className="text-sm font-bold fill-blue-600 dark:fill-blue-400"
              >
                {Math.round((breakData.totalBreakMinutes / 60) * 100)}%
              </text>
            </svg>
          </div>
        </div>
      </div>

      {breakData.totalBreakMinutes > 60 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            ⚠️ Break limit exceeded! You have exceeded your 1-hour daily break limit.
          </p>
        </div>
      )}
    </div>
  )
}
