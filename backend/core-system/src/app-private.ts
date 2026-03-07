import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swaggerUi from 'swagger-ui-express';
import { UserRepository } from './repositories/UserRepository';
import { CoHostRepository } from './repositories/CoHostRepository';
import { CoHostService } from './services/CoHostService';
import { createLoadUser } from './middleware/auth';
import { filterSpecByEntry } from './utils/swaggerSpecByEntry';
import coHostsRoutes from './routes/admin/coHosts';
import permissionsRoutes from './routes/admin/permissions';

const __dirname = dirname(fileURLToPath(import.meta.url));

const userRepo = new UserRepository();
const coHostRepo = new CoHostRepository();
const coHostService = new CoHostService(userRepo, coHostRepo);
const loadUser = createLoadUser(userRepo);

const app = express();
app.use(express.json());

const swaggerPath = join(__dirname, '..', 'swagger-output.json');
if (existsSync(swaggerPath)) {
  const fullSpec = JSON.parse(readFileSync(swaggerPath, 'utf8'));
  const spec = filterSpecByEntry(fullSpec, 'private');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, { persistAuthorization: true } as Record<string, unknown>));
}

app.use('/v1/admin/co-hosts', coHostsRoutes(coHostService, loadUser));
app.use('/v1/admin/permissions', permissionsRoutes(loadUser));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
