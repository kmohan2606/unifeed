"use client"

import Image from "next/image"
import logo from "@/logo.png"
import { cn } from "@/lib/utils"

interface SiteLogoProps {
  className?: string
}

export function SiteLogo({ className }: SiteLogoProps) {
  return (
    <Image
      src={logo}
      alt="UniFeed logo"
      width={500}
      height={500}
      className={cn("h-8 w-8 object-contain", className)}
      priority
    />
  )
}
