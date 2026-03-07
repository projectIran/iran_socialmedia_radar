import express, { type Express } from 'express';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swaggerUi from 'swagger-ui-express';
import { UserRepository } from './repositories/UserRepository';
import { CoHostRepository } from './repositories/CoHostRepository';
import { AuthService } from './services/AuthService';
import { MeService } from './services/MeService';
import { createLoadUser } from './middleware/auth';
import { filterSpecByEntry } from './utils/swaggerSpecByEntry';
import authRoutes from './routes/auth';

const __dirname = dirname(fileURLToPath(import.meta.url));

const userRepo = new UserRepository();
const coHostRepo = new CoHostRepository();
const authService = new AuthService(userRepo);
const meService = new MeService(coHostRepo);
const loadUser = createLoadUser(userRepo);

const app: Express = express();
app.use(express.json());

const swaggerPath = join(__dirname, '..', 'swagger-output.json');
if (existsSync(swaggerPath)) {
  const fullSpec = JSON.parse(readFileSync(swaggerPath, 'utf8'));
  const spec = filterSpecByEntry(fullSpec, 'public');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, { persistAuthorization: true } as Record<string, unknown>));
}

app.get('/', (_req, res) => {
  res.redirect(302, '/api-docs');
});

app.use('/v1/auth', authRoutes(authService, meService, loadUser));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
