from main import Edge, Node, analyze_pipeline


def build(nodes, edge_pairs):
    node_models = [
        Node(id=n[0], type=n[1]) if isinstance(n, tuple) else Node(id=n)
        for n in nodes
    ]
    edges = [Edge(source=s, target=t) for s, t in edge_pairs]
    return analyze_pipeline(node_models, edges)


def test_empty_pipeline():
    result = build([], [])
    assert result.num_nodes == 0
    assert result.num_edges == 0
    assert result.is_dag is True
    assert result.cycle == []


def test_linear_pipeline_is_dag():
    result = build(["a", "b", "c"], [("a", "b"), ("b", "c")])
    assert result.is_dag is True
    assert result.execution_order == ["a", "b", "c"]


def test_one_edge_is_never_a_cycle():
    # Regression: 6 nodes with a single real edge must be a valid DAG.
    result = build(["a", "b", "c", "d", "e", "f"], [("a", "b")])
    assert result.is_dag is True
    assert result.cycle == []
    assert result.num_edges == 1


def test_dangling_edge_is_ignored():
    # Edge references a node that no longer exists (e.g. deleted node).
    result = build(["a", "b"], [("a", "ghost")])
    assert result.is_dag is True
    assert result.num_edges == 0


def test_duplicate_edge_counted_once():
    result = build(["a", "b"], [("a", "b"), ("a", "b")])
    assert result.num_edges == 1


def test_self_loop_is_a_cycle_and_is_listed():
    result = build(["a", "b"], [("a", "a")])
    assert result.is_dag is False
    assert result.cycle == ["a"]
    assert result.num_edges == 1


def test_real_cycle_lists_the_nodes():
    result = build(["a", "b", "c"], [("a", "b"), ("b", "c"), ("c", "a")])
    assert result.is_dag is False
    assert set(result.cycle) == {"a", "b", "c"}


def test_cycle_is_never_empty_when_not_dag():
    result = build(["a", "b"], [("a", "b"), ("b", "a")])
    assert result.is_dag is False
    assert len(result.cycle) > 0


def test_orphan_warnings_match_edges():
    result = build(["a", "b", "c", "d"], [("a", "b")])
    orphans = [w for w in result.warnings if "not connected" in w]
    assert len(orphans) == 2  # c and d


def test_parallel_stages():
    result = build(["a", "b", "c", "d"], [("a", "b"), ("a", "c"), ("b", "d"), ("c", "d")])
    assert result.stages[0] == ["a"]
    assert set(result.stages[1]) == {"b", "c"}
    assert result.stages[2] == ["d"]


def test_note_is_not_flagged_or_executed():
    result = build([("i", "customInput"), ("o", "customOutput"), ("n1", "note")], [("i", "o")])
    assert result.is_dag is True
    assert not any("n1" in w for w in result.warnings)
    assert "n1" not in result.execution_order
    flat = [node for stage in result.stages for node in stage]
    assert "n1" not in flat
    assert result.num_nodes == 3


def test_critical_path_and_latency():
    nodes = [("i", "customInput"), ("m", "llm"), ("o", "customOutput")]
    result = build(nodes, [("i", "m"), ("m", "o"), ("i", "o")])
    assert result.critical_path == ["i", "m", "o"]
    assert result.estimated_latency_ms == 1220
