import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const icons = {
  success: '✓',
  error: '!',
  info: 'i',
};

export const Toaster = () => {
  const { toasts, removeToast } = useStore(
    (state) => ({ toasts: state.toasts, removeToast: state.removeToast }),
    shallow
  );

  return (
    <div className="vs-toaster">
      {toasts.map((toast) => (
        <div key={toast.id} className={`vs-toast vs-toast--${toast.type}`}>
          <span className="vs-toast__icon">{icons[toast.type] || 'i'}</span>
          <span className="vs-toast__message">{toast.message}</span>
          <button className="vs-toast__close" onClick={() => removeToast(toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
