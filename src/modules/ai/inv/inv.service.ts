import { GeminiService } from '@infrastructure/gemini/gemini.service';
import { InvToolsService } from './tools/inv-tools.service';
import { Part } from '@google/generative-ai';
import { systemPrompt } from './inv.prompts';
import { Injectable } from '@nestjs/common';
import { inventoryPrompt } from './inv.prompts';
import {
  getInventoryItemsTool,
  GetInventoryItemsToolArgs,
} from './tools/inv.tools';
import { ToolNames } from '../ai.enums';

@Injectable()
export class InvService {
  constructor(
    private readonly invToolsService: InvToolsService,
    private readonly geminiService: GeminiService,
  ) {}

  async calculateInventoryTotalValue(base64Image: string) {
    const model = this.geminiService.provideGenerativeModel({
      tools: [getInventoryItemsTool],
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat();

    const cleanImage = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const result = await chat.sendMessage([
      {
        text: inventoryPrompt,
      },
      { inlineData: { mimeType: 'image/jpeg', data: cleanImage } },
    ]);

    const response = result.response;
    const toolCalls = response.functionCalls();

    if (toolCalls && toolCalls.length > 0) {
      const toolResponses: Part[] = [];

      for (const call of toolCalls) {
        if (call.name === ToolNames.GET_INVENTORY_ITEMS.toString()) {
          const args = call.args as unknown as GetInventoryItemsToolArgs;

          const { totalValue, itemsData } =
            await this.invToolsService.getInventoryItems(args);

          toolResponses.push({
            functionResponse: {
              name: ToolNames.GET_INVENTORY_ITEMS,
              response: {
                totalValue,
                items: itemsData,
              },
            },
          });
        }
      }

      const finalResult = await chat.sendMessage(toolResponses);
      return finalResult.response.text();
    }

    return response.text();
  }
}
