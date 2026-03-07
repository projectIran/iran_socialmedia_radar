import { pool } from '../db/pool';
import type { UserRow } from '../types';

export class UserRepository {
  async findByEmail(email: string | null | undefined): Promise<(UserRow & { password_hash: string | null }) | null> {
    if (!email || typeof email !== 'string') return null;
    const normalized = email.trim().toLowerCase();
    const r = await pool.query(
      'SELECT id, email, password_hash, name, created_at FROM users WHERE LOWER(email) = $1',
      [normalized]
    );
    return (r.rows[0] as (UserRow & { password_hash: string | null }) | undefined) ?? null;
  }

  async findById(id: string | null | undefined): Promise<UserRow | null> {
    if (id == null) return null;
    const r = await pool.query(
      'SELECT id, email, password_hash, name, created_at FROM users WHERE id = $1',
      [String(id).trim()]
    );
    return (r.rows[0] as UserRow | undefined) ?? null;
  }

  async create({
    email,
    passwordHash,
    name = null,
  }: {
    email: string;
    passwordHash: string | null;
    name?: string | null;
  }): Promise<{ id: string; email: string; name: string | null; created_at?: string }> {
    const normalized = (email || '').trim().toLowerCase();
    if (!normalized) throw new Error('Email is required');
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at`,
      [normalized, passwordHash || null, name || null]
    );
    return r.rows[0] as { id: string; email: string; name: string | null; created_at?: string };
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await pool.query('UPDATE users SET password_hash = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [
      String(userId).trim(),
      passwordHash,
    ]);
  }
}
