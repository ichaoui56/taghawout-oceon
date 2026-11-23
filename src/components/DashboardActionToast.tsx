"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type DashboardActionToastProps = {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
};

export default function DashboardActionToast({ type, message, onDismiss }: DashboardActionToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 7000);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={`dashboard-action-toast dashboard-action-toast--${type}`} role={type === "error" ? "alert" : "status"} aria-live={type === "error" ? "assertive" : "polite"} aria-atomic="true">
      <span className="dashboard-action-toast__icon" aria-hidden="true">{type === "success" ? "✓" : "!"}</span>
      <p>{message}</p>
      <button type="button" aria-label="Dismiss notification" onClick={onDismiss}>×</button>
    </div>,
    document.body,
  );
}
