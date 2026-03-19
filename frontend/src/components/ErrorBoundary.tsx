import React, { ReactNode, ReactElement } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h1>❌ Oops! Algo deu errado</h1>
            <p>Desculpe, ocorreu um erro inesperado na aplicação.</p>

            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
                <summary>Detalhes técnicos</summary>
                <p>{this.state.error && this.state.error.toString()}</p>
                {this.state.errorInfo && <p>{this.state.errorInfo.componentStack}</p>}
              </details>
            )}

            <button onClick={this.resetError} className="error-boundary-button">
              Tentar Novamente
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              className="error-boundary-button error-boundary-button-secondary"
            >
              Voltar para Início
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as ReactElement;
  }
}

const styles = `
.error-boundary-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-boundary-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.error-boundary-content h1 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 28px;
}

.error-boundary-content p {
  color: #666;
  margin: 12px 0;
  line-height: 1.6;
}

.error-boundary-content details {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  text-align: left;
  font-size: 12px;
  color: #333;
}

.error-boundary-content summary {
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 8px;
}

.error-boundary-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  margin-right: 10px;
  transition: background 0.3s;
}

.error-boundary-button:hover {
  background: #5568d3;
}

.error-boundary-button-secondary {
  background: #6c757d;
}

.error-boundary-button-secondary:hover {
  background: #5a6268;
}
`;

export const ErrorBoundaryStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: styles }} />
);
