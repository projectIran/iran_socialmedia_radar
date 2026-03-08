"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  adminGetCoHosts,
  adminAddCoHost,
  adminRemoveCoHost,
  adminGetCoHostPermissions,
  adminUpdateCoHostPermissions,
  type CoHost,
} from "@/lib/api"

const ALL_PERMISSIONS = ["media_support", "email_campaign", "feedback", "stats"]

export default function AdminCoHostsPage() {
  const { role } = useAuth()
  const [coHosts, setCoHosts] = useState<(CoHost & { permissions?: string[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminGetCoHosts()
      const withPerms = await Promise.all(
        data.co_hosts.map(async (ch) => {
          try {
            const p = await adminGetCoHostPermissions(ch.user_id)
            return { ...ch, permissions: p.permissions }
          } catch {
            return { ...ch, permissions: [] }
          }
        })
      )
      setCoHosts(withPerms)
    } catch {
      setError("Failed to load co-hosts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (role !== "admin") {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-neutral-400 text-sm">Only admins can manage co-hosts.</p>
      </div>
    )
  }

  const handleAdd = async () => {
    if (!email) return
    setSaving(true)
    setError("")
    try {
      await adminAddCoHost({ email, display_name: displayName || undefined })
      setShowAdd(false)
      setEmail("")
      setDisplayName("")
      load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add co-host")
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this co-host?")) return
    try {
      await adminRemoveCoHost(userId)
      load()
    } catch {
      setError("Failed to remove co-host")
    }
  }

  const togglePermission = async (userId: string, perm: string, current: string[]) => {
    const next = current.includes(perm) ? current.filter((p) => p !== perm) : [...current, perm]
    try {
      await adminUpdateCoHostPermissions(userId, next)
      setCoHosts((prev) =>
        prev.map((ch) => (ch.user_id === userId ? { ...ch, permissions: next } : ch))
      )
    } catch {
      setError("Failed to update permissions")
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Co-hosts</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Manage team members and their permissions</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="rounded-xl bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          + Add Co-host
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-neutral-900">Add Co-host</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cohost@example.com"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleAdd} disabled={saving || !email} className="flex-1 rounded-xl bg-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {saving ? "Adding..." : "Add"}
              </button>
              <button onClick={() => setShowAdd(false)} className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#6366f1]" />
        </div>
      ) : coHosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-400 text-sm">No co-hosts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coHosts.map((ch) => (
            <div key={ch.user_id} className="rounded-xl bg-white border border-neutral-100 shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{ch.display_name || ch.email}</p>
                  <p className="text-xs text-neutral-400">{ch.email}</p>
                </div>
                <button onClick={() => handleRemove(ch.user_id)} className="rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-600 hover:bg-red-100">
                  Remove
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ALL_PERMISSIONS.map((perm) => {
                  const active = ch.permissions?.includes(perm)
                  return (
                    <button
                      key={perm}
                      onClick={() => togglePermission(ch.user_id, perm, ch.permissions || [])}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "bg-[#6366f1] text-white"
                          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      }`}
                    >
                      {perm.replace("_", " ")}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
