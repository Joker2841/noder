// Generates VectorShift Python SDK code from the visual pipeline.
// Mirrors the real SDK shape: Pipeline.new() + p.add.<node>(... wiring ...) + p.save().

const PY_KEYWORDS = new Set(['from', 'import', 'input', 'type', 'class', 'def', 'lambda']);

const pyString = (value = '') => {
  const str = String(value);
  if (str.includes('\n')) {
    return `"""\n${str.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')}\n"""`;
  }
  return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
};

const sanitize = (raw, fallback) => {
  let name = String(raw || fallback).trim().replace(/[^a-zA-Z0-9_]/g, '_');
  if (!name || /^[0-9]/.test(name)) name = `${fallback}_${name}`;
  name = name.replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase();
  if (!name || PY_KEYWORDS.has(name)) name = `${fallback}_node`;
  return name;
};

const PROVIDERS = { OpenAI: 'openai', Anthropic: 'anthropic', Google: 'google', Meta: 'meta', Mistral: 'mistral' };

// method: SDK builder name · output: attribute other nodes read · terminal: no output
// params(data): positional builder args · kwarg(suffix): maps a target handle to a kwarg
const SDK_MAP = {
  customInput: {
    method: 'input',
    output: 'text',
    base: (d) => d?.inputName || 'input',
    params: (d) => `name=${pyString(d?.inputName || 'input')}, input_type=${pyString((d?.inputType || 'Text').toLowerCase() === 'file' ? 'file' : 'string')}`,
    kwarg: () => null,
  },
  text: {
    method: 'text',
    output: 'output',
    base: () => 'text',
    params: (d) => `text=${pyString(d?.text ?? '')}`,
    kwarg: (suffix) => (suffix.startsWith('var-') ? suffix.slice(4) : null),
  },
  llm: {
    method: 'llm',
    output: 'response',
    base: () => 'llm',
    params: (d) => `provider=${pyString(PROVIDERS[d?.provider] || 'openai')}, model=${pyString(d?.model || 'gpt-4o')}`,
    kwarg: (suffix) => (suffix === 'system' || suffix === 'prompt' ? suffix : null),
  },
  knowledgeBase: {
    method: 'knowledge_base',
    output: 'results',
    base: () => 'kb',
    params: (d) => `base_name=${pyString(d?.baseName || 'knowledge-base')}, top_k=${parseInt(d?.topK, 10) || 5}`,
    kwarg: (suffix) => (suffix === 'query' ? 'query' : null),
  },
  transform: {
    method: 'transform',
    output: 'output',
    base: () => 'transform',
    params: (d) => `code=${pyString(d?.code || 'def transform(input):\n    return input')}`,
    kwarg: (suffix) => (suffix === 'input' ? 'input' : null),
  },
  pipeline: {
    method: 'pipeline',
    output: 'output',
    base: () => 'workflow',
    params: (d) => `pipeline=${pyString(d?.workflow || 'sub-workflow')}`,
    kwarg: (suffix) => (suffix === 'input' ? 'input' : null),
  },
  fileSave: {
    method: 'file_save',
    output: null,
    terminal: true,
    base: () => 'file_save',
    params: (d) => `name=${pyString(d?.fileName || 'output.txt')}`,
    kwarg: (suffix) => (suffix === 'input' ? 'value' : null),
  },
  customOutput: {
    method: 'output',
    output: null,
    terminal: true,
    base: (d) => d?.outputName || 'output',
    params: (d) => `name=${pyString(d?.outputName || 'output')}`,
    kwarg: (suffix) => (suffix === 'value' ? 'value' : null),
  },
};

const topoSort = (nodes, edges) => {
  const ids = nodes.map((n) => n.id);
  const idSet = new Set(ids);
  const indeg = {};
  const succ = {};
  ids.forEach((id) => {
    indeg[id] = 0;
    succ[id] = [];
  });
  edges.forEach((edge) => {
    if (idSet.has(edge.source) && idSet.has(edge.target) && edge.source !== edge.target) {
      succ[edge.source].push(edge.target);
      indeg[edge.target] += 1;
    }
  });
  const queue = ids.filter((id) => indeg[id] === 0);
  const order = [];
  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    succ[id].forEach((m) => {
      indeg[m] -= 1;
      if (indeg[m] === 0) queue.push(m);
    });
  }
  return order.length === ids.length ? order : null;
};

export const generateSdkCode = (nodes, edges) => {
  const runnable = nodes.filter((node) => SDK_MAP[node.type]);
  if (runnable.length === 0) {
    return '# Add a few nodes to generate the pipeline.';
  }

  const order = topoSort(runnable, edges);
  if (!order) {
    return '# This pipeline has a cycle and cannot be compiled.\n# Remove the loop, then export again.';
  }

  const nodeById = Object.fromEntries(runnable.map((n) => [n.id, n]));
  const incoming = {};
  runnable.forEach((n) => {
    incoming[n.id] = [];
  });
  edges.forEach((edge) => {
    if (nodeById[edge.source] && nodeById[edge.target] && edge.source !== edge.target) {
      incoming[edge.target].push(edge);
    }
  });

  // Assign a unique, valid Python variable name to each node.
  const varName = {};
  const used = {};
  order.forEach((id) => {
    const node = nodeById[id];
    const map = SDK_MAP[node.type];
    let name = sanitize(map.base(node.data), map.method);
    if (used[name]) {
      used[name] += 1;
      name = `${name}_${used[name]}`;
    } else {
      used[name] = 1;
    }
    varName[id] = name;
  });

  const lines = ['from vectorshift import Pipeline', '', 'p = Pipeline.new(name="My Pipeline")', ''];

  order.forEach((id) => {
    const node = nodeById[id];
    const map = SDK_MAP[node.type];
    const wiring = incoming[id]
      .map((edge) => {
        const suffix = edge.targetHandle ? edge.targetHandle.replace(`${id}-`, '') : '';
        const kwarg = map.kwarg(suffix);
        if (!kwarg) return null;
        const srcNode = nodeById[edge.source];
        const srcMap = SDK_MAP[srcNode.type];
        return `${kwarg}=${varName[edge.source]}.${srcMap.output || 'output'}`;
      })
      .filter(Boolean);

    const args = [map.params(node.data), ...wiring].filter(Boolean).join(', ');
    const assignment = map.terminal ? '' : `${varName[id]} = `;
    lines.push(`${assignment}p.add.${map.method}(${args})`);
  });

  lines.push('', 'p.save()');
  return lines.join('\n');
};
