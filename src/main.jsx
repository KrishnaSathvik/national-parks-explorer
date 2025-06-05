// ✨ Enhanced main.jsx - Advanced Application Setup and Bootstrap
import React, {StrictMode} from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import App from "./App";

// Enhanced CSS imports with proper order
import 'leaflet/dist/leaflet.css';
import './styles.css';
import './App.css';

// Enhanced context providers
import {AuthProvider} from "./context/AuthContext";
import {ToastProvider} from "./context/ToastContext";

// Enhanced error boundary for the entire app
import {ErrorBoundary} from "react-error-boundary";

// Enhanced performance monitoring
import {createPerformanceTrace, logAnalyticsEvent} from "./firebase";

// Global error handler component
function ErrorFallback({error, resetErrorBoundary}) {
    return (
        <div
            className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-red-100">
                <div className="text-6xl mb-6">💥</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Application Error
                </h1>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    We encountered an unexpected error that prevented the app from loading properly.
                    This has been reported to our team.
                </p>

                {/* Error details for development */}
                {import.meta.env.DEV && (
                    <details className="mb-6 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium">
                            🔧 Error Details (Development Mode)
                        </summary>
                        <div className="mt-3 p-4 bg-red-50 rounded-xl border border-red-200">
                            <p className="text-sm font-mono text-red-800 break-all">
                                {error.message}
                            </p>
                            {error.stack && (
                                <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-32">
                  {error.stack}
                </pre>
                            )}
                        </div>
                    </details>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={resetErrorBoundary}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        🔄 Try Again
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                    >
                        🔃 Reload Page
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        If this problem persists, please contact support
                    </p>
                </div>
            </div>
        </div>
    );
}

// Enhanced initialization function
const initializeApp = async () => {
    // Start performance monitoring
    const initTrace = createPerformanceTrace?.('app_initialization');
    initTrace?.start();

    try {
        // Basic browser compatibility checks
        const requiredFeatures = {
            'ES6 Modules': () => window.Symbol && window.Map && window.Set,
            'Fetch API': () => window.fetch,
            'Local Storage': () => window.localStorage,
            'Session Storage': () => window.sessionStorage,
            'CSS Custom Properties': () => window.CSS && window.CSS.supports && window.CSS.supports('--test', '0'),
            'IntersectionObserver': () => window.IntersectionObserver,
            'RequestAnimationFrame': () => window.requestAnimationFrame
        };

        const missingFeatures = Object.entries(requiredFeatures)
            .filter(([name, test]) => !test())
            .map(([name]) => name);

        if (missingFeatures.length > 0) {
            console.warn('⚠️ Missing browser features:', missingFeatures);

            // Log unsupported browser
            logAnalyticsEvent?.('unsupported_browser', {
                missing_features: missingFeatures,
                user_agent: navigator.userAgent,
                browser_name: navigator.appName,
                browser_version: navigator.appVersion
            });

            // Show compatibility warning for production
            if (!import.meta.env.DEV) {
                const shouldContinue = confirm(
                    `Your browser may not support all features of this application.\n\n` +
                    `Missing features: ${missingFeatures.join(', ')}\n\n` +
                    `For the best experience, please update your browser or try a modern browser like Chrome, Firefox, or Safari.\n\n` +
                    `Continue anyway?`
                );

                if (!shouldContinue) {
                    document.body.innerHTML = `
            <div style="
              min-height: 100vh; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-family: system-ui, sans-serif;
              background: linear-gradient(135deg, #fdf2f8 0%, #faf5ff 50%, #eff6ff 100%);
              padding: 2rem;
            ">
              <div style="
                max-width: 500px; 
                text-align: center; 
                background: white; 
                padding: 3rem; 
                border-radius: 1.5rem; 
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
              ">
                <div style="font-size: 4rem; margin-bottom: 1.5rem;">🌐</div>
                <h1 style="font-size: 1.75rem; font-weight: bold; margin-bottom: 1rem; color: #1f2937;">
                  Browser Update Required
                </h1>
                <p style="color: #6b7280; margin-bottom: 2rem; line-height: 1.6;">
                  To use National Parks Explorer, please update your browser or switch to a modern browser for the best experience.
                </p>
                <a 
                  href="https://browsehappy.com/" 
                  target="_blank"
                  style="
                    display: inline-block;
                    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                    color: white;
                    padding: 0.75rem 2rem;
                    border-radius: 0.75rem;
                    text-decoration: none;
                    font-weight: 600;
                    transition: transform 0.2s;
                  "
                  onmouseover="this.style.transform='scale(1.05)'"
                  onmouseout="this.style.transform='scale(1)'"
                >
                  Update Browser
                </a>
              </div>
            </div>
          `;
                    return;
                }
            }
        }

        // Enhanced body class setup
        document.body.classList.add("body-base");

        // Add mobile/desktop classes for CSS targeting
        const isMobile = window.innerWidth <= 768;
        document.body.classList.add(isMobile ? 'is-mobile' : 'is-desktop');

        // Add touch/no-touch classes
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        document.body.classList.add(hasTouch ? 'has-touch' : 'no-touch');

        // Add reduced motion class if user prefers it
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('prefers-reduced-motion');
        }

        // Add dark mode class if user prefers it
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('prefers-dark');
        }

        // Enhanced viewport meta tag for mobile
        if (isMobile) {
            let viewport = document.querySelector('meta[name="viewport"]');
            if (!viewport) {
                viewport = document.createElement('meta');
                viewport.name = 'viewport';
                document.head.appendChild(viewport);
            }
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
        }

        // Add theme color meta tags
        const addMetaTag = (name, content) => {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = name;
                document.head.appendChild(meta);
            }
            meta.content = content;
        };

        addMetaTag('theme-color', '#ec4899');
        addMetaTag('apple-mobile-web-app-capable', 'yes');
        addMetaTag('apple-mobile-web-app-status-bar-style', 'default');
        addMetaTag('apple-mobile-web-app-title', 'National Parks Explorer');

        // Enhanced console welcome message
        if (import.meta.env.PROD) {
            console.log(
                '%c🏞️ National Parks Explorer',
                'font-size: 24px; font-weight: bold; color: #ec4899; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);'
            );
            console.log(
                '%cWelcome to National Parks Explorer! 🌲\n' +
                'Discover amazing national parks across the United States.\n' +
                'Built with ❤️ using React, Firebase, and modern web technologies.\n\n' +
                'Found a bug? Have feedback? We\'d love to hear from you!',
                'font-size: 14px; color: #6b7280; line-height: 1.5;'
            );
        } else {
            console.log(
                '%c🔧 Development Mode Active',
                'font-size: 16px; font-weight: bold; color: #059669; background: #d1fae5; padding: 8px 12px; border-radius: 6px;'
            );
            console.log('Environment variables:', import.meta.env);
        }

        // Performance monitoring
        const performanceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.entryType === 'navigation') {
                    logAnalyticsEvent?.('app_performance', {
                        load_time: entry.loadEventEnd - entry.loadEventStart,
                        dom_content_loaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                        dns_lookup: entry.domainLookupEnd - entry.domainLookupStart,
                        tcp_connect: entry.connectEnd - entry.connectStart,
                        server_response: entry.responseEnd - entry.requestStart,
                        dom_parse: entry.domContentLoadedEventStart - entry.responseEnd,
                        resource_load: entry.loadEventStart - entry.domContentLoadedEventEnd
                    });
                }
            });
        });

        if ('PerformanceObserver' in window) {
            try {
                performanceObserver.observe({entryTypes: ['navigation', 'measure']});
            } catch (error) {
                console.warn('⚠️ Performance monitoring unavailable:', error);
            }
        }

        // Log successful initialization
        logAnalyticsEvent?.('app_initialized', {
            timestamp: Date.now(),
            environment: import.meta.env.MODE,
            has_touch: hasTouch,
            is_mobile: isMobile,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            user_agent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        console.log('✅ App initialization completed successfully');

    } catch (error) {
        console.error('❌ App initialization failed:', error);

        logAnalyticsEvent?.('app_init_error', {
            error_message: error.message,
            error_stack: error.stack
        });
    } finally {
        initTrace?.stop();
    }
};

// Enhanced error reporting function
const reportError = (error, errorInfo) => {
    console.error('🔥 React Error Boundary caught an error:', error, errorInfo);

    // Log to analytics
    logAnalyticsEvent?.('react_error_boundary', {
        error_message: error.message,
        error_stack: error.stack,
        component_stack: errorInfo?.componentStack,
        timestamp: Date.now(),
        url: window.location.href,
        user_agent: navigator.userAgent
    });

    // Additional error reporting could be added here
    // e.g., Sentry, LogRocket, or other error tracking services
};

// Initialize the app
initializeApp();

// Enhanced React 18 root creation with error handling
const container = document.getElementById("root");

if (!container) {
    throw new Error('Root element not found. Make sure you have <div id="root"></div> in your HTML.');
}

const root = ReactDOM.createRoot(container);

// Enhanced render with comprehensive providers and error boundary
root.render(
    <StrictMode>
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={reportError}
            onReset={() => {
                // Clear any error state
                window.location.reload();
            }}
        >
            <BrowserRouter>
                <AuthProvider>
                    <ToastProvider
                        position="top-right"
                        maxToasts={5}
                        enableSounds={false}
                        enableReducedMotion={true}
                    >
                        <App/>
                    </ToastProvider>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </StrictMode>
);

// Enhanced development helpers
if (import.meta.env.DEV) {
    // Hot reload indicator
    if (import.meta.hot) {
        import.meta.hot.accept();
        console.log('🔥 Hot reload active');
    }

    // Development shortcuts
    window.devHelpers = {
        clearStorage: () => {
            localStorage.clear();
            sessionStorage.clear();
            console.log('🧹 Storage cleared');
        },
        logEnv: () => {
            console.table(import.meta.env);
        },
        toggleTheme: () => {
            document.body.classList.toggle('dark-theme');
            console.log('🎨 Theme toggled');
        },
        simulateOffline: () => {
            window.dispatchEvent(new Event('offline'));
            console.log('📴 Offline mode simulated');
        },
        simulateOnline: () => {
            window.dispatchEvent(new Event('online'));
            console.log('🌐 Online mode simulated');
        }
    };

    console.log(
        '%c💡 Development Helpers Available',
        'background: #3b82f6; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold;'
    );
    console.log('Available in console:', Object.keys(window.devHelpers));
}

// Enhanced production optimizations
if (import.meta.env.PROD) {
    // Disable console.log in production (keep errors and warnings)
    const originalLog = console.log;
    console.log = (...args) => {
        // Only log in development or for important messages
        if (args[0]?.includes?.('✅') || args[0]?.includes?.('❌') || args[0]?.includes?.('⚠️')) {
            originalLog.apply(console, args);
        }
    };

    // Add global error handler for unhandled errors
    window.addEventListener('error', (event) => {
        logAnalyticsEvent?.('global_error', {
            error_message: event.error?.message || event.message,
            error_filename: event.filename,
            error_lineno: event.lineno,
            error_colno: event.colno,
            error_stack: event.error?.stack,
            timestamp: Date.now()
        });
    });

    // Add global handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        logAnalyticsEvent?.('unhandled_promise_rejection', {
            error_message: event.reason?.message || String(event.reason),
            error_stack: event.reason?.stack,
            timestamp: Date.now()
        });
    });
}

// Performance monitoring for Core Web Vitals
if ('web-vitals' in window) {
    import('web-vitals').then(({getCLS, getFID, getFCP, getLCP, getTTFB}) => {
        getCLS((metric) => logAnalyticsEvent?.('core_web_vital_cls', metric));
        getFID((metric) => logAnalyticsEvent?.('core_web_vital_fid', metric));
        getFCP((metric) => logAnalyticsEvent?.('core_web_vital_fcp', metric));
        getLCP((metric) => logAnalyticsEvent?.('core_web_vital_lcp', metric));
        getTTFB((metric) => logAnalyticsEvent?.('core_web_vital_ttfb', metric));
    }).catch(() => {
        // Web vitals not available, silently continue
    });
}

export default root;