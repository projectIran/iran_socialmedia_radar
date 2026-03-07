import pg from 'pg';
import { config } from '../config/config';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl!,
  max: 10,
  idleTimeoutMillis: 30000,
});
