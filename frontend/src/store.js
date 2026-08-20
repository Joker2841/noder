// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';
import { getHandleType, typesCompatible, DATA_TYPES } from './nodes/handleTypes';

const STORAGE_KEY = 'vs-pipeline';

const loadPersisted = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persisted = loadPersisted();

// Rebuild the per-type id counters from a set of nodes so that newly added
// nodes continue numbering correctly after a load.
const deriveNodeIDs = (nodes) => {
  const ids = {};
  (nodes || []).forEach((node) => {
    const match = /^(.*)-(\d+)$/.exec(node.id);
    if (match) {
      const type = match[1];
      ids[type] = Math.max(ids[type] || 0, parseInt(match[2], 10));
    }
  });
  return ids;
};

const edgeDefaults = {
  type: 'smoothstep',
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, height: 18, width: 18 },
};

export const useStore = create((set, get) => ({
    nodes: persisted?.nodes || [],
    edges: persisted?.edges || [],
    nodeIDs: persisted?.nodeIDs || {},
    theme: localStorage.getItem('vs-theme') || 'light',
    toasts: [],
    analysis: null,

    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node],
            analysis: null,
        });
    },
    removeNode: (nodeId) => {
        set({
            nodes: get().nodes.filter((node) => node.id !== nodeId),
            edges: get().edges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId
            ),
            analysis: null,
        });
    },
    setAnalysis: (analysis) => set({ analysis }),
    onNodesChange: (changes) => {
      const nodes = applyNodeChanges(changes, get().nodes);
      const removed = changes.some((change) => change.type === 'remove');
      if (removed) {
        // Drop any edges left dangling by a deleted node.
        const ids = new Set(nodes.map((node) => node.id));
        set({
          nodes,
          edges: get().edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)),
          analysis: null,
        });
      } else {
        set({ nodes });
      }
    },
    onEdgesChange: (changes) => {
      const edges = applyEdgeChanges(changes, get().edges);
      // A structural edge change invalidates the last analysis / highlight.
      const structural = changes.some(
        (change) => change.type === 'remove' || change.type === 'add'
      );
      set(structural ? { edges, analysis: null } : { edges });
    },
    onConnect: (connection) => {
      if (connection.source === connection.target) {
        get().addToast({ type: 'error', message: 'A node cannot connect to itself.' });
        return;
      }

      const isDuplicate = get().edges.some(
        (edge) =>
          edge.source === connection.source &&
          edge.target === connection.target &&
          edge.sourceHandle === connection.sourceHandle &&
          edge.targetHandle === connection.targetHandle
      );
      if (isDuplicate) {
        get().addToast({ type: 'info', message: 'That connection already exists.' });
        return;
      }

      const sourceType = getHandleType(connection.sourceHandle);
      const targetType = getHandleType(connection.targetHandle);

      if (!typesCompatible(sourceType, targetType)) {
        get().addToast({
          type: 'error',
          message: `Incompatible types: ${DATA_TYPES[sourceType].label} cannot connect to ${DATA_TYPES[targetType].label}.`,
        });
        return;
      }

      set({
        edges: addEdge({ ...connection, ...edgeDefaults }, get().edges),
        analysis: null,
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, [fieldName]: fieldValue } };
          }
          return node;
        }),
      });
    },

    // theme
    toggleTheme: () => {
      const theme = get().theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('vs-theme', theme);
      set({ theme });
    },

    // persistence
    persist: () => {
      const { nodes, edges, nodeIDs } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges, nodeIDs }));
    },
    exportPipeline: () => {
      const { nodes, edges } = get();
      return JSON.stringify({ nodes, edges }, null, 2);
    },
    importPipeline: (json) => {
      try {
        const parsed = typeof json === 'string' ? JSON.parse(json) : json;
        const nodes = parsed.nodes || [];
        set({ nodes, edges: parsed.edges || [], nodeIDs: deriveNodeIDs(nodes), analysis: null });
        get().addToast({ type: 'success', message: 'Pipeline loaded.' });
      } catch {
        get().addToast({ type: 'error', message: 'Could not read that file.' });
      }
    },
    clearPipeline: () => {
      set({ nodes: [], edges: [], nodeIDs: {}, analysis: null });
      localStorage.removeItem(STORAGE_KEY);
    },
    loadExample: (example) => {
      set({
        nodes: example.nodes.map((node) => ({ ...node, data: { ...node.data } })),
        edges: example.edges.map((edge) => ({ ...edge })),
        nodeIDs: deriveNodeIDs(example.nodes),
        analysis: null,
      });
      get().addToast({ type: 'success', message: `Loaded "${example.name}".` });
    },

    // toasts
    addToast: ({ type = 'info', message }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      set({ toasts: [...get().toasts, { id, type, message }] });
      setTimeout(() => get().removeToast(id), 4000);
    },
    removeToast: (id) => {
      set({ toasts: get().toasts.filter((toast) => toast.id !== id) });
    },
  }));
