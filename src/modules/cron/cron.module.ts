import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScraperModule } from '@modules/scraper/scraper.module';
import { DrizzleModule } from '@infrastructure/drizzle/drizzle.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramModule } from '@modules/telegram/telegram.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ScraperModule,
    DrizzleModule,
    TelegramModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class CronModule {}
