import { createNodeType } from './createNodeType';

export const NoteNode = createNodeType({
  title: 'Note',
  icon: '✎',
  fields: [
    {
      name: 'note',
      type: 'textarea',
      default: '',
      placeholder: 'Write a note...',
    },
  ],
  handles: [],
});
