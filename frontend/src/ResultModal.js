// ResultModal.js

const formatLatency = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`);

export const ResultModal = ({ result, onClose }) => {
  const {
    num_nodes,
    num_edges,
    is_dag,
    stages = [],
    critical_path = [],
    cycle = [],
    estimated_latency_ms = 0,
    estimated_cost_usd = 0,
    warnings = [],
  } = result;

  return (
    <div className="vs-modal__overlay" onClick={onClose}>
      <div className="vs-modal" onClick={(event) => event.stopPropagation()}>
        <div className="vs-modal__header">
          <h2>Pipeline Intelligence</h2>
          <button className="vs-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="vs-modal__stats">
          <div className="vs-stat">
            <span className="vs-stat__value">{num_nodes}</span>
            <span className="vs-stat__label">Nodes</span>
          </div>
          <div className="vs-stat">
            <span className="vs-stat__value">{num_edges}</span>
            <span className="vs-stat__label">Edges</span>
          </div>
          <div className={`vs-stat vs-stat--${is_dag ? 'ok' : 'warn'}`}>
            <span className="vs-stat__value">{is_dag ? '✓' : '✕'}</span>
            <span className="vs-stat__label">{is_dag ? 'Valid DAG' : 'Has Cycle'}</span>
          </div>
        </div>

        {is_dag && (
          <div className="vs-modal__stats">
            <div className="vs-stat">
              <span className="vs-stat__value">{formatLatency(estimated_latency_ms)}</span>
              <span className="vs-stat__label">Critical-path latency</span>
            </div>
            <div className="vs-stat">
              <span className="vs-stat__value">${estimated_cost_usd.toFixed(3)}</span>
              <span className="vs-stat__label">Est. cost / run</span>
            </div>
            <div className="vs-stat">
              <span className="vs-stat__value">{stages.length}</span>
              <span className="vs-stat__label">Parallel stages</span>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="vs-modal__section">
            <div className="vs-modal__section-title">Warnings</div>
            {warnings.map((warning) => (
              <div key={warning} className="vs-warning">
                <span className="vs-warning__icon">!</span>
                {warning}
              </div>
            ))}
          </div>
        )}

        {is_dag ? (
          <>
            <div className="vs-modal__section">
              <div className="vs-modal__section-title">
                Critical path (bottleneck, highlighted on canvas)
              </div>
              <div className="vs-order">
                {critical_path.map((id, index) => (
                  <span key={id} className="vs-order__step vs-order__step--critical">
                    {index > 0 && <span className="vs-order__arrow">→</span>}
                    {id}
                  </span>
                ))}
              </div>
            </div>

            <div className="vs-modal__section">
              <div className="vs-modal__section-title">
                Execution stages (each stage runs in parallel)
              </div>
              <div className="vs-stages">
                {stages.map((stage, index) => (
                  <div key={index} className="vs-stage">
                    <span className="vs-stage__index">{index + 1}</span>
                    <div className="vs-stage__nodes">
                      {stage.map((id) => (
                        <span key={id} className="vs-order__step">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="vs-modal__section">
            <div className="vs-modal__section-title">Nodes involved in the cycle</div>
            <div className="vs-order">
              {cycle.map((id) => (
                <span key={id} className="vs-order__step vs-order__step--warn">
                  {id}
                </span>
              ))}
            </div>
            <p className="vs-modal__muted">
              A pipeline must be acyclic to run. Remove a connection in the cycle above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
