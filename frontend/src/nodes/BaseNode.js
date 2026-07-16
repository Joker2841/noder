import { Handle, Position } from 'reactflow';

const positionMap = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const resolveHandles = (handles, data) =>
  typeof handles === 'function' ? handles(data) : handles;

export const BaseNode = ({ id, title, icon, handles = [], children, data, style }) => {
  const resolved = resolveHandles(handles, data);

  return (
    <div className="vs-node" style={style}>
      {resolved.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={positionMap[handle.position] || Position.Left}
          id={`${id}-${handle.id}`}
          className="vs-node__handle"
          style={handle.style}
        />
      ))}

      <div className="vs-node__header">
        {icon && <span className="vs-node__icon">{icon}</span>}
        <span className="vs-node__title">{title}</span>
      </div>

      {children && <div className="vs-node__body">{children}</div>}
    </div>
  );
};
