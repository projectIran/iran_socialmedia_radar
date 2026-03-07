import { pool } from './pool';

export async function initializeSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS co_hosts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        added_by UUID REFERENCES users(id) ON DELETE SET NULL,
        display_name VARCHAR(255),
        permissions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_co_hosts_user_id ON co_hosts(user_id);
    `);
  } finally {
    client.release();
  }
}
