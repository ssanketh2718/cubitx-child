import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05091a] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#0f1a38] border border-red-500/30 p-8 rounded-3xl max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold text-red-400">Something went wrong</h2>
            <p className="text-sm text-gray-400">
              {this.state.error?.message || "An unexpected error occurred during rendering."}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition-all"
              >
                Clear Cache & Restart
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#5b7fff] text-white rounded-xl text-sm font-semibold hover:bg-[#4a6ee0] transition-all"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}