// submit.js

import { useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { ResultModal } from './ResultModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  addToast: state.addToast,
  setAnalysis: state.setAnalysis,
});

export const SubmitButton = () => {
  const { nodes, edges, addToast, setAnalysis } = useStore(selector, shallow);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (nodes.length === 0) {
      addToast({ type: 'info', message: 'Add a few nodes before submitting.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      if (!response.ok) throw new Error(`Server responded ${response.status}`);
      const data = await response.json();
      setResult(data);
      setAnalysis(data);
    } catch (error) {
      addToast({
        type: 'error',
        message: `Could not reach the backend. Is it running on ${BACKEND_URL}?`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="vs-btn vs-btn--primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Analyzing…' : 'Submit'}
      </button>
      {result && <ResultModal result={result} onClose={() => setResult(null)} />}
    </>
  );
};
