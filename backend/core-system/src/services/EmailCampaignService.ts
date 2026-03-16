import { buildMailto, generateDirectLinkCode } from '../utils/directLinkCode';
import { shortenUrl } from './urlShortener';
import { generatePersonalizedEmail } from './aiPersonalization';
import type { EmailCampaignRepository } from '../repositories/EmailCampaignRepository';
import type { EmailCampaignParticipationRepository } from '../repositories/EmailCampaignParticipationRepository';
import type { EmailCampaignRow, EmailCampaignInsert } from '../repositories/EmailCampaignRepository';
import { ERROR_CODES } from '../errors';

const MAX_CODE_RETRIES = 5;

export class EmailCampaignService {
  constructor(
    private campaignRepo: EmailCampaignRepository,
    private participationRepo: EmailCampaignParticipationRepository
  ) {}

  async list(activeOnly: boolean): Promise<EmailCampaignRow[]> {
    return this.campaignRepo.list(activeOnly);
  }

  async listWithParticipationCount(activeOnly: boolean): Promise<(EmailCampaignRow & { participation_count: number })[]> {
    const list = await this.campaignRepo.list(activeOnly);
    const withCount = await Promise.all(
      list.map(async (c) => {
        const participation_count = await this.participationRepo.countByCampaignId(c.id);
        return { ...c, participation_count };
      })
    );
    return withCount;
  }

  async findByIdOrCode(idOrCode: string, requireActive: boolean): Promise<EmailCampaignRow | null> {
    const row = await this.campaignRepo.findByIdOrCode(idOrCode);
    if (!row) return null;
    if (requireActive && (!row.is_active || (row.expires_at && new Date(row.expires_at) <= new Date()))) return null;
    return row;
  }

  async create(data: {
    title: string;
    description?: string | null;
    email_to: string;
    email_bcc?: string | null;
    subject_base?: string | null;
    body_base?: string | null;
    expires_at?: string | null;
    is_active?: boolean;
  }): Promise<EmailCampaignRow> {
    const mailto = buildMailto(data.email_to, data.email_bcc);
    const link = await shortenUrl(mailto);
    let lastErr: Error | null = null;
    for (let i = 0; i < MAX_CODE_RETRIES; i++) {
      const direct_link_code = generateDirectLinkCode();
      try {
        const insert: EmailCampaignInsert = {
          title: data.title,
          description: data.description ?? null,
          link,
          expires_at: data.expires_at ?? null,
          is_active: data.is_active ?? true,
          email_to: data.email_to,
          email_bcc: data.email_bcc ?? null,
          subject_base: data.subject_base ?? null,
          body_base: data.body_base ?? null,
          direct_link_code,
        };
        return await this.campaignRepo.create(insert);
      } catch (e) {
        lastErr = e as Error;
        const msg = (e as Error).message || '';
        if (!msg.includes('unique') && !msg.includes('duplicate')) throw e;
      }
    }
    throw lastErr || new Error('Failed to generate unique direct_link_code');
  }

  async getById(id: string): Promise<EmailCampaignRow | null> {
    return this.campaignRepo.findById(id);
  }

  async update(
    idOrCode: string,
    data: Partial<
      Pick<EmailCampaignRow, 'title' | 'description' | 'email_to' | 'email_bcc' | 'subject_base' | 'body_base' | 'is_active' | 'expires_at'>
    >
  ): Promise<EmailCampaignRow | null> {
    const row = await this.campaignRepo.findByIdOrCode(idOrCode);
    if (!row) return null;
    const payload: Parameters<EmailCampaignRepository['update']>[1] = { ...data };
    if (data.email_to !== undefined || data.email_bcc !== undefined) {
      const mailto = buildMailto(
        data.email_to ?? row.email_to,
        data.email_bcc !== undefined ? data.email_bcc : row.email_bcc
      );
      payload.link = await shortenUrl(mailto);
    }
    return this.campaignRepo.update(row.id, payload);
  }

  async delete(idOrCode: string): Promise<boolean> {
    const row = await this.campaignRepo.findByIdOrCode(idOrCode);
    if (!row) return false;
    return this.campaignRepo.delete(row.id);
  }

  async generateEmail(idOrCode: string): Promise<{ subject: string; body: string }> {
    const row = await this.campaignRepo.findByIdOrCode(idOrCode);
    if (!row) {
      const err = new Error(ERROR_CODES.CAMPAIGN_NOT_FOUND) as Error & { code?: string };
      err.code = ERROR_CODES.CAMPAIGN_NOT_FOUND;
      throw err;
    }
    if (!row.is_active || (row.expires_at && new Date(row.expires_at) <= new Date())) {
      const err = new Error(ERROR_CODES.CAMPAIGN_NOT_FOUND) as Error & { code?: string };
      err.code = ERROR_CODES.CAMPAIGN_NOT_FOUND;
      throw err;
    }
    return generatePersonalizedEmail(row.subject_base || '', row.body_base || '');
  }

  async participate(idOrCode: string, sessionId: string): Promise<void> {
    const row = await this.campaignRepo.findByIdOrCode(idOrCode);
    if (!row) {
      const err = new Error(ERROR_CODES.CAMPAIGN_NOT_FOUND) as Error & { code?: string };
      err.code = ERROR_CODES.CAMPAIGN_NOT_FOUND;
      throw err;
    }
    if (!row.is_active || (row.expires_at && new Date(row.expires_at) <= new Date())) {
      const err = new Error(ERROR_CODES.CAMPAIGN_NOT_FOUND) as Error & { code?: string };
      err.code = ERROR_CODES.CAMPAIGN_NOT_FOUND;
      throw err;
    }
    await this.participationRepo.record(row.id, sessionId);
  }
}
