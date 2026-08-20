import { useState } from 'react';
import { useStore } from '../store';

const resolveDefault = (field, nodeId, data) => {
  if (data?.[field.name] !== undefined) return data[field.name];
  if (typeof field.default === 'function') return field.default(nodeId, data);
  return field.default ?? '';
};

export const NodeField = ({ nodeId, field, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [value, setValue] = useState(() => resolveDefault(field, nodeId, data));

  const handleChange = (event) => {
    const next = event.target.value;
    setValue(next);
    updateNodeField(nodeId, field.name, next);
    field.onChange?.(next);
  };

  return (
    <label className="vs-field">
      {field.label && <span className="vs-field__label">{field.label}</span>}

      {field.type === 'select' ? (
        <select className="vs-field__control" value={value} onChange={handleChange}>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          className="vs-field__control vs-field__control--textarea"
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          className="vs-field__control"
          type={field.type || 'text'}
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder}
        />
      )}
    </label>
  );
};
