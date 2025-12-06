import { GeminiService } from '@infrastructure/gemini/gemini.service';
import { AskToolsService } from './tools/ask-tools.service';
import { Part } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { systemPrompt } from './ask.prompts';
import {
  getItemByNameFuzzyTool,
  GetItemByNameFuzzyToolArgs,
} from './tools/ask.tools';
import { ToolNames } from '../ai.enums';

@Injectable()
export class AskService {
  constructor(
    private readonly askToolsService: AskToolsService,
    private readonly geminiService: GeminiService,
  ) {}

  async askQuestion(question: string): Promise<string> {
    const model = this.geminiService.provideGenerativeModel({
      tools: [getItemByNameFuzzyTool],
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat();

    const result = await chat.sendMessage(question);

    const response = result.response;
    const toolCalls = response.functionCalls();

    if (toolCalls && toolCalls.length > 0) {
      const toolResponses: Part[] = [];

      for (const call of toolCalls) {
        if (call.name === ToolNames.GET_ITEM_BY_NAME_FUZZY.toString()) {
          const args = call.args as unknown as GetItemByNameFuzzyToolArgs;

          const data = await this.askToolsService.getItemByNameFuzzy(args);

          toolResponses.push({
            functionResponse: {
              name: ToolNames.GET_ITEM_BY_NAME_FUZZY,
              response: {
                data,
                searchTerms: args.names,
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
