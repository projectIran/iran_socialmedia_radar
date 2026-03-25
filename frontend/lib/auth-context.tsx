"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  type AuthUser,
  type MeResponse,
} from "./api"

interface AuthState {
  user: AuthUser | null
  role: MeResponse["role"] | null
  permissions: string[]
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [role, setRole] = useState<MeResponse["role"] | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await getMe()
      setUser(data.user)
      setRole(data.role)
      setPermissions(data.permissions)
    } catch {
      localStorage.removeItem("auth_token")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password)
    localStorage.setItem("auth_token", data.token)
    setUser(data.user)
    const me = await getMe()
    setRole(me.role)
    setPermissions(me.permissions)
  }, [])

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const data = await apiRegister(email, password, name)
      localStorage.setItem("auth_token", data.token)
      setUser(data.user)
      const me = await getMe()
      setRole(me.role)
      setPermissions(me.permissions)
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token")
    setUser(null)
    setRole(null)
    setPermissions([])
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, role, permissions, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
