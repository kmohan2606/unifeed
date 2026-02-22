"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getToken, getMe } from "@/lib/api/auth"
import type { AuthUser } from "@/lib/api/auth"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function LandingNavActions() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setChecked(true)
      return
    }
    getMe(token).then((u) => {
      setUser(u)
      setChecked(true)
    })
  }, [])

  if (!checked) return null

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Button size="sm" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Link href="/settings" className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
          {getInitials(user.name)}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/sign-up">Get Started</Link>
      </Button>
    </div>
  )
}
