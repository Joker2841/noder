// toolbar.js

import { DraggableNode } from './draggableNode';
import { nodeGroups } from './nodes';

export const PipelineToolbar = () => {
    return (
        <aside className="vs-sidebar">
            <div className="vs-sidebar__title">Nodes</div>
            <p className="vs-sidebar__hint">Drag a node onto the canvas</p>

            {Object.entries(nodeGroups).map(([group, nodes]) => (
                <div key={group} className="vs-palette-group">
                    <div className="vs-palette-group__label">{group}</div>
                    <div className="vs-palette-group__items">
                        {nodes.map(({ type, label, icon, accent }) => (
                            <DraggableNode
                                key={type}
                                type={type}
                                label={label}
                                icon={icon}
                                accent={accent}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </aside>
    );
};
