import { BaseNode } from './BaseNode';
import { NodeField } from './NodeField';

export const createNodeType = (config) => {
  const NodeComponent = ({ id, data }) => (
    <BaseNode
      id={id}
      title={config.title}
      icon={config.icon}
      accent={config.accent}
      handles={config.handles}
      data={data}
      style={config.style}
    >
      {config.fields?.map((field) => (
        <NodeField key={field.name} nodeId={id} field={field} data={data} />
      ))}
      {config.render?.({ id, data })}
    </BaseNode>
  );

  NodeComponent.displayName = config.title;
  return NodeComponent;
};
