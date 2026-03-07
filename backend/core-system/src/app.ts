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
import { createLoadUser } from './middleware/auth';
import authRoutes from './routes/auth';
import coHostsRoutes from './routes/admin/coHosts';
import permissionsRoutes from './routes/admin/permissions';

const __dirname = dirname(fileURLToPath(import.meta.url));

const userRepo = new UserRepository();
const coHostRepo = new CoHostRepository();
const authService = new AuthService(userRepo);
const meService = new MeService(coHostRepo);
const coHostService = new CoHostService(userRepo, coHostRepo);
const loadUser = createLoadUser(userRepo);

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

app.get('/health', (req, res) => {
  /* #swagger.tags = ['Health']
     #swagger.summary = 'Liveness check'
     #swagger.responses[200] = { description: 'OK' }
  */
  res.json({ status: 'ok' });
});

export default app;
