import { Injectable } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  Part,
} from '@google/generative-ai';
import { GeminiConfig } from '@infrastructure/config/gemini.config';
import { ItemRepo } from '@infrastructure/drizzle/repo/item.repo';
import { GetItemValuesToolArgs, tools } from './trade.tools';
import { getItemValuesPrompt, systemPrompt } from './trade.prompts';

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
}
