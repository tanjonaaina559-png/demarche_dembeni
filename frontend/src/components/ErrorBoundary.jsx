import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#F9FAFB', padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '600px', width: '100%',
            textAlign: 'center', border: '1px solid #FEE2E2'
          }}>
            <div style={{
              width: '64px', height: '64px', background: '#FEE2E2', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: '28px'
            }}>⚠️</div>
            <h2 style={{ color: '#111827', marginBottom: '10px', fontSize: '1.4rem' }}>
              Une erreur est survenue
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '0.95rem' }}>
              {this.state.error?.message || "Une erreur inattendue s'est produite dans cette page."}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={{
                background: '#1F2937', color: '#F9FAFB', padding: '16px',
                borderRadius: '8px', fontSize: '0.75rem', textAlign: 'left',
                overflowX: 'auto', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto'
              }}>
                {this.state.error.stack}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                style={{
                  padding: '10px 20px', background: '#16A34A', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                }}
              >
                🔄 Réessayer
              </button>
              <button
                onClick={() => window.history.back()}
                style={{
                  padding: '10px 20px', background: 'white', color: '#374151',
                  border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                }}
              >
                ← Retour
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
