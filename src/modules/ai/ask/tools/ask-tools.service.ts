import { Injectable } from '@nestjs/common';
import { GetItemByNameFuzzyToolArgs } from './ask.tools';
import { ItemService } from '@modules/item/item.service';

@Injectable()
export class AskToolsService {
  constructor(private readonly itemService: ItemService) {}

  async getItemByNameFuzzy({ names }: GetItemByNameFuzzyToolArgs) {
    return await this.itemService.findByNamesFuzzy(names);
  }
}
