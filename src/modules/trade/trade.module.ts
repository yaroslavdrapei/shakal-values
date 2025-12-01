import { DrizzleModule } from '@infrastructure/drizzle/drizzle.module';
import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';

@Module({
  imports: [DrizzleModule],
  providers: [TradeService],
  exports: [TradeService],
})
export class TradeModule {}
