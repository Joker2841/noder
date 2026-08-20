import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { registerHandleType, typeColor } from './handleTypes';

const positionMap = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const resolveHandles = (handles, data) =>
  typeof handles === 'function' ? handles(data) : handles;

export const BaseNode = ({ id, title, icon, accent, handles = [], children, data, style }) => {
  const removeNode = useStore((state) => state.removeNode);
  const resolved = resolveHandles(handles, data) || [];

  return (
    <div className="vs-node" style={{ '--node-accent': accent, ...style }}>
      {resolved.map((handle) => {
        const handleId = `${id}-${handle.id}`;
        const dataType = handle.dataType || 'any';
        registerHandleType(handleId, dataType);
        return (
          <Handle
            key={handle.id}
            type={handle.type}
            position={positionMap[handle.position] || Position.Left}
            id={handleId}
            className="vs-node__handle"
            style={{ background: typeColor(dataType), ...handle.style }}
            title={handle.label ? `${handle.label} (${dataType})` : dataType}
          />
        );
      })}

      <div className="vs-node__header">
        {icon && <span className="vs-node__icon">{icon}</span>}
        <span className="vs-node__title">{title}</span>
        <button
          type="button"
          className="vs-node__remove"
          onClick={() => removeNode(id)}
          title="Delete node"
        >
          ×
        </button>
      </div>

      {children && <div className="vs-node__body">{children}</div>}
    </div>
  );
};
