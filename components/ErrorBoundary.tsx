'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="text-center p-5">
              <div className="mb-4">
                <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
              </div>
              <h2 className="text-danger mb-3">حدث خطأ غير متوقع</h2>
              <p className="text-muted mb-4">
                نعتذر، حدث خطأ أثناء تحميل هذا الجزء من التطبيق. يرجى المحاولة مرة أخرى.
              </p>
              
              <div className="d-flex gap-3 justify-content-center">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-refresh me-2"></i>
                  إعادة تحميل الصفحة
                </button>
                
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                >
                  <i className="fas fa-redo me-2"></i>
                  المحاولة مرة أخرى
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-start">
                  <summary className="btn btn-link text-decoration-none">
                    عرض تفاصيل الخطأ (وضع التطوير)
                  </summary>
                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>رسالة الخطأ:</h6>
                    <pre className="text-danger small">
                      {this.state.error.toString()}
                    </pre>
                    
                    {this.state.errorInfo && (
                      <>
                        <h6 className="mt-3">تفاصيل المكون:</h6>
                        <pre className="text-muted small">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
