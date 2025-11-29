import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './infrastructure/config/config.module';
import { DrizzleModule } from './infrastructure/drizzle/drizzle.module';
import { RedisModule } from './infrastructure/redis/redis.module';

@Module({
  imports: [ConfigModule, DrizzleModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
