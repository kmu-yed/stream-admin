import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

const AUTH_STORAGE_KEY = 'stream-admin-authenticated'
const PASSWORD_STORAGE_KEY = 'stream-admin-common-password'
const DEFAULT_COMMON_PASSWORD = 'stream2026'

function readStorage(key: string) {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(key)
}

type AuthContextValue = {
  isAuthenticated: boolean
  commonPassword: string
  login: (studentId: string, password: string) => boolean
  logout: () => void
  updateCommonPassword: (password: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => readStorage(AUTH_STORAGE_KEY) === 'true')
  const [commonPassword, setCommonPassword] = useState(() => readStorage(PASSWORD_STORAGE_KEY) ?? DEFAULT_COMMON_PASSWORD)

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    commonPassword,
    login: (studentId, password) => {
      const valid = /^\d{8,}$/.test(studentId.trim()) && password === commonPassword
      if (!valid) return false
      window.localStorage.setItem(AUTH_STORAGE_KEY, 'true')
      setIsAuthenticated(true)
      return true
    },
    logout: () => {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      setIsAuthenticated(false)
    },
    updateCommonPassword: (password) => {
      window.localStorage.setItem(PASSWORD_STORAGE_KEY, password)
      setCommonPassword(password)
    },
  }), [commonPassword, isAuthenticated])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
