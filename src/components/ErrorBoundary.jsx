import { Component } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-3">
              Something Went Wrong
            </h1>
            <p className="text-text-secondary mb-8 leading-relaxed">
              We apologize for the inconvenience. An unexpected error has occurred. 
              Please try refreshing the page or return to the homepage.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full font-medium text-sm transition-all active:scale-95 w-full sm:w-auto justify-center"
                aria-label="Reload page"
              >
                <RefreshCw size={16} />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 bg-bg-card border border-border-subtle hover:border-text-secondary text-text-primary px-6 py-3 rounded-full font-medium text-sm transition-all w-full sm:w-auto justify-center"
                aria-label="Go to homepage"
              >
                Go to Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-text-muted text-sm cursor-pointer hover:text-text-secondary">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-4 bg-bg-card border border-border-subtle rounded-xl text-xs text-red-400 overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
