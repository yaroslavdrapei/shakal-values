import { forwardRef, Module } from '@nestjs/common';
import { TradeToolsService } from './trade/tools/trade-tools.service';
import { TradeService } from './trade/trade.service';
import { InvToolsService } from './inv/tools/inv-tools.service';
import { InvService } from './inv/inv.service';
import { AskToolsService } from './ask/tools/ask-tools.service';
import { AskService } from './ask/ask.service';
import { GeminiModule } from '@infrastructure/gemini/gemini.module';
import { ItemModule } from '@modules/item/item.module';

@Module({
  imports: [forwardRef(() => ItemModule), GeminiModule],
  providers: [
    TradeToolsService,
    TradeService,
    InvToolsService,
    InvService,
    AskToolsService,
    AskService,
  ],
  exports: [TradeService, InvService, AskService],
})
export class AiModule {}
