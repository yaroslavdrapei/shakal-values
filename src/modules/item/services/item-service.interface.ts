import {
  ItemValuesUpdateModel,
  ItemValuesSelectModel,
} from '@infrastructure/drizzle/repo/item-values.repo';
import {
  ItemSelectModel,
  ItemWithValuesSelectModel,
} from '@infrastructure/drizzle/repo/item.repo';

export interface IItemService {
  findByName(name: string): Promise<ItemWithValuesSelectModel | null>;

  findByNames(names: string[]): Promise<ItemWithValuesSelectModel[]>;

  findByNamesFuzzy(searchTerms: string[]): Promise<ItemWithValuesSelectModel[]>;

  findAllWithValues(): Promise<ItemWithValuesSelectModel[]>;

  updateItemValuesByItemId(
    itemId: ItemSelectModel['id'],
    values: ItemValuesUpdateModel,
  ): Promise<ItemValuesSelectModel | null>;
}
