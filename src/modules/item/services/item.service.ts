import { Injectable } from '@nestjs/common';
import {
  ItemRepo,
  ItemSelectModel,
  ItemWithValuesSelectModel,
} from '@infrastructure/drizzle/repo/item.repo';
import {
  ItemValuesRepo,
  ItemValuesSelectModel,
  ItemValuesUpdateModel,
} from '@infrastructure/drizzle/repo/item-values.repo';
import { IItemService } from './item-service.interface';

@Injectable()
export class ItemService implements IItemService {
  constructor(
    private readonly itemRepo: ItemRepo,
    private readonly itemValuesRepo: ItemValuesRepo,
  ) {}

  async findByName(name: string): Promise<ItemWithValuesSelectModel | null> {
    return this.itemRepo.findByName(name);
  }

  async findByNames(names: string[]): Promise<ItemWithValuesSelectModel[]> {
    return this.itemRepo.findByNames(names);
  }

  async findByNamesFuzzy(
    searchTerms: string[],
  ): Promise<ItemWithValuesSelectModel[]> {
    return this.itemRepo.findByNamesFuzzy(searchTerms);
  }

  async findAllWithValues(): Promise<ItemWithValuesSelectModel[]> {
    return this.itemRepo.findAllWithValues();
  }

  async updateItemValuesByItemId(
    itemId: ItemSelectModel['id'],
    values: ItemValuesUpdateModel,
  ): Promise<ItemValuesSelectModel | null> {
    return this.itemValuesRepo.updateByItemId(itemId, values);
  }
}
