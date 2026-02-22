import { apiUrl } from "./config"

export interface AuthUser {
  id: number
  name: string
  email: string
  balance: number
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(apiUrl("/api/auth/signin"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || "Invalid email or password")
  }
  return res.json()
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(apiUrl("/api/auth/signup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || "Sign up failed")
  }
  return res.json()
}

export async function getMe(token: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(apiUrl("/api/auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      // Token is invalid or the DB was wiped — clear the stale cookie
      clearToken()
      return null
    }
    const data = await res.json()
    return data.user
  } catch {
    return null
  }
}

export function setToken(token: string) {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export function getToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)
  return match ? match[1] : null
}

export function clearToken() {
  document.cookie = "token=; path=/; max-age=0"
}
