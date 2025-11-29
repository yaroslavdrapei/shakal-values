import { Global, Module } from '@nestjs/common';
import { ConfigifyModule } from '@itgorillaz/configify';
import { DatabaseConfig } from './database.config';
import { RedisConfig } from './redis.config';
import { AppConfig } from './app.config';

const providers = [AppConfig, DatabaseConfig, RedisConfig];

@Global()
@Module({
  imports: [ConfigifyModule.forRootAsync()],
  providers,
  exports: providers,
})
export class ConfigModule {}
