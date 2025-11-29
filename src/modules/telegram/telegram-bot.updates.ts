import { Injectable, Logger } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramSubscriberRepo } from '@infrastructure/drizzle/repo/telegram-subscriber.repo';

// TODO: use upsert everywhere ???
@Update()
@Injectable()
export class TelegramBotUpdates {
  private readonly logger = new Logger(TelegramBotUpdates.name);
  constructor(
    private readonly telegramSubscriberRepo: TelegramSubscriberRepo,
  ) {}

  @Command('start')
  async start(@Ctx() ctx: Context) {
    if (!ctx.from) return;

    const chatId = ctx.from.id;
    const username = ctx.from.username;

    const existing = await this.telegramSubscriberRepo.findByChatId(chatId);

    if (!existing) {
      await this.telegramSubscriberRepo.create({
        chatId,
        username,
        subscribed: false,
      });
    }

    this.logger.log(`User ${username} started the bot`);

    await ctx.reply(
      'Welcome! This bot will send you updates when new values are available. Use /sub to subscribe to updates. If you want to unsubscribe, use /unsub',
    );
  }

  @Command('sub')
  async subscribe(@Ctx() ctx: Context) {
    if (!ctx.from) return;

    const chatId = ctx.from.id;
    const username = ctx.from.username;

    await this.telegramSubscriberRepo.upsert(chatId, username, true);

    this.logger.log(`User ${username} subscribed to updates`);
    await ctx.reply(`You've subscribed to updates`);
  }

  @Command('unsub')
  async unsubscribe(@Ctx() ctx: Context) {
    if (!ctx.from) return;

    const chatId = ctx.from.id;
    const username = ctx.from.username;

    await this.telegramSubscriberRepo.upsert(chatId, username, false);

    this.logger.log(`User ${username} unsubscribed from updates`);
    await ctx.reply(`You've unsubscribed from updates`);
  }

  @Command('status')
  async status(@Ctx() ctx: Context) {
    if (!ctx.from) return;

    const chatId = ctx.from.id;
    const username = ctx.from.username;

    let subscriber = await this.telegramSubscriberRepo.findByChatId(chatId);

    if (!subscriber) {
      subscriber = await this.telegramSubscriberRepo.create({
        chatId,
        username,
        subscribed: false,
      });
    }

    const statusText = subscriber.subscribed
      ? 'You are subscribed to updates'
      : 'You are not subscribed to updates';

    await ctx.reply(statusText);
  }

  @Command('help')
  async help(@Ctx() ctx: Context) {
    await ctx.reply(
      `/start - Start the bot
/sub - Subscribe to updates
/unsub - Unsubscribe from updates
/status - Check your subscription status
/help - Show this help message`,
    );
  }
}
