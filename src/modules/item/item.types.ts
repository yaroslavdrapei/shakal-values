/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ItemSelectModel } from '@infrastructure/drizzle/repo/item.repo';
import { ItemValuesSelectModel } from '@infrastructure/drizzle/repo/item-values.repo';
import { stringToStabilityMapper } from '@modules/mapper/string-to-stability.mapper';
import { pageToTypeMapper } from '@modules/mapper/page-to-type.mapper';

export type FoundItem = Pick<
  ItemSelectModel,
  'name' | 'type' | 'origin' | 'class'
> &
  Pick<
    ItemValuesSelectModel,
    'value' | 'stability' | 'demand' | 'rarity' | 'rangedValue'
  >;

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
    typeof obj.rarity === 'string' &&
    (obj.rangedValue === undefined ||
      (typeof obj.rangedValue === 'object' &&
        typeof obj.rangedValue.min === 'number' &&
        typeof obj.rangedValue.max === 'number'))
  );
}

export function validateFoundItem(item: FoundItem): FoundItem | null {
  const { stability, type, demand, rarity } = item;

  const stabilityValid = stringToStabilityMapper(stability);
  const typeValid = pageToTypeMapper(type);

  // TODO: don't let '' be a valid demand or rarity
  const demandValid = demand == '' ? '0' : demand;
  const rarityValid = rarity == '' ? '0' : rarity;

  if (stabilityValid !== null && typeValid !== null) {
    return {
      ...item,
      stability: stabilityValid,
      type: typeValid,
      demand: demandValid,
      rarity: rarityValid,
    };
  }

  return null;
}
