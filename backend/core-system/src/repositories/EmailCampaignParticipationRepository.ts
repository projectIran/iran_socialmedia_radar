import { pool } from '../db/pool';

export class EmailCampaignParticipationRepository {
  async record(campaignId: string, sessionId: string): Promise<void> {
    await pool.query(
      `INSERT INTO email_campaign_participations (campaign_id, session_id) VALUES ($1, $2) ON CONFLICT (campaign_id, session_id) DO NOTHING`,
      [campaignId, sessionId]
    );
  }

  async countByCampaignId(campaignId: string): Promise<number> {
    const r = await pool.query(
      'SELECT COUNT(*)::int AS c FROM email_campaign_participations WHERE campaign_id = $1',
      [campaignId]
    );
    return (r.rows[0] as { c: number })?.c ?? 0;
  }
}
