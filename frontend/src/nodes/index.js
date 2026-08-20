import { InputNode } from './inputNode';
import { OutputNode } from './outputNode';
import { LLMNode } from './llmNode';
import { TextNode } from './textNode';
import { KnowledgeBaseNode } from './knowledgeBaseNode';
import { TransformNode } from './transformNode';
import { PipelineNode } from './pipelineNode';
import { FileSaveNode } from './fileSaveNode';
import { NoteNode } from './noteNode';

export const nodeRegistry = [
  { type: 'customInput', label: 'Input', icon: '→', accent: '#6c5acd', group: 'General', component: InputNode },
  { type: 'customOutput', label: 'Output', icon: '←', accent: '#7c5cd6', group: 'General', component: OutputNode },
  { type: 'text', label: 'Text', icon: '¶', accent: '#4ab0ff', group: 'General', component: TextNode },
  { type: 'note', label: 'Note', icon: '✎', accent: '#b38f00', group: 'General', component: NoteNode },
  { type: 'llm', label: 'LLM', icon: '✦', accent: '#6c5acd', group: 'AI', component: LLMNode },
  { type: 'knowledgeBase', label: 'Knowledge Base', icon: '⛁', accent: '#159a8a', group: 'AI', component: KnowledgeBaseNode },
  { type: 'transform', label: 'Transform', icon: 'λ', accent: '#c0862e', group: 'Data', component: TransformNode },
  { type: 'pipeline', label: 'Workflow', icon: '⧉', accent: '#5a78c8', group: 'Data', component: PipelineNode },
  { type: 'fileSave', label: 'File Save', icon: '⇩', accent: '#6b7280', group: 'Data', component: FileSaveNode },
];

export const nodeGroups = nodeRegistry.reduce((acc, node) => {
  (acc[node.group] = acc[node.group] || []).push(node);
  return acc;
}, {});

export const nodeTypes = nodeRegistry.reduce((acc, { type, component }) => {
  acc[type] = component;
  return acc;
}, {});
