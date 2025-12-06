import { Injectable } from '@nestjs/common';
import { GetItemValuesToolArgs } from './trade.tools';
import { ItemRepo } from '@infrastructure/drizzle/repo/item.repo';

@Injectable()
export class TradeToolsService {
  constructor(private readonly itemRepo: ItemRepo) {}

  async getItemValues({ items }: GetItemValuesToolArgs) {
    return await this.itemRepo.findByNames(items);
  }
}
