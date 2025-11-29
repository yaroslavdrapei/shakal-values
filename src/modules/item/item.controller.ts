import { Controller, Get, Post } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemResponseDto } from './dto/response/item.dto';
import { DtoMapper } from '@modules/mapper/dto.mapper';
import { TasksService } from '@modules/cron/tasks.service';

@Controller('items')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly tasksService: TasksService,
    private readonly dtoMapper: DtoMapper,
  ) {}

  @Get()
  async getItems(): Promise<ItemResponseDto[]> {
    const items = await this.itemService.findAllWithValues();

    return this.dtoMapper.mapItemWithValuesToItemResponseDtoList(items);
  }

  @Post('scrape')
  async scrapeItems(): Promise<void> {
    await this.tasksService.scrapeItemsSupreme();
  }
}
