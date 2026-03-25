"use client"

import { useState, useEffect, useCallback, use } from "react"
import Link from "next/link"
import {
  getCampaign,
  generateCampaignEmail,
  participateCampaign,
  type EmailCampaign,
} from "@/lib/api"

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = use(params)
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null)
  const [generated, setGenerated] = useState<{ subject: string; body: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [participated, setParticipated] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    getCampaign(code)
      .then(setCampaign)
      .catch(() => setError("Campaign not found"))
      .finally(() => setLoading(false))
  }, [code])

  const handleGenerate = useCallback(async () => {
    if (!campaign) return
    setGenerating(true)
    try {
      const data = await generateCampaignEmail(code)
      setGenerated(data)
    } catch {
      if (campaign) {
        setGenerated({ subject: campaign.subject_base, body: campaign.body_base })
      }
    } finally {
      setGenerating(false)
    }
  }, [campaign, code])

  const handleSendEmail = useCallback(async () => {
    if (!campaign || !generated) return
    try {
      await participateCampaign(code)
      setParticipated(true)
    } catch {
      // participation tracking failed silently
    }
    const mailto = `mailto:${campaign.email_to}?subject=${encodeURIComponent(generated.subject)}&body=${encodeURIComponent(generated.body)}`
    window.location.href = mailto
  }, [campaign, generated, code])

  const copyAll = useCallback(() => {
    if (!generated) return
    navigator.clipboard.writeText(`Subject: ${generated.subject}\n\n${generated.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generated])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f5f7" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#2dd4a8]" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#f5f5f7" }}>
        <p className="text-neutral-500">{error || "Campaign not found"}</p>
        <Link href="/campaigns" className="text-sm text-[#2dd4a8] hover:underline">← Back to campaigns</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f5f5f7" }}>
      <header className="border-b border-neutral-200/60 bg-white/90 backdrop-blur-sm px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <Link href="/campaigns" className="text-neutral-400 hover:text-neutral-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-neutral-900 truncate">{campaign.title}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Campaign info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 leading-relaxed">{campaign.description}</p>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
            <span className="text-xs font-medium text-neutral-500 shrink-0">TO:</span>
            <span className="text-sm text-neutral-800 truncate flex-1">{campaign.email_to}</span>
            <button
              onClick={() => navigator.clipboard.writeText(campaign.email_to)}
              className="shrink-0 rounded-md bg-[#2dd4a8] px-2 py-1 text-xs font-medium text-white hover:opacity-90"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Generate email */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-100 space-y-4">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full rounded-xl bg-gradient-to-r from-[#2dd4a8] to-[#1aab88] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {generating ? "Generating..." : generated ? "Regenerate Email" : "Generate Personalized Email"}
          </button>

          {generated && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-lg px-3 py-2" style={{ backgroundColor: "#e6faf4" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500 mb-1">SUBJECT</p>
                <p className="text-sm font-semibold text-neutral-900">{generated.subject}</p>
              </div>

              <div className="rounded-lg bg-neutral-50 p-4 overflow-y-auto" style={{ maxHeight: 300 }}>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-700">
                  {generated.body}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyAll}
                  className="rounded-xl bg-[#2dd4a8] px-2 py-2.5 text-xs font-medium text-white hover:opacity-90"
                >
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
                <button
                  onClick={handleSendEmail}
                  className="rounded-xl bg-neutral-700 px-2 py-2.5 text-xs font-medium text-white hover:opacity-90"
                >
                  {participated ? "✓ Email Sent" : "Open in Email App"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
