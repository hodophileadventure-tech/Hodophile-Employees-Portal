// hooks/useAuth.ts
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/types/auth'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (!token || !userStr) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        const userData = JSON.parse(userStr) as AuthUser
        setUser(userData)
        setIsAuthenticated(true)
      } catch {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData: AuthUser, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
  }

  const isAdmin = user?.role === 'ADMIN'
  const isEmployee = user?.role === 'EMPLOYEE'

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isEmployee,
    login,
    logout,
  }
}
