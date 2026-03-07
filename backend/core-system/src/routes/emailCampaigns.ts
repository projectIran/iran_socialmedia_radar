import { Router, type Request, type Response } from 'express';
import { param, validationResult } from 'express-validator';
import { sendError, ERROR_CODES } from '../errors';
import { getSessionId, getOrCreateSessionId } from '../utils/sessionId';
import { defaultRateLimiter } from '../utils/rateLimiter';
import type { EmailCampaignService } from '../services/EmailCampaignService';

export default function emailCampaignsRoutes(service: EmailCampaignService): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    /* #swagger.tags = ['Email Campaigns']
       #swagger.summary = 'List active email campaigns (public)'
       #swagger.responses[200] = { description: 'OK' }
    */
    try {
      const list = await service.list(true);
      return res.json({ campaigns: list });
    } catch {
      return sendError(res, ERROR_CODES.NOT_FOUND);
    }
  });

  router.get('/:idOrCode', param('idOrCode').notEmpty().trim(), async (req: Request, res: Response) => {
    /* #swagger.tags = ['Email Campaigns']
       #swagger.summary = 'Get campaign by ID or direct link code (public)'
       #swagger.responses[200] = { description: 'OK' }
       #swagger.responses[404] = { description: 'Not found or inactive' }
    */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
    const row = await service.findByIdOrCode(req.params.idOrCode, true);
    if (!row) return sendError(res, ERROR_CODES.CAMPAIGN_NOT_FOUND);
    return res.json(row);
  });

  router.post('/:idOrCode/generate-email', param('idOrCode').notEmpty().trim(), async (req: Request, res: Response) => {
    /* #swagger.tags = ['Email Campaigns']
       #swagger.summary = 'Generate personalized email (subject, body) via AI'
       #swagger.responses[200] = { description: 'OK', content: { "application/json": { schema: { type: "object", properties: { subject: {}, body: {} } } } } }
       #swagger.responses[404] = { description: 'Campaign not found' }
       #swagger.responses[429] = { description: 'Too many requests' }
    */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
    const rateKey = getSessionId(req) ?? req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const limit = defaultRateLimiter.checkLimit(rateKey);
    if (!limit.allowed) {
      res.setHeader('X-RateLimit-Limit', 10);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('Retry-After', Math.ceil((limit.resetAt - Date.now()) / 1000));
      return sendError(res, ERROR_CODES.RATE_LIMIT_EXCEEDED);
    }
    try {
      const result = await service.generateEmail(req.params.idOrCode);
      res.setHeader('X-RateLimit-Limit', 10);
      res.setHeader('X-RateLimit-Remaining', String(limit.remaining));
      return res.json(result);
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === ERROR_CODES.CAMPAIGN_NOT_FOUND) return sendError(res, ERROR_CODES.CAMPAIGN_NOT_FOUND);
      return sendError(res, ERROR_CODES.PERSONALIZATION_FAILED);
    }
  });

  router.post('/:idOrCode/participate', param('idOrCode').notEmpty().trim(), async (req: Request, res: Response) => {
    /* #swagger.tags = ['Email Campaigns']
       #swagger.summary = 'Record participation (idempotent by session)'
       #swagger.responses[200] = { description: 'OK' }
       #swagger.responses[404] = { description: 'Campaign not found' }
    */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
    const sessionId = getOrCreateSessionId(req, res);
    try {
      await service.participate(req.params.idOrCode, sessionId);
      return res.json({ message: 'Participated' });
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === ERROR_CODES.CAMPAIGN_NOT_FOUND) return sendError(res, ERROR_CODES.CAMPAIGN_NOT_FOUND);
      return sendError(res, ERROR_CODES.NOT_FOUND);
    }
  });

  return router;
}
