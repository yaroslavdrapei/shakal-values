import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { HttpModule } from '@nestjs/axios';
import { SupremeConfig } from '@infrastructure/config/supreme.config';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [SupremeConfig],
      useFactory: (supremeConfig: SupremeConfig) => ({
        baseURL: supremeConfig.baseUrl,
      }),
    }),
  ],
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}
