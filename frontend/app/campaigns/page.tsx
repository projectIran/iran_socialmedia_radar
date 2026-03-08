"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getCampaigns, type EmailCampaign } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function CampaignsPage() {
  const { user, logout } = useAuth()
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getCampaigns()
      .then((data) => setCampaigns(data.campaigns))
      .catch(() => setError("Failed to load campaigns"))
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
              <h1 className="text-xl font-bold text-neutral-900">Email Campaigns</h1>
              <p className="text-xs text-neutral-500">Send advocacy emails to make your voice heard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
              Radar
            </Link>
            <Link href="/petitions" className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
              Petitions
            </Link>
            {user ? (
              <button onClick={logout} className="rounded-lg bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-200">
                Logout
              </button>
            ) : (
              <Link href="/login" className="rounded-lg bg-[#2dd4a8] px-3 py-2 text-xs font-semibold text-white hover:opacity-90">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#2dd4a8]" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!loading && campaigns.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-neutral-400 text-sm">No active campaigns right now.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.direct_link_code}`}
              className="group rounded-2xl bg-white p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6faf4]">
                  <svg className="h-5 w-5 text-[#2dd4a8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                {c.is_active && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Active</span>
                )}
              </div>
              <h3 className="text-base font-semibold text-neutral-900 group-hover:text-[#1aab88] transition-colors">
                {c.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{c.description}</p>
              <p className="mt-3 text-xs text-neutral-400">To: {c.email_to}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
