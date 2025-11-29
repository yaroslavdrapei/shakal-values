import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { ScraperModule } from '@modules/scraper/scraper.module';
import { CronModule } from '@modules/cron/cron.module';

@Module({
  imports: [ScraperModule, CronModule],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
