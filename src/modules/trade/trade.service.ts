import { Injectable } from '@nestjs/common';
import { Part } from '@google/generative-ai';
import { ItemRepo } from '@infrastructure/drizzle/repo/item.repo';
import {
  GetItemValuesToolArgs,
  tools,
  askTools,
  GetItemInfoToolArgs,
  inventoryTools,
  GetItemInventoryToolArgs,
} from './trade.tools';
import {
  getItemValuesPrompt,
  inventoryPrompt,
  inventorySystemPrompt,
  systemPrompt,
} from './trade.prompts';
import { stringToNumber } from '@shared/utils/string-to-number.util';
import { GeminiService } from '@infrastructure/gemini/gemini.service';

// TODO: move gemini to a separate module/service
// TODO: make tools services for better separation of concerns
@Injectable()
export class TradeService {
  constructor(
    private readonly itemRepo: ItemRepo,
    private readonly geminiService: GeminiService,
  ) {}

  async evaluateTrade(base64Image: string) {
    const model = this.geminiService.provideGenerativeModel({
      tools,
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat();

    const cleanImage = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const result = await chat.sendMessage([
      {
        text: getItemValuesPrompt,
      },
      { inlineData: { mimeType: 'image/jpeg', data: cleanImage } },
    ]);

    const response = result.response;
    const toolCalls = response.functionCalls();

    if (toolCalls && toolCalls.length > 0) {
      const toolResponses: Part[] = [];

      for (const call of toolCalls) {
        if (call.name === 'get_item_values') {
          const args = call.args as unknown as GetItemValuesToolArgs;

          const dbData = await this.itemRepo.findByNames(args.items);

          console.log(dbData);

          toolResponses.push({
            functionResponse: {
              name: 'get_item_values',
              response: {
                owner: args.owner,
                data: dbData,
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

  async askQuestion(question: string): Promise<string> {
    const model = this.geminiService.provideGenerativeModel({
      tools: askTools,
      systemInstruction: `You are a helpful MM2 (Murder Mystery 2) trading assistant.
- When users ask about item values, use the 'get_item_info' tool to fetch current data.
- Extract item names from the user's question, even if they have typos or use different capitalization.
- Support multiple items in a single question (e.g., "what's the value of luger and candy").
- After getting item data, provide a clear response with (each with new line):
  * Item name
  * Type: type
  * Value: value
  * Stability: stability
  * Demand: demand 
  * Rarity: rarity
- If an item is not found, suggest similar items if available.
- Use plain text, no markdown formatting.
- Be conversational and helpful.
- Typo correction for possessive forms:
 If a user's item name appears to be missing an apostrophe in a possessive form, 
 automatically correct it when making tool calls. Look for patterns where a word ending in 's' 
 should be possessive (e.g., "travelers axe" → "traveler's axe", "players knife" → "player's knife", "winters edge" → "winter's edge", "santas magic" → "santa's magic"). 
 Apply this correction pattern whenever you detect a plural-looking word followed by a noun 
 that suggests a possessive relationship.
- If user types chroma or c, like chroma traveler's gun or c traveler's axe, it means you should search for chromas, 
meaning make request with both "c." and "chroma" when you pass that in a tool call.
- Answer questions only about items and their values/properties in mm2`,
    });

    const chat = model.startChat();

    const result = await chat.sendMessage(question);

    const response = result.response;
    const toolCalls = response.functionCalls();

    if (toolCalls && toolCalls.length > 0) {
      const toolResponses: Part[] = [];

      for (const call of toolCalls) {
        if (call.name === 'get_item_info') {
          const args = call.args as unknown as GetItemInfoToolArgs;

          const dbData = await this.itemRepo.findByNamesFuzzy(args.items);

          toolResponses.push({
            functionResponse: {
              name: 'get_item_info',
              response: {
                data: dbData,
                searchTerms: args.items,
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

  async calculateInventoryTotalValue(base64Image: string) {
    const model = this.geminiService.provideGenerativeModel({
      tools: inventoryTools,
      systemInstruction: inventorySystemPrompt,
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
        if (call.name === 'get_inventory_items') {
          const args = call.args as unknown as GetItemInventoryToolArgs;

          let totalValue = 0;
          const itemData: { name: string; count: number; value: number }[] = [];
          for (const aiItem of args.items) {
            const item = await this.itemRepo.findByName(aiItem.name);
            if (!item) continue;

            const normalizedValue = stringToNumber(item.values.value);
            const localValue = normalizedValue * aiItem.count;
            totalValue += localValue;

            itemData.push({
              name: aiItem.name,
              count: aiItem.count,
              value: localValue,
            });
          }

          toolResponses.push({
            functionResponse: {
              name: 'get_inventory_items',
              response: {
                totalValue,
                items: itemData,
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
