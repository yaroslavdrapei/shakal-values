import { Injectable } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  Part,
} from '@google/generative-ai';
import { GeminiConfig } from '@infrastructure/config/gemini.config';
import { ItemRepo } from '@infrastructure/drizzle/repo/item.repo';
import {
  GetItemValuesToolArgs,
  tools,
  askTools,
  GetItemInfoToolArgs,
} from './trade.tools';
import { getItemValuesPrompt, systemPrompt } from './trade.prompts';

// TODO: move gemini to a separate module/service
@Injectable()
export class TradeService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(
    private readonly geminiConfig: GeminiConfig,
    private readonly itemRepo: ItemRepo,
  ) {
    // 1. Initialize the SDK
    this.genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
  }

  // 2. Define the Tool (The "Interface")
  async evaluateTrade(base64Image: string) {
    // 3. Configure the Model
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools,
      systemInstruction: systemPrompt,
    });

    const chat = this.model.startChat();

    // 2. Prepare the Image
    // Ensure we strip the data header if it exists
    const cleanImage = base64Image.replace(/^data:image\/\w+;base64,/, '');

    // 3. Send Initial Request
    const result = await chat.sendMessage([
      {
        text: getItemValuesPrompt,
      },
      { inlineData: { mimeType: 'image/jpeg', data: cleanImage } },
    ]);

    const response = result.response;
    const toolCalls = response.functionCalls();

    // 4. Handle Tool Calls (if any)
    if (toolCalls && toolCalls.length > 0) {
      // We use the 'Part' type from the SDK to ensure type safety for the response
      const toolResponses: Part[] = [];

      for (const call of toolCalls) {
        // Strict name check - must match the tool definition exactly
        if (call.name === 'get_item_values') {
          const args = call.args as unknown as GetItemValuesToolArgs;

          const dbData = await this.itemRepo.findByNames(args.items);

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

      // 5. Send Tool Outputs back to Gemini to get the final answer
      // The AI uses this data to generate the final "Win/Loss" text
      const finalResult = await chat.sendMessage(toolResponses);
      return finalResult.response.text();
    }

    // Fallback: If AI didn't call tools (e.g., couldn't see items), return its raw text
    return response.text();
  }

  async askQuestion(question: string): Promise<string> {
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
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

    const chat = this.model.startChat();

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
}
