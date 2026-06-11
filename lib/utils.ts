// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency (PKR)
 */
export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
  }).format(amount)
}

/**
 * Format date
 */
export function formatDate(date: Date | string, format: string = 'short'): string {
  const d = new Date(date)
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }
  
  return d.toLocaleDateString()
}

/**
 * Format time
 */
export function formatTime(time: Date | string): string {
  const d = new Date(time)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Calculate working hours
 */
export function calculateWorkingHours(checkIn: Date, checkOut: Date): number {
  const diff = checkOut.getTime() - checkIn.getTime()
  return diff / (1000 * 60 * 60) // Convert to hours
}

/**
 * Calculate daily salary
 */
export function calculateDailySalary(monthlySalary: number, daysInMonth: number = 30): number {
  return monthlySalary / daysInMonth
}

/**
 * Calculate earned salary
 */
export function calculateEarnedSalary(dailySalary: number, daysWorked: number): number {
  return dailySalary * daysWorked
}

/**
 * Get initials from name
 */
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Slugify string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Generate random color
 */
export function generateRandomColor(): string {
  const colors = [
    '#2563EB',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
    '#EC4899',
    '#14B8A6',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Pakistan)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+92|0)[0-9]{10}$/
  return phoneRegex.test(phone)
}

/**
 * Get days in month
 */
export function getDaysInMonth(date: Date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Get day of week
 */
export function getDayOfWeek(date: Date = new Date()): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

/**
 * Is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Is past date
 */
export function isPastDate(date: Date): boolean {
  return new Date(date) < new Date()
}

/**
 * Is future date
 */
export function isFutureDate(date: Date): boolean {
  return new Date(date) > new Date()
}

/**
 * Delay function for async operations
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
