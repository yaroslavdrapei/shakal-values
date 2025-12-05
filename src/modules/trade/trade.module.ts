import { DrizzleModule } from '@infrastructure/drizzle/drizzle.module';
import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { GeminiModule } from '@infrastructure/gemini/gemini.module';

@Module({
  imports: [DrizzleModule, GeminiModule],
  providers: [TradeService],
  exports: [TradeService],
})
export class TradeModule {}
