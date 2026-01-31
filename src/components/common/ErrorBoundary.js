import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you would send this to your error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    // Log to Supabase if available
    this.logErrorToDatabase(error, errorInfo, errorId);
  }

  async logErrorToDatabase(error, errorInfo, errorId) {
    try {
      // This would integrate with your existing Supabase logger
      const errorData = {
        error_id: errorId,
        error_message: error.message,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        url: window.location.href
      };
      
      console.log('Error logged with ID:', errorId, errorData);
      
      // TODO: Integrate with your Supabase error logging table
      // await supabaseLogger.logError(errorData);
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-jersey text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-400 font-normaltext mb-6">
                We encountered an unexpected error. Our team has been notified.
              </p>
              
              {this.state.errorId && (
                <div className="bg-gray-800 rounded p-3 mb-4">
                  <p className="text-xs text-gray-400 font-normaltext">
                    Error ID: {this.state.errorId}
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-logocolor text-black px-4 py-2 rounded-lg font-normaltext hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg font-normaltext hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Go to Dashboard</span>
                </button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                    Show Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-800 rounded text-xs text-red-400 overflow-auto max-h-40">
                    <pre>{this.state.error.toString()}</pre>
                    <pre className="mt-2 text-gray-500">{this.state.errorInfo.componentStack}</pre>
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

export default ErrorBoundary;
