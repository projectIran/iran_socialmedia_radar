import express, { type Request, type Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swaggerUi from 'swagger-ui-express';
import { UserRepository } from './repositories/UserRepository';
import { CoHostRepository } from './repositories/CoHostRepository';
import { AuthService } from './services/AuthService';
import { MeService } from './services/MeService';
import { CoHostService } from './services/CoHostService';
import { EmailCampaignRepository } from './repositories/EmailCampaignRepository';
import { EmailCampaignParticipationRepository } from './repositories/EmailCampaignParticipationRepository';
import { PetitionRepository } from './repositories/PetitionRepository';
import { PetitionParticipationRepository } from './repositories/PetitionParticipationRepository';
import { EmailCampaignService } from './services/EmailCampaignService';
import { PetitionService } from './services/PetitionService';
import { createLoadUser } from './middleware/auth';
import { createRequirePermission } from './middleware/requirePermission';
import authRoutes from './routes/auth';
import coHostsRoutes from './routes/admin/coHosts';
import permissionsRoutes from './routes/admin/permissions';
import emailCampaignsAdminRoutes from './routes/admin/emailCampaigns';
import petitionsAdminRoutes from './routes/admin/petitions';
import emailCampaignsRoutes from './routes/emailCampaigns';
import petitionsRoutes from './routes/petitions';
import { PERMISSIONS } from './utils/permissions';

const __dirname = dirname(fileURLToPath(import.meta.url));

const userRepo = new UserRepository();
const coHostRepo = new CoHostRepository();
const authService = new AuthService(userRepo);
const meService = new MeService(coHostRepo);
const coHostService = new CoHostService(userRepo, coHostRepo);
const loadUser = createLoadUser(userRepo);

const emailCampaignRepo = new EmailCampaignRepository();
const emailCampaignParticipationRepo = new EmailCampaignParticipationRepository();
const petitionRepo = new PetitionRepository();
const petitionParticipationRepo = new PetitionParticipationRepository();
const emailCampaignService = new EmailCampaignService(emailCampaignRepo, emailCampaignParticipationRepo);
const petitionService = new PetitionService(petitionRepo, petitionParticipationRepo);
const requireCampaignPermission = createRequirePermission(coHostRepo)(PERMISSIONS.EMAIL_CAMPAIGN);

const app = express();
app.use(express.json());

const swaggerPath = join(__dirname, '..', 'swagger-output.json');
if (existsSync(swaggerPath)) {
  const spec = JSON.parse(readFileSync(swaggerPath, 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, { persistAuthorization: true } as Record<string, unknown>));
}

app.get('/', (req, res) => {
  res.redirect(302, '/api-docs');
});

app.use('/v1/auth', authRoutes(authService, meService, loadUser));
app.use('/v1/admin/co-hosts', coHostsRoutes(coHostService, loadUser));
app.use('/v1/admin/permissions', permissionsRoutes(loadUser));
app.use('/v1/admin/email-campaigns', emailCampaignsAdminRoutes(emailCampaignService, loadUser, requireCampaignPermission));
app.use('/v1/admin/petitions', petitionsAdminRoutes(petitionService, loadUser, requireCampaignPermission));
app.use('/v1/email-campaigns', emailCampaignsRoutes(emailCampaignService));
app.use('/v1/petitions', petitionsRoutes(petitionService));

app.get('/health', (req, res) => {
  /* #swagger.tags = ['Health']
     #swagger.summary = 'Liveness check'
     #swagger.responses[200] = { description: 'OK' }
  */
  res.json({ status: 'ok' });
});

// Return JSON for JSON parse errors (invalid request body) instead of HTML
app.use((err: unknown, _req: Request, res: Response, next: (e?: unknown) => void) => {
  if (err instanceof SyntaxError && !res.headersSent) {
    res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body. Use \\n for newlines inside strings.',
        details: (err as Error).message,
      },
    });
    return;
  }
  next(err);
});

export default app;
