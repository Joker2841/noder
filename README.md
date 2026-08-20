# VectorShift Frontend Technical Assessment

A visual pipeline builder for AI workflows, built with React (ReactFlow and Zustand) on the frontend and Python (FastAPI) on the backend. Users drag nodes onto a canvas, wire them together with typed connections, and submit the pipeline for analysis. The application also generates runnable VectorShift SDK code from the visual graph.

## Table of contents

1. [Running the application](#running-the-application)
2. [Project structure](#project-structure)
3. [Assessment parts](#assessment-parts)
4. [Additional work beyond the brief](#additional-work-beyond-the-brief)
5. [Problems faced and how they were solved](#problems-faced-and-how-they-were-solved)
6. [Testing](#testing)

## Running the application

### Frontend

```bash
cd frontend
npm install
npm start
```

The app runs on http://localhost:3000.

If you run the app from WSL2 against a Windows-mounted path, enable polling so hot reload works:

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

The API runs on http://localhost:8000. Interactive docs are available at http://localhost:8000/docs.

### Tests

```bash
cd backend
source .venv/bin/activate
pip install pytest
python -m pytest -q
```

## Project structure

```
frontend/
  src/
    nodes/
      BaseNode.js          Layout primitive: shell, header, handles, delete control
      NodeField.js         Reusable form controls wired to the store
      createNodeType.js    Factory that turns a config object into a node component
      handleTypes.js       Data type definitions, colors, compatibility, handle registry
      index.js             Central node registry (types, labels, icons, groups)
      inputNode.js         Node configs (Input, Output, LLM, Knowledge Base, and so on)
      textNode.js          Custom node built on BaseNode (auto-resize and variable handles)
    store.js               Zustand store: nodes, edges, theme, toasts, persistence
    ui.js                  ReactFlow canvas and critical-path highlighting
    toolbar.js             Draggable node palette grouped by category
    AppBar.js              Top bar: examples, load, export, SDK, theme, submit
    submit.js              Sends the pipeline to the backend
    ResultModal.js         Pipeline Intelligence result panel
    SdkModal.js            Generated SDK code viewer
    sdkExport.js           Visual graph to VectorShift Python SDK generator
    examples.js            Prebuilt example pipelines
    Toaster.js             Toast notifications
    index.css             Design system and theme tokens
backend/
  main.py                  FastAPI app and pipeline analysis engine
  test_main.py             Unit tests for the analysis logic
```

## Assessment parts

### Part 1: Node abstraction

The original code defined each node as a separate file with duplicated logic for the shell, handles, and fields. This project replaces that with a small, composable abstraction made of three layers.

`BaseNode` is a presentational primitive. It renders the node shell (a header with an icon, title, and delete control, plus a body), maps simple position strings such as `left` and `right` to ReactFlow positions, and renders any list of handles. Handles can be a static array or a function of the node data, which is what the Text node uses to produce handles dynamically. Every handle registers its data type in a module-level registry so that connection validation can look it up later.

`NodeField` provides reusable form controls (text, select, and textarea) that read and write to the Zustand store through `updateNodeField`. This keeps field values in the store so they are available when the pipeline is submitted.

`createNodeType` is a factory. Given a configuration object with a title, icon, accent color, handles, and fields, it returns a finished node component. As a result, a new node is a small declarative object rather than a copied file.

The four original nodes (Input, Output, LLM, and Text) are now concise configs. Five new nodes were added to demonstrate the abstraction: Knowledge Base, Transform, Workflow, File Save, and Note. These were chosen to mirror VectorShift's real node palette. A central registry in `nodes/index.js` is the single source of truth for the node list, so the toolbar and the ReactFlow node types are both derived from it. Adding a node requires one config and one registry line.

The Text node is intentionally implemented as a custom component that uses `BaseNode` directly rather than the config factory. This shows that the abstraction supports both declarative configs for simple nodes and fully custom components for complex ones.

### Part 2: Styling

The design language follows VectorShift's own brand, which is a premium, editorial style rather than a generic developer tool. The default light theme uses a warm off-white canvas, black text, a serif display typeface (Fraunces) for the wordmark and headings, and Inter for the interface. The palette centers on a purple primary color and a gold accent, matching the VectorShift logo and marketing site. A second theme provides a refined near-black dark mode.

Theming is driven by CSS custom properties scoped to the application root element, with a data attribute selecting the active theme. A toggle in the top bar switches between the two. Nodes are cards with a category-colored icon tint, the sidebar palette is grouped by category, and the interface includes toasts and a modal that all share the same tokens.

### Part 3: Text node logic

The Text node grows in both width and height as the user types. Height is set from the textarea scroll height, and width is derived from the longest line within sensible bounds.

The node also detects variables written as double curly braces, for example `{{ topic }}`. A regular expression matches valid JavaScript identifiers, and duplicates are removed. Each unique variable produces a labeled input handle on the left side of the node, typed as text, and the handles update live as the text changes. Because ReactFlow caches node internals, the component calls `useUpdateNodeInternals` whenever the set of variables changes so that new handles register correctly.

### Part 4: Backend integration

On submit, the frontend sends the nodes and edges of the pipeline as JSON to the `/pipelines/parse` endpoint. The FastAPI backend validates the request with Pydantic models, runs the analysis, and returns a response that includes `num_nodes`, `num_edges`, and `is_dag` as required. CORS is configured for the local frontend.

The result is presented in a styled modal rather than a raw browser alert, which keeps the values readable and on-brand. The response is a superset of the required format, so it remains fully compatible with the specification while also carrying the additional analysis described below.

## Additional work beyond the brief

Several features were added to raise the quality of the submission and to reflect how VectorShift's real product behaves.

Type-safe connections: every handle carries a data type such as text, file, image, or number. When a user attempts an incompatible connection, the store rejects it and shows a toast. Handle colors communicate the type visually.

Pipeline Intelligence: the backend does more than count nodes and edges. It runs Kahn's algorithm to produce a topological execution order, groups nodes into parallel execution stages, computes a critical path using a per-node-type latency model, and estimates cost per run. When the graph contains a cycle, it reports the exact nodes involved. The frontend visualizes these results by highlighting the critical path in gold and any cycle in red directly on the canvas.

SDK export: an export action turns the visual graph into runnable VectorShift Python SDK code. It topologically sorts the graph, assigns clean variable names, and wires each node's inputs to the correct upstream outputs, producing code in the shape of `Pipeline.new()` followed by `p.add.*` builder calls.

Example pipelines: a menu loads prebuilt, realistic pipelines such as a retrieval-augmented question answering flow and a document summarizer, so the tool can be demonstrated instantly.

Quality of life: pipelines autosave to local storage and can be exported or imported as JSON, the theme can be toggled, edges highlight on hover and selection, and node deletion cleans up connected edges.

## Problems faced and how they were solved

Dynamic handles and ReactFlow internals: adding or removing handles on the Text node did not always register with ReactFlow, which caused edges to attach to the wrong position. The fix was to call `useUpdateNodeInternals` whenever the variable set changes, keyed on the joined variable names so that renames are also detected.

Dangling edges after node deletion: deleting a node through ReactFlow removed the node but left edges that still referenced it. These stale edges polluted the analysis and produced impossible results such as a cycle with a single edge. This was solved in two places. The store now removes any edge whose endpoints no longer exist when a node is deleted, and the backend sanitizes edges before analysis by dropping dangling references, removing duplicates, and separating self-loops.

Inconsistent metrics: the node count, edge count, and cycle detection were originally derived from slightly different data, which made the reported numbers disagree. The analysis was rewritten so that every metric comes from the same sanitized edge set, and the cycle list is guaranteed to be populated whenever the graph is not acyclic.

Modal positioning in dark mode: the result modal was rendered inside the top bar, and the top bar used a backdrop blur effect for dark mode. An element with a backdrop filter becomes the containing block for fixed-position descendants, so the modal was measured against the small top bar instead of the viewport and appeared clipped. Removing the blur restored correct positioning in both themes.

Theme variables and portals: an earlier attempt moved the modal into a portal on the document body to escape the containing block. That broke theming because the theme CSS variables are scoped to the application root, so the portaled modal lost all of its colors. The final solution keeps the modal within the themed root and removes the effect that caused the original problem.

Control styling specificity: the ReactFlow zoom and fit controls appeared white in dark mode because the library stylesheet loaded after the application styles and overrode them at equal specificity. Scoping the control overrides under the application root increased specificity so the dark styles win, and the control icons are colored by targeting their SVG fill.

Annotation nodes: the Note node has no handles by design, so it was incorrectly flagged as unconnected and listed as an execution stage. Notes are now treated as annotations and excluded from the execution analysis while still counting as canvas nodes.

## Testing

The backend analysis is covered by a unit test suite that verifies linear pipelines, empty pipelines, real cycles, self-loops, dangling edges, duplicate edges, orphan detection, parallel stages, critical-path latency, cost estimation, and the exclusion of annotation nodes. The suite also includes a regression test for the reported bug where a single edge produced a false cycle.