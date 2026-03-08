"use client"

import { useState, useEffect, useCallback } from "react"
import {
  adminGetCampaigns,
  adminCreateCampaign,
  adminUpdateCampaign,
  adminDeleteCampaign,
  type AdminEmailCampaign,
  type CampaignInput,
} from "@/lib/api"

const EMPTY_FORM: CampaignInput = {
  title: "",
  email_to: "",
  description: "",
  email_bcc: "",
  subject_base: "",
  body_base: "",
  is_active: true,
  expires_at: null,
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<AdminEmailCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AdminEmailCampaign | null>(null)
  const [form, setForm] = useState<CampaignInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    adminGetCampaigns()
      .then((d) => setCampaigns(d.campaigns))
      .catch(() => setError("Failed to load campaigns"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError("")
    setShowForm(true)
  }

  const openEdit = (c: AdminEmailCampaign) => {
    setEditing(c)
    setForm({
      title: c.title,
      email_to: c.email_to,
      description: c.description || "",
      email_bcc: c.email_bcc || "",
      subject_base: c.subject_base || "",
      body_base: c.body_base || "",
      is_active: c.is_active,
      expires_at: c.expires_at,
    })
    setError("")
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      if (editing) {
        await adminUpdateCampaign(editing.id, form)
      } else {
        await adminCreateCampaign(form)
      }
      setShowForm(false)
      load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed"
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return
    try {
      await adminDeleteCampaign(id)
      load()
    } catch {
      setError("Delete failed")
    }
  }

  const updateField = <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Email Campaigns</h1>
          <p className="text-xs text-neutral-500 mt-0.5">{campaigns.length} campaigns total</p>
        </div>
        <button onClick={openCreate} className="rounded-xl bg-[#2dd4a8] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          + New Campaign
        </button>
      </div>

      {error && !showForm && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-neutral-900">
              {editing ? "Edit Campaign" : "New Campaign"}
            </h2>

            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            <div className="space-y-3">
              <Field label="Title *" value={form.title} onChange={(v) => updateField("title", v)} />
              <Field label="Recipient Email *" value={form.email_to} onChange={(v) => updateField("email_to", v)} placeholder="who@example.com" />
              <Field label="BCC" value={form.email_bcc || ""} onChange={(v) => updateField("email_bcc", v)} placeholder="Optional" />
              <Field label="Description" value={form.description || ""} onChange={(v) => updateField("description", v)} multiline />
              <Field label="Subject Template" value={form.subject_base || ""} onChange={(v) => updateField("subject_base", v)} />
              <Field label="Body Template" value={form.body_base || ""} onChange={(v) => updateField("body_base", v)} multiline />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active ?? true}
                  onChange={(e) => updateField("is_active", e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm text-neutral-700">Active</label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.email_to}
                className="flex-1 rounded-xl bg-[#2dd4a8] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#2dd4a8]" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-400 text-sm">No campaigns yet. Create your first one!</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-neutral-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs text-neutral-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">To</th>
                <th className="px-4 py-3 font-medium text-center">Participants</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{c.title}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">/{c.direct_link_code}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 truncate max-w-[160px]">{c.email_to}</td>
                  <td className="px-4 py-3 text-center text-neutral-700">{c.participation_count}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.is_active ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-500"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button onClick={() => openEdit(c)} className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-200">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-600 hover:bg-red-100">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  const cls = "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dd4a8]/50 focus:border-[#2dd4a8]"
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-500 mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  )
}
