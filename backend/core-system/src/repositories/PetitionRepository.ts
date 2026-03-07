import { pool } from '../db/pool';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface PetitionRow {
  id: string;
  title: string;
  description: string | null;
  link: string;
  direct_link_code: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PetitionInsert {
  title: string;
  description?: string | null;
  link: string;
  direct_link_code: string;
  expires_at?: string | null;
  is_active?: boolean;
}

export function isUuid(idOrCode: string): boolean {
  return UUID_REGEX.test((idOrCode || '').trim());
}

export class PetitionRepository {
  async findById(id: string): Promise<PetitionRow | null> {
    if (!id) return null;
    const r = await pool.query(
      `SELECT id, title, description, link, direct_link_code, expires_at, is_active, created_at FROM petitions WHERE id = $1`,
      [id.trim()]
    );
    return (r.rows[0] as PetitionRow) ?? null;
  }

  async findByDirectLinkCode(code: string): Promise<PetitionRow | null> {
    if (!code || typeof code !== 'string') return null;
    const r = await pool.query(
      `SELECT id, title, description, link, direct_link_code, expires_at, is_active, created_at FROM petitions WHERE direct_link_code = $1`,
      [code.trim()]
    );
    return (r.rows[0] as PetitionRow) ?? null;
  }

  async findByIdOrCode(idOrCode: string): Promise<PetitionRow | null> {
    const s = (idOrCode || '').trim();
    if (!s) return null;
    if (isUuid(s)) {
      const byId = await this.findById(s);
      if (byId) return byId;
    }
    return this.findByDirectLinkCode(s);
  }

  async list(activeOnly: boolean): Promise<PetitionRow[]> {
    let q = `SELECT id, title, description, link, direct_link_code, expires_at, is_active, created_at FROM petitions`;
    const params: unknown[] = [];
    if (activeOnly) {
      q += ` WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`;
    }
    q += ` ORDER BY created_at DESC`;
    const r = await pool.query(q, params);
    return r.rows as PetitionRow[];
  }

  async create(data: PetitionInsert): Promise<PetitionRow> {
    const r = await pool.query(
      `INSERT INTO petitions (title, description, link, direct_link_code, expires_at, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, description, link, direct_link_code, expires_at, is_active, created_at`,
      [
        data.title,
        data.description ?? null,
        data.link,
        data.direct_link_code,
        data.expires_at ?? null,
        data.is_active ?? true,
      ]
    );
    return r.rows[0] as PetitionRow;
  }

  async update(
    id: string,
    data: Partial<Pick<PetitionRow, 'title' | 'description' | 'is_active' | 'expires_at'>>
  ): Promise<PetitionRow | null> {
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
      `UPDATE petitions SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, title, description, link, direct_link_code, expires_at, is_active, created_at`,
      values
    );
    return (r.rows[0] as PetitionRow) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const r = await pool.query('DELETE FROM petitions WHERE id = $1 RETURNING id', [id]);
    return r.rowCount !== null && r.rowCount > 0;
  }
}
