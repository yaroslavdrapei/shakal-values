import { ItemValuesRepo } from '@infrastructure/drizzle/repo/item-values.repo';
import { ItemRepo } from '@infrastructure/drizzle/repo/item.repo';
import { RedisService } from '@infrastructure/redis/redis.service';
import { ScraperService } from '@modules/scraper/scraper.service';
import { TelegramBotService } from '@modules/telegram/telegram-bot.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { hashString } from '@shared/utils/hash.util';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private readonly scraperService: ScraperService,
    private readonly itemRepo: ItemRepo,
    private readonly itemValuesRepo: ItemValuesRepo,
    private readonly redisService: RedisService,
    private readonly telegramBotService: TelegramBotService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async scrapeItemsSupreme() {
    this.logger.log('Triggering scrape items supreme');

    const newChangeLog = await this.scraperService.getChangeLog();
    const newHash = hashString(newChangeLog);

    const oldHash = await this.redisService.get(`change-log-hash-supreme`);
    if (oldHash === newHash) {
      this.logger.log('No changes detected, skip scraping');
      return;
    }

    this.logger.log('Changed detected, start scraping');

    const existingItems = await this.itemRepo.findAllWithValues();
    this.logger.log(`Found ${existingItems.length} existing items`);

    const newItems = await this.scraperService.getItems();

    this.logger.log(`Found ${newItems.length} new items`);

    let updatedItems = 0;
    let failedItems = 0;
    for (const newItem of newItems) {
      const existingItem = existingItems.find(
        (i) =>
          i.name === newItem.name &&
          i.type === newItem.type &&
          i.origin === newItem.origin,
      );

      if (existingItem) {
        await this.itemValuesRepo.updateByItemId(existingItem.id, {
          value: newItem.value,
          stability: newItem.stability,
          demand: newItem.demand,
          rarity: newItem.rarity,
        });
        updatedItems++;
      } else {
        this.logger.warn(
          `Item ${newItem.name} ${newItem.type} ${newItem.origin} not found in database`,
        );
        failedItems++;
      }
    }

    this.logger.log(`Updated items: ${updatedItems}`);
    this.logger.log(`Failed to update items: ${failedItems}`);

    await this.redisService.set(`change-log-hash-supreme`, newHash);

    await this.telegramBotService.notifySubscribers(
      'Values have been updated! Check out the website for the latest information',
    );
  }
}
