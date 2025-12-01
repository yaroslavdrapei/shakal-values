import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { TelegramSubscriberRepo } from '@infrastructure/drizzle/repo/telegram-subscriber.repo';

@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    @InjectBot()
    private readonly bot: Telegraf,
    private readonly telegramSubscriberRepo: TelegramSubscriberRepo,
  ) {}

  async sendMessage(message: string): Promise<void> {
    const subscribers = await this.telegramSubscriberRepo.findAllSubscribed();

    for (const subscriber of subscribers) {
      try {
        await this.bot.telegram.sendMessage(subscriber.chatId, message);
      } catch (error) {
        this.logger.error(
          `Failed to send message to chatId ${subscriber.chatId}: ${error}`,
        );
      }
    }
  }
}
