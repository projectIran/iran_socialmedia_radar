import { Router, type Request, type Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/requirePermission';
import { COHOST_PERMISSIONS } from '../../utils/permissions';
import { sendError, ERROR_CODES } from '../../errors';
import type { CoHostService } from '../../services/CoHostService';
import type { RequestWithUser } from '../../types';

type LoadUserMiddleware = ReturnType<typeof import('../../middleware/auth').createLoadUser>;

export default function coHostsRoutes(coHostService: CoHostService, loadUser: LoadUserMiddleware): Router {
  const router = Router();
  const withAdmin = [requireAuth, loadUser, requireAdmin];

  router.get('/', withAdmin, async (_req: Request, res: Response) => {
    /* #swagger.tags = ['Admin – Co-hosts']
       #swagger.summary = 'List all co-hosts'
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.responses[200] = { description: 'OK', content: { "application/json": { schema: { type: "object", properties: { co_hosts: { type: "array", items: { $ref: "#/components/schemas/CoHostItem" } } } } } } }
    */
    try {
      const co_hosts = await coHostService.list();
      return res.json({ co_hosts });
    } catch {
      return sendError(res, ERROR_CODES.COHOST_LIST_FAILED);
    }
  });

  router.post(
    '/',
    withAdmin,
    body('user_id').optional().isUUID(),
    body('email').optional().isEmail(),
    body('display_name').optional().trim(),
    async (req: Request, res: Response) => {
      /* #swagger.tags = ['Admin – Co-hosts']
         #swagger.summary = 'Add or update co-host (by user_id or email)'
         #swagger.security = [{ bearerAuth: [] }]
         #swagger.requestBody = { content: { "application/json": { schema: { type: "object", properties: { user_id: { type: "string", format: "uuid" }, email: { type: "string" }, display_name: { type: "string" } } } } } }
         #swagger.responses[200] = { description: 'Co-host updated' }
         #swagger.responses[201] = { description: 'Co-host added' }
         #swagger.responses[400] = { description: 'Bad request (e.g. cannot add self)' }
         #swagger.responses[404] = { description: 'User not found' }
      */
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
      const { user_id, email, display_name } = req.body;
      const userId = (req as RequestWithUser).user?.id;
      if (!userId) return sendError(res, ERROR_CODES.AUTH_REQUIRED);
      try {
        const result = await coHostService.add(userId, { user_id, email, display_name });
        const status = result.message === 'Co-host added' ? 201 : 200;
        return res.status(status).json(result);
      } catch (err: unknown) {
        const e = err as { code?: string };
        if (e.code === ERROR_CODES.USER_NOT_FOUND) return sendError(res, ERROR_CODES.TARGET_USER_NOT_FOUND);
        if (e.code === ERROR_CODES.CANNOT_ADD_SELF) return sendError(res, ERROR_CODES.CANNOT_ADD_SELF);
        if (e.code === ERROR_CODES.MISSING_IDENTITY) return sendError(res, ERROR_CODES.MISSING_IDENTITY);
        return sendError(res, ERROR_CODES.COHOST_ADD_FAILED);
      }
    }
  );

  router.delete('/:userId', withAdmin, param('userId').isUUID(), async (req: Request, res: Response) => {
    /* #swagger.tags = ['Admin – Co-hosts']
       #swagger.summary = 'Remove co-host'
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.responses[200] = { description: 'Removed' }
       #swagger.responses[404] = { description: 'Co-host not found' }
    */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
    const userId = req.params.userId.trim();
    const result = await coHostService.remove(userId);
    if (!result) return sendError(res, ERROR_CODES.COHOST_NOT_FOUND);
    return res.json({ message: 'Co-host removed' });
  });

  router.get('/:userId/permissions', withAdmin, param('userId').isUUID(), async (req: Request, res: Response) => {
    /* #swagger.tags = ['Admin – Co-hosts']
       #swagger.summary = 'Get co-host permissions'
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.responses[200] = { description: 'OK', content: { "application/json": { schema: { type: "object", properties: { user_id: { type: "string" }, permissions: { type: "array", items: { type: "string" } } } } } } }
       #swagger.responses[404] = { description: 'Co-host not found' }
    */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
    const userId = req.params.userId.trim();
    const result = await coHostService.getPermissions(userId);
    if (!result) return sendError(res, ERROR_CODES.COHOST_NOT_FOUND);
    return res.json(result);
  });

  router.put(
    '/:userId/permissions',
    withAdmin,
    param('userId').isUUID(),
    body('permissions').isArray(),
    body('permissions.*').isString().isIn(COHOST_PERMISSIONS as unknown as string[]),
    async (req: Request, res: Response) => {
      /* #swagger.tags = ['Admin – Co-hosts']
         #swagger.summary = 'Update co-host permissions'
         #swagger.security = [{ bearerAuth: [] }]
         #swagger.requestBody = { required: true, content: { "application/json": { schema: { type: "object", required: ["permissions"], properties: { permissions: { type: "array", items: { type: "string", enum: ["media_support","email_campaign","feedback","stats"] } } } } } } }
         #swagger.responses[200] = { description: 'OK' }
         #swagger.responses[404] = { description: 'Co-host not found' }
      */
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
      const userId = req.params.userId.trim();
      const result = await coHostService.updatePermissions(userId, req.body.permissions as string[]);
      if (!result) return sendError(res, ERROR_CODES.COHOST_NOT_FOUND);
      return res.json(result);
    }
  );

  return router;
}
