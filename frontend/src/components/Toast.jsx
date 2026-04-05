import { useState, useCallback, useRef } from 'react';

let _toastId = 0;

// ─── Hook ────────────────────────────────────────────────────

/**
 * useToast()
 * Retorna { toasts, toast }
 * toast({ message, type: 'success'|'error'|'info', duration? })
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 220);
  }, []);

  const toast = useCallback(
    ({ message, type = 'info', duration = 3500 }) => {
      const id = ++_toastId;
      setToasts((prev) => [...prev, { id, message, type }]);

      timers.current[id] = setTimeout(() => {
        dismiss(id);
        delete timers.current[id];
      }, duration);

      return id;
    },
    [dismiss]
  );

  return { toasts, toast, dismiss };
}

// ─── Componente ──────────────────────────────────────────────

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export function Toast({ toasts, dismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="region" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}${t.exiting ? ' exit' : ''}`}
          onClick={() => dismiss(t.id)}
          title="Clique para fechar"
        >
          <span style={{ fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
            {ICONS[t.type] ?? ICONS.info}
          </span>
          <span style={{ flex: 1 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
