import { Tool, SchemaType } from '@google/generative-ai';
import { ToolNames } from '../../ai.enums';

export interface GetItemByNameFuzzyToolArgs {
  names: string[];
}

export const getItemByNameFuzzyTool: Tool = {
  functionDeclarations: [
    {
      name: ToolNames.GET_ITEM_BY_NAME_FUZZY,
      description:
        "Get the value, demand, stability, and rarity for specific MM2 items. Use this when the user asks about item values or information. Extract item names from the user's question, handling typos and variations.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          names: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description:
              "List of item names the user is asking about. Extract item names from the user's question. Handle typos and variations (e.g., 'luger', 'Luger', 'luger gun', 'luger pistol'). If the user asks about multiple items, include all of them.",
          },
        },
        required: ['names'],
      },
    },
  ],
};
