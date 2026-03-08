"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { adminGetCampaigns, adminGetPetitions, type AdminEmailCampaign, type AdminPetition } from "@/lib/api"

export default function AdminDashboard() {
  const { user, role } = useAuth()
  const [campaigns, setCampaigns] = useState<AdminEmailCampaign[]>([])
  const [petitions, setPetitions] = useState<AdminPetition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([adminGetCampaigns(), adminGetPetitions()])
      .then(([c, p]) => {
        if (c.status === "fulfilled") setCampaigns(c.value.campaigns)
        if (p.status === "fulfilled") setPetitions(p.value.petitions)
      })
      .finally(() => setLoading(false))
  }, [])

  const activeCampaigns = campaigns.filter((c) => c.is_active).length
  const activePetitions = petitions.filter((p) => p.is_active).length
  const totalParticipation = [...campaigns, ...petitions].reduce((s, i) => s + i.participation_count, 0)

  const stats = [
    { label: "Total Campaigns", value: campaigns.length, color: "#2dd4a8", href: "/admin/campaigns" },
    { label: "Active Campaigns", value: activeCampaigns, color: "#22c55e", href: "/admin/campaigns" },
    { label: "Total Petitions", value: petitions.length, color: "#e74c5e", href: "/admin/petitions" },
    { label: "Active Petitions", value: activePetitions, color: "#f59e0b", href: "/admin/petitions" },
    { label: "Total Participations", value: totalParticipation, color: "#6366f1", href: "#" },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Welcome back, {user?.name || user?.email} — <span className="capitalize font-medium">{role}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#2dd4a8]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="rounded-xl bg-white p-4 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[11px] text-neutral-500 mt-1">{s.label}</p>
              </Link>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Recent campaigns */}
            <div className="rounded-xl bg-white p-5 border border-neutral-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-neutral-900">Recent Campaigns</h2>
                <Link href="/admin/campaigns" className="text-xs text-[#2dd4a8] hover:underline">View all</Link>
              </div>
              {campaigns.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">No campaigns yet</p>
              ) : (
                <div className="space-y-2">
                  {campaigns.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">{c.title}</p>
                        <p className="text-[10px] text-neutral-400">{c.participation_count} participations</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.is_active ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-500"}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent petitions */}
            <div className="rounded-xl bg-white p-5 border border-neutral-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-neutral-900">Recent Petitions</h2>
                <Link href="/admin/petitions" className="text-xs text-[#e74c5e] hover:underline">View all</Link>
              </div>
              {petitions.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">No petitions yet</p>
              ) : (
                <div className="space-y-2">
                  {petitions.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">{p.title}</p>
                        <p className="text-[10px] text-neutral-400">{p.participation_count} signatures</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.is_active ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-500"}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
