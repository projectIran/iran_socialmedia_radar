import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { validatePasswordStrength } from '../utils/passwordValidation';
import { sendError, ERROR_CODES } from '../errors';
import type { AuthService } from '../services/AuthService';
import type { MeService } from '../services/MeService';
import type { RequestWithUser } from '../types';

type LoadUserMiddleware = ReturnType<typeof import('../middleware/auth').createLoadUser>;

export default function authRoutes(
  authService: AuthService,
  meService: MeService,
  loadUser: LoadUserMiddleware
): Router {
  const router = Router();

  router.post(
    '/register',
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }),
    body('password')
      .notEmpty().withMessage('Password is required')
      .custom((value) => {
        const { valid, message } = validatePasswordStrength(value);
        if (!valid) throw new Error(message);
        return true;
      })
      .withMessage('Password does not meet strength requirements'),
    body('name').optional().trim(),
    async (req, res) => {
      /* #swagger.tags = ['Auth']
         #swagger.summary = 'Register a new user'
         #swagger.requestBody = { required: true, content: { "application/json": { schema: { type: "object", required: ["email","password"], properties: { email: { type: "string" }, password: { type: "string", minLength: 8 }, name: { type: "string" } } } } } }
         #swagger.responses[201] = { description: 'Created', content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } }
         #swagger.responses[409] = { description: 'Email already registered', content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
      */
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
      }
      const { email, password, name } = req.body;
      try {
        const result = await authService.register({ email, password, name });
        return res.status(201).json(result);
      } catch (err: unknown) {
        const e = err as { code?: string };
        if (e.code === ERROR_CODES.EMAIL_EXISTS) {
          return sendError(res, ERROR_CODES.EMAIL_EXISTS);
        }
        throw err;
      }
    }
  );

  router.post(
    '/login',
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }),
    body('password').exists(),
    async (req, res) => {
      /* #swagger.tags = ['Auth']
         #swagger.summary = 'Login'
         #swagger.requestBody = { required: true, content: { "application/json": { schema: { type: "object", required: ["email","password"], properties: { email: { type: "string" }, password: { type: "string" } } } } } }
         #swagger.responses[200] = { description: 'OK', content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } }
         #swagger.responses[401] = { description: 'Invalid credentials', content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
      */
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, ERROR_CODES.VALIDATION_FAILED, { details: errors.array() });
      }
      const { email, password } = req.body;
      try {
        const result = await authService.login({ email, password });
        return res.json(result);
      } catch (err: unknown) {
        const e = err as { code?: string };
        if (e.code === ERROR_CODES.INVALID_CREDENTIALS) {
          return sendError(res, ERROR_CODES.INVALID_CREDENTIALS);
        }
        throw err;
      }
    }
  );

  router.get('/me', requireAuth, loadUser, async (req, res) => {
    /* #swagger.tags = ['Auth']
       #swagger.summary = 'Current user profile and permissions'
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.responses[200] = { description: 'OK', content: { "application/json": { schema: { $ref: "#/components/schemas/MeProfile" } } } }
       #swagger.responses[401] = { description: 'Unauthorized', content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
    */
    const profile = await meService.getProfile((req as RequestWithUser).user!);
    return res.json(profile);
  });

  return router;
}
