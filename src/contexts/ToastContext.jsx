// src/contexts/ToastContext.jsx
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

const BG = {
  success: '#059669',
  error:   '#DC2626',
  info:    '#1F3A5F',
  warning: '#D97706',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((msg, type = 'info', ms = 3200) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), ms);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        zIndex: 900, display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} className="slide" style={{
            background: BG[t.type] || BG.info,
            color: '#fff',
            padding: '11px 18px',
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 500,
            boxShadow: '0 6px 28px rgba(14,28,47,.22)',
            maxWidth: 340,
            lineHeight: 1.4,
          }}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
