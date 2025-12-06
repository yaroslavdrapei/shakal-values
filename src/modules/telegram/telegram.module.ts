import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { HttpModule } from '@nestjs/axios';
import { TelegramConfig } from '@infrastructure/config/telegram.config';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotUpdates } from './telegram.updates';
import { TelegramPhotoService } from './telegram-photo.service';
import { TelegramTextService } from './telegram-text.service';
import { AiModule } from '@modules/ai/ai.module';
import { MetricsModule } from '@modules/metrics/metrics.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      inject: [TelegramConfig],
      useFactory: (config: TelegramConfig) => ({
        token: config.token,
      }),
    }),
    HttpModule,
    AiModule,
    MetricsModule,
  ],
  providers: [
    TelegramBotService,
    TelegramBotUpdates,
    TelegramPhotoService,
    TelegramTextService,
  ],
  exports: [TelegramBotService, TelegramPhotoService, TelegramTextService],
})
export class TelegramModule {}
