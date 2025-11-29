import { Module } from '@nestjs/common';
import { ConfigModule } from '@infrastructure/config/config.module';
import { DrizzleModule } from '@infrastructure/drizzle/drizzle.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { ItemModule } from '@modules/item/item.module';
import { MapperModule } from '@modules/mapper/mapper.module';

@Module({
  imports: [ConfigModule, DrizzleModule, RedisModule, MapperModule, ItemModule],
})
export class AppModule {}
