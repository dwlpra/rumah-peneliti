"use client";
import { useState, useCallback, useContext, createContext } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const colors = {
    success: { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)", text: "#22c55e", icon: "✅" },
    error: { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)", text: "#ef4444", icon: "❌" },
    info: { bg: "rgba(0,240,255,0.1)", border: "rgba(0,240,255,0.2)", text: "#00f0ff", icon: "ℹ️" },
    warning: { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", text: "#f59e0b", icon: "⚠️" },
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 9999,
        display: "flex", flexDirection: "column-reverse", gap: 8, maxWidth: 400,
      }}>
        {toasts.map(toast => {
          const c = colors[toast.type] || colors.info;
          return (
            <div key={toast.id} onClick={() => removeToast(toast.id)}
              style={{
                background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10,
                padding: "10px 16px", color: c.text, fontSize: "0.85rem", cursor: "pointer",
                backdropFilter: "blur(12px)", animation: "slideInRight 0.3s ease-out",
                display: "flex", alignItems: "center", gap: 8,
              }}>
              <span>{c.icon}</span>
              <span style={{ color: "var(--text-primary, #fff)" }}>{toast.message}</span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { addToast: () => {}, removeToast: () => {} };
  return ctx;
}
