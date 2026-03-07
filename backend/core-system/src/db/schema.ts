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

    await client.query(`
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        link TEXT,
        expires_at TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT TRUE,
        email_to TEXT NOT NULL,
        email_bcc TEXT,
        subject_base TEXT,
        body_base TEXT,
        direct_link_code VARCHAR(24) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_email_campaigns_direct_link_code ON email_campaigns(direct_link_code);
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_campaign_attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
        file_path TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_campaign_participations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
        session_id VARCHAR(64) NOT NULL,
        participated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(campaign_id, session_id)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_email_campaign_participations_campaign_id ON email_campaign_participations(campaign_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS petitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        link TEXT NOT NULL,
        direct_link_code VARCHAR(24) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_petitions_direct_link_code ON petitions(direct_link_code);
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS petition_attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
        file_path TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS petition_participations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
        session_id VARCHAR(64) NOT NULL,
        participated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(petition_id, session_id)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_petition_participations_petition_id ON petition_participations(petition_id);
    `);
  } finally {
    client.release();
  }
}
