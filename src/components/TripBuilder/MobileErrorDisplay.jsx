// MobileErrorDisplay.jsx
import React from 'react';
import { FaExclamationCircle, FaTimes } from 'react-icons/fa';

const MobileErrorDisplay = ({ errors, onDismiss }) => {
    const entries = Object.entries(errors || {});

    if (entries.length === 0) return null;

    return (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg m-3 sm:mx-auto max-w-3xl">
            <div className="flex items-start gap-2">
                <FaExclamationCircle className="mt-1 flex-shrink-0" />
                <div className="flex-1 text-sm space-y-1">
                    {entries.map(([key, msg]) => (
                        <div key={key} className="flex justify-between items-center">
                            <span>{msg}</span>
                            <button onClick={() => onDismiss(key)} className="text-red-500 hover:text-red-600">
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobileErrorDisplay;
