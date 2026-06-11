// app/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (!token || !user) {
      router.push('/login')
      return
    }

    try {
      const userData = JSON.parse(user)
      if (userData.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/employee/dashboard')
      }
    } catch {
      router.push('/login')
    }
  }, [router])

  return null
}
