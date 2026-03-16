import { NextResponse } from "next/server"

const JAVID_API_URL = process.env.JAVID_API_URL || "https://api.javidfighter.com"
const JAVID_API_KEY = process.env.JAVID_API_KEY || ""

export async function GET() {
  if (!JAVID_API_KEY) {
    return NextResponse.json({ items: [] })
  }

  try {
    const res = await fetch(`${JAVID_API_URL}/api/v1/petitions`, {
      headers: { "x-api-key": JAVID_API_KEY },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json({ items: [] })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ items: [] })
  }
}
