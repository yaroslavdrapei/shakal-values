import { SchemaType, Tool } from '@google/generative-ai';

export const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'get_item_values',
        description:
          'Get the value, demand, and stability for specific MM2 items.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            items: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description:
                "List of exact item names found in the image (e.g. 'Luger', 'Candy').",
            },
            owner: {
              type: SchemaType.STRING,
              description: "Who owns these items? ('Me' or 'Them')",
            },
          },
          required: ['items', 'owner'],
        },
      },
    ],
  },
];

export interface GetItemValuesToolArgs {
  items: string[];
  owner: string;
}

export const askTools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'get_item_info',
        description:
          "Get the value, demand, stability, and rarity for specific MM2 items. Use this when the user asks about item values or information. Extract item names from the user's question, handling typos and variations.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            items: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description:
                "List of item names the user is asking about. Extract item names from the user's question. Handle typos and variations (e.g., 'luger', 'Luger', 'luger gun', 'luger pistol'). If the user asks about multiple items, include all of them.",
            },
          },
          required: ['items'],
        },
      },
    ],
  },
];

export interface GetItemInfoToolArgs {
  items: string[];
}
