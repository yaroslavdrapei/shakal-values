import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { TelegramSubscriberRepo } from '@infrastructure/drizzle/repo/telegram-subscriber.repo';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '@shared/enums';

@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    @InjectBot()
    private readonly bot: Telegraf,
    private readonly telegramSubscriberRepo: TelegramSubscriberRepo,
  ) {}

  @OnEvent(Events.ITEMS_UPDATED)
  async handleItemsUpdated(): Promise<void> {
    const subscribers = await this.telegramSubscriberRepo.findAllSubscribed();

    for (const subscriber of subscribers) {
      try {
        await this.bot.telegram.sendMessage(
          subscriber.chatId,
          'Values have been updated! Check out the website for the latest information',
        );
      } catch (error) {
        this.logger.error(
          `Failed to send message to chatId ${subscriber.chatId}: ${String(error)}`,
        );
      }
    }
  }
}
