"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ApiRequestError } from "@/lib/api"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      router.push("/campaigns")
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const details = err.details as Array<{ msg: string }> | undefined
        if (details?.length) {
          setError(details.map((d) => d.msg).join(". "))
        } else {
          setError(err.message)
        }
      } else {
        setError("Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f5f5f7" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2dd4a8] to-[#e74c5e]">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome Back</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to Social Media Radar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-lg">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dd4a8]/50 focus:border-[#2dd4a8]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dd4a8]/50 focus:border-[#2dd4a8]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#2dd4a8] to-[#1aab88] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-xs text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-[#2dd4a8] hover:underline">
              Register
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center">
          <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-600">
            ← Back to Radar
          </Link>
        </p>
      </div>
    </main>
  )
}
