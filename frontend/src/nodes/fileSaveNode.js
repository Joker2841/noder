import { createNodeType } from './createNodeType';

export const FileSaveNode = createNodeType({
  title: 'File Save',
  icon: '⇩',
  accent: '#6b7280',
  fields: [
    {
      name: 'fileName',
      label: 'File name',
      type: 'text',
      default: 'output.txt',
    },
  ],
  handles: [{ id: 'input', type: 'target', position: 'left', label: 'Input', dataType: 'any' }],
});
