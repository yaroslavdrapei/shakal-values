/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ItemSelectModel } from '@infrastructure/drizzle/repo/item.repo';
import { ItemValuesSelectModel } from '@infrastructure/drizzle/repo/item-values.repo';

export type FoundItem = Pick<
  ItemSelectModel,
  'name' | 'type' | 'origin' | 'class'
> &
  Pick<ItemValuesSelectModel, 'value' | 'stability' | 'demand' | 'rarity'>;

export function isFoundItemTypeGuard(obj: any): obj is FoundItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.origin === 'string' &&
    (obj.class === undefined || typeof obj.class === 'string') &&
    typeof obj.value === 'string' &&
    typeof obj.stability === 'string' &&
    typeof obj.demand === 'string' &&
    typeof obj.rarity === 'string'
  );
}
