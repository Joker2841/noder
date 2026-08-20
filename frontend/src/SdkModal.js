// SdkModal.js

import { useState } from 'react';

export const SdkModal = ({ code, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="vs-modal__overlay" onClick={onClose}>
      <div className="vs-modal vs-modal--wide" onClick={(event) => event.stopPropagation()}>
        <div className="vs-modal__header">
          <h2>Export to VectorShift SDK</h2>
          <button className="vs-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <p className="vs-modal__muted" style={{ marginTop: 0 }}>
          Your visual pipeline, generated as runnable VectorShift Python.
        </p>

        <pre className="vs-code">
          <code>{code}</code>
        </pre>

        <div className="vs-modal__actions">
          <button className="vs-btn vs-btn--primary" onClick={handleCopy}>
            {copied ? 'Copied ✓' : 'Copy code'}
          </button>
        </div>
      </div>
    </div>
  );
};
