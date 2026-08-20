import { useMemo, useState, useEffect, useRef } from 'react';
import { useUpdateNodeInternals } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

// Matches {{ variableName }} where the name is a valid JS identifier.
const VARIABLE_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

const extractVariables = (text) => {
  const seen = new Set();
  const variables = [];
  let match;
  while ((match = VARIABLE_REGEX.exec(text)) !== null) {
    if (!seen.has(match[1])) {
      seen.add(match[1]);
      variables.push(match[1]);
    }
  }
  return variables;
};

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const updateNodeInternals = useUpdateNodeInternals();
  const textareaRef = useRef(null);
  const [text, setText] = useState(data?.text ?? '{{input}}');

  const variables = useMemo(() => extractVariables(text), [text]);

  // Handles are dynamic: one target per variable, plus the output.
  const handles = useMemo(() => {
    const variableHandles = variables.map((name, index) => ({
      id: `var-${name}`,
      type: 'target',
      position: 'left',
      label: name,
      dataType: 'text',
      style: { top: `${((index + 1) / (variables.length + 1)) * 100}%` },
    }));
    return [
      ...variableHandles,
      { id: 'output', type: 'source', position: 'right', label: 'Output', dataType: 'text' },
    ];
  }, [variables]);

  // ReactFlow must be told whenever a node's handles change (added, removed, renamed).
  const variableKey = variables.join('|');
  useEffect(() => {
    updateNodeInternals(id);
  }, [variableKey, id, updateNodeInternals]);

  // Grow the textarea height to fit its content.
  useEffect(() => {
    const element = textareaRef.current;
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  }, [text]);

  // Grow the node width with the longest line, within bounds.
  const width = useMemo(() => {
    const longest = text.split('\n').reduce((max, line) => Math.max(max, line.length), 0);
    return Math.min(Math.max(220, longest * 8 + 56), 480);
  }, [text]);

  const handleChange = (event) => {
    const next = event.target.value;
    setText(next);
    updateNodeField(id, 'text', next);
  };

  return (
    <BaseNode id={id} title="Text" icon="¶" accent="#4ab0ff" handles={handles} style={{ width }}>
      <label className="vs-field">
        <span className="vs-field__label">Text</span>
        <textarea
          ref={textareaRef}
          className="vs-field__control vs-field__control--textarea vs-textarea--auto"
          value={text}
          onChange={handleChange}
          rows={1}
          spellCheck={false}
        />
      </label>
      {variables.length > 0 && (
        <div className="vs-text-vars">
          {variables.map((name) => (
            <span key={name} className="vs-text-vars__chip">
              {name}
            </span>
          ))}
        </div>
      )}
    </BaseNode>
  );
};
