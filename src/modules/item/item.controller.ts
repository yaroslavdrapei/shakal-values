import { Controller, Get, Post } from '@nestjs/common';
import { ItemResponseDto } from './dto/response/item.dto';
import { DtoMapper } from '@modules/mapper/dto.mapper';
import { TasksService } from '@modules/cron/tasks.service';
import { ItemCachableService } from './services/item-cachable.service';

@Controller('items')
export class ItemController {
  constructor(
    private readonly itemCacheableService: ItemCachableService,
    private readonly tasksService: TasksService,
    private readonly dtoMapper: DtoMapper,
  ) {}

  @Get()
  async getItems(): Promise<ItemResponseDto[]> {
    const items = await this.itemCacheableService.findAllWithValues();

    return this.dtoMapper.mapItemWithValuesToItemResponseDtoList(items);
  }

  @Post('scrape')
  async scrapeItems(): Promise<void> {
    await this.tasksService.scrapeItemsSupreme();
  }
}
