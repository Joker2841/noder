import { createNodeType } from './createNodeType';

export const LLMNode = createNodeType({
  title: 'LLM',
  icon: '✦',
  render: () => <p className="vs-node__text">This is a LLM.</p>,
  handles: [
    { id: 'system', type: 'target', position: 'left', style: { top: `${100 / 3}%` } },
    { id: 'prompt', type: 'target', position: 'left', style: { top: `${200 / 3}%` } },
    { id: 'response', type: 'source', position: 'right' },
  ],
});
