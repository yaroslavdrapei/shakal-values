import { ItemStability } from '@modules/item/item.enums';

export function stringToStabilityMapper(
  stability: string,
): ItemStability | null {
  const stabilityLower = stability.toLowerCase();

  switch (stabilityLower) {
    case 'rising':
      return ItemStability.RISING;
    case 'overpaid for':
      return ItemStability.OVERPAID_FOR;
    case 'doing well':
      return ItemStability.DOING_WELL;
    case 'improving':
      return ItemStability.IMPROVING;
    case 'fluctuating':
      return ItemStability.FLUCTUATING;
    case 'receding':
      return ItemStability.RECEDING;
    case 'stable':
      return ItemStability.STABLE;
    case 'underpaid for':
      return ItemStability.UNDERPAID_FOR;
    case 'decreasing':
      return ItemStability.DECREASING;
    case 'unsafe':
      return ItemStability.UNSAFE;
    default:
      return null;
  }
}
