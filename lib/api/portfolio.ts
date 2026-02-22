import type { Position, UserBalance } from "@/lib/types"
import { useMockData, apiUrl } from "./config"
import { positions as mockPositions, userBalance as mockUserBalance } from "@/lib/mock-data"

export async function getPositions(): Promise<Position[]> {
  if (useMockData) {
    return Promise.resolve(mockPositions)
  }
  const res = await fetch(apiUrl("/api/portfolio/positions"))
  if (!res.ok) throw new Error("Failed to fetch positions")
  return res.json()
}

export async function getUserBalance(): Promise<UserBalance> {
  if (useMockData) {
    return Promise.resolve(mockUserBalance)
  }
  const res = await fetch(apiUrl("/api/portfolio/balance"))
  if (!res.ok) throw new Error("Failed to fetch balance")
  return res.json()
}
