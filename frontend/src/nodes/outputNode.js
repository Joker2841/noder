import { createNodeType } from './createNodeType';

export const OutputNode = createNodeType({
  title: 'Output',
  icon: '←',
  fields: [
    {
      name: 'outputName',
      label: 'Name',
      type: 'text',
      default: (id) => id.replace('customOutput-', 'output_'),
    },
    {
      name: 'outputType',
      label: 'Type',
      type: 'select',
      default: 'Text',
      options: [
        { value: 'Text', label: 'Text' },
        { value: 'Image', label: 'Image' },
      ],
    },
  ],
  handles: [{ id: 'value', type: 'target', position: 'left' }],
});
