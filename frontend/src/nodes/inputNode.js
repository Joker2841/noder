import { createNodeType } from './createNodeType';

export const InputNode = createNodeType({
  title: 'Input',
  icon: '→',
  accent: '#6c5acd',
  fields: [
    {
      name: 'inputName',
      label: 'Name',
      type: 'text',
      default: (id) => id.replace('customInput-', 'input_'),
    },
    {
      name: 'inputType',
      label: 'Type',
      type: 'select',
      default: 'Text',
      options: [
        { value: 'Text', label: 'Text' },
        { value: 'File', label: 'File' },
      ],
    },
  ],
  handles: (data) => [
    {
      id: 'value',
      type: 'source',
      position: 'right',
      label: 'Value',
      dataType: data?.inputType === 'File' ? 'file' : 'text',
    },
  ],
});
