import { Injectable } from '@nestjs/common';
import { TradeToolsService } from './tools/trade-tools.service';
import { GeminiService } from '@infrastructure/gemini/gemini.service';
import { Part } from '@google/generative-ai';
import { systemPrompt, tradePrompt } from './trade.prompts';
import { getItemValuesTool, GetItemValuesToolArgs } from './tools/trade.tools';
import { ToolNames } from '../ai.enums';

@Injectable()
export class TradeService {
  constructor(
    private readonly tradeToolsService: TradeToolsService,
    private readonly geminiService: GeminiService,
  ) {}

  async evaluateTrade(base64Image: string) {
    const model = this.geminiService.provideGenerativeModel({
      tools: [getItemValuesTool],
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat();

    const cleanImage = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const result = await chat.sendMessage([
      {
        text: tradePrompt,
      },
      { inlineData: { mimeType: 'image/jpeg', data: cleanImage } },
    ]);

    const response = result.response;
    const toolCalls = response.functionCalls();

    if (!toolCalls || toolCalls.length === 0) {
      return response.text();
    }

    const toolResponses: Part[] = [];
    for (const call of toolCalls) {
      if (call.name === ToolNames.GET_ITEM_VALUES.toString()) {
        const args = call.args as unknown as GetItemValuesToolArgs;

        const itemValues = await this.tradeToolsService.getItemValues(args);

        toolResponses.push({
          functionResponse: {
            name: ToolNames.GET_ITEM_VALUES.toString(),
            response: {
              owner: args.owner,
              itemValues,
            },
          },
        });
      }
    }

    const finalResult = await chat.sendMessage(toolResponses);
    return finalResult.response.text();
  }
}
