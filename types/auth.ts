// types/auth.ts
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
    email: string
    role: 'ADMIN' | 'EMPLOYEE'
  }
}

export interface AuthUser {
  id: string
  email: string
  role: 'ADMIN' | 'EMPLOYEE'
  userId?: string
}

export type Role = 'ADMIN' | 'EMPLOYEE'
