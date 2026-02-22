"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { AuthUser } from "@/lib/api/auth"
import { getMe, getToken } from "@/lib/api/auth"

interface AuthState {
  user: AuthUser | null
  status: "loading" | "authenticated" | "unauthenticated"
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  status: "loading",
  refreshUser: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")

  const refreshUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setStatus("unauthenticated")
      return
    }
    const u = await getMe(token)
    if (u) {
      setUser(u)
      setStatus("authenticated")
    } else {
      setUser(null)
      setStatus("unauthenticated")
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, status, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
