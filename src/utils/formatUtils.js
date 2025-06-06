// formatUtils.js

export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

export const formatCompactDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

export const formatNumber = (num, unit = '') => {
    if (!num || isNaN(num)) return `0${unit}`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M${unit}`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k${unit}`;
    return `${Math.round(num)}${unit}`;
};
