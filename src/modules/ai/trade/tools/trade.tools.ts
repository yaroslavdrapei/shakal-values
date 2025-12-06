import { SchemaType, Tool } from '@google/generative-ai';
import { ToolNames } from '../../ai.enums';

export interface GetItemValuesToolArgs {
  items: string[];
  owner: string;
}
export const getItemValuesTool: Tool = {
  functionDeclarations: [
    {
      name: ToolNames.GET_ITEM_VALUES,
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
};
