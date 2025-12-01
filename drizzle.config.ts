import 'dotenv/config';

import type { Config } from 'drizzle-kit';

export default {
  dialect: 'postgresql',
  out: './src/infrastructure/drizzle/migrations',
  schema: './src/infrastructure/drizzle/schema',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
