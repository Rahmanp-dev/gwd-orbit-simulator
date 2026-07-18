"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Orbit ErrorBoundary] Uncaught React rendering error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl m-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-[var(--text-primary)] mb-2">
            Something went wrong
          </h2>
          <p className="text-xs text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || "An unexpected UI rendering error occurred."}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--crimson)] text-white text-xs font-bold rounded-xl hover:bg-[var(--crimson-dark)] transition-all active:scale-95 shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
