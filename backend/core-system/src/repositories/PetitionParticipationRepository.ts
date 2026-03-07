import { pool } from '../db/pool';

export class PetitionParticipationRepository {
  async record(petitionId: string, sessionId: string): Promise<void> {
    await pool.query(
      `INSERT INTO petition_participations (petition_id, session_id) VALUES ($1, $2) ON CONFLICT (petition_id, session_id) DO NOTHING`,
      [petitionId, sessionId]
    );
  }

  async countByPetitionId(petitionId: string): Promise<number> {
    const r = await pool.query(
      'SELECT COUNT(*)::int AS c FROM petition_participations WHERE petition_id = $1',
      [petitionId]
    );
    return (r.rows[0] as { c: number })?.c ?? 0;
  }
}
