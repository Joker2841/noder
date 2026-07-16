import { createNodeType } from './createNodeType';

export const FilterNode = createNodeType({
  title: 'Filter',
  icon: '⧩',
  fields: [
    {
      name: 'condition',
      label: 'Keep where',
      type: 'text',
      default: 'value != null',
    },
  ],
  handles: [
    { id: 'input', type: 'target', position: 'left' },
    { id: 'output', type: 'source', position: 'right' },
  ],
});
