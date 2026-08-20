import { createNodeType } from './createNodeType';

export const TransformNode = createNodeType({
  title: 'Transform',
  icon: 'λ',
  accent: '#c0862e',
  fields: [
    {
      name: 'code',
      label: 'Python',
      type: 'textarea',
      default: 'def transform(input):\n    return input',
    },
  ],
  handles: [
    { id: 'input', type: 'target', position: 'left', label: 'Input', dataType: 'any' },
    { id: 'output', type: 'source', position: 'right', label: 'Output', dataType: 'any' },
  ],
});
