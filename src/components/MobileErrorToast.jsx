// MobileErrorToast.jsx
import React, { useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const MobileErrorToast = ({ message, onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose?.();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">
            <FaExclamationTriangle className="text-white" />
            <span>{message}</span>
        </div>
    );
};

export default MobileErrorToast;
