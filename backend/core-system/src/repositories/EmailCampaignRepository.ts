import { pool } from '../db/pool';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface EmailCampaignRow {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  expires_at: string | null;
  is_active: boolean;
  email_to: string;
  email_bcc: string | null;
  subject_base: string | null;
  body_base: string | null;
  direct_link_code: string;
  created_at: string;
}

export interface EmailCampaignInsert {
  title: string;
  description?: string | null;
  link?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
  email_to: string;
  email_bcc?: string | null;
  subject_base?: string | null;
  body_base?: string | null;
  direct_link_code: string;
}

export function isUuid(idOrCode: string): boolean {
  return UUID_REGEX.test((idOrCode || '').trim());
}

export class EmailCampaignRepository {
  async findById(id: string): Promise<EmailCampaignRow | null> {
    if (!id) return null;
    const r = await pool.query(
      `SELECT id, title, description, link, expires_at, is_active, email_to, email_bcc, subject_base, body_base, direct_link_code, created_at
       FROM email_campaigns WHERE id = $1`,
      [id.trim()]
    );
    return (r.rows[0] as EmailCampaignRow) ?? null;
  }

  async findByDirectLinkCode(code: string): Promise<EmailCampaignRow | null> {
    if (!code || typeof code !== 'string') return null;
    const r = await pool.query(
      `SELECT id, title, description, link, expires_at, is_active, email_to, email_bcc, subject_base, body_base, direct_link_code, created_at
       FROM email_campaigns WHERE direct_link_code = $1`,
      [code.trim()]
    );
    return (r.rows[0] as EmailCampaignRow) ?? null;
  }

  async findByIdOrCode(idOrCode: string): Promise<EmailCampaignRow | null> {
    const s = (idOrCode || '').trim();
    if (!s) return null;
    if (isUuid(s)) {
      const byId = await this.findById(s);
      if (byId) return byId;
    }
    return this.findByDirectLinkCode(s);
  }

  async list(activeOnly: boolean): Promise<EmailCampaignRow[]> {
    let q = `SELECT id, title, description, link, expires_at, is_active, email_to, email_bcc, subject_base, body_base, direct_link_code, created_at FROM email_campaigns`;
    const params: unknown[] = [];
    if (activeOnly) {
      q += ` WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`;
    }
    q += ` ORDER BY created_at DESC`;
    const r = await pool.query(q, params);
    return r.rows as EmailCampaignRow[];
  }

  async create(data: EmailCampaignInsert): Promise<EmailCampaignRow> {
    const r = await pool.query(
      `INSERT INTO email_campaigns (title, description, link, expires_at, is_active, email_to, email_bcc, subject_base, body_base, direct_link_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, title, description, link, expires_at, is_active, email_to, email_bcc, subject_base, body_base, direct_link_code, created_at`,
      [
        data.title,
        data.description ?? null,
        data.link ?? null,
        data.expires_at ?? null,
        data.is_active ?? true,
        data.email_to,
        data.email_bcc ?? null,
        data.subject_base ?? null,
        data.body_base ?? null,
        data.direct_link_code,
      ]
    );
    return r.rows[0] as EmailCampaignRow;
  }

  async update(
    id: string,
    data: Partial<Pick<EmailCampaignRow, 'title' | 'description' | 'is_active' | 'expires_at'>>
  ): Promise<EmailCampaignRow | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (data.title !== undefined) {
      updates.push(`title = $${i++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${i++}`);
      values.push(data.description);
    }
    if (data.is_active !== undefined) {
      updates.push(`is_active = $${i++}`);
      values.push(data.is_active);
    }
    if (data.expires_at !== undefined) {
      updates.push(`expires_at = $${i++}`);
      values.push(data.expires_at);
    }
    if (updates.length === 0) return this.findById(id);
    values.push(id);
    const r = await pool.query(
      `UPDATE email_campaigns SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, title, description, link, expires_at, is_active, email_to, email_bcc, subject_base, body_base, direct_link_code, created_at`,
      values
    );
    return (r.rows[0] as EmailCampaignRow) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const r = await pool.query('DELETE FROM email_campaigns WHERE id = $1 RETURNING id', [id]);
    return r.rowCount !== null && r.rowCount > 0;
  }
}
