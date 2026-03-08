"use client"

import { useState, useEffect, useCallback, use } from "react"
import Link from "next/link"
import { getPetition, participatePetition, type Petition } from "@/lib/api"

export default function PetitionDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = use(params)
  const [petition, setPetition] = useState<Petition | null>(null)
  const [loading, setLoading] = useState(true)
  const [signed, setSigned] = useState(false)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    getPetition(code)
      .then(setPetition)
      .catch(() => setError("Petition not found"))
      .finally(() => setLoading(false))
  }, [code])

  const handleSign = useCallback(async () => {
    if (!petition?.link) return
    setSigning(true)
    try {
      await participatePetition(code)
      setSigned(true)
    } catch {
      // participation tracking failed silently
    } finally {
      setSigning(false)
    }
    window.open(petition.link, "_blank")
  }, [code, petition])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f5f7" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#e74c5e]" />
      </div>
    )
  }

  if (error && !petition) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#f5f5f7" }}>
        <p className="text-neutral-500">{error}</p>
        <Link href="/petitions" className="text-sm text-[#e74c5e] hover:underline">← Back to petitions</Link>
      </div>
    )
  }

  if (!petition) return null

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f5f5f7" }}>
      <header className="border-b border-neutral-200/60 bg-white/90 backdrop-blur-sm px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <Link href="/petitions" className="text-neutral-400 hover:text-neutral-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-neutral-900 truncate">{petition.title}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 leading-relaxed">{petition.description}</p>

          {petition.link && (
            <a
              href={petition.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm text-[#e74c5e] hover:underline"
            >
              Learn more
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-100">
          {signed ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-neutral-900">Thank you for signing!</p>
              <p className="text-xs text-neutral-500 mt-1">Your voice matters for the Iranian people.</p>
            </div>
          ) : (
            <button
              onClick={handleSign}
              disabled={signing}
              className="w-full rounded-xl bg-gradient-to-r from-[#e74c5e] to-[#c93a4b] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {signing ? "Signing..." : "Sign This Petition"}
            </button>
          )}

          {error && signed && (
            <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>
    </main>
  )
}
