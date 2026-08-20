import { createNodeType } from './createNodeType';

export const LLMNode = createNodeType({
  title: 'LLM',
  icon: '✦',
  accent: '#6c5acd',
  fields: [
    {
      name: 'provider',
      label: 'Provider',
      type: 'select',
      default: 'OpenAI',
      options: [
        { value: 'OpenAI', label: 'OpenAI' },
        { value: 'Anthropic', label: 'Anthropic' },
        { value: 'Google', label: 'Google' },
        { value: 'Meta', label: 'Meta Llama' },
        { value: 'Mistral', label: 'Mistral' },
      ],
    },
    {
      name: 'model',
      label: 'Model',
      type: 'select',
      default: 'gpt-4o',
      options: [
        { value: 'gpt-4o', label: 'gpt-4o' },
        { value: 'claude-sonnet', label: 'claude-sonnet' },
        { value: 'gemini-pro', label: 'gemini-pro' },
        { value: 'llama-3', label: 'llama-3' },
        { value: 'mistral-large', label: 'mistral-large' },
      ],
    },
  ],
  handles: [
    { id: 'system', type: 'target', position: 'left', label: 'System', dataType: 'text', style: { top: `${100 / 3}%` } },
    { id: 'prompt', type: 'target', position: 'left', label: 'Prompt', dataType: 'text', style: { top: `${200 / 3}%` } },
    { id: 'response', type: 'source', position: 'right', label: 'Response', dataType: 'text' },
  ],
});
