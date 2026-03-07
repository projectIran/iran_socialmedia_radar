import { Router, type Request, type Response } from 'express';
import { param, validationResult } from 'express-validator';
import { sendError, ERROR_CODES } from '../errors';
import { getOrCreateSessionId } from '../utils/sessionId';
import type { PetitionService } from '../services/PetitionService';

export default function petitionsRoutes(service: PetitionService): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    /* #swagger.tags = ['Petitions']
       #swagger.summary = 'List active petitions (public)'
       #swagger.responses[200] = { description: 'OK' }
    */
    try {
      const list = await service.list(true);
      return res.json({ petitions: list });
    } catch {
      return sendError(res, ERROR_CODES.NOT_FOUND);
    }
  });

  router.get('/:idOrCode', param('idOrCode').notEmpty().trim(), async (req: Request, res: Response) => {
    /* #swagger.tags = ['Petitions']
       #swagger.summary = 'Get petition by ID or direct link code (public)'
       #swagger.responses[200] = { description: 'OK' }
       #swagger.responses[404] = { description: 'Not found or inactive' }
    */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
    const row = await service.findByIdOrCode(req.params.idOrCode, true);
    if (!row) return sendError(res, ERROR_CODES.PETITION_NOT_FOUND);
    return res.json(row);
  });

  router.post('/:idOrCode/participate', param('idOrCode').notEmpty().trim(), async (req: Request, res: Response) => {
    /* #swagger.tags = ['Petitions']
       #swagger.summary = 'Record participation (idempotent by session)'
       #swagger.responses[200] = { description: 'OK' }
       #swagger.responses[404] = { description: 'Petition not found' }
    */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
    const sessionId = getOrCreateSessionId(req, res);
    try {
      await service.participate(req.params.idOrCode, sessionId);
      return res.json({ message: 'Participated' });
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === ERROR_CODES.PETITION_NOT_FOUND) return sendError(res, ERROR_CODES.PETITION_NOT_FOUND);
      return sendError(res, ERROR_CODES.NOT_FOUND);
    }
  });

  return router;
}
