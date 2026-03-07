import express, { type Express } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/config';
import { resolveSwaggerSpecPath } from './utils/swaggerSpecPath';
import { UserRepository } from './repositories/UserRepository';
import { CoHostRepository } from './repositories/CoHostRepository';
import { AuthService } from './services/AuthService';
import { MeService } from './services/MeService';
import { EmailCampaignRepository } from './repositories/EmailCampaignRepository';
import { EmailCampaignParticipationRepository } from './repositories/EmailCampaignParticipationRepository';
import { PetitionRepository } from './repositories/PetitionRepository';
import { PetitionParticipationRepository } from './repositories/PetitionParticipationRepository';
import { EmailCampaignService } from './services/EmailCampaignService';
import { PetitionService } from './services/PetitionService';
import { createLoadUser } from './middleware/auth';
import { filterSpecByEntry } from './utils/swaggerSpecByEntry';
import authRoutes from './routes/auth';
import emailCampaignsRoutes from './routes/emailCampaigns';
import petitionsRoutes from './routes/petitions';

const __dirname = dirname(fileURLToPath(import.meta.url));

const userRepo = new UserRepository();
const coHostRepo = new CoHostRepository();
const authService = new AuthService(userRepo);
const meService = new MeService(coHostRepo);
const loadUser = createLoadUser(userRepo);

const emailCampaignRepo = new EmailCampaignRepository();
const emailCampaignParticipationRepo = new EmailCampaignParticipationRepository();
const petitionRepo = new PetitionRepository();
const petitionParticipationRepo = new PetitionParticipationRepository();
const emailCampaignService = new EmailCampaignService(emailCampaignRepo, emailCampaignParticipationRepo);
const petitionService = new PetitionService(petitionRepo, petitionParticipationRepo);

const app: Express = express();
app.use(express.json());

const swaggerPath = resolveSwaggerSpecPath(__dirname);
if (swaggerPath) {
  const fullSpec = JSON.parse(readFileSync(swaggerPath, 'utf8'));
  const spec = filterSpecByEntry(fullSpec, 'public');
  spec.servers = [{ url: `${config.baseUrl}/v1`, description: 'v1' }];
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, { persistAuthorization: true } as Record<string, unknown>));
} else {
  console.warn('Swagger: swagger-output.json not found. Endpoints will not show in /api-docs. Use "npm start" or add "node dist/swagger.js --generate-only" to build.');
}

app.get('/', (_req, res) => {
  res.redirect(302, '/api-docs');
});

app.use('/v1/auth', authRoutes(authService, meService, loadUser));
app.use('/v1/email-campaigns', emailCampaignsRoutes(emailCampaignService));
app.use('/v1/petitions', petitionsRoutes(petitionService));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, next: (e?: unknown) => void) => {
  if (err instanceof SyntaxError && !res.headersSent) {
    res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body. Use \\n for newlines inside strings.', details: (err as Error).message },
    });
    return;
  }
  next(err);
});

export default app;
