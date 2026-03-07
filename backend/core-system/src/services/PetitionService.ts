import { generateDirectLinkCode } from '../utils/directLinkCode';
import type { PetitionRepository } from '../repositories/PetitionRepository';
import type { PetitionParticipationRepository } from '../repositories/PetitionParticipationRepository';
import type { PetitionRow, PetitionInsert } from '../repositories/PetitionRepository';
import { ERROR_CODES } from '../errors';

const MAX_CODE_RETRIES = 5;

export class PetitionService {
  constructor(
    private petitionRepo: PetitionRepository,
    private participationRepo: PetitionParticipationRepository
  ) {}

  async list(activeOnly: boolean): Promise<PetitionRow[]> {
    return this.petitionRepo.list(activeOnly);
  }

  async listWithParticipationCount(activeOnly: boolean): Promise<(PetitionRow & { participation_count: number })[]> {
    const list = await this.petitionRepo.list(activeOnly);
    const withCount = await Promise.all(
      list.map(async (p) => {
        const participation_count = await this.participationRepo.countByPetitionId(p.id);
        return { ...p, participation_count };
      })
    );
    return withCount;
  }

  async findByIdOrCode(idOrCode: string, requireActive: boolean): Promise<PetitionRow | null> {
    const row = await this.petitionRepo.findByIdOrCode(idOrCode);
    if (!row) return null;
    if (requireActive && (!row.is_active || (row.expires_at && new Date(row.expires_at) <= new Date()))) return null;
    return row;
  }

  async create(data: {
    title: string;
    description?: string | null;
    link: string;
    expires_at?: string | null;
    is_active?: boolean;
  }): Promise<PetitionRow> {
    let lastErr: Error | null = null;
    for (let i = 0; i < MAX_CODE_RETRIES; i++) {
      const direct_link_code = generateDirectLinkCode();
      try {
        const insert: PetitionInsert = {
          title: data.title,
          description: data.description ?? null,
          link: data.link,
          direct_link_code,
          expires_at: data.expires_at ?? null,
          is_active: data.is_active ?? true,
        };
        return await this.petitionRepo.create(insert);
      } catch (e) {
        lastErr = e as Error;
        const msg = (e as Error).message || '';
        if (!msg.includes('unique') && !msg.includes('duplicate')) throw e;
      }
    }
    throw lastErr || new Error('Failed to generate unique direct_link_code');
  }

  async getById(id: string): Promise<PetitionRow | null> {
    return this.petitionRepo.findById(id);
  }

  async update(
    idOrCode: string,
    data: Partial<Pick<PetitionRow, 'title' | 'description' | 'is_active' | 'expires_at'>>
  ): Promise<PetitionRow | null> {
    const row = await this.petitionRepo.findByIdOrCode(idOrCode);
    if (!row) return null;
    return this.petitionRepo.update(row.id, data);
  }

  async delete(idOrCode: string): Promise<boolean> {
    const row = await this.petitionRepo.findByIdOrCode(idOrCode);
    if (!row) return false;
    return this.petitionRepo.delete(row.id);
  }

  async participate(idOrCode: string, sessionId: string): Promise<void> {
    const row = await this.petitionRepo.findByIdOrCode(idOrCode);
    if (!row) {
      const err = new Error(ERROR_CODES.PETITION_NOT_FOUND) as Error & { code?: string };
      err.code = ERROR_CODES.PETITION_NOT_FOUND;
      throw err;
    }
    if (!row.is_active || (row.expires_at && new Date(row.expires_at) <= new Date())) {
      const err = new Error(ERROR_CODES.PETITION_NOT_FOUND) as Error & { code?: string };
      err.code = ERROR_CODES.PETITION_NOT_FOUND;
      throw err;
    }
    await this.participationRepo.record(row.id, sessionId);
  }
}
