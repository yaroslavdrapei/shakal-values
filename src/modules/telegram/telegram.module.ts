import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { HttpModule } from '@nestjs/axios';
import { TelegramConfig } from '@infrastructure/config/telegram.config';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotUpdates } from './telegram-bot.updates';
import { DrizzleModule } from '@infrastructure/drizzle/drizzle.module';
import { TradeModule } from '@modules/trade/trade.module';

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
    TradeModule,
  ],
  providers: [TelegramBotService, TelegramBotUpdates],
  exports: [TelegramBotService],
})
export class TelegramModule {}
