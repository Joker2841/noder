# VectorShift Frontend Technical Assessment

A visual pipeline builder built with React (ReactFlow + Zustand) and a FastAPI backend.
Users drag nodes onto a canvas, wire them together, and submit the pipeline for analysis.

## Project structure

```
frontend/
  src/
    nodes/            node abstraction and all node types
      BaseNode.js       layout primitive (shell, header, handles)
      NodeField.js      reusable form controls wired to the store
      createNodeType.js factory that turns a config into a node component
      index.js          central node registry
    store.js          zustand store (nodes, edges, field updates)
    ui.js             ReactFlow canvas
    toolbar.js        draggable node palette
    submit.js         submit button and backend call
backend/
  main.py             FastAPI app with the /pipelines/parse endpoint
```

## Running the app

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on http://localhost:3000

If you run from WSL2 against a Windows-mounted path (`/mnt/c/...`),
enable polling so hot reload works:

```bash
CHOKIDAR_USEPOLLING=true WATCHPACK_POLLING=true npm start
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn
uvicorn main:app --reload
```

Runs on http://localhost:8000

## Assessment parts

1. **Node Abstraction** — a config-driven system where new nodes are small
   declarative objects instead of copied files.
2. **Styling** — a unified, VectorShift-inspired design.
3. **Text Node Logic** — auto-resizing text node with dynamic `{{ variable }}` handles.
4. **Backend Integration** — submit pipeline to FastAPI, which returns node/edge
   counts and whether the graph is a DAG.
