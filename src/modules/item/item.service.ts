import { Injectable } from '@nestjs/common';
import {
  ItemRepo,
  ItemWithValuesSelectModel,
} from '@infrastructure/drizzle/repo/item.repo';

@Injectable()
export class ItemService {
  constructor(private readonly itemRepo: ItemRepo) {}

  async findAllWithValues(): Promise<ItemWithValuesSelectModel[]> {
    return this.itemRepo.findAllWithValues();
  }
}
