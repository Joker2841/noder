// Prebuilt example pipelines for one-click loading.

const edge = (source, sourceHandle, target, targetHandle) => ({
  id: `${source}-${target}`,
  source,
  target,
  sourceHandle: `${source}-${sourceHandle}`,
  targetHandle: `${target}-${targetHandle}`,
  type: 'smoothstep',
  animated: true,
  markerEnd: { type: 'arrowclosed', height: 18, width: 18 },
});

const node = (id, type, position, data) => ({
  id,
  type,
  position,
  data: { id, nodeType: type, ...data },
});

export const examples = [
  {
    name: 'RAG Q&A',
    description: 'Retrieve context from a knowledge base, then answer with an LLM.',
    nodes: [
      node('customInput-1', 'customInput', { x: 0, y: 170 }, { inputName: 'query', inputType: 'Text' }),
      node('text-1', 'text', { x: 0, y: 410 }, {
        text: 'You are a helpful assistant. Answer using only the retrieved context.',
      }),
      node('knowledgeBase-1', 'knowledgeBase', { x: 350, y: 40 }, { baseName: 'company-docs', topK: '5' }),
      node('llm-1', 'llm', { x: 700, y: 230 }, { provider: 'Anthropic', model: 'claude-sonnet' }),
      node('customOutput-1', 'customOutput', { x: 1040, y: 230 }, { outputName: 'answer', outputType: 'Text' }),
    ],
    edges: [
      edge('customInput-1', 'value', 'knowledgeBase-1', 'query'),
      edge('text-1', 'output', 'llm-1', 'system'),
      edge('knowledgeBase-1', 'results', 'llm-1', 'prompt'),
      edge('llm-1', 'response', 'customOutput-1', 'value'),
    ],
  },
  {
    name: 'Document Summarizer',
    description: 'Summarize an input with an LLM, return it and save it to a file.',
    nodes: [
      node('customInput-1', 'customInput', { x: 0, y: 170 }, { inputName: 'document', inputType: 'Text' }),
      node('text-1', 'text', { x: 0, y: 410 }, { text: 'Summarize the input in three concise bullet points.' }),
      node('llm-1', 'llm', { x: 380, y: 250 }, { provider: 'OpenAI', model: 'gpt-4o' }),
      node('customOutput-1', 'customOutput', { x: 740, y: 120 }, { outputName: 'summary', outputType: 'Text' }),
      node('fileSave-1', 'fileSave', { x: 740, y: 380 }, { fileName: 'summary.txt' }),
    ],
    edges: [
      edge('customInput-1', 'value', 'llm-1', 'prompt'),
      edge('text-1', 'output', 'llm-1', 'system'),
      edge('llm-1', 'response', 'customOutput-1', 'value'),
      edge('llm-1', 'response', 'fileSave-1', 'input'),
    ],
  },
];
