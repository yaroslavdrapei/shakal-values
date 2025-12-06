import { Tool, SchemaType } from '@google/generative-ai';
import { ToolNames } from '@modules/ai/ai.enums';

export interface GetInventoryItemsToolArgs {
  items: { name: string; count: number }[];
}

export interface GetInventoryItemsToolResponse {
  totalValue: number;
  itemsData: { name: string; count: number; value: number }[];
}

export const getInventoryItemsTool: Tool = {
  functionDeclarations: [
    {
      name: ToolNames.GET_INVENTORY_ITEMS,
      description:
        'Get the value and information for specific MM2 items with their counts. Use this to look up items found in the inventory image.',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          items: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: {
                  type: SchemaType.STRING,
                  description:
                    'The exact item name (e.g., "Luger", "Candy", "Chroma Darkbringer")',
                },
                count: {
                  type: SchemaType.NUMBER,
                  description:
                    'How many times this item appears in the inventory',
                },
              },
              required: ['name', 'count'],
            },
            description:
              'List of items found in the inventory with their counts. Each item should include both the name and how many times it appears.',
          },
        },
        required: ['items'],
      },
    },
  ],
};
