import { ItemRepo } from '@infrastructure/drizzle/repo/item.repo';
import { Injectable } from '@nestjs/common';
import { GetItemByNameFuzzyToolArgs } from './ask.tools';

@Injectable()
export class AskToolsService {
  constructor(private readonly itemRepo: ItemRepo) {}

  async getItemByNameFuzzy({ names }: GetItemByNameFuzzyToolArgs) {
    return await this.itemRepo.findByNamesFuzzy(names);
  }
}
