"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMe, getToken } from "@/lib/api/auth"
import type { AuthUser } from "@/lib/api/auth"

export function LandingHeroActions() {
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

  return (
    <div className="mt-8 flex justify-center">
      <Button size="lg" asChild>
        <Link href={user ? "/dashboard" : "/sign-up"} className="flex items-center gap-2">
          Start Trading
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

export function LandingBottomActions() {
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
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
      <Button size="lg" asChild>
        <Link href="/sign-up" className="flex items-center gap-2">
          Create Free Account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="outline" size="lg" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
    </div>
  )
}
