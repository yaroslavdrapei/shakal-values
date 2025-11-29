import { ItemType } from '@modules/item/item.enums';

export function pageToTypeMapper(page: string): ItemType | null {
  switch (page) {
    case 'uniques':
      return ItemType.UNIQUE;
    case 'ancients':
      return ItemType.ANCIENT;
    case 'godlies':
      return ItemType.GODLY;
    case 'legendaries':
      return ItemType.LEGENDARY;
    case 'rares':
      return ItemType.RARE;
    case 'uncommons':
      return ItemType.UNCOMMON;
    case 'commons':
      return ItemType.COMMON;
    case 'misc':
      return ItemType.MISC;
    case 'pets':
      return ItemType.PET;
    case 'vintages':
      return ItemType.VINTAGE;
    case 'chromas':
      return ItemType.CHROMA;
    default:
      return null;
  }
}
