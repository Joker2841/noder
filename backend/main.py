from collections import deque
from typing import Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="VectorShift Pipeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Per-node-type cost model used to estimate pipeline latency and spend.
# latency is in milliseconds, cost is an estimated USD spend per execution.
COST_MODEL: Dict[str, Dict[str, float]] = {
    "llm": {"latency": 1200, "cost": 0.02},
    "knowledgeBase": {"latency": 450, "cost": 0.004},
    "pipeline": {"latency": 800, "cost": 0.01},
    "transform": {"latency": 60, "cost": 0.0},
    "text": {"latency": 15, "cost": 0.0},
    "customInput": {"latency": 10, "cost": 0.0},
    "customOutput": {"latency": 10, "cost": 0.0},
    "fileSave": {"latency": 40, "cost": 0.0},
    "note": {"latency": 0, "cost": 0.0},
}
DEFAULT_COST = {"latency": 50, "cost": 0.0}

# Annotation-only nodes are documentation, not runtime steps: they never connect
# and are excluded from execution analysis (order, stages, warnings, DAG check).
ANNOTATION_TYPES = {"note"}


class Node(BaseModel):
    id: str
    type: Optional[str] = None


class Edge(BaseModel):
    source: str
    target: str


class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


class PipelineAnalysis(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool
    execution_order: List[str]
    cycle: List[str]
    stages: List[List[str]]
    critical_path: List[str]
    estimated_latency_ms: int
    estimated_cost_usd: float
    warnings: List[str]


def _latency(node_type: Optional[str]) -> float:
    return COST_MODEL.get(node_type or "", DEFAULT_COST)["latency"]


def _cost(node_type: Optional[str]) -> float:
    return COST_MODEL.get(node_type or "", DEFAULT_COST)["cost"]


def analyze_pipeline(nodes: List[Node], edges: List[Edge]) -> PipelineAnalysis:
    node_type = {node.id: node.type for node in nodes}
    # Runtime nodes exclude annotation-only nodes such as notes.
    node_ids = [node.id for node in nodes if node.type not in ANNOTATION_TYPES]
    id_set = set(node_ids)

    # Sanitize edges once so every downstream metric uses the same set:
    #   - drop dangling edges that reference a node that no longer exists
    #   - drop duplicates (same source/target)
    #   - separate self-loops (source == target), which are degenerate cycles
    seen = set()
    graph_edges: List[Edge] = []
    self_loops: List[str] = []
    for edge in edges:
        if edge.source not in id_set or edge.target not in id_set:
            continue
        key = (edge.source, edge.target)
        if key in seen:
            continue
        seen.add(key)
        if edge.source == edge.target:
            self_loops.append(edge.source)
        else:
            graph_edges.append(edge)

    num_edges = len(graph_edges) + len(self_loops)

    successors: Dict[str, List[str]] = {node_id: [] for node_id in node_ids}
    predecessors: Dict[str, List[str]] = {node_id: [] for node_id in node_ids}
    indegree: Dict[str, int] = {node_id: 0 for node_id in node_ids}
    for edge in graph_edges:
        successors[edge.source].append(edge.target)
        predecessors[edge.target].append(edge.source)
        indegree[edge.target] += 1

    # Kahn's algorithm: any node left unprocessed is part of (or blocked by) a cycle.
    remaining = dict(indegree)
    queue = deque(node_id for node_id in node_ids if remaining[node_id] == 0)
    order: List[str] = []
    while queue:
        current = queue.popleft()
        order.append(current)
        for nxt in successors[current]:
            remaining[nxt] -= 1
            if remaining[nxt] == 0:
                queue.append(nxt)

    stuck = set(node_id for node_id in node_ids if node_id not in set(order))

    cycle_nodes = set(self_loops)
    color = {}

    def dfs(node):
        color[node] = 1

        for nxt in successors[node]:
            if nxt not in stuck:
                continue

            state = color.get(nxt, 0)

            if state == 0:
                if dfs(nxt):
                    cycle_nodes.add(node)
            elif state == 1:
                cycle_nodes.add(node)
                cycle_nodes.add(nxt)

        color[node] = 2
        return node in cycle_nodes

    for node in stuck:
        if color.get(node, 0) == 0:
            dfs(node)

    cycle = sorted(cycle_nodes)
    is_dag = len(cycle) == 0

    # A node is an orphan only if no valid edge (or self-loop) touches it.
    touched = set(self_loops)
    for edge in graph_edges:
        touched.add(edge.source)
        touched.add(edge.target)

    warnings: List[str] = []
    for node_id in node_ids:
        if node_id not in touched:
            warnings.append(f"{node_id} is not connected to anything.")
    for node_id in sorted(set(self_loops)):
        warnings.append(f"{node_id} connects to itself, which forms a loop.")
    if not is_dag:
        warnings.append("Pipeline has a cycle and cannot run until it is broken.")

    stages: List[List[str]] = []
    critical_path: List[str] = []
    estimated_latency_ms = 0
    estimated_cost_usd = sum(_cost(node_type[n]) for n in node_ids)

    if is_dag and order:
        # Parallel execution stages: nodes at the same depth can run concurrently.
        level: Dict[str, int] = {}
        for node_id in order:
            preds = predecessors[node_id]
            level[node_id] = 0 if not preds else 1 + max(level[p] for p in preds)
        stages = [[] for _ in range(max(level.values()) + 1)]
        for node_id in order:
            stages[level[node_id]].append(node_id)

        # Critical path: longest latency-weighted chain through the graph.
        dist: Dict[str, float] = {}
        parent: Dict[str, Optional[str]] = {}
        for node_id in order:
            best, best_pred = 0.0, None
            for pred in predecessors[node_id]:
                if dist[pred] > best:
                    best, best_pred = dist[pred], pred
            dist[node_id] = best + _latency(node_type[node_id])
            parent[node_id] = best_pred

        end = max(order, key=lambda n: dist[n])
        estimated_latency_ms = int(dist[end])
        walker: Optional[str] = end
        while walker is not None:
            critical_path.append(walker)
            walker = parent[walker]
        critical_path.reverse()

    return PipelineAnalysis(
        num_nodes=len(nodes),
        num_edges=num_edges,
        is_dag=is_dag,
        execution_order=order if is_dag else [],
        cycle=cycle,
        stages=stages,
        critical_path=critical_path,
        estimated_latency_ms=estimated_latency_ms,
        estimated_cost_usd=round(estimated_cost_usd, 4),
        warnings=warnings,
    )


@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse", response_model=PipelineAnalysis)
def parse_pipeline(pipeline: Pipeline):
    return analyze_pipeline(pipeline.nodes, pipeline.edges)
