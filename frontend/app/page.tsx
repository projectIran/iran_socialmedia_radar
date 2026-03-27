"use client"

import { useState, useEffect, useCallback } from "react"
import { getCampaigns, getPetitions, getJavidCampaigns, getJavidPetitions, type EmailCampaign, type Petition, type JavidCampaign, type JavidPetition } from "@/lib/api"
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

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface TreemapCampaign {
  id: string
  title: string
  titleEn?: string
  type: "email" | "tweet" | "donation" | "petition"
  weight: number
  description: string
  sampleContent: string
  actionLabel: string
  color: string
  participants: number
  upvotes: number
  downvotes: number
  shareLink?: string
}

interface LayoutRect extends TreemapCampaign {
  x: number
  y: number
  w: number
  h: number
}

interface CampaignFormData {
  category: "email" | "tweet" | "donation" | "petition" | null
  title: string
  description: string
  importance: string
  emailTo?: string
  emailSubject?: string
  emailBody?: string
  tweetText?: string
  donationGoal?: string
  donationLink?: string
  petitionLink?: string
  petitionTarget?: string
}

// ------------------------------------------------------------------
// Translations
// ------------------------------------------------------------------
const translations = {
  fa: {
    appTitle: "رادار شبکه‌های اجتماعی",
    appSubtitle: "داشبورد تأثیرگذاری کمپین‌ها",
    createCampaign: "+ ایجاد کمپین جدید",
    activeCampaigns: "کمپین‌های فعال",
    campaignDescription: "اندازه مستطیل نشان‌دهنده اهمیت کمپین است. برای مشارکت کلیک کنید.",
    allCategories: "همه",
    email: "ایمیل",
    tweet: "توییت",
    donation: "کمک مالی",
    petition: "پتیشن",
    admin: "مدیریت",
    logout: "خروج",
    signIn: "ورود",
    participants: "شرکت‌کننده",
    upvote: "رأی مثبت",
    downvote: "رأی منفی",
    share: "اشتراک",
    promote: "تبلیغ",
    feedback: "بازخورد",
    close: "بستن",
    next: "بعدی",
    back: "قبلی",
    submit: "ثبت",
    categorySelect: "دسته‌بندی کمپین را انتخاب کنید",
    emailCampaign: "کمپین ایمیل",
    tweetStorm: "طوفان توییت",
    fundraiser: "جمع‌آوری کمک",
    petitionCampaign: "کمپین پتیشن",
    campaignDetails: "جزئیات کمپین",
    campaignTitle: "عنوان کمپین",
    campaignTitlePlaceholder: "یک عنوان جذاب وارد کنید",
    campaignDescPlaceholder: "کمپین شما درباره چیست؟",
    whyImportant: "چرا این کمپین مهم است؟",
    whyImportantPlaceholder: "توضیح دهید چرا مردم باید در این کمپین شرکت کنند...",
    emailTo: "ایمیل گیرنده",
    emailToPlaceholder: "recipient@example.com",
    emailSubject: "موضوع ایمیل",
    emailSubjectPlaceholder: "موضوع پیش‌فرض",
    emailBody: "متن ایمیل",
    emailBodyPlaceholder: "متن پیش‌فرض ایمیل...",
    tweetText: "متن توییت",
    tweetTextPlaceholder: "توییت پیش‌نویس خود را بنویسید...",
    donationGoal: "هدف مالی",
    donationGoalPlaceholder: "مثلاً ۱۰۰۰۰ دلار",
    donationLink: "لینک کمک مالی",
    donationLinkPlaceholder: "https://donate.example.com",
    petitionLink: "لینک پتیشن",
    petitionLinkPlaceholder: "https://petition.example.com",
    petitionTarget: "مخاطب پتیشن",
    petitionTargetPlaceholder: "مثلاً سازمان ملل",
    successTitle: "کمپین شما ایجاد شد!",
    successMessage: "لینک زیر را با دوستان خود به اشتراک بگذارید:",
    copyLink: "کپی لینک",
    copied: "کپی شد!",
    shareOn: "اشتراک‌گذاری در:",
    shareThisCampaign: "اشتراک‌گذاری این کمپین",
    footer: "رادار شبکه‌های اجتماعی — ساخته شده برای جامعه ایرانیان مهاجر",
  },
  en: {
    appTitle: "Social Media Radar",
    appSubtitle: "Campaign Impact Dashboard",
    createCampaign: "+ Create New Campaign",
    activeCampaigns: "Active Campaigns",
    campaignDescription: "Rectangle size reflects campaign importance. Click to participate.",
    allCategories: "All",
    email: "Email",
    tweet: "Tweet",
    donation: "Donation",
    petition: "Petition",
    admin: "Admin",
    logout: "Logout",
    signIn: "Sign In",
    participants: "participants",
    upvote: "Upvote",
    downvote: "Downvote",
    share: "Share",
    promote: "Promote",
    feedback: "Feedback",
    close: "Close",
    next: "Next",
    back: "Back",
    submit: "Submit",
    categorySelect: "Select Campaign Category",
    emailCampaign: "Email Campaign",
    tweetStorm: "Tweet Storm",
    fundraiser: "Fundraiser",
    petitionCampaign: "Petition",
    campaignDetails: "Campaign Details",
    campaignTitle: "Campaign Title",
    campaignTitlePlaceholder: "Enter a compelling title",
    campaignDescPlaceholder: "What is your campaign about?",
    whyImportant: "Why is this campaign important?",
    whyImportantPlaceholder: "Explain why people should participate in this campaign...",
    emailTo: "Recipient Email",
    emailToPlaceholder: "recipient@example.com",
    emailSubject: "Email Subject",
    emailSubjectPlaceholder: "Default subject line",
    emailBody: "Email Body",
    emailBodyPlaceholder: "Default email text...",
    tweetText: "Tweet Text",
    tweetTextPlaceholder: "Write your draft tweet...",
    donationGoal: "Fundraising Goal",
    donationGoalPlaceholder: "e.g. $10,000",
    donationLink: "Donation Link",
    donationLinkPlaceholder: "https://donate.example.com",
    petitionLink: "Petition Link",
    petitionLinkPlaceholder: "https://petition.example.com",
    petitionTarget: "Petition Target",
    petitionTargetPlaceholder: "e.g. United Nations",
    successTitle: "Campaign Created Successfully!",
    successMessage: "Share this link with your friends:",
    copyLink: "Copy Link",
    copied: "Copied!",
    shareOn: "Share on:",
    shareThisCampaign: "Share this Campaign",
    footer: "Social Media Radar — Built for the Iranian Diaspora advocacy community",
  },
}

const EMAIL_THRESHOLD = Number(process.env.NEXT_PUBLIC_EMAIL_THRESHOLD) || 100

// ------------------------------------------------------------------
// Squarified Treemap Layout Algorithm
// ------------------------------------------------------------------
const MIN_W = 60
const MIN_H = 40
const GAP = 2

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

function squarify(
  items: { weight: number; index: number }[],
  rect: Rect,
  results: { index: number; x: number; y: number; w: number; h: number }[]
): void {
  if (items.length === 0) return
  if (items.length === 1) {
    results.push({ index: items[0].index, x: rect.x, y: rect.y, w: rect.w, h: rect.h })
    return
  }

  const totalWeight = items.reduce((s, i) => s + i.weight, 0)
  const isWide = rect.w >= rect.h

  let bestCount = 1
  let bestWorst = Infinity

  for (let count = 1; count <= items.length; count++) {
    const stripItems = items.slice(0, count)
    const stripWeight = stripItems.reduce((s, i) => s + i.weight, 0)
    const fraction = stripWeight / totalWeight

    if (isWide) {
      const stripW = rect.w * fraction
      let worst = 0
      for (const item of stripItems) {
        const itemH = rect.h * (item.weight / stripWeight)
        const ratio = Math.max(stripW / itemH, itemH / stripW)
        if (ratio > worst) worst = ratio
      }
      if (worst < bestWorst || count === 1) {
        bestWorst = worst
        bestCount = count
      } else {
        break
      }
    } else {
      const stripH = rect.h * fraction
      let worst = 0
      for (const item of stripItems) {
        const itemW = rect.w * (item.weight / stripWeight)
        const ratio = Math.max(stripH / itemW, itemW / stripH)
        if (ratio > worst) worst = ratio
      }
      if (worst < bestWorst || count === 1) {
        bestWorst = worst
        bestCount = count
      } else {
        break
      }
    }
  }

  const stripItems = items.slice(0, bestCount)
  const remaining = items.slice(bestCount)
  const stripWeight = stripItems.reduce((s, i) => s + i.weight, 0)
  const fraction = stripWeight / totalWeight

  if (isWide) {
    const stripW = rect.w * fraction
    let yOff = rect.y
    for (const item of stripItems) {
      const itemH = rect.h * (item.weight / stripWeight)
      results.push({ index: item.index, x: rect.x, y: yOff, w: stripW, h: itemH })
      yOff += itemH
    }
    squarify(remaining, { x: rect.x + stripW, y: rect.y, w: rect.w - stripW, h: rect.h }, results)
  } else {
    const stripH = rect.h * fraction
    let xOff = rect.x
    for (const item of stripItems) {
      const itemW = rect.w * (item.weight / stripWeight)
      results.push({ index: item.index, x: xOff, y: rect.y, w: itemW, h: stripH })
      xOff += itemW
    }
    squarify(remaining, { x: rect.x, y: rect.y + stripH, w: rect.w, h: rect.h - stripH }, results)
  }
}

function computeTreemap(
  campaigns: TreemapCampaign[],
  width: number,
  height: number
): LayoutRect[] {
  if (width <= 0 || height <= 0) return []

  const sorted = campaigns
    .map((c, i) => ({ weight: c.weight, index: i }))
    .sort((a, b) => b.weight - a.weight)

  const rawResults: { index: number; x: number; y: number; w: number; h: number }[] = []
  squarify(sorted, { x: 0, y: 0, w: width, h: height }, rawResults)

  return rawResults.map((r) => ({
    ...campaigns[r.index],
    x: r.x + GAP / 2,
    y: r.y + GAP / 2,
    w: Math.max(r.w - GAP, MIN_W),
    h: Math.max(r.h - GAP, MIN_H),
  }))
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function getTextColor(bgHex: string): string {
  return getLuminance(bgHex) > 0.35 ? "#1a1a1a" : "#ffffff"
}

function formatParticipants(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

const TYPE_ICONS: Record<TreemapCampaign["type"], string> = {
  email: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  tweet: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", // X logo
  donation: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  petition: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
}

const TYPE_LABELS = {
  fa: {
    email: "کمپین ایمیل",
    tweet: "طوفان توییت",
    donation: "جمع‌آوری کمک",
    petition: "پتیشن",
  },
  en: {
    email: "Email Campaign",
    tweet: "Tweet Storm",
    donation: "Fundraiser",
    petition: "Petition",
  },
}

// ------------------------------------------------------------------
// Create Campaign Modal (Multi-step)
// ------------------------------------------------------------------
function CreateCampaignModal({
  onClose,
  onSuccess,
  lang,
}: {
  onClose: () => void
  onSuccess: (shareLink: string) => void
  lang: "fa" | "en"
}) {
  const t = translations[lang]
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState<CampaignFormData>({
    category: null,
    title: "",
    description: "",
    importance: "",
  })

  const categories: Array<{ type: TreemapCampaign["type"]; icon: string; label: string; color: string }> = [
    { type: "email", icon: TYPE_ICONS.email, label: t.emailCampaign, color: "#0d9488" },
    { type: "tweet", icon: TYPE_ICONS.tweet, label: t.tweetStorm, color: "#3b82f6" },
    { type: "donation", icon: TYPE_ICONS.donation, label: t.fundraiser, color: "#f59e0b" },
    { type: "petition", icon: TYPE_ICONS.petition, label: t.petitionCampaign, color: "#e11d48" },
  ]

  const handleCategorySelect = (cat: TreemapCampaign["type"]) => {
    setFormData({ ...formData, category: cat })
    setStep(2)
  }

  const handleSubmit = () => {
    const mockShareLink = `https://radar.example.com/c/${Math.random().toString(36).slice(2, 9)}`
    onSuccess(mockShareLink)
  }

  const isFormValid = formData.title && formData.description && formData.importance

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        dir={lang === "fa" ? "rtl" : "ltr"}
      >
        <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3 sticky top-0 z-10">
          <button
            onClick={onClose}
            className="h-3 w-3 rounded-full transition-colors hover:brightness-90"
            style={{ backgroundColor: "#ff5f57" }}
            aria-label="Close"
          />
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
          <span className="ml-2 text-sm font-medium text-neutral-600">
            {t.createCampaign}
          </span>
        </div>

        <div className="p-6 space-y-5">
          {step === 1 ? (
            <>
              <h3 className="text-lg font-bold text-neutral-900">{t.categorySelect}</h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.type}
                    onClick={() => handleCategorySelect(cat.type)}
                    className="flex flex-col items-center gap-3 rounded-xl p-5 transition-all hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-current"
                    style={{ backgroundColor: cat.color + "15", color: cat.color }}
                  >
                    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={cat.icon} />
                    </svg>
                    <span className="text-sm font-semibold text-neutral-800">{cat.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-900">{t.campaignDetails}</h3>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  {t.back}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.campaignTitle}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t.campaignTitlePlaceholder}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.campaignDescription}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t.campaignDescPlaceholder}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {formData.category === "email" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.emailTo}</label>
                    <input
                      type="email"
                      value={formData.emailTo || ""}
                      onChange={(e) => setFormData({ ...formData, emailTo: e.target.value })}
                      placeholder={t.emailToPlaceholder}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.emailSubject}</label>
                    <input
                      type="text"
                      value={formData.emailSubject || ""}
                      onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                      placeholder={t.emailSubjectPlaceholder}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.emailBody}</label>
                    <textarea
                      value={formData.emailBody || ""}
                      onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                      placeholder={t.emailBodyPlaceholder}
                      rows={4}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {formData.category === "tweet" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.tweetText}</label>
                  <textarea
                    value={formData.tweetText || ""}
                    onChange={(e) => setFormData({ ...formData, tweetText: e.target.value })}
                    placeholder={t.tweetTextPlaceholder}
                    rows={4}
                    maxLength={280}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-neutral-400 mt-1">{(formData.tweetText || "").length}/280</p>
                </div>
              )}

              {formData.category === "donation" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.donationGoal}</label>
                    <input
                      type="text"
                      value={formData.donationGoal || ""}
                      onChange={(e) => setFormData({ ...formData, donationGoal: e.target.value })}
                      placeholder={t.donationGoalPlaceholder}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.donationLink}</label>
                    <input
                      type="url"
                      value={formData.donationLink || ""}
                      onChange={(e) => setFormData({ ...formData, donationLink: e.target.value })}
                      placeholder={t.donationLinkPlaceholder}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {formData.category === "petition" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.petitionLink}</label>
                    <input
                      type="url"
                      value={formData.petitionLink || ""}
                      onChange={(e) => setFormData({ ...formData, petitionLink: e.target.value })}
                      placeholder={t.petitionLinkPlaceholder}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.petitionTarget}</label>
                    <input
                      type="text"
                      value={formData.petitionTarget || ""}
                      onChange={(e) => setFormData({ ...formData, petitionTarget: e.target.value })}
                      placeholder={t.petitionTargetPlaceholder}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.whyImportant}</label>
                <textarea
                  value={formData.importance}
                  onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                  placeholder={t.whyImportantPlaceholder}
                  rows={4}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#2dd4a8" }}
              >
                {t.submit}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Success Modal (Share Campaign)
// ------------------------------------------------------------------
function SuccessModal({
  shareLink,
  onClose,
  lang,
}: {
  shareLink: string
  onClose: () => void
  lang: "fa" | "en"
}) {
  const t = translations[lang]
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const socialShares = [
    { name: "X", icon: TYPE_ICONS.tweet, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}`, color: "#000000" },
    { name: "Telegram", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z", url: `https://t.me/share/url?url=${encodeURIComponent(shareLink)}`, color: "#0088cc" },
    { name: "WhatsApp", icon: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z", url: `https://wa.me/?text=${encodeURIComponent(shareLink)}`, color: "#25D366" },
    { name: "Email", icon: TYPE_ICONS.email, url: `mailto:?body=${encodeURIComponent(shareLink)}`, color: "#6b7280" },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir={lang === "fa" ? "rtl" : "ltr"}
      >
        <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
          <button
            onClick={onClose}
            className="h-3 w-3 rounded-full transition-colors hover:brightness-90"
            style={{ backgroundColor: "#ff5f57" }}
            aria-label="Close"
          />
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
        </div>

        <div className="p-6 space-y-5">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">{t.successTitle}</h3>
            <p className="text-sm text-neutral-600">{t.successMessage}</p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2.5 border border-neutral-200">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 bg-transparent text-sm text-neutral-700 outline-none"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all hover:brightness-110"
              style={{ backgroundColor: "#2dd4a8" }}
            >
              {copied ? t.copied : t.copyLink}
            </button>
          </div>

          <div>
            <p className="text-xs font-medium text-neutral-500 mb-3">{t.shareOn}</p>
            <div className="grid grid-cols-4 gap-3">
              {socialShares.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 rounded-lg p-3 transition-all hover:scale-105 hover:shadow-md"
                  style={{ backgroundColor: social.color + "15" }}
                >
                  <svg className="h-6 w-6" style={{ color: social.color }} viewBox="0 0 24 24" fill="currentColor">
                    <path d={social.icon} />
                  </svg>
                  <span className="text-[10px] font-medium text-neutral-600">{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Campaign Detail Modal
// ------------------------------------------------------------------
function CampaignDetailModal({
  campaign,
  onClose,
  onUpvote,
  onDownvote,
  lang,
}: {
  campaign: TreemapCampaign
  onClose: () => void
  onUpvote: () => void
  onDownvote: () => void
  lang: "fa" | "en"
}) {
  const t = translations[lang]
  const [copied, setCopied] = useState(false)

  const handleAction = () => {
    onUpvote()
    alert(`Action: ${campaign.actionLabel}`)
  }

  const handleCopy = () => {
    if (campaign.shareLink) {
      navigator.clipboard.writeText(campaign.shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const socialShares = [
    { name: "X", icon: TYPE_ICONS.tweet, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(campaign.shareLink || "")}`, color: "#000000" },
    { name: "Telegram", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z", url: `https://t.me/share/url?url=${encodeURIComponent(campaign.shareLink || "")}`, color: "#0088cc" },
    { name: "WhatsApp", icon: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z", url: `https://wa.me/?text=${encodeURIComponent(campaign.shareLink || "")}`, color: "#25D366" },
    { name: "Email", icon: TYPE_ICONS.email, url: `mailto:?subject=${encodeURIComponent(campaign.title)}&body=${encodeURIComponent(campaign.shareLink || "")}`, color: "#6b7280" },
  ]

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: "90vh", overflowY: "auto" }}
          dir={lang === "fa" ? "rtl" : "ltr"}
        >
          <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3 sticky top-0 z-10">
            <button
              onClick={onClose}
              className="h-3 w-3 rounded-full transition-colors hover:brightness-90"
              style={{ backgroundColor: "#ff5f57" }}
              aria-label="Close"
            />
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
            <div className="ml-2 flex flex-col min-w-0">
              <span className="text-sm font-medium text-neutral-600 truncate">
                {campaign.title}
              </span>
              {campaign.titleEn && (
                <span className="text-xs text-neutral-400 truncate">
                  {campaign.titleEn}
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: campaign.color + "18",
                  color: campaign.color,
                }}
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={TYPE_ICONS[campaign.type]} />
                </svg>
                {TYPE_LABELS[lang][campaign.type]}
              </span>
              <span className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700 text-base">{formatParticipants(campaign.participants)}</span> {t.participants}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-neutral-600">
              {campaign.description}
            </p>

            <div className="rounded-xl border border-neutral-200 overflow-hidden">
              <div
                className="h-24 flex items-end p-3"
                style={{
                  background: `linear-gradient(135deg, ${campaign.color}, ${campaign.color}dd)`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={TYPE_ICONS[campaign.type]} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{lang === "fa" ? "پست کمپین" : "Campaign Post"}</p>
                    <p className="text-[10px] text-white/70">{lang === "fa" ? "محتوای نمونه" : "Sample content"}</p>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm leading-relaxed text-neutral-700">
                  {campaign.sampleContent}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onUpvote}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-green-700 hover:bg-green-100 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 10l5-5 5 5M12 5v14" />
                </svg>
                <span className="text-base font-semibold">{campaign.upvotes}</span>
              </button>
              <button
                onClick={onDownvote}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-red-700 hover:bg-red-100 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 14l-5 5-5-5M12 19V5" />
                </svg>
                <span className="text-base font-semibold">{campaign.downvotes}</span>
              </button>
            </div>

            {/* Main action button */}
            <button
              onClick={handleAction}
              className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: campaign.color }}
            >
              {campaign.actionLabel}
            </button>
          </div>

          {/* Sharing ribbon at bottom - INSIDE modal */}
          <div className="sticky bottom-0 border-t border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100 px-5 py-4">
            <p className="text-xs font-semibold text-neutral-700 mb-3">{t.shareThisCampaign}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Copy link button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg bg-white border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                {copied ? t.copied : t.copyLink}
              </button>

              {/* Social share buttons */}
              {socialShares.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onUpvote()}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: social.color }}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d={social.icon} />
                  </svg>
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ------------------------------------------------------------------
// Campaign Treemap
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
type StoryItem = {
  id: string
  title: string
  description: string
  link: string
  type: "campaign" | "petition"
  source: "internal" | "javid"
  participation_count?: number
  images?: string[]
  email_to?: string
  subject_base?: string
  body_base?: string
}

function StoryOverlay({
  item,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  item: StoryItem
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}) {
  const isCampaign = item.type === "campaign"
  const bgGradient = isCampaign
    ? "from-amber-500/90 via-orange-500/90 to-red-500/90"
    : "from-rose-500/90 via-pink-500/90 to-purple-500/90"

  const actionLabel = isCampaign ? "📧 ارسال ایمیل" : "✍️ امضای کارزار"

  let actionHref = item.link
  if (isCampaign && item.email_to) {
    const subject = encodeURIComponent(item.subject_base || item.title)
    const body = encodeURIComponent(item.body_base || "")
    actionHref = `mailto:${item.email_to}?subject=${subject}&body=${body}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-2 sm:left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-2 sm:right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-[90vw] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
      >
        <div className={`bg-gradient-to-br ${bgGradient} p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
              {isCampaign ? "📧 Email Campaign" : "✍️ Petition"}
              {item.source === "javid" && <span className="ml-1 opacity-75">• Javid Fighter</span>}
            </span>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">{item.title}</h2>
          {item.participation_count != null && item.participation_count > 0 && (
            <p className="mt-2 text-sm text-white/80">👥 {item.participation_count.toLocaleString()} participants</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-b-2xl">
          {item.images && item.images.length > 0 && (
            <div className="mb-4 -mx-2">
              {item.images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full rounded-lg mb-2 last:mb-0" />
              ))}
            </div>
          )}

          <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
            {item.description || "No description available."}
          </p>

          <a
            href={actionHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] ${
              isCampaign
                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                : "bg-gradient-to-r from-rose-500 to-pink-500"
            }`}
          >
            {actionLabel}
          </a>
        </div>
      </div>
    </div>
  )
}

function StoriesBar({
  campaigns,
  petitions,
  javidCampaigns,
  javidPetitions,
}: {
  campaigns: EmailCampaign[]
  petitions: Petition[]
  javidCampaigns: JavidCampaign[]
  javidPetitions: JavidPetition[]
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const stories: StoryItem[] = [
    ...javidCampaigns.map((c, i) => ({
      id: `jc-${i}`,
      title: c.title,
      description: c.description,
      link: c.link,
      type: "campaign" as const,
      source: "javid" as const,
      participation_count: c.participation_count,
      images: c.images,
    })),
    ...javidPetitions.map((p, i) => ({
      id: `jp-${i}`,
      title: p.title,
      description: p.description,
      link: p.link,
      type: "petition" as const,
      source: "javid" as const,
      participation_count: p.participation_count,
      images: p.images,
    })),
    ...campaigns.map((c) => ({
      id: `ic-${c.id}`,
      title: c.title,
      description: c.description,
      link: c.link,
      type: "campaign" as const,
      source: "internal" as const,
      email_to: c.email_to,
      subject_base: c.subject_base,
      body_base: c.body_base,
    })),
    ...petitions.map((p) => ({
      id: `ip-${p.id}`,
      title: p.title,
      description: p.description,
      link: p.link,
      type: "petition" as const,
      source: "internal" as const,
    })),
  ]

  if (stories.length === 0) return null

  const gradients: Record<string, [string, string]> = {
    "campaign-javid": ["#f59e0b", "#ea580c"],
    "petition-javid": ["#f59e0b", "#d97706"],
    "campaign-internal": ["#2dd4a8", "#1aab88"],
    "petition-internal": ["#e74c5e", "#c93a4b"],
  }

  return (
    <>
      <div className="w-full overflow-x-auto px-4 py-4 border-b border-neutral-200/60 bg-white/50">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex gap-4 pb-1" style={{ minWidth: "min-content" }}>
            {stories.map((story, idx) => {
              const key = `${story.type}-${story.source}`
              const [from, to] = gradients[key] || ["#888", "#666"]
              const emoji = story.type === "campaign" ? "📧" : "✍️"
              const truncTitle = story.title.length > 12 ? story.title.slice(0, 11) + "…" : story.title
              return (
                <button
                  key={story.id}
                  onClick={() => setActiveIndex(idx)}
                  className="flex flex-col items-center gap-1.5 group flex-shrink-0"
                >
                  <div
                    className="flex h-[68px] w-[68px] items-center justify-center rounded-full p-[3px]"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white group-hover:bg-neutral-50 transition-colors">
                      <span className="text-xl">{emoji}</span>
                    </div>
                  </div>
                  <span className="block w-[72px] text-center text-[10px] font-medium text-neutral-600 leading-tight truncate">
                    {truncTitle}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {activeIndex !== null && stories[activeIndex] && (
        <StoryOverlay
          item={stories[activeIndex]}
          onClose={() => setActiveIndex(null)}
          onPrev={() => setActiveIndex((p) => Math.max(0, (p ?? 0) - 1))}
          onNext={() => setActiveIndex((p) => Math.min(stories.length - 1, (p ?? 0) + 1))}
          hasPrev={activeIndex > 0}
          hasNext={activeIndex < stories.length - 1}
        />
      )}
    </>
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
  defaultOpen = true,
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

                <div className="flex items-center justify-between mt-auto">
                  <span
                    className={`font-bold ${isTiny ? "text-xs" : isSmall ? "text-sm" : "text-base"}`}
                    style={{ color: textColor, opacity: 0.9 }}
                  >
                    {formatParticipants(item.participants)}
                  </span>
                  {!isSmall && (
                    <span
                      className="text-[10px] font-medium rounded px-1 py-0.5"
                      style={{
                        backgroundColor: getLuminance(item.color) <= 0.35 ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
                        color: textColor,
                      }}
                    >
                      {item.type}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Quick action buttons - appear on hover for larger rectangles */}
            {showActions && isHovered && (
              <div
                className="absolute bottom-1 left-1 right-1 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onQuickAction(item, "share")
                  }}
                  className="flex-1 flex items-center justify-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-white/95 text-neutral-700 hover:bg-white transition-all shadow-sm"
                  title={t.share}
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                  {t.share}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onQuickAction(item, "promote")
                  }}
                  className="flex-1 flex items-center justify-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-white/95 text-neutral-700 hover:bg-white transition-all shadow-sm"
                  title={t.promote}
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  {t.promote}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onQuickAction(item, "feedback")
                  }}
                  className="flex-1 flex items-center justify-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-white/95 text-neutral-700 hover:bg-white transition-all shadow-sm"
                  title={t.feedback}
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {t.feedback}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ------------------------------------------------------------------
// Main Page
// ------------------------------------------------------------------
export default function SocialMediaRadar() {
  const [democrats, setDemocrats] = useState<Person[]>([])
  const [republicans, setRepublicans] = useState<Person[]>([])
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [javidCampaigns, setJavidCampaigns] = useState<JavidCampaign[]>([])
  const [javidPetitions, setJavidPetitions] = useState<JavidPetition[]>([])
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
    } else if (action === "promote") {
      alert(`${lang === "fa" ? "تبلیغ کمپین" : "Promote campaign"}: ${campaign.title}`)
    } else if (action === "feedback") {
      alert(`${lang === "fa" ? "ارسال بازخورد برای" : "Send feedback for"}: ${campaign.title}`)
    }
  }

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
    getJavidCampaigns().then(setJavidCampaigns).catch(() => {})
    getJavidPetitions().then(setJavidPetitions).catch(() => {})
    fetchClickCounts()
  }, [fetchClickCounts])

  const handleEmailSent = useCallback(() => {
    setTimeout(fetchClickCounts, 500)
  }, [fetchClickCounts])

  return (
    <main className="h-screen flex flex-col" style={{ backgroundColor: "#f5f5f7", fontFamily: "Inter, sans-serif" }} dir={lang === "fa" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="shrink-0 border-b border-neutral-200/60 bg-white/90 backdrop-blur-sm px-4 py-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
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
              <h1 className="text-xl font-bold text-neutral-900">{t.appTitle}</h1>
              <p className="text-xs text-neutral-500">{t.appSubtitle}</p>
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
          </div>
        </div>
      </header>

      {/* Stories bar — Campaigns & Petitions like Instagram stories */}
      <StoriesBar campaigns={campaigns} petitions={petitions} javidCampaigns={javidCampaigns} javidPetitions={javidPetitions} />

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
      </div>

      {/* Treemap section - fills remaining height */}
      <div className="flex-1 overflow-hidden px-4 py-4">
        <div className="mx-auto max-w-7xl h-full">
          <CampaignTreemap
            campaigns={filteredCampaigns}
            onSelect={setSelectedCampaign}
            onQuickAction={handleQuickAction}
            lang={lang}
          />
        </div>
      </div>

      {/* Modals */}
      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onUpvote={() => handleUpvote(selectedCampaign.id)}
          onDownvote={() => handleDownvote(selectedCampaign.id)}
          lang={lang}
        />
      )}

      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(link) => {
            setShowCreateModal(false)
            setShowSuccessModal(link)
          }}
          lang={lang}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          shareLink={showSuccessModal}
          onClose={() => setShowSuccessModal(null)}
          lang={lang}
        />
      )}
    </main>
  )
}
