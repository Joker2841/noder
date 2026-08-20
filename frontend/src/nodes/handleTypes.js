// Central definition of handle data types, their colors, and compatibility.
// A module-level registry lets connection validation look up the type of any
// handle by id without threading state through React.

export const DATA_TYPES = {
  any: { label: 'Any', color: '#94a3b8' },
  text: { label: 'Text', color: '#6366f1' },
  file: { label: 'File', color: '#f59e0b' },
  image: { label: 'Image', color: '#10b981' },
  number: { label: 'Number', color: '#ec4899' },
};

export const typeColor = (type) => (DATA_TYPES[type] || DATA_TYPES.any).color;

export const typesCompatible = (source, target) =>
  source === 'any' || target === 'any' || source === target;

const registry = new Map();

export const registerHandleType = (handleId, type) => {
  registry.set(handleId, type || 'any');
};

export const getHandleType = (handleId) => registry.get(handleId) || 'any';
