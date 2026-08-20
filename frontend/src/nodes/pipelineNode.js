import { createNodeType } from './createNodeType';

export const PipelineNode = createNodeType({
  title: 'Workflow',
  icon: '⧉',
  accent: '#5a78c8',
  fields: [
    {
      name: 'workflow',
      label: 'Workflow',
      type: 'text',
      default: 'sub-workflow',
    },
  ],
  handles: [
    { id: 'input', type: 'target', position: 'left', label: 'Input', dataType: 'any' },
    { id: 'output', type: 'source', position: 'right', label: 'Output', dataType: 'any' },
  ],
});
