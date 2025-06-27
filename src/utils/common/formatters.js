// src/utils/common/formatters.js

/**
 * Date formatting utilities
 */
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'Not set';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';

        const defaultOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

export const formatCompactDate = (dateString) => {
    return formatDate(dateString, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Dates not set';

    try {
        const start = formatDate(startDate, { month: 'short', day: 'numeric' });
        const end = formatDate(endDate, { month: 'short', day: 'numeric', year: 'numeric' });
        return `${start} → ${end}`;
    } catch (error) {
        return 'Invalid date range';
    }
};

export const formatRelativeDate = (dateString) => {
    if (!dateString) return 'Unknown';

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

        return `${Math.floor(diffDays / 365)} years ago`;
    } catch (error) {
        return 'Unknown';
    }
};

/**
 * Currency formatting utilities
 */
export const formatCurrency = (amount, options = {}) => {
    if (!amount || amount === 0) return '$0';

    const {
        showCents = false,
        currency = 'USD',
        locale = 'en-US'
    } = options;

    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: showCents ? 2 : 0,
        maximumFractionDigits: showCents ? 2 : 0
    });

    return formatter.format(amount);
};

export const formatCurrencyCompact = (amount) => {
    if (!amount || amount === 0) return '$0';

    if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}K`;
    }

    return formatCurrency(amount);
};

/**
 * Number formatting utilities
 */
export const formatNumber = (num, unit = '') => {
    if (!num || isNaN(num) || num === 0) return `0${unit}`;

    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M${unit}`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K${unit}`;
    }

    return `${Math.round(num).toLocaleString()}${unit}`;
};

export const formatNumberPrecise = (num, decimals = 0) => {
    if (!num || isNaN(num)) return '0';

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
};

export const formatPercentage = (value, total, decimals = 1) => {
    if (!value || !total || total === 0) return '0%';

    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
};

/**
 * Duration formatting utilities
 */
export const formatDuration = (days) => {
    if (!days || days === 0) return '0 days';
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;

    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;

    if (weeks === 1 && remainingDays === 0) return '1 week';
    if (weeks > 1 && remainingDays === 0) return `${weeks} weeks`;
    if (weeks === 1) return `1 week, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;

    return `${weeks} weeks, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
};

export const formatHours = (hours) => {
    if (!hours || hours === 0) return '0 hours';
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours === 1) return '1 hour';
    if (hours < 24) return `${Math.round(hours)} hours`;

    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);

    if (days === 1 && remainingHours === 0) return '1 day';
    if (days > 1 && remainingHours === 0) return `${days} days`;
    if (days === 1) return `1 day, ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;

    return `${days} days, ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
};

/**
 * Distance formatting utilities
 */
export const formatDistance = (miles) => {
    if (!miles || miles === 0) return '0 mi';
    if (miles < 0.1) return `${Math.round(miles * 5280)} ft`;
    if (miles < 1) return `${(miles).toFixed(1)} mi`;

    return `${formatNumber(miles)} mi`;
};

export const formatDistanceMetric = (kilometers) => {
    if (!kilometers || kilometers === 0) return '0 km';
    if (kilometers < 0.1) return `${Math.round(kilometers * 1000)} m`;
    if (kilometers < 1) return `${(kilometers).toFixed(1)} km`;

    return `${formatNumber(kilometers)} km`;
};

/**
 * Size formatting utilities
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Text formatting utilities
 */
export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';

    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phoneNumber; // Return original if not 10 digits
};

export const formatCapitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

export const formatSlug = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const formatTruncate = (str, maxLength = 100, suffix = '...') => {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Trip-specific formatting utilities
 */
export const formatTripStatus = (trip) => {
    if (!trip.startDate || !trip.endDate) return 'Planning';

    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    if (now < start) return 'Upcoming';
    if (now > end) return 'Completed';
    return 'In Progress';
};

export const formatTripDates = (trip) => {
    if (!trip.startDate || !trip.endDate) return 'Dates not set';

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const isSameYear = start.getFullYear() === end.getFullYear();
    const isSameMonth = isSameYear && start.getMonth() === end.getMonth();

    if (isSameMonth) {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
    } else if (isSameYear) {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
};

export const formatParksList = (parks, maxShow = 3) => {
    if (!parks || parks.length === 0) return 'No parks selected';

    const parkNames = parks.map(park => park.parkName || park.name);

    if (parkNames.length <= maxShow) {
        return parkNames.join(', ');
    }

    const shown = parkNames.slice(0, maxShow);
    const remaining = parkNames.length - maxShow;

    return `${shown.join(', ')} and ${remaining} more`;
};

/**
 * Analytics formatting utilities
 */
export const formatGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? '+∞%' : '0%';

    const growth = ((current - previous) / previous) * 100;
    const sign = growth >= 0 ? '+' : '';

    return `${sign}${growth.toFixed(1)}%`;
};

export const formatTrend = (value, isPositive = true) => {
    const arrow = isPositive ? '↗' : '↘';
    const color = isPositive ? 'text-green-600' : 'text-red-600';

    return {
        value: formatNumber(Math.abs(value)),
        arrow,
        color,
        formatted: `${arrow} ${formatNumber(Math.abs(value))}`
    };
};

/**
 * Validation utilities
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
};

export const isValidPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length === 10;
};

/**
 * URL formatting utilities
 */
export const formatShareUrl = (baseUrl, tripId, tripTitle) => {
    const slug = formatSlug(tripTitle);
    return `${baseUrl}/trip/${tripId}/${slug}`;
};

export const formatImageUrl = (imageUrl, width, height) => {
    if (!imageUrl) return '';

    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;

    // If it's a relative path, construct full URL
    const baseUrl = window.location.origin;
    return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

/**
 * Export all formatters as a single object for easy importing
 */
export const formatters = {
    // Date formatters
    date: formatDate,
    compactDate: formatCompactDate,
    dateRange: formatDateRange,
    relativeDate: formatRelativeDate,

    // Currency formatters
    currency: formatCurrency,
    currencyCompact: formatCurrencyCompact,

    // Number formatters
    number: formatNumber,
    numberPrecise: formatNumberPrecise,
    percentage: formatPercentage,

    // Duration formatters
    duration: formatDuration,
    hours: formatHours,

    // Distance formatters
    distance: formatDistance,
    distanceMetric: formatDistanceMetric,

    // Size formatters
    fileSize: formatFileSize,

    // Text formatters
    phoneNumber: formatPhoneNumber,
    capitalize: formatCapitalize,
    titleCase: formatTitleCase,
    slug: formatSlug,
    truncate: formatTruncate,

    // Trip formatters
    tripStatus: formatTripStatus,
    tripDates: formatTripDates,
    parksList: formatParksList,

    // Analytics formatters
    growthRate: formatGrowthRate,
    trend: formatTrend,

    // Validation
    isValidEmail,
    isValidDate,
    isValidPhoneNumber,

    // URL formatters
    shareUrl: formatShareUrl,
    imageUrl: formatImageUrl
};

export default formatters;