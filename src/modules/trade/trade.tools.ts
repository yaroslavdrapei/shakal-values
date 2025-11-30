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
