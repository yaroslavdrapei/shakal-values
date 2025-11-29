import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScraperModule } from '@modules/scraper/scraper.module';
import { DrizzleModule } from '@infrastructure/drizzle/drizzle.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), ScraperModule, DrizzleModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class CronModule {}
