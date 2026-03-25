import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/requirePermission';
import { COHOST_PERMISSIONS } from '../../utils/permissions';

type LoadUserMiddleware = ReturnType<typeof import('../../middleware/auth').createLoadUser>;

export default function permissionsRoutes(loadUser: LoadUserMiddleware): Router {
  const router = Router();
  const withAdmin = [requireAuth, loadUser, requireAdmin];

  router.get('/', withAdmin, (_req: Request, res: Response) => {
    /* #swagger.tags = ['Admin – Co-hosts']
       #swagger.summary = 'List available permission keys'
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.responses[200] = { description: 'OK', content: { "application/json": { schema: { type: "object", properties: { permissions: { type: "array", items: { type: "string" } } } } } } }
    */
    return res.json({ permissions: [...COHOST_PERMISSIONS] });
  });

  return router;
}
