// hooks/useApi.ts
'use client'

import { useState, useCallback } from 'react'
import axios, { AxiosError } from 'axios'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: AxiosError) => void
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AxiosError | null>(null)

  const request = useCallback(
    async (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any, options?: UseApiOptions) => {
      setLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const response = await axios({
          url,
          method,
          data,
          headers,
          baseURL: process.env.NEXT_PUBLIC_API_URL,
        })

        if (options?.onSuccess) {
          options.onSuccess(response.data)
        }

        return response.data
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }

        setError(err)
        if (options?.onError) {
          options.onError(err)
        }
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const get = useCallback(
    (url: string, options?: UseApiOptions) => request(url, 'GET', undefined, options),
    [request]
  )

  const post = useCallback(
    (url: string, data: any, options?: UseApiOptions) => request(url, 'POST', data, options),
    [request]
  )

  const put = useCallback(
    (url: string, data: any, options?: UseApiOptions) => request(url, 'PUT', data, options),
    [request]
  )

  const deleteRequest = useCallback(
    (url: string, options?: UseApiOptions) => request(url, 'DELETE', undefined, options),
    [request]
  )

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: deleteRequest,
  }
}
