// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { nodeTypes, nodeRegistry } from './nodes';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const accentByType = nodeRegistry.reduce((acc, node) => {
  acc[node.type] = node.accent;
  return acc;
}, {});

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  analysis: state.analysis,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {
      nodes,
      edges,
      analysis,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect
    } = useStore(selector, shallow);

    // Highlight analysis results on the canvas: gold critical path when valid,
    // red cycle when the pipeline is not a DAG.
    const hasCycle = analysis ? !analysis.is_dag : false;
    const criticalPath = analysis?.critical_path || [];
    const criticalNodes = useMemo(() => new Set(criticalPath), [criticalPath]);
    const criticalPairs = useMemo(() => {
      const pairs = new Set();
      for (let i = 0; i < criticalPath.length - 1; i += 1) {
        pairs.add(`${criticalPath[i]}->${criticalPath[i + 1]}`);
      }
      return pairs;
    }, [criticalPath]);
    const cycleNodes = useMemo(
      () => new Set(hasCycle ? analysis.cycle : []),
      [hasCycle, analysis]
    );

    const displayNodes = useMemo(
      () =>
        nodes.map((node) => {
          let className;
          if (cycleNodes.has(node.id)) className = 'vs-cycle';
          else if (criticalNodes.has(node.id)) className = 'vs-critical';
          return { ...node, className };
        }),
      [nodes, criticalNodes, cycleNodes]
    );

    const displayEdges = useMemo(
      () =>
        edges.map((edge) => {
          if (!analysis) return edge;
          if (hasCycle) {
            const inCycle = cycleNodes.has(edge.source) && cycleNodes.has(edge.target);
            return {
              ...edge,
              animated: inCycle,
              style: inCycle
                ? { stroke: '#e5484d', strokeWidth: 3 }
                : { stroke: 'var(--accent)', strokeWidth: 1.5, opacity: 0.55 },
            };
          }
          const isCritical = criticalPairs.has(`${edge.source}->${edge.target}`);
          return {
            ...edge,
            animated: isCritical,
            style: isCritical
              ? { stroke: '#b38f00', strokeWidth: 3 }
              : { stroke: 'var(--accent)', strokeWidth: 1.5, opacity: 0.55 },
          };
        }),
      [edges, analysis, hasCycle, criticalPairs, cycleNodes]
    );

    const getInitNodeData = (nodeID, type) => {
      return { id: nodeID, nodeType: `${type}` };
    };

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();

          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;

            if (typeof type === 'undefined' || !type) {
              return;
            }

            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };

            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <div className="vs-canvas" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={displayNodes}
                edges={displayEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
                fitView
            >
                <Background color="var(--canvas-dot)" gap={gridSize} />
                <Controls />
                <MiniMap
                    pannable
                    zoomable
                    nodeColor={(node) => accentByType[node.type] || '#6366f1'}
                    maskColor="var(--minimap-mask)"
                />
            </ReactFlow>
        </div>
    );
};
