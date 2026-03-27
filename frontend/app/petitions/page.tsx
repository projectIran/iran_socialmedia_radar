"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getPetitions, type Petition } from "@/lib/api"
export default function PetitionsPage() {
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getPetitions()
      .then((data) => setPetitions(data.petitions))
      .catch(() => setError("Failed to load petitions"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f5f5f7" }}>
      <header className="border-b border-neutral-200/60 bg-white/90 backdrop-blur-sm px-4 py-5">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2dd4a8] to-[#e74c5e]">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Petitions</h1>
              <p className="text-xs text-neutral-500">Sign petitions to support the Iranian people</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
              Radar
            </Link>
            <Link href="/campaigns" className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
              Campaigns
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#e74c5e]" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Link to Javid Fighter */}
        <Link
          href="/petitions/javid"
          className="mb-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/50 p-4 border border-amber-200/60 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦁</span>
            <div>
              <span className="text-sm font-bold text-amber-800">Javid Fighter Petitions</span>
              <p className="text-xs text-amber-600">کارزارهای جاوید فایتر</p>
            </div>
          </div>
          <svg className="h-5 w-5 text-amber-500 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {!loading && petitions.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-neutral-400 text-sm">No internal petitions right now.</p>
          </div>
        )}

        {petitions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✍️</span>
              <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">Internal Petitions</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {petitions.map((p) => (
                <Link
                  key={p.id}
                  href={`/petitions/${p.direct_link_code}`}
                  className="group rounded-2xl bg-white p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf0f0]">
                      <svg className="h-5 w-5 text-[#e74c5e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    {p.is_active && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Active</span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 group-hover:text-[#c93a4b] transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{p.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
