import { createNodeType } from './createNodeType';

export const NoteNode = createNodeType({
  title: 'Note',
  icon: '✎',
  accent: '#b38f00',
  fields: [
    {
      name: 'note',
      type: 'textarea',
      default: '',
      placeholder: 'Leave a comment on the pipeline...',
    },
  ],
  handles: [],
});
