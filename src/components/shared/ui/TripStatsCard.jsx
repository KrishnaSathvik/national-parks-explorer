// src/components/shared/ui/TripStatsCard.jsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const TripStatsCard = ({
                           value,
                           label,
                           color = 'from-blue-500 to-purple-500',
                           icon = null,
                           loading = false,
                           onClick = null,
                           className = '',
                           size = 'normal' // 'small', 'normal', 'large'
                       }) => {
    const sizeClasses = {
        small: 'p-3 text-sm',
        normal: 'p-4 text-base',
        large: 'p-6 text-lg'
    };

    const valueClasses = {
        small: 'text-lg sm:text-xl',
        normal: 'text-lg sm:text-xl',
        large: 'text-xl sm:text-2xl'
    };

    const labelClasses = {
        small: 'text-xs',
        normal: 'text-xs sm:text-sm',
        large: 'text-sm'
    };

    const Component = onClick ? 'button' : 'div';

    return (
        <Component
            onClick={onClick}
            className={`
                bg-gradient-to-br ${color} text-white rounded-xl shadow-lg
                flex flex-col items-center justify-center text-center
                transition-all duration-200
                ${onClick ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : ''}
                ${sizeClasses[size]}
                ${className}
            `}
        >
            {/* Icon */}
            {icon && (
                <div className="mb-2 opacity-80">
                    {React.isValidElement(icon) ? icon : <icon className="w-5 h-5" />}
                </div>
            )}

            {/* Value */}
            <div className={`font-bold ${valueClasses[size]} mb-1`}>
                {loading ? (
                    <FaSpinner className="animate-spin mx-auto w-5 h-5" />
                ) : (
                    value
                )}
            </div>

            {/* Label */}
            <div className={`font-medium tracking-wide opacity-90 ${labelClasses[size]}`}>
                {label}
            </div>
        </Component>
    );
};

// Pre-configured variants for common use cases
export const TripCountCard = ({ count, loading, ...props }) => (
    <TripStatsCard
        value={loading ? '...' : count}
        label="Trips"
        color="from-blue-500 to-cyan-500"
        loading={loading}
        {...props}
    />
);

export const ParksCountCard = ({ count, loading, ...props }) => (
    <TripStatsCard
        value={loading ? '...' : count}
        label="Parks"
        color="from-green-500 to-emerald-500"
        loading={loading}
        {...props}
    />
);

export const BudgetCard = ({ amount, loading, ...props }) => (
    <TripStatsCard
        value={loading ? '...' : `$${amount?.toLocaleString() || 0}`}
        label="Budget"
        color="from-yellow-500 to-orange-500"
        loading={loading}
        {...props}
    />
);

export const DurationCard = ({ days, loading, ...props }) => (
    <TripStatsCard
        value={loading ? '...' : `${days || 0}`}
        label={`Day${days !== 1 ? 's' : ''}`}
        color="from-purple-500 to-pink-500"
        loading={loading}
        {...props}
    />
);

export default TripStatsCard;