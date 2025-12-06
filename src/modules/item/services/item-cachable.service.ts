import { Inject, Injectable, Logger } from '@nestjs/common';
import { ItemService } from './item.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IItemService } from './item-service.interface';
import {
  ItemValuesUpdateModel,
  ItemValuesSelectModel,
} from '@infrastructure/drizzle/repo/item-values.repo';
import {
  ItemWithValuesSelectModel,
  ItemSelectModel,
} from '@infrastructure/drizzle/repo/item.repo';
import { RedisKeys } from '@shared/enums';
import { millisecondsInDay } from 'date-fns/constants';

@Injectable()
export class ItemCachableService implements IItemService {
  private readonly logger = new Logger(ItemCachableService.name);

  constructor(
    private readonly itemService: ItemService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async findByName(name: string): Promise<ItemWithValuesSelectModel | null> {
    return this.itemService.findByName(name);
  }

  async findByNames(names: string[]): Promise<ItemWithValuesSelectModel[]> {
    return this.itemService.findByNames(names);
  }

  async findByNamesFuzzy(
    searchTerms: string[],
  ): Promise<ItemWithValuesSelectModel[]> {
    return this.itemService.findByNamesFuzzy(searchTerms);
  }

  async findAllWithValues(): Promise<ItemWithValuesSelectModel[]> {
    const cachedItems = await this.cacheService.get<
      ItemWithValuesSelectModel[]
    >(RedisKeys.ITEMS_WITH_VALUES_SUPREME);

    if (cachedItems) {
      this.logger.debug(
        `Found ${cachedItems.length} items in cache for key ${RedisKeys.ITEMS_WITH_VALUES_SUPREME}`,
      );
      return cachedItems;
    }

    this.logger.debug(
      `Not found in cache for key ${RedisKeys.ITEMS_WITH_VALUES_SUPREME}, fetching from database and caching`,
    );

    const items = await this.itemService.findAllWithValues();
    await this.cacheService.set(
      RedisKeys.ITEMS_WITH_VALUES_SUPREME,
      items,
      millisecondsInDay * 3,
    );

    return items;
  }

  async updateItemValuesByItemId(
    itemId: ItemSelectModel['id'],
    values: ItemValuesUpdateModel,
  ): Promise<ItemValuesSelectModel | null> {
    return this.itemService.updateItemValuesByItemId(itemId, values);
  }
}
