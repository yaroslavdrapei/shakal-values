import { forwardRef, Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './services/item.service';
import { ItemCachableService } from './services/item-cachable.service';
import { ScraperModule } from '@modules/scraper/scraper.module';
import { CronModule } from '@modules/cron/cron.module';

@Module({
  imports: [ScraperModule, forwardRef(() => CronModule)],
  controllers: [ItemController],
  providers: [ItemService, ItemCachableService],
  exports: [ItemService, ItemCachableService],
})
export class ItemModule {}
