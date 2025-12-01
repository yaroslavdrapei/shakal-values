import { Module } from '@nestjs/common';
import { ConfigModule } from '@infrastructure/config/config.module';
import { DrizzleModule } from '@infrastructure/drizzle/drizzle.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { ItemModule } from '@modules/item/item.module';
import { MapperModule } from '@modules/mapper/mapper.module';
import { ScraperModule } from '@modules/scraper/scraper.module';
import { CronModule } from '@modules/cron/cron.module';
import { TelegramModule } from '@modules/telegram/telegram.module';

@Module({
  imports: [
    ConfigModule,
    DrizzleModule,
    RedisModule,
    MapperModule,
    ItemModule,
    ScraperModule,
    CronModule,
    TelegramModule,
  ],
})
export class AppModule {}
