import { createNodeType } from './createNodeType';

export const InputNode = createNodeType({
  title: 'Input',
  icon: '→',
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
  handles: [{ id: 'value', type: 'source', position: 'right' }],
});
