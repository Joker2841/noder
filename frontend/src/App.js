import { useEffect } from 'react';
import { AppBar } from './AppBar';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { Toaster } from './Toaster';
import { useStore } from './store';

function App() {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    let timer;
    const unsubscribe = useStore.subscribe((state, prev) => {
      if (state.nodes !== prev.nodes || state.edges !== prev.edges) {
        clearTimeout(timer);
        timer = setTimeout(() => useStore.getState().persist(), 400);
      }
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return (
    <div className="vs-app" data-theme={theme}>
      <AppBar />
      <div className="vs-main">
        <PipelineToolbar />
        <PipelineUI />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
