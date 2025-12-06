import { forwardRef, Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScraperModule } from '@modules/scraper/scraper.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramModule } from '@modules/telegram/telegram.module';
import { ItemModule } from '@modules/item/item.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ScraperModule,
    forwardRef(() => TelegramModule),
    forwardRef(() => ItemModule),
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class CronModule {}
