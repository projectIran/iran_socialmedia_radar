import { pool } from '../db/pool';

interface CoHostRowWithJoined {
  id: string;
  user_id: string;
  added_by: string | null;
  display_name: string | null;
  permissions: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string | null;
}

export class CoHostRepository {
  async add(
    userId: string,
    addedBy: string | null,
    displayName: string | null = null
  ): Promise<CoHostRowWithJoined> {
    const r = await pool.query(
      `INSERT INTO co_hosts (user_id, added_by, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id)
       DO UPDATE SET added_by = EXCLUDED.added_by, display_name = COALESCE(EXCLUDED.display_name, co_hosts.display_name)
       RETURNING *`,
      [String(userId).trim(), addedBy ? String(addedBy).trim() : null, displayName || null]
    );
    return this._row(r.rows[0])!;
  }

  async remove(userId: string): Promise<CoHostRowWithJoined | null> {
    const r = await pool.query('DELETE FROM co_hosts WHERE user_id = $1 RETURNING *', [String(userId).trim()]);
    return r.rows[0] ? this._row(r.rows[0]) : null;
  }

  async findByUserId(userId: string): Promise<CoHostRowWithJoined | null> {
    const r = await pool.query('SELECT * FROM co_hosts WHERE user_id = $1', [String(userId).trim()]);
    return r.rows[0] ? this._row(r.rows[0]) : null;
  }

  async getAll(): Promise<CoHostRowWithJoined[]> {
    const r = await pool.query(
      `SELECT c.*, u.email AS user_email, u.name AS user_name
       FROM co_hosts c
       JOIN users u ON u.id = c.user_id
       ORDER BY c.created_at DESC`
    );
    return r.rows.map((row) => this._row(row)!);
  }

  async getPermissions(userId: string): Promise<string[]> {
    const row = await this.findByUserId(userId);
    if (!row || !row.permissions) return [];
    try {
      const parsed = JSON.parse(row.permissions) as unknown;
      return Array.isArray(parsed) ? (parsed as string[]).filter((p) => typeof p === 'string') : [];
    } catch {
      return [];
    }
  }

  async updatePermissions(userId: string, permissions: string[]): Promise<void> {
    const perms = Array.isArray(permissions)
      ? permissions.filter((p) => typeof p === 'string')
      : [];
    await pool.query('UPDATE co_hosts SET permissions = $2 WHERE user_id = $1', [
      String(userId).trim(),
      JSON.stringify(perms),
    ]);
  }

  async isCoHost(userId: string): Promise<boolean> {
    const row = await this.findByUserId(userId);
    return !!row;
  }

  private _row(row: Record<string, unknown> | undefined): CoHostRowWithJoined | null {
    if (!row) return null;
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      added_by: (row.added_by as string | null) ?? null,
      display_name: (row.display_name as string | null) ?? null,
      permissions: (row.permissions as string | null) ?? null,
      created_at: row.created_at as string,
      user_email: row.user_email as string | undefined,
      user_name: (row.user_name as string | null) ?? null,
    };
  }
}
