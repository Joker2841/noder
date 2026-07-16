import { InputNode } from './inputNode';
import { OutputNode } from './outputNode';
import { LLMNode } from './llmNode';
import { TextNode } from './textNode';
import { FilterNode } from './filterNode';
import { MathNode } from './mathNode';
import { ApiNode } from './apiNode';
import { NoteNode } from './noteNode';
import { ConditionalNode } from './conditionalNode';

export const nodeRegistry = [
  { type: 'customInput', label: 'Input', component: InputNode },
  { type: 'llm', label: 'LLM', component: LLMNode },
  { type: 'customOutput', label: 'Output', component: OutputNode },
  { type: 'text', label: 'Text', component: TextNode },
  { type: 'filter', label: 'Filter', component: FilterNode },
  { type: 'math', label: 'Math', component: MathNode },
  { type: 'api', label: 'API', component: ApiNode },
  { type: 'note', label: 'Note', component: NoteNode },
  { type: 'conditional', label: 'Conditional', component: ConditionalNode },
];

export const nodeTypes = nodeRegistry.reduce((acc, { type, component }) => {
  acc[type] = component;
  return acc;
}, {});
