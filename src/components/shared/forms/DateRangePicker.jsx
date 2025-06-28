// src/components/shared/forms/DateRangePicker.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    FaCalendarAlt,
    FaArrowRight,
    FaInfoCircle,
    FaExclamationTriangle,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaMapMarkerAlt
} from 'react-icons/fa';
import { useFormContext } from './SmartForm';

/**
 * Advanced date range picker component optimized for trip planning
 * Features calendar widget, trip duration suggestions, and mobile optimization
 */

const DateRangePicker = ({
                             startDateName = 'startDate',
                             endDateName = 'endDate',
                             label = 'Trip Dates',
                             required = false,
                             disabled = false,
                             className = '',
                             helpText = '',
                             minDate = null,
                             maxDate = null,
                             tripDurationSuggestions = true,
                             showDuration = true,
                             popularDates = []
                         }) => {
    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        disabled: formDisabled,
        loading
    } = useFormContext();

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectingStart, setSelectingStart] = useState(true);
    const [hoveredDate, setHoveredDate] = useState(null);
    const calendarRef = useRef(null);

    const startDate = values[startDateName] ? new Date(values[startDateName]) : null;
    const endDate = values[endDateName] ? new Date(values[endDateName]) : null;
    const startError = errors[startDateName];
    const endError = errors[endDateName];
    const startTouched = touched[startDateName];
    const endTouched = touched[endDateName];
    const hasError = (startError && startTouched) || (endError && endTouched);
    const isDisabled = disabled || formDisabled || loading;

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format date for display
    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Calculate trip duration
    const getTripDuration = () => {
        if (!startDate || !endDate) return null;
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get month days for calendar
    const getMonthDays = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Previous month days
        const prevMonth = new Date(year, month - 1, 0);
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonth.getDate() - i),
                isCurrentMonth: false,
                isSelectable: false
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let isSelectable = true;
            if (minDate && currentDate < new Date(minDate)) isSelectable = false;
            if (maxDate && currentDate > new Date(maxDate)) isSelectable = false;
            if (currentDate < today) isSelectable = false;

            days.push({
                date: currentDate,
                isCurrentMonth: true,
                isSelectable,
                isToday: currentDate.toDateString() === today.toDateString()
            });
        }

        // Next month days to fill the grid
        const remainingDays = 42 - days.length; // 6 rows × 7 days
        for (let day = 1; day <= remainingDays; day++) {
            days.push({
                date: new Date(year, month + 1, day),
                isCurrentMonth: false,
                isSelectable: false
            });
        }

        return days;
    };

    // Check if date is in range
    const isDateInRange = (date) => {
        if (!startDate || !endDate) return false;
        return date >= startDate && date <= endDate;
    };

    // Check if date is selected
    const isDateSelected = (date) => {
        if (!startDate && !endDate) return false;
        const dateStr = date.toDateString();
        const startStr = startDate?.toDateString();
        const endStr = endDate?.toDateString();
        return dateStr === startStr || dateStr === endStr;
    };

    // Check if date is hovered range
    const isDateInHoverRange = (date) => {
        if (!hoveredDate || !startDate || endDate) return false;
        const start = startDate;
        const end = hoveredDate;
        return date >= Math.min(start, end) && date <= Math.max(start, end);
    };

    // Handle date selection
    const handleDateSelect = (date) => {
        if (!date.isSelectable) return;

        const dateStr = date.date.toISOString().split('T')[0];

        if (selectingStart || !startDate) {
            handleChange(startDateName, dateStr);
            if (endDate && new Date(dateStr) > endDate) {
                handleChange(endDateName, '');
            }
            setSelectingStart(false);
        } else {
            if (new Date(dateStr) < startDate) {
                // If selecting end date before start date, swap them
                handleChange(endDateName, values[startDateName]);
                handleChange(startDateName, dateStr);
            } else {
                handleChange(endDateName, dateStr);
            }
            setIsCalendarOpen(false);
            setSelectingStart(true);
        }
    };

    // Handle input focus
    const handleInputFocus = (isStart) => {
        setSelectingStart(isStart);
        setIsCalendarOpen(true);
    };

    // Trip duration suggestions
    const durationSuggestions = [
        { days: 2, label: 'Weekend' },
        { days: 3, label: '3 Days' },
        { days: 7, label: 'Week' },
        { days: 14, label: '2 Weeks' },
        { days: 30, label: 'Month' }
    ];

    // Handle duration suggestion
    const handleDurationSuggestion = (days) => {
        const start = new Date();
        start.setDate(start.getDate() + 1); // Start tomorrow
        const end = new Date(start);
        end.setDate(start.getDate() + days - 1);

        handleChange(startDateName, start.toISOString().split('T')[0]);
        handleChange(endDateName, end.toISOString().split('T')[0]);
    };

    const duration = getTripDuration();

    return (
        <div className={`date-range-picker ${className}`} ref={calendarRef}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Date Inputs */}
            <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Start Date Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={startDate ? formatDate(startDate) : ''}
                            placeholder="Start date"
                            readOnly
                            disabled={isDisabled}
                            onFocus={() => handleInputFocus(true)}
                            onBlur={() => handleBlur(startDateName)}
                            className={`
                                w-full px-4 py-3 pl-10 border rounded-xl transition-all duration-200 cursor-pointer
                                ${hasError
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }
                                ${isDisabled
                                ? 'bg-gray-100 cursor-not-allowed'
                                : 'bg-white hover:border-gray-400'
                            }
                                focus:outline-none focus:ring-2 focus:ring-opacity-50
                            `}
                        />
                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>

                    {/* Arrow separator */}
                    <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="bg-white border border-gray-300 rounded-full p-2">
                            <FaArrowRight className="w-3 h-3 text-gray-400" />
                        </div>
                    </div>

                    {/* End Date Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={endDate ? formatDate(endDate) : ''}
                            placeholder="End date"
                            readOnly
                            disabled={isDisabled}
                            onFocus={() => handleInputFocus(false)}
                            onBlur={() => handleBlur(endDateName)}
                            className={`
                                w-full px-4 py-3 pl-10 border rounded-xl transition-all duration-200 cursor-pointer
                                ${hasError
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }
                                ${isDisabled
                                ? 'bg-gray-100 cursor-not-allowed'
                                : 'bg-white hover:border-gray-400'
                            }
                                focus:outline-none focus:ring-2 focus:ring-opacity-50
                            `}
                        />
                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                </div>

                {/* Duration Display */}
                {showDuration && duration && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <FaClock className="w-3 h-3" />
                        <span>{duration} {duration === 1 ? 'day' : 'days'}</span>
                    </div>
                )}

                {/* Calendar Popup */}
                {isCalendarOpen && !isDisabled && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <FaChevronLeft className="w-4 h-4 text-gray-600" />
                            </button>

                            <h3 className="font-semibold text-gray-800">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>

                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <FaChevronRight className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {getMonthDays(currentMonth).map((day, index) => {
                                const isSelected = isDateSelected(day.date);
                                const isInRange = isDateInRange(day.date);
                                const isInHoverRange = isDateInHoverRange(day.date);

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleDateSelect(day)}
                                        onMouseEnter={() => setHoveredDate(day.date)}
                                        onMouseLeave={() => setHoveredDate(null)}
                                        disabled={!day.isSelectable}
                                        className={`
                                            relative p-2 text-sm rounded-lg transition-all duration-150
                                            ${!day.isCurrentMonth
                                            ? 'text-gray-300'
                                            : day.isSelectable
                                                ? 'text-gray-700 hover:bg-blue-50'
                                                : 'text-gray-300 cursor-not-allowed'
                                        }
                                            ${isSelected
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : isInRange || isInHoverRange
                                                ? 'bg-blue-100 text-blue-700'
                                                : ''
                                        }
                                            ${day.isToday && !isSelected
                                            ? 'border-2 border-blue-500'
                                            : ''
                                        }
                                        `}
                                    >
                                        {day.date.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Quick Duration Suggestions */}
                        {tripDurationSuggestions && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-500 mb-2">Quick Select:</p>
                                <div className="flex flex-wrap gap-2">
                                    {durationSuggestions.map(suggestion => (
                                        <button
                                            key={suggestion.days}
                                            type="button"
                                            onClick={() => handleDurationSuggestion(suggestion.days)}
                                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                        >
                                            {suggestion.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular Dates */}
                        {popularDates.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-500 mb-2">Popular Times:</p>
                                <div className="space-y-1">
                                    {popularDates.map((period, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => {
                                                handleChange(startDateName, period.start);
                                                handleChange(endDateName, period.end);
                                                setIsCalendarOpen(false);
                                            }}
                                            className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 rounded flex items-center gap-2"
                                        >
                                            <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                                            <span>{period.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selection Instructions */}
                        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                            {selectingStart ? (
                                <p>Select your start date</p>
                            ) : (
                                <p>Select your end date</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Help text */}
            {helpText && !hasError && (
                <p className="mt-2 text-sm text-gray-500 flex items-start gap-2">
                    <FaInfoCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{helpText}</span>
                </p>
            )}

            {/* Error messages */}
            {hasError && (
                <div className="mt-2 space-y-1">
                    {startError && startTouched && (
                        <p className="text-sm text-red-600 flex items-start gap-2">
                            <FaExclamationTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>Start date: {startError}</span>
                        </p>
                    )}
                    {endError && endTouched && (
                        <p className="text-sm text-red-600 flex items-start gap-2">
                            <FaExclamationTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>End date: {endError}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

// Hook for date validation
export const useDateRangeValidation = () => {
    const validateDateRange = (startDate, endDate) => {
        const errors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!startDate) {
            errors.startDate = 'Start date is required';
        } else {
            const start = new Date(startDate);
            if (start < today) {
                errors.startDate = 'Start date cannot be in the past';
            }
        }

        if (!endDate) {
            errors.endDate = 'End date is required';
        } else if (startDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end < start) {
                errors.endDate = 'End date must be after start date';
            }

            // Check for reasonable trip length (max 1 year)
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 365) {
                errors.endDate = 'Trip cannot be longer than 1 year';
            }
        }

        return errors;
    };

    return { validateDateRange };
};

// Popular travel periods helper
export const getPopularTravelPeriods = () => {
    const currentYear = new Date().getFullYear();

    return [
        {
            label: 'Memorial Day Weekend',
            start: `${currentYear}-05-25`,
            end: `${currentYear}-05-27`,
            type: 'holiday'
        },
        {
            label: 'Independence Day Weekend',
            start: `${currentYear}-07-04`,
            end: `${currentYear}-07-06`,
            type: 'holiday'
        },
        {
            label: 'Labor Day Weekend',
            start: `${currentYear}-09-01`,
            end: `${currentYear}-09-03`,
            type: 'holiday'
        },
        {
            label: 'Thanksgiving Week',
            start: `${currentYear}-11-21`,
            end: `${currentYear}-11-28`,
            type: 'holiday'
        },
        {
            label: 'Christmas Week',
            start: `${currentYear}-12-23`,
            end: `${currentYear}-12-30`,
            type: 'holiday'
        }
    ];
};

export default DateRangePicker;