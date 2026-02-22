/**
 * API configuration. Set NEXT_PUBLIC_API_URL to your backend base URL.
 * When unset, the app uses mock data (lib/mock-data).
 */
export const API_BASE_URL =
  typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "")
    : ""

export const useMockData = !API_BASE_URL

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
}
