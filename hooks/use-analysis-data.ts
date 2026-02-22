"use client"

import { useState, useEffect, useRef } from "react"
import type { AnalysisNewsItem, AnalysisDiscussion } from "@/lib/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const POLL_INTERVAL_MS = 2500
const MAX_ATTEMPTS = 40 // ~100 seconds before giving up

interface AnalysisDataState {
  news: AnalysisNewsItem[]
  discussions: AnalysisDiscussion[]
  newsReady: boolean
  discussionsReady: boolean
  error: string | null
}

/**
 * Polls /newsdata/ and /redditData/ until both return status "ready"
 * for the given topic, then stops.
 *
 * @param topic - The market topic string sent to /analyze/ beforehand
 * @param enabled - Set false to skip polling (e.g. topic not yet known)
 */
export function useAnalysisData(topic: string | null, enabled = true): AnalysisDataState {
  const [state, setState] = useState<AnalysisDataState>({
    news: [],
    discussions: [],
    newsReady: false,
    discussionsReady: false,
    error: null,
  })

  const attemptsRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled || !topic) return

    // Reset when topic changes
    setState({ news: [], discussions: [], newsReady: false, discussionsReady: false, error: null })
    attemptsRef.current = 0

    let newsReady = false
    let discussionsReady = false

    async function poll() {
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setState((prev) => ({ ...prev, error: "Timed out waiting for analysis data." }))
        return
      }
      attemptsRef.current += 1

      const encodedTopic = encodeURIComponent(topic!)

      try {
        const [newsRes, redditRes] = await Promise.all([
          !newsReady
            ? fetch(`${API_URL}/newsdata/?topic=${encodedTopic}`).then((r) => r.json())
            : Promise.resolve(null),
          !discussionsReady
            ? fetch(`${API_URL}/redditData/?topic=${encodedTopic}`).then((r) => r.json())
            : Promise.resolve(null),
        ])

        let nextState: Partial<AnalysisDataState> = {}

        // ── News ──────────────────────────────────────────────────
        // status "ready" means the backend has finished — results may be empty
        if (newsRes && newsRes.status === "ready") {
          newsReady = true
          const rawResults = newsRes.newsdata?.results
          const articles: AnalysisNewsItem[] = Array.isArray(rawResults)
            ? rawResults.map((a: any) => ({
              title: a.title ?? "",
              description: a.description ?? "",
              link: a.link ?? "#",
              source_name: a.source_name ?? a.source_id ?? "",
              pubDate: a.pubDate ?? new Date().toISOString(),
            }))
            : []
          nextState = { ...nextState, news: articles, newsReady: true }
        }

        // ── Discussions ───────────────────────────────────────────
        // status "ready" means the backend has finished — results may be empty
        if (redditRes && redditRes.status === "ready") {
          discussionsReady = true
          const rawResults = redditRes.redditdata?.discussions?.results
          const posts: AnalysisDiscussion[] = Array.isArray(rawResults)
            ? rawResults.map((p: any) => ({
              title: p.title ?? "",
              description: p.description ?? "",
              url: p.url ?? "#",
              forum_name: p.forum_name ?? "reddit",
              age: p.age ?? "",
              score: p.score ?? 0,
              num_answers: p.num_answers ?? 0,
            }))
            : []
          nextState = { ...nextState, discussions: posts, discussionsReady: true }
        }

        if (Object.keys(nextState).length > 0) {
          setState((prev) => ({ ...prev, ...nextState }))
        }

        // Keep polling if either source is still pending
        if (!newsReady || !discussionsReady) {
          timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch (err) {
        console.error("[useAnalysisData] poll error:", err)
        // Don't give up on a transient network error — just retry
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
      }
    }

    poll()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [topic, enabled])

  return state
}