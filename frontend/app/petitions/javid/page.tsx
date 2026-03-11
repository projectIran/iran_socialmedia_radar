"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { getJavidPetitions, type JavidPetition } from "@/lib/api"

export default function JavidPetitionsPage() {
  const [petitions, setPetitions] = useState<JavidPetition[]>([])
  const [selected, setSelected] = useState<JavidPetition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJavidPetitions()
      .then(setPetitions)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f5f7" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-amber-500" />
      </div>
    )
  }

  if (selected) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "#f5f5f7" }}>
        <header className="border-b border-neutral-200/60 bg-white/90 backdrop-blur-sm px-4 py-4">
          <div className="mx-auto max-w-2xl flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-neutral-900 truncate">{selected.title}</h1>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
          {selected.images.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-neutral-100 shadow-sm">
              <div className="grid gap-1" style={{ gridTemplateColumns: selected.images.length > 1 ? "1fr 1fr" : "1fr" }}>
                {selected.images.map((img, i) => (
                  <div key={i} className="relative aspect-[4/3] bg-neutral-100">
                    <Image src={img} alt="" fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                ✍️ کارزار (پتیشن)
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                👥 {selected.participation_count} نفر امضا کرده‌اند
              </span>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{selected.description}</p>
          </div>

          <a
            href={selected.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-4 text-center shadow-sm hover:opacity-90 transition-opacity"
          >
            <span className="text-base font-bold text-white">✍️ امضای کارزار</span>
            <p className="text-xs text-amber-100 mt-1">از طریق بات جاوید فایتر در تلگرام</p>
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f5f5f7" }}>
      <header className="border-b border-neutral-200/60 bg-white/90 backdrop-blur-sm px-4 py-5">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
              <span className="text-lg">🦁</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Javid Fighter Petitions</h1>
              <p className="text-xs text-neutral-500">کارزارهای جاوید فایتر</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
              Radar
            </Link>
            <Link href="/petitions" className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
              All Petitions
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {petitions.map((jp) => (
            <button
              key={jp.link}
              onClick={() => setSelected(jp)}
              className="group rounded-2xl bg-white shadow-sm border border-neutral-100 hover:shadow-md transition-shadow overflow-hidden text-left"
            >
              {jp.images?.[0] && (
                <div className="relative h-40 w-full bg-neutral-100">
                  <Image src={jp.images[0]} alt={jp.title} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">✍️ پتیشن</span>
                  <span className="text-[10px] font-semibold text-amber-600">👥 {jp.participation_count}</span>
                </div>
                <h3 className="text-base font-semibold text-neutral-900 group-hover:text-amber-700 transition-colors leading-snug">
                  {jp.title}
                </h3>
                <p className="mt-1.5 text-sm text-neutral-500 line-clamp-2">{jp.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
