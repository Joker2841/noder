import { useRef, useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { SubmitButton } from './submit';
import { SdkModal } from './SdkModal';
import { examples } from './examples';
import { generateSdkCode } from './sdkExport';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  theme: state.theme,
  toggleTheme: state.toggleTheme,
  exportPipeline: state.exportPipeline,
  importPipeline: state.importPipeline,
  clearPipeline: state.clearPipeline,
  loadExample: state.loadExample,
  addToast: state.addToast,
});

export const AppBar = () => {
  const { nodes, edges, theme, toggleTheme, exportPipeline, importPipeline, clearPipeline, loadExample, addToast } =
    useStore(selector, shallow);
  const fileInput = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sdkCode, setSdkCode] = useState(null);

  const handleExport = () => {
    const blob = new Blob([exportPipeline()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vectorshift-pipeline.json';
    link.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Pipeline exported.' });
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importPipeline(reader.result);
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <header className="vs-appbar">
      <div className="vs-brand">
        <span className="vs-brand__name">
          Vector<span className="vs-brand__accent">Shift</span>
        </span>
        <span className="vs-brand__sub">Pipeline Builder</span>
      </div>

      <div className="vs-appbar__actions">
        <div className="vs-menu-wrap">
          <button className="vs-btn" onClick={() => setMenuOpen((open) => !open)}>
            Examples ▾
          </button>
          {menuOpen && (
            <>
              <div className="vs-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="vs-menu">
                {examples.map((example) => (
                  <button
                    key={example.name}
                    className="vs-menu__item"
                    onClick={() => {
                      loadExample(example);
                      setMenuOpen(false);
                    }}
                  >
                    <span className="vs-menu__name">{example.name}</span>
                    <span className="vs-menu__desc">{example.description}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <button className="vs-btn" onClick={() => fileInput.current?.click()}>
          Load
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        <button className="vs-btn" onClick={handleExport}>
          Export
        </button>
        <button className="vs-btn" onClick={() => setSdkCode(generateSdkCode(nodes, edges))}>
          SDK
        </button>
        <button className="vs-btn" onClick={clearPipeline}>
          Clear
        </button>
        <button className="vs-btn vs-btn--icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <SubmitButton />
      </div>
      {sdkCode !== null && <SdkModal code={sdkCode} onClose={() => setSdkCode(null)} />}
    </header>
  );
};
