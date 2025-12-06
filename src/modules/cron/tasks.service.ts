import { RedisService } from '@infrastructure/redis/redis.service';
import { ItemCachableService } from '@modules/item/services/item-cachable.service';
import { ScraperService } from '@modules/scraper/scraper.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Events, RedisKeys } from '@shared/enums';
import { hashString } from '@shared/utils/hash.util';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private readonly scraperService: ScraperService,
    private readonly itemCachableService: ItemCachableService,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async scrapeItemsSupreme() {
    this.logger.log('Triggering scrape items supreme');

    const newChangeLog = await this.scraperService.getChangeLog();
    const newHash = hashString(newChangeLog);

    const oldHash = await this.redisService.get(
      RedisKeys.CHANGE_LOG_HASH_SUPREME,
    );

    if (oldHash === newHash) {
      this.logger.log('No changes detected, skip scraping');
      return;
    }

    this.logger.log('Changed detected, start scraping');

    const existingItems = await this.itemCachableService.findAllWithValues();
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
        await this.itemCachableService.updateItemValuesByItemId(
          existingItem.id,
          {
            value: newItem.value,
            stability: newItem.stability,
            demand: newItem.demand,
            rarity: newItem.rarity,
          },
        );
        updatedItems++;
      } else {
        this.logger.warn(
          `Item ${newItem.name} ${newItem.type} ${newItem.origin} not found in database`,
        );
        failedItems++;
      }
    }

    this.logger.log(`Updated items: ${updatedItems}`);
    if (failedItems > 0) {
      this.logger.warn(`Failed to update items: ${failedItems}`);
    }

    await this.redisService.set(RedisKeys.CHANGE_LOG_HASH_SUPREME, newHash);

    // clear cache so next time we can get the latest items
    await this.cacheService.del(RedisKeys.ITEMS_WITH_VALUES_SUPREME);
    this.eventEmitter.emit(Events.ITEMS_UPDATED);
  }
}
