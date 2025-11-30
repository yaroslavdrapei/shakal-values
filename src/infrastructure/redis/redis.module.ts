import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';
import { RedisConfig } from '../config/redis.config';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [RedisConfig],
      useFactory: (config: RedisConfig) => {
        return new Redis(config.url);
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
