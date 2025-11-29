import { Global, Module } from '@nestjs/common';
import { DtoMapper } from './dto.mapper';

@Global()
@Module({
  providers: [DtoMapper],
  exports: [DtoMapper],
})
export class MapperModule {}
