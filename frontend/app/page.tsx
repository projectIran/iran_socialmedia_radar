"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getCampaigns, getPetitions, type EmailCampaign, type Petition } from "@/lib/api"
import emailData from "@/lib/emailData"

interface Person {
  id: number
  name: string
  role: string
  x_handle: string
  email: string
  category: string
  priority: "high" | "medium" | "low"
}

type Side = "antiwar" | "prowar"

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function getHandleClean(x_handle: string): string {
  return x_handle.replace(/^@/, "")
}

function getPhotoUrl(x_handle: string): string {
  return `/data/photos/${getHandleClean(x_handle).toLowerCase()}.jpg`
}

const EMAIL_THRESHOLD = 2

function getInfluenceScore(person: Person): number {
  const base = person.priority === "high" ? 9.0 : person.priority === "medium" ? 7.5 : 5.0
  const frac = (person.name.length * 0.1) % 1
  return Math.round((base + frac) * 10) / 10
}

function sortPersons(
  persons: Person[],
  clickCounts: Record<string, number>
): Person[] {
  return [...persons].sort((a, b) => {
    const countA = clickCounts[getHandleClean(a.x_handle).toLowerCase()] ?? 0
    const countB = clickCounts[getHandleClean(b.x_handle).toLowerCase()] ?? 0
    const overA = countA >= EMAIL_THRESHOLD ? 1 : 0
    const overB = countB >= EMAIL_THRESHOLD ? 1 : 0

    if (overA !== overB) return overA - overB

    if (!overA) {
      if (countA !== countB) return countA - countB
    } else {
      if (countA !== countB) return countA - countB
    }

    const prioOrder = { high: 0, medium: 1, low: 2 }
    if (prioOrder[a.priority] !== prioOrder[b.priority]) {
      return prioOrder[a.priority] - prioOrder[b.priority]
    }
    return a.name.localeCompare(b.name)
  })
}

async function trackEmailClick(handle: string): Promise<void> {
  try {
    await fetch("/api/email-clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    })
  } catch {
    // silently fail
  }
}

function generateEmailClientSide(
  person: Person,
  side: Side,
  userName: string,
  userCity: string
): { subject: string; body: string } {
  const currentType = side === "prowar" ? "supporters" : "opponents"
  const data = emailData[currentType]

  const subject = getRandom(data.subjects)
  const greeting = getRandom(data.greetings).replace("{name}", person.name)
  const openingSentence = getRandom(data.openings)
  const openingExtra = getRandom(data.opening_extras)
  const para1 = `${openingSentence} ${openingExtra}`

  const middleParagraphs: string[] = []

  if (currentType === "opponents" && data.facts_ir_crimes) {
    const crimeCount = 2 + Math.floor(Math.random() * 3)
    const crimes = [...data.facts_ir_crimes].sort(() => Math.random() - 0.5).slice(0, crimeCount)
    middleParagraphs.push(crimes.join(" "))
  }

  const pahlaviCount = 2 + Math.floor(Math.random() * 3)
  const pahlaviFacts = [...data.facts_pahlavi].sort(() => Math.random() - 0.5).slice(0, pahlaviCount)
  middleParagraphs.push(pahlaviFacts.join(" "))

  const principleCount = 2 + Math.floor(Math.random() * 3)
  const principleFacts = [...data.facts_principles].sort(() => Math.random() - 0.5).slice(0, principleCount)
  middleParagraphs.push(principleFacts.join(" "))

  const middleText = middleParagraphs.join("\n\n")

  const ask = getRandom(data.asks)
  const closing = getRandom(data.closings)

  const identityString =
    userName || userCity
      ? `\n\n- ${userName || "A concerned citizen"}${userCity ? `, ${userCity}` : ""}`
      : ""

  const body = `${greeting}\n\n${para1}\n\n${middleText}\n\n${ask}\n\n${closing}${identityString}`

  return { subject, body }
}

// ------------------------------------------------------------------
// Avatar with fallback initials
// ------------------------------------------------------------------
function Avatar({
  person,
  side,
  size = 80,
}: {
  person: Person
  side: Side
  size?: number
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const ringColor = side === "antiwar" ? "#e74c5e" : "#2dd4a8"

  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{
        width: size + 8,
        height: size + 8,
        border: `3px solid ${ringColor}`,
        background: "#fff",
      }}
    >
      {!imgFailed ? (
        <img
          src={getPhotoUrl(person.x_handle)}
          alt={person.name}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center font-bold text-white"
          style={{
            width: size,
            height: size,
            backgroundColor: ringColor,
            fontSize: size * 0.35,
          }}
        >
          {getInitials(person.name)}
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------
// Email Template Modal
// ------------------------------------------------------------------
function EmailTemplateModal({
  person,
  side,
  onClose,
  onEmailSent,
}: {
  person: Person
  side: Side
  onClose: () => void
  onEmailSent?: () => void
}) {
  const [userName, setUserName] = useState("")
  const [userCity, setUserCity] = useState("")
  const [generated, setGenerated] = useState<{ subject: string; body: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const accentColor = side === "antiwar" ? "#e74c5e" : "#2dd4a8"

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personName: person.name,
          personEmail: person.email,
          side,
          userName,
          userCity,
        }),
      })
      if (!res.ok) throw new Error("API failed")
      const data = await res.json()
      setGenerated({ subject: data.subject, body: data.body })
    } catch {
      const result = generateEmailClientSide(person, side, userName, userCity)
      setGenerated(result)
    } finally {
      setLoading(false)
    }
  }, [person, side, userName, userCity])

  const copyAll = useCallback(() => {
    if (!generated) return
    navigator.clipboard.writeText(`Subject: ${generated.subject}\n\n${generated.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generated])

  const encodedSubject = generated ? encodeURIComponent(generated.subject) : ""
  const encodedBody = generated ? encodeURIComponent(generated.body) : ""
  const encodedEmail = encodeURIComponent(person.email)

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* macOS dots */}
        <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3 sticky top-0 z-10">
          <button
            onClick={onClose}
            className="h-3 w-3 rounded-full transition-colors"
            style={{ backgroundColor: "#ff5f57" }}
            aria-label="Close"
          />
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
          <span className="ml-2 text-sm font-medium text-neutral-600">Email Template</span>
        </div>

        <div className="p-6 space-y-4">
          {/* Input fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">City / State</label>
              <input
                type="text"
                value={userCity}
                onChange={(e) => setUserCity(e.target.value)}
                placeholder="City, State"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? "Generating..." : generated ? "Regenerate" : "Generate Email"}
          </button>

          {/* Generated content */}
          {generated && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* TO field */}
              <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
                <span className="text-xs font-medium text-neutral-500 shrink-0">TO:</span>
                <span className="text-sm text-neutral-800 truncate flex-1">{person.email}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(person.email)
                  }}
                  className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: accentColor }}
                >
                  Copy
                </button>
              </div>

              {/* Persian warning */}
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 leading-relaxed" dir="rtl">
                ⚠️ برای برخی گوشی‌ها اگر سایت را با مرورگری جز کروم باز کنید، ممکن است آدرس ایمیل در فیلد TO قرار نگیرد. لطفاً قبل از زدن دکمه Email، آدرس بالا را کپی کنید.
              </p>

              {/* Subject */}
              <div className="rounded-lg px-3 py-2" style={{ backgroundColor: "#e6faf4" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500 mb-1">SUBJECT</p>
                <p className="text-sm font-semibold text-neutral-900">{generated.subject}</p>
              </div>

              {/* Body */}
              <div className="rounded-lg bg-neutral-50 p-4 overflow-y-auto" style={{ maxHeight: 300 }}>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-700">
                  {generated.body}
                </pre>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyAll}
                  className="rounded-xl px-2 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: accentColor }}
                >
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
                <a
                  href={`mailto:${person.email}?subject=${encodedSubject}&body=${encodedBody}`}
                  onClick={() => {
                    trackEmailClick(person.x_handle)
                    onEmailSent?.()
                  }}
                  className="rounded-xl px-2 py-2.5 text-xs font-medium text-white text-center transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#6b7280" }}
                >
                  Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Person Modal
// ------------------------------------------------------------------
function PersonModal({
  person,
  side,
  onClose,
  emailCount,
  onEmailSent,
}: {
  person: Person
  side: Side
  onClose: () => void
  emailCount: number
  onEmailSent: () => void
}) {
  const [showEmail, setShowEmail] = useState(false)
  const accentColor = side === "antiwar" ? "#e74c5e" : "#2dd4a8"
  const lightBg = side === "antiwar" ? "#fdf0f0" : "#e6faf4"
  const handle = getHandleClean(person.x_handle)
  const progress = Math.min((emailCount / EMAIL_THRESHOLD) * 100, 100)
  const isOverThreshold = emailCount >= EMAIL_THRESHOLD

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* macOS dots */}
          <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
            <button
              onClick={onClose}
              className="h-3 w-3 rounded-full transition-colors"
              style={{ backgroundColor: "#ff5f57" }}
              aria-label="Close"
            />
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
          </div>

          <div className="p-6">
            {/* Profile header */}
            <div className="mb-6 flex items-center gap-4">
              <Avatar person={person} side={side} size={72} />
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{person.name}</h3>
                <p className="text-sm text-neutral-500">
                  Influence Score: {getInfluenceScore(person).toFixed(1)}
                </p>
              </div>
            </div>

            {/* Social links */}
            <div className="space-y-3">
              {handle && (
                <a
                  href={`https://x.com/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:opacity-80"
                  style={{ backgroundColor: lightBg }}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: accentColor }}
                  >
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">X (Twitter)</p>
                    <p className="text-xs text-neutral-500">@{handle}</p>
                  </div>
                </a>
              )}

              <a
                href={`https://instagram.com/${handle.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:opacity-80"
                style={{ backgroundColor: lightBg }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Instagram</p>
                  <p className="text-xs text-neutral-500">@{handle.toLowerCase()}</p>
                </div>
              </a>

              <button
                onClick={() => setShowEmail(true)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:opacity-80"
                style={{ backgroundColor: lightBg }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: accentColor }}
                >
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-neutral-900">Send Email</p>
                  <p className="text-xs text-neutral-500">Open pre-written email template</p>
                </div>
              </button>
            </div>

            {/* Email count progress */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">
                  Emails sent: <span className="font-semibold text-neutral-700">{emailCount}</span> / {EMAIL_THRESHOLD}
                </span>
                {isOverThreshold && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    Goal reached
                  </span>
                )}
              </div>
              <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: isOverThreshold ? "#22c55e" : accentColor,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEmail && (
        <EmailTemplateModal
          person={person}
          side={side}
          onClose={() => setShowEmail(false)}
          onEmailSent={onEmailSent}
        />
      )}
    </>
  )
}

// ------------------------------------------------------------------
// Avatar Card (grid item)
// ------------------------------------------------------------------
function AvatarCard({
  person,
  side,
  onClick,
  emailCount,
}: {
  person: Person
  side: Side
  onClick: () => void
  emailCount: number
}) {
  const accentColor = side === "antiwar" ? "#e74c5e" : "#2dd4a8"
  const isOverThreshold = emailCount >= EMAIL_THRESHOLD
  const opacity = isOverThreshold ? "opacity-50" : ""

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg p-1 transition-transform hover:scale-105 ${opacity}`}
      style={{ width: 100 }}
    >
      <span
        className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
        style={{ backgroundColor: isOverThreshold ? "#22c55e" : accentColor }}
      >
        {isOverThreshold ? `✓ ${emailCount}` : `${emailCount} / ${EMAIL_THRESHOLD}`}
      </span>
      <Avatar person={person} side={side} size={68} />
      <span className="mt-2 max-w-[90px] text-center text-[11px] font-medium leading-tight text-neutral-700 line-clamp-2">
        {person.name}
      </span>
    </button>
  )
}

// ------------------------------------------------------------------
// Stories Bar (Instagram-style for Campaigns & Petitions)
// ------------------------------------------------------------------
function StoriesBar({
  campaigns,
  petitions,
}: {
  campaigns: EmailCampaign[]
  petitions: Petition[]
}) {
  const items = [
    ...campaigns.map((c) => ({ type: "campaign" as const, id: c.id, title: c.title, code: c.direct_link_code, active: c.is_active })),
    ...petitions.map((p) => ({ type: "petition" as const, id: p.id, title: p.title, code: p.direct_link_code, active: p.is_active })),
  ]

  if (items.length === 0) return null

  return (
    <div className="w-full overflow-x-auto px-4 py-4 border-b border-neutral-200/60 bg-white/50">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex gap-4 min-w-max">
          {items.map((item) => {
            const isCampaign = item.type === "campaign"
            const gradFrom = isCampaign ? "#2dd4a8" : "#e74c5e"
            const gradTo = isCampaign ? "#1aab88" : "#c93a4b"
            const icon = isCampaign
              ? "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              : "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"

            return (
              <Link
                key={item.id}
                href={isCampaign ? `/campaigns/${item.code}` : `/petitions/${item.code}`}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full p-[3px]"
                  style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white group-hover:bg-neutral-50 transition-colors">
                    <svg className="h-5 w-5" style={{ color: gradFrom }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                  </div>
                </div>
                <span className="max-w-[72px] text-center text-[10px] font-medium leading-tight text-neutral-600 line-clamp-2">
                  {item.title}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Collapsible Column (Dropdown/Accordion)
// ------------------------------------------------------------------
function PersonColumn({
  title,
  persons,
  side,
  search,
  clickCounts,
  onEmailSent,
  defaultOpen = false,
}: {
  title: string
  persons: Person[]
  side: Side
  search: string
  clickCounts: Record<string, number>
  onEmailSent: () => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  const filtered = persons.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.x_handle.toLowerCase().includes(q)
    )
  })

  const sorted = sortPersons(filtered, clickCounts)

  const bgColor = side === "antiwar" ? "#fdf0f0" : "#e6faf4"
  const titleColor = side === "antiwar" ? "#c93a4b" : "#1aab88"

  const persianTitle = side === "antiwar"
    ? "چهره‌های مخالف جهانی"
    : "حامیان آزادی ایران"
  const subtitle = side === "antiwar"
    ? "Influential Social Media Voices"
    : "Most Influential Faces"

  const totalPersons = filtered.length
  const coveredCount = filtered.filter(
    (p) => (clickCounts[getHandleClean(p.x_handle).toLowerCase()] ?? 0) >= EMAIL_THRESHOLD
  ).length

  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm">
      {/* Dropdown header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:opacity-90"
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: titleColor + "20" }}>
            <svg className="h-5 w-5" style={{ color: titleColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {side === "antiwar" ? (
                <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /></>
              ) : (
                <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>
              )}
            </svg>
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: titleColor }}>
              {title}
            </h2>
            <p className="text-xs text-neutral-500">
              {persianTitle} · {subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">{coveredCount}/{totalPersons}</span>
          <svg
            className={`h-5 w-5 text-neutral-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Collapsible content */}
      <div
        className={`transition-all duration-300 overflow-hidden ${open ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="px-5 pb-5">
          {/* Coverage bar */}
          <div className="mx-auto mb-4 max-w-xs">
            <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
              <span>Coverage: {coveredCount}/{totalPersons}</span>
              <span>{totalPersons > 0 ? Math.round((coveredCount / totalPersons) * 100) : 0}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-neutral-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${totalPersons > 0 ? (coveredCount / totalPersons) * 100 : 0}%`,
                  backgroundColor: titleColor,
                }}
              />
            </div>
          </div>

          {sorted.length === 0 ? (
            <p className="text-center text-sm text-neutral-400 py-8">No results found</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {sorted.map((person) => (
                <AvatarCard
                  key={`${person.id}-${person.x_handle}`}
                  person={person}
                  side={side}
                  onClick={() => setSelectedPerson(person)}
                  emailCount={clickCounts[getHandleClean(person.x_handle).toLowerCase()] ?? 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPerson && (
        <PersonModal
          person={selectedPerson}
          side={side}
          onClose={() => setSelectedPerson(null)}
          emailCount={clickCounts[getHandleClean(selectedPerson.x_handle).toLowerCase()] ?? 0}
          onEmailSent={onEmailSent}
        />
      )}
    </div>
  )
}

// ------------------------------------------------------------------
// Main Page
// ------------------------------------------------------------------
export default function SocialMediaRadar() {
  const { user, logout } = useAuth()
  const [democrats, setDemocrats] = useState<Person[]>([])
  const [republicans, setRepublicans] = useState<Person[]>([])
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({})

  const fetchClickCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/email-clicks")
      if (res.ok) {
        const data = await res.json()
        setClickCounts(data)
      }
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    Promise.all([
      fetch("/data/democrats.json").then((r) => r.json()),
      fetch("/data/republicans.json").then((r) => r.json()),
    ])
      .then(([dems, reps]) => {
        setDemocrats(dems)
        setRepublicans(reps)
      })
      .catch((err) => console.error("Failed to load data:", err))
      .finally(() => setLoading(false))

    getCampaigns().then((d) => setCampaigns(d.campaigns)).catch(() => {})
    getPetitions().then((d) => setPetitions(d.petitions)).catch(() => {})
    fetchClickCounts()
  }, [fetchClickCounts])

  const handleEmailSent = useCallback(() => {
    setTimeout(fetchClickCounts, 500)
  }, [fetchClickCounts])

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f5f5f7", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-neutral-200/60 bg-white/90 backdrop-blur-sm px-4 py-5">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2dd4a8] to-[#e74c5e]">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Social Media Radar</h1>
              <p className="text-xs text-neutral-500">Monitoring Global Influence | Advocating for Iran</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role, or handle..."
              className="flex-1 sm:w-60 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#2dd4a8]/50 focus:border-[#2dd4a8]"
            />
            {user ? (
              <button onClick={logout} className="shrink-0 rounded-lg bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-200">
                Logout
              </button>
            ) : (
              <Link href="/login" className="shrink-0 rounded-lg bg-gradient-to-r from-[#2dd4a8] to-[#1aab88] px-3 py-2 text-xs font-semibold text-white hover:opacity-90">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Stories bar — Campaigns & Petitions like Instagram stories */}
      <StoriesBar campaigns={campaigns} petitions={petitions} />

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#2dd4a8]" />
        </div>
      ) : (
        <div className="mx-auto max-w-[1400px] px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="order-2 md:order-1">
            <PersonColumn
              title="GLOBAL PROGRESSIVE FIGURES"
              persons={democrats}
              side="antiwar"
              search={search}
              clickCounts={clickCounts}
              onEmailSent={handleEmailSent}
            defaultOpen={true}
          />
          </div>

          <div className="order-1 md:order-2">
            <PersonColumn
              title="IRAN LIBERATION ADVOCATES"
              persons={republicans}
              side="prowar"
              search={search}
              clickCounts={clickCounts}
              onEmailSent={handleEmailSent}
              defaultOpen={true}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-200/50 bg-white/80 backdrop-blur-sm px-4 py-5">
        <p className="text-center text-xs text-neutral-400">
          Social Media Radar — Built for the Iranian Diaspora advocacy community
        </p>
      </footer>
    </main>
  )
}
