import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { HttpModule } from '@nestjs/axios';
import { TelegramConfig } from '@infrastructure/config/telegram.config';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotUpdates } from './telegram.updates';
import { DrizzleModule } from '@infrastructure/drizzle/drizzle.module';
import { TelegramPhotoService } from './telegram-photo.service';
import { TelegramTextService } from './telegram-text.service';
import { AiModule } from '@modules/ai/ai.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      inject: [TelegramConfig],
      useFactory: (config: TelegramConfig) => ({
        token: config.token,
      }),
    }),
    HttpModule,
    DrizzleModule,
    AiModule,
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
