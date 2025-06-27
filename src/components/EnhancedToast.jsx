// src/components/EnhancedToast.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaRoute } from 'react-icons/fa';

const EnhancedToast = ({
                           message,
                           type = 'info',
                           onClose,
                           actionLabel,
                           onActionClick,
                           duration = 5000
                       }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, duration);

        const progressTimer = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - (100 / (duration / 100));
                return Math.max(0, newProgress);
            });
        }, 100);

        return () => {
            clearTimeout(timer);
            clearInterval(progressTimer);
        };
    }, [duration, onClose]);

    const getToastStyles = () => {
        switch(type) {
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'trip':
                return 'bg-purple-50 border-purple-200 text-purple-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getProgressColor = () => {
        switch(type) {
            case 'error':
                return 'bg-red-400';
            case 'success':
                return 'bg-green-400';
            case 'warning':
                return 'bg-yellow-400';
            case 'trip':
                return 'bg-purple-400';
            default:
                return 'bg-blue-400';
        }
    };

    const getIcon = () => {
        switch(type) {
            case 'error':
                return <FaExclamationTriangle className="text-red-500" />;
            case 'success':
                return <FaCheckCircle className="text-green-500" />;
            case 'warning':
                return <FaExclamationTriangle className="text-yellow-500" />;
            case 'trip':
                return <FaRoute className="text-purple-500" />;
            default:
                return <FaInfoCircle className="text-blue-500" />;
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 left-4 right-4 z-50 rounded-xl border shadow-lg transform transition-all duration-300 overflow-hidden ${getToastStyles()}`}>
            {/* Progress bar */}
            <div
                className={`h-1 transition-all duration-100 ease-linear ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
            ></div>

            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-relaxed">{message}</p>
                        {actionLabel && onActionClick && (
                            <button
                                onClick={onActionClick}
                                className="mt-2 text-xs underline hover:no-underline font-medium transition-colors"
                            >
                                {actionLabel}
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            onClose?.();
                        }}
                        className="p-1 hover:bg-black/10 rounded transition-colors flex-shrink-0"
                    >
                        <FaTimes className="text-xs" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnhancedToast;