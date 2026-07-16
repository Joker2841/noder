import { createNodeType } from './createNodeType';

export const MathNode = createNodeType({
  title: 'Math',
  icon: '∑',
  fields: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      default: 'add',
      options: [
        { value: 'add', label: 'Add' },
        { value: 'subtract', label: 'Subtract' },
        { value: 'multiply', label: 'Multiply' },
        { value: 'divide', label: 'Divide' },
      ],
    },
  ],
  handles: [
    { id: 'a', type: 'target', position: 'left', style: { top: '35%' } },
    { id: 'b', type: 'target', position: 'left', style: { top: '65%' } },
    { id: 'result', type: 'source', position: 'right' },
  ],
});
