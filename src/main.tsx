import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RootErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('kurdhi_academic_state_cache_v3_sql');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#004b87] text-white flex items-center justify-center mx-auto shadow-md">
              <span className="font-serif font-bold text-2xl tracking-wider">UNS</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Portofolio Akademik
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Terjadi penyesuaian saat memuat tampilan komponen. Silakan klik tombol di bawah untuk menyegarkan tampilan.
            </p>
            {this.state.error && (
              <div className="text-left bg-slate-100 p-3 rounded-lg text-xs font-mono text-slate-700 overflow-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="px-6 py-2.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Muat Ulang Halaman
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
}

