"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getCampaigns, getPetitions, type EmailCampaign, type Petition } from "@/lib/api"
import { IRAN_LIBERATION_CAMPAIGNS } from "./iran-liberation-campaigns"

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

// Mock campaigns now imported from iran-liberation-campaigns.ts
// Keeping this comment for reference - data moved to separate file
const MOCK_CAMPAIGNS_REMOVED = [
  // Email campaigns (15 items)
  { id: "1", title: "آزادی زندانیان سیاسی", type: "email", weight: 24, description: "خواستار آزادی زندانیان سیاسی بازداشت‌شده بدون محاکمه.", sampleContent: "بیش از ۲۰ هزار زندانی سیاسی برای بیان مسالمت‌آمیز عقایدشان در زندان هستند.", actionLabel: "ارسال ایمیل", color: "#0d9488", participants: 4820, upvotes: 2340, downvotes: 120, shareLink: "https://radar.example.com/c/1" },
  { id: "5", title: "حمایت از آزادی مطبوعات", type: "email", weight: 14, description: "نامه به سازمان‌های رسانه‌ای و دولت‌ها برای محکوم کردن دستگیری روزنامه‌نگاران.", sampleContent: "روزنامه‌نگاران چشم و گوش جهان هستند.", actionLabel: "ارسال ایمیل", color: "#14b8a6", participants: 1890, upvotes: 980, downvotes: 55, shareLink: "https://radar.example.com/c/5" },
  { id: "9", title: "کمپین حریم خصوصی دیجیتال", type: "email", weight: 9, description: "فشار بر شرکت‌های فناوری برای توقف فروش تکنولوژی نظارتی.", sampleContent: "تکنولوژی شما برای ردیابی فعالان استفاده می‌شود.", actionLabel: "ارسال ایمیل", color: "#2dd4bf", participants: 1560, upvotes: 890, downvotes: 40, shareLink: "https://radar.example.com/c/9" },
  { id: "13", title: "حمایت از میراث فرهنگی", type: "email", weight: 6, description: "حفاظت از مکان‌های فرهنگی در معرض خطر.", sampleContent: "هزاران سال میراث فرهنگی در خطر است.", actionLabel: "ارسال ایمیل", color: "#0f766e", participants: 670, upvotes: 420, downvotes: 20, shareLink: "https://radar.example.com/c/13" },
  { id: "17", title: "ابزارهای ضد سانسور", type: "email", weight: 4, description: "حمایت از ابزارهایی که به مردم کمک می‌کند سانسور را دور بزنند.", sampleContent: "VPNها شریان حیات میلیون‌ها نفر هستند.", actionLabel: "ارسال ایمیل", color: "#115e59", participants: 540, upvotes: 340, downvotes: 15, shareLink: "https://radar.example.com/c/17" },
  { id: "21", title: "تحریم شرکت‌های متخلف", type: "email", weight: 11, description: "درخواست از شرکت‌ها برای قطع همکاری با رژیم.", sampleContent: "شرکت‌های بین‌المللی نباید با نقض حقوق بشر همکاری کنند.", actionLabel: "ارسال ایمیل", color: "#0d9488", participants: 2340, upvotes: 1450, downvotes: 78, shareLink: "https://radar.example.com/c/21" },
  { id: "25", title: "پایان اعدام‌های سیاسی", type: "email", weight: 18, description: "مخالفت با اعدام فعالان سیاسی و مدنی.", sampleContent: "اعدام فعالان سیاسی جنایت علیه بشریت است.", actionLabel: "ارسال ایمیل", color: "#14b8a6", participants: 5120, upvotes: 3240, downvotes: 156, shareLink: "https://radar.example.com/c/25" },
  { id: "29", title: "آزادی معلمان زندانی", type: "email", weight: 7, description: "خواستار آزادی معلمان بازداشت‌شده.", sampleContent: "معلمان برای آموزش و تعلیم زندانی شده‌اند.", actionLabel: "ارسال ایمیل", color: "#2dd4bf", participants: 1230, upvotes: 780, downvotes: 42, shareLink: "https://radar.example.com/c/29" },
  { id: "33", title: "حمایت از کارگران معدن", type: "email", weight: 5, description: "توجه به شرایط کارگران معادن.", sampleContent: "کارگران معادن در شرایط غیرانسانی کار می‌کنند.", actionLabel: "ارسال ایمیل", color: "#0f766e", participants: 890, upvotes: 540, downvotes: 28, shareLink: "https://radar.example.com/c/33" },
  { id: "37", title: "لغو حکم شلاق", type: "email", weight: 8, description: "مخالفت با مجازات شلاق.", sampleContent: "شلاق شکنجه است و باید لغو شود.", actionLabel: "ارسال ایمیل", color: "#115e59", participants: 1670, upvotes: 1020, downvotes: 51, shareLink: "https://radar.example.com/c/37" },
  { id: "41", title: "حمایت از وکلای حقوق بشر", type: "email", weight: 10, description: "دفاع از وکلای مدافع حقوق بشر.", sampleContent: "وکلای حقوق بشر تحت فشار و تهدید هستند.", actionLabel: "ارسال ایمیل", color: "#0d9488", participants: 2100, upvotes: 1340, downvotes: 67, shareLink: "https://radar.example.com/c/41" },
  { id: "45", title: "پایان سانسور کتاب", type: "email", weight: 4, description: "مخالفت با سانسور کتاب و نشر.", sampleContent: "کتاب‌ها پل ارتباطی فرهنگ‌ها هستند.", actionLabel: "ارسال ایمیل", color: "#14b8a6", participants: 780, upvotes: 490, downvotes: 23, shareLink: "https://radar.example.com/c/45" },
  { id: "49", title: "حمایت از هنرمندان آزاد", type: "email", weight: 6, description: "دفاع از آزادی بیان هنری.", sampleContent: "هنر باید آزاد باشد از سانسور و محدودیت.", actionLabel: "ارسال ایمیل", color: "#2dd4bf", participants: 1340, upvotes: 820, downvotes: 38, shareLink: "https://radar.example.com/c/49" },
  { id: "53", title: "توقف آزار کودکان کار", type: "email", weight: 9, description: "حمایت از کودکان کار و خیابانی.", sampleContent: "میلیون‌ها کودک مجبور به کار هستند.", actionLabel: "ارسال ایمیل", color: "#0f766e", participants: 1890, upvotes: 1150, downvotes: 58, shareLink: "https://radar.example.com/c/53" },
  { id: "57", title: "لغو ممنوعیت سفر", type: "email", weight: 5, description: "اعتراض به ممنوعیت خروج از کشور.", sampleContent: "ممنوعیت سفر نقض آشکار حقوق انسانی است.", actionLabel: "ارسال ایمیل", color: "#115e59", participants: 1120, upvotes: 690, downvotes: 34, shareLink: "https://radar.example.com/c/57" },

  // Tweet campaigns (15 items)
  { id: "2", title: "توقف قطع اینترنت", type: "tweet", weight: 20, description: "افزایش آگاهی درباره قطع اینترنت.", sampleContent: "قطع اینترنت ابزار سرکوب است. #KeepItOn", actionLabel: "ارسال توییت", color: "#3b82f6", participants: 3150, upvotes: 1890, downvotes: 85, shareLink: "https://radar.example.com/c/2" },
  { id: "6", title: "تحریم ناقضان حقوق بشر", type: "tweet", weight: 13, description: "درخواست تحریم‌های هدفمند.", sampleContent: "مقامات ناقض حقوق بشر باید تحریم شوند.", actionLabel: "ارسال توییت", color: "#6366f1", participants: 2310, upvotes: 1340, downvotes: 95, shareLink: "https://radar.example.com/c/6" },
  { id: "10", title: "جنبش وحدت دیاسپورا", type: "tweet", weight: 8, description: "ایجاد همبستگی جوامع دیاسپورا.", sampleContent: "دیاسپورا متحد ایستاده است. #DiasporaUnited", actionLabel: "ارسال توییت", color: "#8b5cf6", participants: 4100, upvotes: 2340, downvotes: 150, shareLink: "https://radar.example.com/c/10" },
  { id: "14", title: "شبکه همبستگی دانشجویی", type: "tweet", weight: 6, description: "اتصال دانشجویان اخراجی.", sampleContent: "دانشگاه‌ها درهای خود را باز کنید.", actionLabel: "ارسال توییت", color: "#4f46e5", participants: 1780, upvotes: 1020, downvotes: 55, shareLink: "https://radar.example.com/c/14" },
  { id: "18", title: "روز آگاهی جهانی", type: "tweet", weight: 4, description: "کمپین هماهنگ رسانه‌های اجتماعی.", sampleContent: "جهان با یک صدا صحبت می‌کند.", actionLabel: "ارسال توییت", color: "#7c3aed", participants: 7200, upvotes: 4120, downvotes: 230, shareLink: "https://radar.example.com/c/18" },
  { id: "22", title: "روز جهانی زن", type: "tweet", weight: 15, description: "بزرگداشت مبارزات زنان ایرانی.", sampleContent: "زنان ایرانی پیشگامان تغییرند. #WomanLifeFreedom", actionLabel: "ارسال توییت", color: "#3b82f6", participants: 8900, upvotes: 5340, downvotes: 267, shareLink: "https://radar.example.com/c/22" },
  { id: "26", title: "همبستگی با بازداشت‌شدگان", type: "tweet", weight: 11, description: "پویش روزانه یادآوری زندانیان.", sampleContent: "هر روز نام یک زندانی سیاسی را منتشر کنید.", actionLabel: "ارسال توییت", color: "#6366f1", participants: 3450, upvotes: 2100, downvotes: 112, shareLink: "https://radar.example.com/c/26" },
  { id: "30", title: "کمپین #آزادی_بیان", type: "tweet", weight: 9, description: "دفاع از حق آزادی بیان.", sampleContent: "آزادی بیان حق هر انسانی است.", actionLabel: "ارسال توییت", color: "#8b5cf6", participants: 2890, upvotes: 1670, downvotes: 89, shareLink: "https://radar.example.com/c/30" },
  { id: "34", title: "توقف اعدام نوجوانان", type: "tweet", weight: 12, description: "مخالفت با اعدام افراد زیر ۱۸ سال.", sampleContent: "اعدام نوجوانان جنایت جنگی است.", actionLabel: "ارسال توییت", color: "#4f46e5", participants: 4560, upvotes: 2890, downvotes: 145, shareLink: "https://radar.example.com/c/34" },
  { id: "38", title: "حمایت از LGBTQ+", type: "tweet", weight: 7, description: "دفاع از حقوق دگرباشان جنسی.", sampleContent: "عشق جرم نیست. #LoveIsLove", actionLabel: "ارسال توییت", color: "#7c3aed", participants: 1980, upvotes: 1240, downvotes: 78, shareLink: "https://radar.example.com/c/38" },
  { id: "42", title: "نه به جنگ", type: "tweet", weight: 10, description: "مخالفت با تنش‌های نظامی.", sampleContent: "مردم خواهان صلح هستند نه جنگ.", actionLabel: "ارسال توییت", color: "#3b82f6", participants: 3670, upvotes: 2230, downvotes: 118, shareLink: "https://radar.example.com/c/42" },
  { id: "46", title: "حمایت از ورزشکاران", type: "tweet", weight: 5, description: "دفاع از ورزشکارانی که صدایشان را بلند کرده‌اند.", sampleContent: "ورزشکاران صدای مردم هستند.", actionLabel: "ارسال توییت", color: "#6366f1", participants: 2340, upvotes: 1450, downvotes: 72, shareLink: "https://radar.example.com/c/46" },
  { id: "50", title: "آزادی مذهبی", type: "tweet", weight: 6, description: "دفاع از حق انتخاب مذهب.", sampleContent: "هر کس حق دارد مذهب خود را انتخاب کند.", actionLabel: "ارسال توییت", color: "#8b5cf6", participants: 1560, upvotes: 960, downvotes: 48, shareLink: "https://radar.example.com/c/50" },
  { id: "54", title: "کمپین #توقف_تبعیض", type: "tweet", weight: 8, description: "مبارزه با تبعیض قومی و مذهبی.", sampleContent: "تبعیض باید متوقف شود. همه برابریم.", actionLabel: "ارسال توییت", color: "#4f46e5", participants: 2780, upvotes: 1690, downvotes: 85, shareLink: "https://radar.example.com/c/54" },
  { id: "58", title: "صدای جوانان", type: "tweet", weight: 7, description: "تقویت صدای نسل جوان.", sampleContent: "جوانان آینده‌ساز ایران هستند.", actionLabel: "ارسال توییت", color: "#7c3aed", participants: 3210, upvotes: 1950, downvotes: 98, shareLink: "https://radar.example.com/c/58" },

  // Donation campaigns (15 items)
  { id: "3", title: "حمایت از حقوق زنان", type: "donation", weight: 18, description: "تأمین بودجه برای سازمان‌های حقوقی.", sampleContent: "حمایت از نمایندگی حقوقی زنان.", actionLabel: "کمک مالی", color: "#f59e0b", participants: 2740, upvotes: 1560, downvotes: 45, shareLink: "https://radar.example.com/c/3" },
  { id: "7", title: "صندوق دسترسی به آموزش", type: "donation", weight: 11, description: "کمک به دانشجویان اخراجی.", sampleContent: "حمایت از تحصیل دانشجویان در خارج.", actionLabel: "کمک مالی", color: "#d97706", participants: 980, upvotes: 620, downvotes: 30, shareLink: "https://radar.example.com/c/7" },
  { id: "11", title: "کمک پزشکی برای قربانیان", type: "donation", weight: 8, description: "ارائه کمک پزشکی به مجروحان.", sampleContent: "درمان حیاتی از طریق شبکه‌های زیرزمینی.", actionLabel: "کمک مالی", color: "#b45309", participants: 1230, upvotes: 780, downvotes: 25, shareLink: "https://radar.example.com/c/11" },
  { id: "15", title: "صندوق دفاع حقوقی", type: "donation", weight: 5, description: "نمایندگی حقوقی فعالان.", sampleContent: "حمایت از وکلای مدافع آزادی.", actionLabel: "کمک مالی", color: "#92400e", participants: 890, upvotes: 560, downvotes: 18, shareLink: "https://radar.example.com/c/15" },
  { id: "19", title: "شبکه حمایت از پناهندگان", type: "donation", weight: 3, description: "کمک به پناهندگان و پناهجویان.", sampleContent: "سرپناه و امید برای آغاز جدید.", actionLabel: "کمک مالی", color: "#78350f", participants: 1100, upvotes: 720, downvotes: 28, shareLink: "https://radar.example.com/c/19" },
  { id: "23", title: "صندوق کمک به خانواده‌های زندانیان", type: "donation", weight: 14, description: "حمایت مالی از خانواده‌های زندانیان سیاسی.", sampleContent: "خانواده‌های زندانیان نیاز به حمایت دارند.", actionLabel: "کمک مالی", color: "#f59e0b", participants: 3450, upvotes: 2180, downvotes: 109, shareLink: "https://radar.example.com/c/23" },
  { id: "27", title: "کمک به کودکان بی‌سرپرست", type: "donation", weight: 10, description: "حمایت از کودکان بی‌سرپرست و آسیب‌دیده.", sampleContent: "هر کودک شایسته زندگی بهتر است.", actionLabel: "کمک مالی", color: "#d97706", participants: 2670, upvotes: 1650, downvotes: 83, shareLink: "https://radar.example.com/c/27" },
  { id: "31", title: "صندوق حمایت از معلولین", type: "donation", weight: 6, description: "کمک به افراد دارای معلولیت.", sampleContent: "فراهم کردن امکانات برای زندگی بهتر.", actionLabel: "کمک مالی", color: "#b45309", participants: 1450, upvotes: 890, downvotes: 44, shareLink: "https://radar.example.com/c/31" },
  { id: "35", title: "حمایت از سالمندان", type: "donation", weight: 4, description: "کمک به سالمندان بی‌بضاعت.", sampleContent: "سالمندان نیاز به مراقبت و احترام دارند.", actionLabel: "کمک مالی", color: "#92400e", participants: 780, upvotes: 490, downvotes: 24, shareLink: "https://radar.example.com/c/35" },
  { id: "39", title: "صندوق بازسازی زلزله", type: "donation", weight: 9, description: "کمک به آسیب‌دیدگان زلزله.", sampleContent: "بازسازی زندگی پس از فاجعه.", actionLabel: "کمک مالی", color: "#78350f", participants: 4230, upvotes: 2680, downvotes: 134, shareLink: "https://radar.example.com/c/39" },
  { id: "43", title: "کمک به بیماران سرطانی", type: "donation", weight: 7, description: "حمایت از بیماران فاقد بیمه.", sampleContent: "هر کس حق دارد به درمان دسترسی داشته باشد.", actionLabel: "کمک مالی", color: "#f59e0b", participants: 2120, upvotes: 1340, downvotes: 67, shareLink: "https://radar.example.com/c/43" },
  { id: "47", title: "صندوق کمک به معتادین", type: "donation", weight: 5, description: "حمایت از درمان اعتیاد.", sampleContent: "اعتیاد بیماری است نه جرم.", actionLabel: "کمک مالی", color: "#d97706", participants: 1340, upvotes: 830, downvotes: 41, shareLink: "https://radar.example.com/c/47" },
  { id: "51", title: "حمایت از بانوان سرپرست خانوار", type: "donation", weight: 8, description: "کمک به زنان سرپرست خانواده.", sampleContent: "زنان قهرمان خانواده‌های خود هستند.", actionLabel: "کمک مالی", color: "#b45309", participants: 1980, upvotes: 1220, downvotes: 61, shareLink: "https://radar.example.com/c/51" },
  { id: "55", title: "صندوق کمک به دانش‌آموزان", type: "donation", weight: 6, description: "تأمین لوازم تحریر و کتاب برای دانش‌آموزان.", sampleContent: "هر کودک حق دارد به آموزش دسترسی داشته باشد.", actionLabel: "کمک مالی", color: "#92400e", participants: 1670, upvotes: 1030, downvotes: 51, shareLink: "https://radar.example.com/c/55" },
  { id: "59", title: "کمک به بیماران کلیوی", type: "donation", weight: 4, description: "حمایت از بیماران دیالیزی.", sampleContent: "دیالیز هزینه‌بر است و بسیاری توان پرداخت ندارند.", actionLabel: "کمک مالی", color: "#78350f", participants: 890, upvotes: 550, downvotes: 27, shareLink: "https://radar.example.com/c/59" },

  // Petition campaigns (15 items)
  { id: "4", title: "تحقیق حقوق بشر سازمان ملل", type: "petition", weight: 16, description: "درخواست تحقیقات مستقل.", sampleContent: "عدالت مستلزم پاسخگویی است.", actionLabel: "امضای پتیشن", color: "#e11d48", participants: 6230, upvotes: 3420, downvotes: 210, shareLink: "https://radar.example.com/c/4" },
  { id: "8", title: "پتیشن حقوق کارگران", type: "petition", weight: 10, description: "حمایت از حق سازماندهی کارگران.", sampleContent: "کارگران سزاوار سازماندهی مسالمت‌آمیز هستند.", actionLabel: "امضای پتیشن", color: "#f43f5e", participants: 3450, upvotes: 1890, downvotes: 110, shareLink: "https://radar.example.com/c/8" },
  { id: "12", title: "عدالت زیست‌محیطی", type: "petition", weight: 7, description: "درخواست پاسخگویی برای تخریب زیست‌محیطی.", sampleContent: "تخریب محیط زیست موضوع حقوق بشری است.", actionLabel: "امضای پتیشن", color: "#fb7185", participants: 2890, upvotes: 1670, downvotes: 90, shareLink: "https://radar.example.com/c/12" },
  { id: "16", title: "حمایت از حقوق اقلیت‌ها", type: "petition", weight: 5, description: "درخواست حقوق برابر برای اقلیت‌ها.", sampleContent: "همه سزاوار حقوق برابر هستند.", actionLabel: "امضای پتیشن", color: "#be123c", participants: 4560, upvotes: 2780, downvotes: 180, shareLink: "https://radar.example.com/c/16" },
  { id: "20", title: "حقیقت و آشتی", type: "petition", weight: 3, description: "فرآیند مستندسازی نقض‌ها.", sampleContent: "عدالت نیازمند حقیقت است.", actionLabel: "امضای پتیشن", color: "#9f1239", participants: 3670, upvotes: 2120, downvotes: 140, shareLink: "https://radar.example.com/c/20" },
  { id: "24", title: "لغو مجازات اعدام", type: "petition", weight: 19, description: "پتیشن برای لغو کامل مجازات اعدام.", sampleContent: "اعدام نقض حق حیات است.", actionLabel: "امضای پتیشن", color: "#e11d48", participants: 9870, upvotes: 6120, downvotes: 312, shareLink: "https://radar.example.com/c/24" },
  { id: "28", title: "حق تجمع مسالمت‌آمیز", type: "petition", weight: 12, description: "دفاع از حق اعتراض مسالمت‌آمیز.", sampleContent: "اعتراض مسالمت‌آمیز حق هر شهروند است.", actionLabel: "امضای پتیشن", color: "#f43f5e", participants: 5670, upvotes: 3450, downvotes: 178, shareLink: "https://radar.example.com/c/28" },
  { id: "32", title: "آزادی احزاب سیاسی", type: "petition", weight: 8, description: "خواست فعالیت آزاد احزاب.", sampleContent: "دموکراسی نیازمند تکثر سیاسی است.", actionLabel: "امضای پتیشن", color: "#fb7185", participants: 3120, upvotes: 1890, downvotes: 95, shareLink: "https://radar.example.com/c/32" },
  { id: "36", title: "حق آموزش به زبان مادری", type: "petition", weight: 6, description: "درخواست آموزش به زبان‌های محلی.", sampleContent: "هر کودک حق دارد به زبان مادری آموزش ببیند.", actionLabel: "امضای پتیشن", color: "#be123c", participants: 2340, upvotes: 1450, downvotes: 72, shareLink: "https://radar.example.com/c/36" },
  { id: "40", title: "لغو تبعیض جنسیتی در قوانین", type: "petition", weight: 15, description: "حذف قوانین تبعیض‌آمیز علیه زنان.", sampleContent: "زنان و مردان باید حقوق برابر داشته باشند.", actionLabel: "امضای پتیشن", color: "#9f1239", participants: 7890, upvotes: 4890, downvotes: 245, shareLink: "https://radar.example.com/c/40" },
  { id: "44", title: "حق انتخاب آزاد", type: "petition", weight: 11, description: "درخواست انتخابات آزاد و عادلانه.", sampleContent: "مردم حق دارند رهبران خود را انتخاب کنند.", actionLabel: "امضای پتیشن", color: "#e11d48", participants: 6780, upvotes: 4120, downvotes: 207, shareLink: "https://radar.example.com/c/44" },
  { id: "48", title: "لغو سانسور اینترنت", type: "petition", weight: 9, description: "خواست اینترنت آزاد و بدون فیلتر.", sampleContent: "دسترسی به اطلاعات حق همگان است.", actionLabel: "امضای پتیشن", color: "#f43f5e", participants: 8230, upvotes: 5010, downvotes: 251, shareLink: "https://radar.example.com/c/48" },
  { id: "52", title: "حمایت از استقلال قوه قضائیه", type: "petition", weight: 7, description: "درخواست قضاوت عادلانه و مستقل.", sampleContent: "عدالت نیازمند قوه قضائیه مستقل است.", actionLabel: "امضای پتیشن", color: "#fb7185", participants: 3890, upvotes: 2360, downvotes: 118, shareLink: "https://radar.example.com/c/52" },
  { id: "56", title: "لغو قوانین ارتداد", type: "petition", weight: 4, description: "مخالفت با مجازات ارتداد.", sampleContent: "ایمان امری شخصی است.", actionLabel: "امضای پتیشن", color: "#be123c", participants: 2120, upvotes: 1310, downvotes: 65, shareLink: "https://radar.example.com/c/56" },
  { id: "60", title: "آزادی دانشجویان زندانی", type: "petition", weight: 13, description: "خواستار آزادی دانشجویان بازداشتی.", sampleContent: "دانشجویان باید در کلاس باشند نه زندان.", actionLabel: "امضای پتیشن", color: "#9f1239", participants: 7120, upvotes: 4340, downvotes: 217, shareLink: "https://radar.example.com/c/60" },
]

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

// ------------------------------------------------------------------
// Backend Campaign Transformer
// ------------------------------------------------------------------
function transformBackendCampaigns(
  emailCampaigns: EmailCampaign[],
  petitions: Petition[]
): TreemapCampaign[] {
  const COLOR_PALETTES = {
    email: ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4"],
    petition: ["#e11d48", "#f43f5e", "#fb7185", "#fda4af"],
  }

  const result: TreemapCampaign[] = []

  // Transform email campaigns
  emailCampaigns.forEach((campaign, idx) => {
    result.push({
      id: campaign.id,
      title: campaign.title,
      titleEn: undefined, // Backend doesn't have English titles yet
      type: "email",
      weight: 10 + Math.random() * 15, // Random weight 10-25 for visualization
      description: campaign.description || "",
      sampleContent: campaign.subject_base || "",
      actionLabel: "ارسال ایمیل",
      color: COLOR_PALETTES.email[idx % COLOR_PALETTES.email.length],
      participants: 0, // Will be updated from participation_count if available
      upvotes: 0,
      downvotes: 0,
      shareLink: `${window.location.origin}/campaigns/${campaign.direct_link_code}`,
    })
  })

  // Transform petitions
  petitions.forEach((petition, idx) => {
    result.push({
      id: petition.id,
      title: petition.title,
      titleEn: undefined,
      type: "petition",
      weight: 10 + Math.random() * 15,
      description: petition.description || "",
      sampleContent: petition.link,
      actionLabel: "امضای پتیشن",
      color: COLOR_PALETTES.petition[idx % COLOR_PALETTES.petition.length],
      participants: 0,
      upvotes: 0,
      downvotes: 0,
      shareLink: `${window.location.origin}/petitions/${petition.direct_link_code}`,
    })
  })

  return result
}

// Fallback to mock data if backend is unavailable
function useCampaignData() {
  const [campaigns, setCampaigns] = useState<TreemapCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const [emailRes, petitionRes] = await Promise.all([
          getCampaigns(),
          getPetitions(),
        ])

        const transformed = transformBackendCampaigns(
          emailRes.campaigns,
          petitionRes.petitions
        )

        if (transformed.length === 0) {
          // No campaigns in database, use mock data
          console.warn("No campaigns found in database, using mock data")
          setCampaigns(IRAN_LIBERATION_CAMPAIGNS)
          setUsingMockData(true)
        } else {
          setCampaigns(transformed)
          setUsingMockData(false)
        }
      } catch (error) {
        console.error("Failed to fetch campaigns from backend:", error)
        // Fallback to mock data on API error
        setCampaigns(IRAN_LIBERATION_CAMPAIGNS)
        setUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  return { campaigns, setCampaigns, loading, usingMockData }
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
function CampaignTreemap({
  campaigns,
  onSelect,
  onQuickAction,
  lang,
}: {
  campaigns: TreemapCampaign[]
  onSelect: (campaign: TreemapCampaign) => void
  onQuickAction: (campaign: TreemapCampaign, action: "share" | "promote" | "feedback") => void
  lang: "fa" | "en"
}) {
  const t = translations[lang]
  const containerRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<LayoutRect[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const recalculate = useCallback(() => {
    if (!containerRef.current) return
    const { width, height } = containerRef.current.getBoundingClientRect()
    if (width > 0 && height > 0) {
      setLayout(computeTreemap(campaigns, width, height))
    }
  }, [campaigns])

  useEffect(() => {
    recalculate()
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(() => recalculate())
    observer.observe(el)
    return () => observer.disconnect()
  }, [recalculate])

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        height: "100%",
        backgroundColor: "#e5e5e5",
      }}
    >
      {layout.map((item) => {
        const textColor = getTextColor(item.color)
        const isSmall = item.w < 120 || item.h < 70
        const isTiny = item.w < 90 || item.h < 55
        const isHovered = hoveredId === item.id
        const showActions = !isTiny && item.w >= 140 && item.h >= 80

        return (
          <div
            key={item.id}
            className="absolute transition-all duration-200 hover:z-10"
            style={{
              left: item.x,
              top: item.y,
              width: item.w,
              height: item.h,
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => onSelect(item)}
              className="w-full h-full flex flex-col justify-between overflow-hidden transition-all duration-200 hover:brightness-110 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{
                backgroundColor: item.color,
                borderRadius: 4,
              }}
            >
              <div className="flex-1 flex flex-col justify-between p-2" style={{ minHeight: 0 }}>
                <div className="flex items-start justify-between gap-1">
                  <h3
                    className={`font-semibold leading-tight line-clamp-2 text-left ${
                      isTiny ? "text-[10px]" : isSmall ? "text-xs" : "text-sm"
                    }`}
                    style={{
                      color: textColor,
                      textShadow: getLuminance(item.color) <= 0.35 ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                    }}
                  >
                    {item.title}
                  </h3>
                  {!isTiny && (
                    <svg
                      className="shrink-0 mt-0.5"
                      style={{ color: textColor, opacity: 0.7, width: isSmall ? 12 : 14, height: isSmall ? 12 : 14 }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={TYPE_ICONS[item.type]} />
                    </svg>
                  )}
                </div>

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
  const { user, role, logout } = useAuth()
  const [selectedCampaign, setSelectedCampaign] = useState<TreemapCampaign | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState<string | null>(null)
  const { campaigns, setCampaigns, loading: campaignsLoading, usingMockData } = useCampaignData()
  const [lang, setLang] = useState<"fa" | "en">("fa")
  const [categoryFilter, setCategoryFilter] = useState<TreemapCampaign["type"] | "all">("all")

  const t = translations[lang]

  const filteredCampaigns = categoryFilter === "all"
    ? campaigns
    : campaigns.filter((c) => c.type === categoryFilter)

  const handleUpvote = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, upvotes: c.upvotes + 1, weight: c.weight + 0.1 } : c
      )
    )
  }

  const handleDownvote = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, downvotes: c.downvotes + 1, weight: Math.max(1, c.weight - 0.1) } : c
      )
    )
  }

  const handleQuickAction = (campaign: TreemapCampaign, action: "share" | "promote" | "feedback") => {
    if (action === "share") {
      handleUpvote(campaign.id)
      if (campaign.shareLink) {
        setShowSuccessModal(campaign.shareLink)
      }
    } else if (action === "promote") {
      alert(`${lang === "fa" ? "تبلیغ کمپین" : "Promote campaign"}: ${campaign.title}`)
    } else if (action === "feedback") {
      alert(`${lang === "fa" ? "ارسال بازخورد برای" : "Send feedback for"}: ${campaign.title}`)
    }
  }

  const categories = [
    { type: "all" as const, label: t.allCategories, color: "#6b7280" },
    { type: "email" as const, label: t.email, color: "#0d9488" },
    { type: "tweet" as const, label: t.tweet, color: "#3b82f6" },
    { type: "donation" as const, label: t.donation, color: "#f59e0b" },
    { type: "petition" as const, label: t.petition, color: "#e11d48" },
  ]

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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "fa" ? "en" : "fa")}
              className="shrink-0 rounded-lg bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-200"
            >
              {lang === "fa" ? "EN" : "فا"}
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="shrink-0 rounded-xl bg-gradient-to-r from-[#2dd4a8] to-[#1aab88] px-5 py-3 text-sm font-bold text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
            >
              {t.createCampaign}
            </button>

            {user ? (
              <>
                {(role === "admin" || role === "cohost") && (
                  <Link href="/admin" className="shrink-0 rounded-lg bg-neutral-800 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-700">
                    {t.admin}
                  </Link>
                )}
                <button onClick={logout} className="shrink-0 rounded-lg bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-200">
                  {t.logout}
                </button>
              </>
            ) : (
              <Link href="/login" className="shrink-0 rounded-lg bg-neutral-800 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-700">
                {t.signIn}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mock Data Warning Banner */}
      {usingMockData && (
        <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="mx-auto max-w-7xl flex items-center gap-2 text-xs text-amber-800">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="flex-1">
              {lang === "fa"
                ? "⚠️ در حال نمایش داده‌های نمونه - بک‌اند در دسترس نیست یا کمپینی در پایگاه داده وجود ندارد"
                : "⚠️ Showing mock data - Backend unavailable or no campaigns in database"}
            </span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {campaignsLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-[#2dd4a8]" />
            <p className="text-sm text-neutral-500">
              {lang === "fa" ? "در حال بارگذاری کمپین‌ها..." : "Loading campaigns..."}
            </p>
          </div>
        </div>
      )}

      {/* Main Content - Only show when not loading */}
      {!campaignsLoading && (
        <>
          {/* Statistics ribbon + Category filter */}
          <div className="shrink-0 border-b border-neutral-200/60 bg-white/50 px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          {/* Statistics on the left */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg px-3 py-1.5 border border-blue-200">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="text-xs font-semibold text-blue-900">{campaigns.reduce((sum, c) => sum + c.participants, 0).toLocaleString()}</span>
              <span className="text-[10px] text-blue-700">{lang === "fa" ? "بازدید" : "visitors"}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg px-3 py-1.5 border border-green-200">
              <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-xs font-semibold text-green-900">{campaigns.length}</span>
              <span className="text-[10px] text-green-700">{lang === "fa" ? "کمپین" : "campaigns"}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg px-3 py-1.5 border border-purple-200">
              <svg className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-semibold text-purple-900">{campaigns.reduce((sum, c) => sum + c.upvotes, 0).toLocaleString()}</span>
              <span className="text-[10px] text-purple-700">{lang === "fa" ? "ارسال شده" : "sent"}</span>
            </div>
          </div>

          {/* Category filters on the right */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.type}
                onClick={() => setCategoryFilter(cat.type)}
                className={`shrink-0 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  categoryFilter === cat.type
                    ? "text-white shadow-md"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
                style={
                  categoryFilter === cat.type
                    ? { backgroundColor: cat.color }
                    : undefined
                }
              >
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: cat.color }} />
                {cat.label}
              </button>
            ))}
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
        </>
      )}

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
