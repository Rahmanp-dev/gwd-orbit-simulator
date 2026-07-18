/**
 * Toast notification system for GWD Orbit Simulator.
 * 
 * Usage:
 *   // In a layout or root component:
 *   <ToastProvider />
 * 
 *   // In any component:
 *   const { toast } = useToast();
 *   toast.success("Deal submitted!");
 *   toast.error("Something went wrong");
 *   toast.info("Processing...");
 */
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastActions {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

interface ToastContextType {
  toast: ToastActions;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback that doesn't crash — just logs to console
    return {
      toast: {
        success: () => {},
        error: (m) => console.error("[toast:error]", m),
        info: () => {},
        warning: (m) => console.warn("[toast:warning]", m),
        dismiss: () => {},
      },
    };
  }
  return ctx;
}

// ─── Variant styling ──────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, { bg: string; icon: string; border: string }> = {
  success: {
    bg: "linear-gradient(135deg, #065F46 0%, #047857 100%)",
    icon: "✓",
    border: "1px solid rgba(16, 185, 129, 0.3)",
  },
  error: {
    bg: "linear-gradient(135deg, #991B1B 0%, #DC2626 100%)",
    icon: "✕",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  info: {
    bg: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)",
    icon: "ℹ",
    border: "1px solid rgba(59, 130, 246, 0.3)",
  },
  warning: {
    bg: "linear-gradient(135deg, #78350F 0%, #D97706 100%)",
    icon: "⚠",
    border: "1px solid rgba(245, 158, 11, 0.3)",
  },
};

// ─── Toast Item Component ─────────────────────────────────────────────────────

function ToastItemView({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false);
  const style = VARIANT_STYLES[item.variant];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, item.duration);
    return () => clearTimeout(timeout);
  }, [item.duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={() => { setExiting(true); setTimeout(onDismiss, 300); }}
      style={{
        background: style.bg,
        border: style.border,
        borderRadius: "12px",
        padding: "12px 16px",
        color: "#fff",
        fontSize: "13px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        backdropFilter: "blur(12px)",
        maxWidth: "420px",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "translateX(100px)" : "translateX(0)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: "toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <span
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          flexShrink: 0,
        }}
      >
        {style.icon}
      </span>
      <span style={{ lineHeight: 1.4 }}>{item.message}</span>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant, duration = 4000) => {
    const id = `toast-${++idCounter}-${Date.now()}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, variant, duration }]); // Max 5 visible
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast: ToastActions = {
    success: (m, d) => addToast(m, "success", d),
    error: (m, d) => addToast(m, "error", d ?? 6000),
    info: (m, d) => addToast(m, "info", d),
    warning: (m, d) => addToast(m, "warning", d ?? 5000),
    dismiss,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Global toast style animation */}
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(100px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
      {/* Toast container — fixed bottom-right */}
      <div
        aria-label="Notifications"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastItemView item={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
