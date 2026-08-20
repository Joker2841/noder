import { createNodeType } from './createNodeType';

export const KnowledgeBaseNode = createNodeType({
  title: 'Knowledge Base',
  icon: '⛁',
  accent: '#159a8a',
  fields: [
    {
      name: 'baseName',
      label: 'Base',
      type: 'text',
      default: 'my-knowledge-base',
    },
    {
      name: 'topK',
      label: 'Top K',
      type: 'number',
      default: '5',
    },
  ],
  handles: [
    { id: 'query', type: 'target', position: 'left', label: 'Query', dataType: 'text' },
    { id: 'results', type: 'source', position: 'right', label: 'Results', dataType: 'text' },
  ],
});
