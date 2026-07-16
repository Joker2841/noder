import { createNodeType } from './createNodeType';

export const ConditionalNode = createNodeType({
  title: 'Conditional',
  icon: '⑃',
  fields: [
    {
      name: 'expression',
      label: 'If',
      type: 'text',
      default: 'value > 0',
    },
  ],
  handles: [
    { id: 'input', type: 'target', position: 'left' },
    { id: 'true', type: 'source', position: 'right', style: { top: '35%' } },
    { id: 'false', type: 'source', position: 'right', style: { top: '65%' } },
  ],
});
