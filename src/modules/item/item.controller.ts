import { Controller, Get } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemResponseDto } from './dto/response/item.dto';
import { DtoMapper } from '@modules/mapper/dto.mapper';

@Controller('items')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly dtoMapper: DtoMapper,
  ) {}

  @Get()
  async getItems(): Promise<ItemResponseDto[]> {
    const items = await this.itemService.findAllWithValues();

    return this.dtoMapper.mapItemWithValuesToItemResponseDtoList(items);
  }
}
