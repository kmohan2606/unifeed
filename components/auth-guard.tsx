"use client"

import { AuthProvider } from "@/lib/auth-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
