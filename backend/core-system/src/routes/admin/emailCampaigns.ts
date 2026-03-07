import { Router, type Request, type Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { requireAuth } from '../../middleware/auth';
import { sendError, ERROR_CODES } from '../../errors';
import type { EmailCampaignService } from '../../services/EmailCampaignService';
import type { NextFunction } from 'express';
import type { RequestWithUser } from '../../types';

type LoadUserMiddleware = ReturnType<typeof import('../../middleware/auth').createLoadUser>;
type RequirePermissionMiddleware = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => void | Response | Promise<void | Response>;

export default function emailCampaignsAdminRoutes(
  service: EmailCampaignService,
  loadUser: LoadUserMiddleware,
  requireCampaignPermission: RequirePermissionMiddleware
): Router {
  const router = Router();
  const withCampaignAdmin = [requireAuth, loadUser, requireCampaignPermission];

  router.get('/', withCampaignAdmin, async (req: Request, res: Response) => {
    /* #swagger.tags = ['Admin – Email campaigns']
       #swagger.summary = 'List email campaigns (admin)'
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['active_only'] = { in: 'query', schema: { type: 'string', enum: ['true','false'] } }
       #swagger.responses[200] = { description: 'OK' }
    */
    const activeOnly = req.query.active_only === 'true';
    try {
      const list = await service.listWithParticipationCount(activeOnly);
      return res.json({ campaigns: list });
    } catch {
      return sendError(res, ERROR_CODES.NOT_FOUND);
    }
  });

  router.get('/:idOrCode', withCampaignAdmin, param('idOrCode').notEmpty().trim(), async (req: Request, res: Response) => {
    /* #swagger.tags = ['Admin – Email campaigns']
       #swagger.summary = 'Get email campaign by ID or code (admin)'
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.responses[200] = { description: 'OK' }
       #swagger.responses[404] = { description: 'Not found' }
    */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
    const row = await service.findByIdOrCode(req.params.idOrCode, false);
    if (!row) return sendError(res, ERROR_CODES.CAMPAIGN_NOT_FOUND);
    return res.json(row);
  });

  router.post(
    '/',
    withCampaignAdmin,
    body('title').trim().notEmpty(),
    body('email_to').trim().notEmpty(),
    body('description').optional().trim(),
    body('email_bcc').optional().trim(),
    body('subject_base').optional().trim(),
    body('body_base').optional().trim(),
    body('expires_at').optional().isISO8601().withMessage('expires_at must be ISO 8601 datetime (e.g. UTC: 2025-12-31T23:59:59Z)'),
    body('is_active').optional().isBoolean(),
    async (req: Request, res: Response) => {
      /* #swagger.tags = ['Admin – Email campaigns']
         #swagger.summary = 'Create email campaign'
         #swagger.security = [{ bearerAuth: [] }]
         #swagger.requestBody = { required: true, content: { "application/json": { schema: { type: "object", required: ["title","email_to"], properties: { title: {}, description: {}, email_to: {}, email_bcc: {}, subject_base: {}, body_base: {}, expires_at: {}, is_active: {} } } } } }
         #swagger.responses[201] = { description: 'Created' }
      */
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
      const { title, description, email_to, email_bcc, subject_base, body_base, expires_at, is_active } = req.body;
      try {
        const row = await service.create({
          title,
          description: description || null,
          email_to,
          email_bcc: email_bcc || null,
          subject_base: subject_base || null,
          body_base: body_base || null,
          expires_at: expires_at || null,
          is_active,
        });
        return res.status(201).json(row);
      } catch {
        return sendError(res, ERROR_CODES.VALIDATION_FAILED);
      }
    }
  );

  router.patch(
    '/:idOrCode',
    withCampaignAdmin,
    param('idOrCode').notEmpty().trim(),
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('is_active').optional().isBoolean(),
    body('expires_at').optional().isISO8601().withMessage('expires_at must be ISO 8601 datetime (e.g. UTC: 2025-12-31T23:59:59Z)'),
    async (req: Request, res: Response) => {
      /* #swagger.tags = ['Admin – Email campaigns']
         #swagger.summary = 'Update email campaign'
         #swagger.security = [{ bearerAuth: [] }]
         #swagger.responses[200] = { description: 'OK' }
         #swagger.responses[404] = { description: 'Not found' }
      */
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
      const { title, description, is_active, expires_at } = req.body;
      const row = await service.update(req.params.idOrCode, { title, description, is_active, expires_at });
      if (!row) return sendError(res, ERROR_CODES.CAMPAIGN_NOT_FOUND);
      return res.json(row);
    }
  );

  router.delete('/:idOrCode', withCampaignAdmin, param('idOrCode').notEmpty().trim(), async (req: Request, res: Response) => {
    /* #swagger.tags = ['Admin – Email campaigns']
       #swagger.summary = 'Delete email campaign'
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.responses[200] = { description: 'Deleted' }
       #swagger.responses[404] = { description: 'Not found' }
    */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
    const ok = await service.delete(req.params.idOrCode);
    if (!ok) return sendError(res, ERROR_CODES.CAMPAIGN_NOT_FOUND);
    return res.json({ message: 'Deleted' });
  });

  return router;
}
