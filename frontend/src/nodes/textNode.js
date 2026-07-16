import { createNodeType } from './createNodeType';

export const TextNode = createNodeType({
  title: 'Text',
  icon: '¶',
  fields: [
    {
      name: 'text',
      label: 'Text',
      type: 'text',
      default: '{{input}}',
    },
  ],
  handles: [{ id: 'output', type: 'source', position: 'right' }],
});
