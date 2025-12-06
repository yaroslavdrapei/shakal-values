import { ItemWithValuesSelectModel } from '@infrastructure/drizzle/repo/item.repo';
import { ItemResponseDto } from '@modules/item/dto/response/item.dto';
import { ItemSource, ItemStability } from '@modules/item/item.enums';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DtoMapper {
  public mapItemWithValuesToItemResponseDto(
    item: ItemWithValuesSelectModel,
  ): ItemResponseDto {
    return {
      id: item.id,
      name: item.name,
      type: item.type,
      origin: item.origin,
      category: item.category,
      class: item.class,
      value: item.values?.value ?? null,
      stability: (item.values?.stability as ItemStability) ?? null,
      demand: item.values?.demand ? Number(item.values.demand) : null,
      rarity: item.values?.rarity ? Number(item.values.rarity) : null,
      rangedValue: item.values?.rangedValue ?? null,
      source: ItemSource.SUPREME,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  public mapItemWithValuesToItemResponseDtoList(
    items: ItemWithValuesSelectModel[],
  ): ItemResponseDto[] {
    return items.map((item) => this.mapItemWithValuesToItemResponseDto(item));
  }
}
