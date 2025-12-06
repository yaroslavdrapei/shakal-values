import { Injectable } from '@nestjs/common';
import { GetItemValuesToolArgs } from './trade.tools';
import { ItemService } from '@modules/item/item.service';

@Injectable()
export class TradeToolsService {
  constructor(private readonly itemService: ItemService) {}

  async getItemValues({ items }: GetItemValuesToolArgs) {
    return await this.itemService.findByNames(items);
  }
}
