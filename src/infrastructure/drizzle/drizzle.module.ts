import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';
import { DatabaseConfig } from '../config/database.config';
import {
  CONNECT_TIMEOUT_IN_SECONDS,
  IDLE_CONNECTION_TIMEOUT_IN_SECONDS,
  POSTGRES_CONNECTION,
} from './drizzle.constants';
import { PostgresDatabase } from './drizzle.types';

@Global()
@Module({
  providers: [
    {
      provide: POSTGRES_CONNECTION,
      inject: [DatabaseConfig],
      useFactory: (config: DatabaseConfig): PostgresDatabase => {
        const uri = config.databaseUrl;
        const client = postgres(uri, {
          max: 10,
          idle_timeout: IDLE_CONNECTION_TIMEOUT_IN_SECONDS,
          connect_timeout: CONNECT_TIMEOUT_IN_SECONDS,
        });

        return drizzle(client, { schema });
      },
    },
  ],
  exports: [POSTGRES_CONNECTION],
})
export class DrizzleModule {}
