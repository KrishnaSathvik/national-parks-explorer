import React from 'react';

class TripPlannerErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        console.error('Trip Planner Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="text-6xl mb-4">🚨</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
                        <p className="text-gray-600 mb-6">
                            The trip planner encountered an unexpected error. Please refresh the page to continue.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-semibold"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                            >
                                Try Again
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    Show Error Details
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                                    {this.state.errorInfo.componentStack}
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

export default TripPlannerErrorBoundary;
