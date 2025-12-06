import { TelegramSubscriberRepo } from '@infrastructure/drizzle/repo/telegram-subscriber.repo';
import { AskService } from '@modules/ai/ask/ask.service';
import { MetricsService } from '@modules/metrics/metrics.service';
import { FeatureUsage, MetricSource } from '@modules/metrics/metrics.enums';
import { Injectable, Logger } from '@nestjs/common';
import { Context } from 'telegraf';

@Injectable()
export class TelegramTextService {
  private readonly logger = new Logger(TelegramTextService.name);

  constructor(
    private readonly telegramSubscriberRepo: TelegramSubscriberRepo,
    private readonly askService: AskService,
    private readonly metricsService: MetricsService,
  ) {}

  async start(ctx: Context) {
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

  async subscribe(ctx: Context) {
    if (!ctx.from) return;

    const chatId = ctx.from.id;
    const username = ctx.from.username;

    await this.telegramSubscriberRepo.upsert(chatId, username, true);

    this.logger.log(`User ${username} subscribed to updates`);
    await ctx.reply(`You've subscribed to updates`);
  }

  async unsubscribe(ctx: Context) {
    if (!ctx.from) return;

    const chatId = ctx.from.id;
    const username = ctx.from.username;

    await this.telegramSubscriberRepo.upsert(chatId, username, false);

    this.logger.log(`User ${username} unsubscribed from updates`);
    await ctx.reply(`You've unsubscribed from updates`);
  }

  async status(ctx: Context) {
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

  async ask(ctx: Context) {
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
      const result = await this.askService.askQuestion(question);
      await ctx.reply(result);
      await this.metricsService.createFeatureUsageMetric({
        feature: FeatureUsage.ASK,
        success: true,
        source: MetricSource.TELEGRAM,
        chatId: ctx.from.id,
        metadata: {
          question,
          answer: result,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error processing ask question: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      await ctx.reply(
        'Sorry, I encountered an error while processing your question. Please try again.',
      );
      await this.metricsService.createFeatureUsageMetric({
        feature: FeatureUsage.ASK,
        success: false,
        source: MetricSource.TELEGRAM,
        chatId: ctx.from.id,
        metadata: {
          question,
          error,
        },
      });
    }
  }
}
