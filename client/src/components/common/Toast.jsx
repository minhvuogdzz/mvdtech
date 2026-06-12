import { useState, useEffect, useCallback } from 'react';

let addToastFn = null;

export const showToast = (message, type = 'success', duration = 3000) => {
  if (addToastFn) addToastFn({ message, type, duration, id: Date.now() });
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, toast.duration);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="toast flex items-center gap-3"
          style={{
            borderLeft: `3px solid ${toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : 'var(--accent)'}`,
          }}
        >
          {toast.type === 'success' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          )}
          {toast.type === 'error' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          <span style={{ color: 'var(--text-primary)' }}>{toast.message}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
