import { createNodeType } from './createNodeType';

export const ApiNode = createNodeType({
  title: 'API Request',
  icon: '⇄',
  fields: [
    {
      name: 'method',
      label: 'Method',
      type: 'select',
      default: 'GET',
      options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
      ],
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      default: 'https://api.example.com',
    },
  ],
  handles: [
    { id: 'trigger', type: 'target', position: 'left' },
    { id: 'response', type: 'source', position: 'right' },
  ],
});
