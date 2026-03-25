// Requests go through Next.js rewrite proxy (/api/v1/* → backend)
// This avoids CORS issues entirely
const API_PREFIX = "/api"

interface ApiError {
  code: string
  message: string
  details?: unknown
}

export class ApiRequestError extends Error {
  code: string
  details?: unknown

  constructor(err: ApiError) {
    super(err.message)
    this.code = err.code
    this.details = err.details
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_PREFIX}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    if (body?.error) {
      throw new ApiRequestError(body.error)
    }
    throw new Error(`API error ${res.status}`)
  }

  return res.json()
}

// ── Auth ──

export interface AuthUser {
  id: string
  email: string
  name: string | null
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export interface MeResponse {
  user: AuthUser
  role: "admin" | "cohost" | "user"
  permissions: string[]
}

export function register(email: string, password: string, name?: string) {
  return request<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  })
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export function getMe() {
  return request<MeResponse>("/v1/auth/me")
}

// ── Email Campaigns ──

export interface EmailCampaign {
  id: string
  title: string
  description: string
  link: string
  expires_at: string | null
  is_active: boolean
  email_to: string
  email_bcc: string | null
  subject_base: string
  body_base: string
  direct_link_code: string
  created_at: string
}

export function getCampaigns() {
  return request<{ campaigns: EmailCampaign[] }>("/v1/email-campaigns")
}

export function getCampaign(idOrCode: string) {
  return request<EmailCampaign>(`/v1/email-campaigns/${idOrCode}`)
}

export function generateCampaignEmail(idOrCode: string) {
  return request<{ subject: string; body: string }>(
    `/v1/email-campaigns/${idOrCode}/generate-email`,
    { method: "POST" }
  )
}

export function participateCampaign(idOrCode: string) {
  return request<{ message: string }>(
    `/v1/email-campaigns/${idOrCode}/participate`,
    { method: "POST" }
  )
}

// ── Petitions ──

export interface Petition {
  id: string
  title: string
  description: string
  link: string
  direct_link_code: string
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export function getPetitions() {
  return request<{ petitions: Petition[] }>("/v1/petitions")
}

export function getPetition(idOrCode: string) {
  return request<Petition>(`/v1/petitions/${idOrCode}`)
}

export function participatePetition(idOrCode: string) {
  return request<{ message: string }>(
    `/v1/petitions/${idOrCode}/participate`,
    { method: "POST" }
  )
}

// ── Admin: Email Campaigns ──

export interface AdminEmailCampaign extends EmailCampaign {
  participation_count: number
}

export interface CampaignInput {
  title: string
  email_to: string
  description?: string
  email_bcc?: string
  subject_base?: string
  body_base?: string
  expires_at?: string | null
  is_active?: boolean
}

export function adminGetCampaigns() {
  return request<{ campaigns: AdminEmailCampaign[] }>("/v1/admin/email-campaigns")
}

export function adminGetCampaign(idOrCode: string) {
  return request<AdminEmailCampaign>(`/v1/admin/email-campaigns/${idOrCode}`)
}

export function adminCreateCampaign(data: CampaignInput) {
  return request<EmailCampaign>("/v1/admin/email-campaigns", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function adminUpdateCampaign(idOrCode: string, data: Partial<CampaignInput>) {
  return request<EmailCampaign>(`/v1/admin/email-campaigns/${idOrCode}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function adminDeleteCampaign(idOrCode: string) {
  return request<{ message: string }>(`/v1/admin/email-campaigns/${idOrCode}`, {
    method: "DELETE",
  })
}

// ── Admin: Petitions ──

export interface AdminPetition extends Petition {
  participation_count: number
}

export interface PetitionInput {
  title: string
  link: string
  description?: string
  expires_at?: string | null
  is_active?: boolean
}

export function adminGetPetitions() {
  return request<{ petitions: AdminPetition[] }>("/v1/admin/petitions")
}

export function adminGetPetition(idOrCode: string) {
  return request<AdminPetition>(`/v1/admin/petitions/${idOrCode}`)
}

export function adminCreatePetition(data: PetitionInput) {
  return request<Petition>("/v1/admin/petitions", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function adminUpdatePetition(idOrCode: string, data: Partial<PetitionInput>) {
  return request<Petition>(`/v1/admin/petitions/${idOrCode}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function adminDeletePetition(idOrCode: string) {
  return request<{ message: string }>(`/v1/admin/petitions/${idOrCode}`, {
    method: "DELETE",
  })
}

// ── Admin: Co-hosts ──

export interface CoHost {
  user_id: string
  email: string
  display_name: string | null
}

export function adminGetCoHosts() {
  return request<{ co_hosts: CoHost[] }>("/v1/admin/co-hosts")
}

export function adminAddCoHost(data: { user_id?: string; email?: string; display_name?: string }) {
  return request<{ message: string; co_host: CoHost }>("/v1/admin/co-hosts", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function adminRemoveCoHost(userId: string) {
  return request<{ message: string }>(`/v1/admin/co-hosts/${userId}`, {
    method: "DELETE",
  })
}

export function adminGetCoHostPermissions(userId: string) {
  return request<{ user_id: string; permissions: string[] }>(
    `/v1/admin/co-hosts/${userId}/permissions`
  )
}

export function adminUpdateCoHostPermissions(userId: string, permissions: string[]) {
  return request<{ user_id: string; permissions: string[] }>(
    `/v1/admin/co-hosts/${userId}/permissions`,
    { method: "PUT", body: JSON.stringify({ permissions }) }
  )
}
