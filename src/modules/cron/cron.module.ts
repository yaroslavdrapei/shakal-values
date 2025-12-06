import { forwardRef, Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScraperModule } from '@modules/scraper/scraper.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ItemModule } from '@modules/item/item.module';
import { MetricsModule } from '@modules/metrics/metrics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ScraperModule,
    forwardRef(() => ItemModule),
    MetricsModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class CronModule {}
