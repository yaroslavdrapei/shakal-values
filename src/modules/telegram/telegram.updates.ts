import { Injectable } from '@nestjs/common';
import { Command, Ctx, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { PhotoContext } from './telegram.types';
import { TelegramPhotoService } from './telegram-photo.service';
import { TelegramTextService } from './telegram-text.service';

// TODO: add validation + type + logs for .from property
@Update()
@Injectable()
export class TelegramBotUpdates {
  constructor(
    private readonly telegramTextService: TelegramTextService,
    private readonly telegramPhotoService: TelegramPhotoService,
  ) {}

  @Command('start')
  async start(@Ctx() ctx: Context) {
    await this.telegramTextService.start(ctx);
  }

  @Command('sub')
  async subscribe(@Ctx() ctx: Context) {
    await this.telegramTextService.subscribe(ctx);
  }

  @Command('unsub')
  async unsubscribe(@Ctx() ctx: Context) {
    await this.telegramTextService.unsubscribe(ctx);
  }

  @Command('status')
  async status(@Ctx() ctx: Context) {
    await this.telegramTextService.status(ctx);
  }

  @Command('ask')
  async ask(@Ctx() ctx: Context) {
    await this.telegramTextService.ask(ctx);
  }

  @Command('help')
  async help(@Ctx() ctx: Context) {
    await ctx.reply(
      `/start - Start the bot
/sub - Subscribe to updates
/unsub - Unsubscribe from updates
/status - Check your subscription status
/ask - Ask about item values (e.g., "/ask what's the value of luger")
/help - Show this help message
/trade - AI evaluation of your trade (attach screenshot)
/inv - AI calculation of total inventory value (attach screenshot)`,
    );
  }

  @On('photo')
  async handlePhoto(@Ctx() ctx: PhotoContext) {
    if (!ctx.from || !ctx.message) return;

    const caption = ctx.message.caption ?? '';

    switch (caption) {
      case '/trade':
        await this.telegramPhotoService.handleTradeImage(ctx);
        break;
      case '/inv':
        await this.telegramPhotoService.handleInventoryImage(ctx);
        break;
      default:
        return;
    }
  }
}
