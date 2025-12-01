import { Injectable, Logger } from '@nestjs/common';
import { Command, Ctx, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TelegramSubscriberRepo } from '@infrastructure/drizzle/repo/telegram-subscriber.repo';
import { TradeService } from '@modules/trade/trade.service';

// TODO: use upsert everywhere ???
@Update()
@Injectable()
export class TelegramBotUpdates {
  private readonly logger = new Logger(TelegramBotUpdates.name);

  constructor(
    private readonly telegramSubscriberRepo: TelegramSubscriberRepo,
    private readonly httpService: HttpService,
    private readonly tradeService: TradeService,
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

  @Command('ask')
  async ask(@Ctx() ctx: Context) {
    if (!ctx.from || !ctx.message) return;

    const messageText = 'text' in ctx.message ? ctx.message.text : '';
    const question = messageText.replace(/^\/ask\s*/i, '').trim();

    if (!question) {
      await ctx.reply(
        'Please ask a question about MM2 items. For example:\n' +
          "• /ask what's the value of luger\n" +
          '• /ask tell me about candy and chroma\n' +
          '• /ask luger value',
      );
      return;
    }

    await ctx.reply('Let me look that up for you...');

    try {
      const result = await this.tradeService.askQuestion(question);
      await ctx.reply(result);
    } catch (error) {
      this.logger.error(
        `Error processing ask question: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      await ctx.reply(
        'Sorry, I encountered an error while processing your question. Please try again.',
      );
    }
  }

  @Command('help')
  async help(@Ctx() ctx: Context) {
    await ctx.reply(
      `/start - Start the bot
/sub - Subscribe to updates
/unsub - Unsubscribe from updates
/status - Check your subscription status
/ask - Ask about item values (e.g., "/ask what's the value of luger")
/help - Show this help message`,
    );
  }

  @On('photo')
  async handleTradeImage(@Ctx() ctx: Context) {
    if (!ctx.from || !ctx.message) return;

    if ('photo' in ctx.message && ctx.message.photo) {
      const photo = ctx.message.photo;
      const largestPhoto = photo[photo.length - 1];

      await ctx.reply('Processing your trade image...');

      try {
        const fileLink = await ctx.telegram.getFileLink(largestPhoto.file_id);

        const response = await firstValueFrom(
          this.httpService.get(fileLink.toString(), {
            responseType: 'arraybuffer',
          }),
        );

        const imageBuffer = Buffer.from(response.data);
        const base64Image = imageBuffer.toString('base64');

        const result = await this.tradeService.evaluateTrade(base64Image);

        await ctx.reply(result);
      } catch (error) {
        this.logger.error(
          `Error processing trade image: ${error instanceof Error ? error.message : String(error)}`,
        );
        await ctx.reply(
          'Sorry, I encountered an error while processing your trade image. Please try again',
        );
      }
    }
  }
}
