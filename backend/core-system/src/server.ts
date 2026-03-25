import type { Express } from 'express';
import { config } from './config/config';
import { initializeSchema } from './db/schema';
import { pool } from './db/pool';
import { UserRepository } from './repositories/UserRepository';

type AppModule = { default: Express };
const ENTRY_POINT = (process.env.ENTRY_POINT || 'full').toLowerCase();

async function start(): Promise<void> {
  try {
    await initializeSchema();
    if (config.adminEmails.length > 0) {
      const userRepo = new UserRepository();
      for (const email of config.adminEmails) {
        const user = await userRepo.findByEmail(email);
        if (user && !config.adminIds.includes(user.id)) {
          config.adminIds.push(user.id);
          console.log('Admin resolved from email:', email);
        }
      }
    }
  } catch (err) {
    console.error('DB init error:', err);
    process.exit(1);
  }

  let app: Express;
  if (ENTRY_POINT === 'public') {
    app = ((await import('./app-public')) as AppModule).default;
    console.log('Entry: public (auth, health, Swagger)');
  } else if (ENTRY_POINT === 'private') {
    app = ((await import('./app-private')) as AppModule).default;
    console.log('Entry: private (admin, co-hosts, health)');
  } else {
    app = ((await import('./app')) as AppModule).default;
    console.log('Entry: full (all routes)');
  }

  const server = app.listen(config.port, () => {
    console.log('Core API listening on port', config.port);
  });

  process.on('SIGTERM', () => {
    server.close(() => pool.end().then(() => process.exit(0)));
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
