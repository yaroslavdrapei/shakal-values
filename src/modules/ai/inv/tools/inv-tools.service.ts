import { ItemRepo } from '@infrastructure/drizzle/repo/item.repo';
import { Injectable } from '@nestjs/common';
import {
  GetInventoryItemsToolArgs,
  GetInventoryItemsToolResponse,
} from './inv.tools';
import { stringToNumber } from '@shared/utils/string-to-number.util';

@Injectable()
export class InvToolsService {
  constructor(private readonly itemRepo: ItemRepo) {}

  async getInventoryItems({
    items,
  }: GetInventoryItemsToolArgs): Promise<GetInventoryItemsToolResponse> {
    let totalValue = 0;
    const itemData: GetInventoryItemsToolResponse['itemsData'] = [];

    for (const aiItem of items) {
      const item = await this.itemRepo.findByName(aiItem.name);
      if (!item) continue;

      const normalizedValue = stringToNumber(item.values.value);
      const localValue = normalizedValue * aiItem.count;
      totalValue += localValue;

      itemData.push({
        name: aiItem.name,
        count: aiItem.count,
        value: localValue,
      });
    }

    return {
      totalValue,
      itemsData: itemData,
    };
  }
}
