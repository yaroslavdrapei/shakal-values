import {
  ItemCategory,
  ItemSource,
  ItemStability,
  ItemType,
} from '../../item.enums';

export class ItemResponseDto {
  id: string;
  name: string;
  type: ItemType;
  origin: string;
  category: ItemCategory;
  class: ItemType | null;
  value: string | null;
  stability: ItemStability | null;
  demand: number | null;
  rarity: number | null;
  source: ItemSource;
  createdAt: string;
  updatedAt: string;
}
