// src/components/shared/forms/BudgetInput.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    FaDollarSign,
    FaInfoCircle,
    FaExclamationTriangle,
    FaPlus,
    FaMinus,
    FaCalculator,
    FaChartPie,
    FaEdit,
    FaCheck,
    FaTimes
} from 'react-icons/fa';
import { useFormContext } from './SmartForm';

/**
 * Advanced budget input component with category breakdown and real-time calculations
 * Optimized for trip planning with smart suggestions and mobile-friendly controls
 */

const BudgetInput = ({
                         budgetFieldName = 'budget',
                         categoriesFieldName = 'budgetCategories',
                         label = 'Trip Budget',
                         currency = 'USD',
                         currencySymbol = '$',
                         required = false,
                         disabled = false,
                         className = '',
                         helpText = '',
                         showCategories = true,
                         showSuggestions = true,
                         showCalculator = true,
                         minBudget = 0,
                         maxBudget = 100000,
                         defaultCategories = null
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

    const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [tempCategoryValue, setTempCategoryValue] = useState('');
    const [calculatorMode, setCalculatorMode] = useState(false);

    const totalBudget = parseFloat(values[budgetFieldName]) || 0;
    const budgetCategories = values[categoriesFieldName] || getDefaultCategories();
    const budgetError = errors[budgetFieldName];
    const budgetTouched = touched[budgetFieldName];
    const hasError = budgetError && budgetTouched;
    const isDisabled = disabled || formDisabled || loading;

    // Default budget categories for trip planning
    function getDefaultCategories() {
        if (defaultCategories) return defaultCategories;

        return {
            accommodation: { label: 'Hotels & Lodging', amount: 0, percentage: 40 },
            transportation: { label: 'Transportation', amount: 0, percentage: 25 },
            food: { label: 'Food & Dining', amount: 0, percentage: 20 },
            activities: { label: 'Activities & Tours', amount: 0, percentage: 10 },
            miscellaneous: { label: 'Miscellaneous', amount: 0, percentage: 5 }
        };
    }

    // Calculate category amounts based on percentages
    const calculateCategoryAmounts = useMemo(() => {
        const categories = { ...budgetCategories };

        Object.keys(categories).forEach(key => {
            if (categories[key].percentage) {
                categories[key].amount = Math.round((totalBudget * categories[key].percentage) / 100);
            }
        });

        return categories;
    }, [totalBudget, budgetCategories]);

    // Update categories when total budget changes
    useEffect(() => {
        if (totalBudget > 0 && showCategories) {
            const updatedCategories = calculateCategoryAmounts;
            handleChange(categoriesFieldName, updatedCategories);
        }
    }, [totalBudget, showCategories, categoriesFieldName]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Format number input
    const formatNumberInput = (value) => {
        // Remove non-numeric characters except decimal point
        const cleanValue = value.replace(/[^\d.]/g, '');
        // Ensure only one decimal point
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
            return parts[0] + '.' + parts.slice(1).join('');
        }
        return cleanValue;
    };

    // Handle budget input change
    const handleBudgetChange = (value) => {
        const numericValue = formatNumberInput(value);
        const floatValue = parseFloat(numericValue) || 0;

        if (floatValue <= maxBudget) {
            handleChange(budgetFieldName, numericValue);
        }
    };

    // Handle category percentage change
    const handleCategoryPercentageChange = (categoryKey, percentage) => {
        const updatedCategories = { ...budgetCategories };
        updatedCategories[categoryKey].percentage = Math.max(0, Math.min(100, percentage));

        // Recalculate amounts
        const totalPercentage = Object.values(updatedCategories)
            .reduce((sum, cat) => sum + cat.percentage, 0);

        if (totalPercentage <= 100) {
            handleChange(categoriesFieldName, updatedCategories);
        }
    };

    // Handle category amount change
    const handleCategoryAmountChange = (categoryKey, amount) => {
        const updatedCategories = { ...budgetCategories };
        updatedCategories[categoryKey].amount = Math.max(0, amount);

        // Update percentage
        if (totalBudget > 0) {
            updatedCategories[categoryKey].percentage = Math.round((amount / totalBudget) * 100);
        }

        handleChange(categoriesFieldName, updatedCategories);
    };

    // Budget suggestions based on trip type and duration
    const getBudgetSuggestions = () => {
        const suggestions = [
            { label: 'Budget Trip', amount: 500, description: 'Hostels, local food, basic activities' },
            { label: 'Mid-Range', amount: 1500, description: 'Hotels, restaurants, guided tours' },
            { label: 'Luxury', amount: 3000, description: 'Premium hotels, fine dining, exclusive experiences' },
            { label: 'Ultra Luxury', amount: 5000, description: 'Five-star resorts, private tours, premium everything' }
        ];

        return suggestions;
    };

    // Quick budget amounts
    const quickAmounts = [100, 250, 500, 1000, 2000, 5000];

    const totalCategoryAmount = Object.values(calculateCategoryAmounts)
        .reduce((sum, cat) => sum + (cat.amount || 0), 0);

    const budgetDifference = totalBudget - totalCategoryAmount;

    return (
        <div className={`budget-input ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Main Budget Input */}
            <div className="relative mb-4">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        {currencySymbol}
                    </span>
                    <input
                        type="text"
                        value={values[budgetFieldName] || ''}
                        placeholder="0"
                        disabled={isDisabled}
                        onChange={(e) => handleBudgetChange(e.target.value)}
                        onBlur={() => handleBlur(budgetFieldName)}
                        className={`
                            w-full pl-8 pr-16 py-4 border rounded-xl transition-all duration-200 
                            text-lg font-semibold text-center
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
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        {currency}
                    </span>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {quickAmounts.map(amount => (
                        <button
                            key={amount}
                            type="button"
                            onClick={() => handleBudgetChange(amount.toString())}
                            disabled={isDisabled}
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:hover:bg-gray-100 rounded-full transition-colors"
                        >
                            {formatCurrency(amount)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Budget Suggestions */}
            {showSuggestions && totalBudget === 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                    <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                        <FaInfoCircle className="w-4 h-4" />
                        Budget Suggestions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getBudgetSuggestions().map(suggestion => (
                            <button
                                key={suggestion.label}
                                type="button"
                                onClick={() => handleBudgetChange(suggestion.amount.toString())}
                                disabled={isDisabled}
                                className="text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
                            >
                                <div className="font-medium text-blue-800">{suggestion.label}</div>
                                <div className="text-lg font-bold text-blue-600">{formatCurrency(suggestion.amount)}</div>
                                <div className="text-xs text-blue-600 mt-1">{suggestion.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Breakdown */}
            {showCategories && totalBudget > 0 && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <FaChartPie className="w-4 h-4" />
                            Budget Breakdown
                        </h4>
                        <button
                            type="button"
                            onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
                            className="text-xs text-blue-600 hover:text-blue-700"
                        >
                            {showCategoryBreakdown ? 'Hide Details' : 'Show Details'}
                        </button>
                    </div>

                    {/* Category Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                        {Object.entries(calculateCategoryAmounts).map(([key, category]) => (
                            <div key={key} className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs text-gray-600">{category.label}</div>
                                <div className="font-semibold text-gray-800">{formatCurrency(category.amount)}</div>
                                <div className="text-xs text-gray-500">{category.percentage}%</div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Category Editor */}
                    {showCategoryBreakdown && (
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                            <div className="space-y-3">
                                {Object.entries(calculateCategoryAmounts).map(([key, category]) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{category.label}</div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Percentage Input */}
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={category.percentage}
                                                    onChange={(e) => handleCategoryPercentageChange(key, parseInt(e.target.value))}
                                                    className="w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center"
                                                    min="0"
                                                    max="100"
                                                />
                                                <span className="text-xs text-gray-500">%</span>
                                            </div>

                                            {/* Amount Display/Edit */}
                                            {editingCategory === key ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs">{currencySymbol}</span>
                                                    <input
                                                        type="number"
                                                        value={tempCategoryValue}
                                                        onChange={(e) => setTempCategoryValue(e.target.value)}
                                                        className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleCategoryAmountChange(key, parseInt(tempCategoryValue));
                                                                setEditingCategory(null);
                                                            }
                                                            if (e.key === 'Escape') {
                                                                setEditingCategory(null);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleCategoryAmountChange(key, parseInt(tempCategoryValue));
                                                            setEditingCategory(null);
                                                        }}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <FaCheck className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingCategory(null)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <FaTimes className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCategory(key);
                                                        setTempCategoryValue(category.amount.toString());
                                                    }}
                                                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                                                >
                                                    {formatCurrency(category.amount)}
                                                    <FaEdit className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Budget Balance */}
                            {budgetDifference !== 0 && (
                                <div className={`mt-3 p-2 rounded-lg text-sm flex items-center gap-2 ${
                                    budgetDifference > 0
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                }`}>
                                    <FaCalculator className="w-4 h-4" />
                                    {budgetDifference > 0
                                        ? `${formatCurrency(budgetDifference)} remaining to allocate`
                                        : `${formatCurrency(Math.abs(budgetDifference))} over budget`
                                    }
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Budget Calculator */}
            {showCalculator && (
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setCalculatorMode(!calculatorMode)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                        <FaCalculator className="w-4 h-4" />
                        {calculatorMode ? 'Hide Calculator' : 'Budget Calculator'}
                    </button>

                    {calculatorMode && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-3">
                                Calculate your budget based on:
                            </div>
                            <BudgetCalculator onCalculate={(amount) => handleBudgetChange(amount.toString())} />
                        </div>
                    )}
                </div>
            )}

            {/* Help text */}
            {helpText && !hasError && (
                <p className="mt-2 text-sm text-gray-500 flex items-start gap-2">
                    <FaInfoCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{helpText}</span>
                </p>
            )}

            {/* Error message */}
            {hasError && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-2">
                    <FaExclamationTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{budgetError}</span>
                </p>
            )}
        </div>
    );
};

// Budget Calculator Component
const BudgetCalculator = ({ onCalculate }) => {
    const [days, setDays] = useState(7);
    const [dailyBudget, setDailyBudget] = useState(100);
    const [people, setPeople] = useState(1);

    const totalCalculated = days * dailyBudget * people;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Trip Duration
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setDays(Math.max(1, days - 1))}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            <FaMinus className="w-3 h-3" />
                        </button>
                        <input
                            type="number"
                            value={days}
                            onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                            min="1"
                        />
                        <button
                            type="button"
                            onClick={() => setDays(days + 1)}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            <FaPlus className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-gray-500">days</span>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Daily Budget
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">$</span>
                        <input
                            type="number"
                            value={dailyBudget}
                            onChange={(e) => setDailyBudget(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                            min="0"
                        />
                        <span className="text-xs text-gray-500">per day</span>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Travelers
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPeople(Math.max(1, people - 1))}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            <FaMinus className="w-3 h-3" />
                        </button>
                        <input
                            type="number"
                            value={people}
                            onChange={(e) => setPeople(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                            min="1"
                        />
                        <button
                            type="button"
                            onClick={() => setPeople(people + 1)}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            <FaPlus className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-gray-500">people</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div>
                    <div className="text-sm text-gray-600">Total Budget:</div>
                    <div className="text-lg font-bold text-gray-800">
                        ${totalCalculated.toLocaleString()}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onCalculate(totalCalculated)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                >
                    Use This Budget
                </button>
            </div>
        </div>
    );
};

// Hook for budget validation
export const useBudgetValidation = () => {
    const validateBudget = (budget, categories = {}) => {
        const errors = {};
        const numBudget = parseFloat(budget);

        if (!budget || budget === '') {
            errors.budget = 'Budget is required';
        } else if (isNaN(numBudget) || numBudget < 0) {
            errors.budget = 'Budget must be a positive number';
        } else if (numBudget > 1000000) {
            errors.budget = 'Budget seems unreasonably high';
        } else if (numBudget < 50) {
            errors.budget = 'Budget seems too low for a trip';
        }

        // Validate category percentages
        const totalPercentage = Object.values(categories)
            .reduce((sum, cat) => sum + (cat.percentage || 0), 0);

        if (totalPercentage > 100) {
            errors.budgetCategories = 'Category percentages cannot exceed 100%';
        }

        return errors;
    };

    return { validateBudget };
};

// Budget templates for different trip types
export const getBudgetTemplates = () => {
    return {
        backpacker: {
            name: 'Backpacker',
            dailyBudget: 50,
            categories: {
                accommodation: { percentage: 30 },
                transportation: { percentage: 30 },
                food: { percentage: 25 },
                activities: { percentage: 10 },
                miscellaneous: { percentage: 5 }
            }
        },
        standard: {
            name: 'Standard',
            dailyBudget: 150,
            categories: {
                accommodation: { percentage: 40 },
                transportation: { percentage: 25 },
                food: { percentage: 20 },
                activities: { percentage: 10 },
                miscellaneous: { percentage: 5 }
            }
        },
        luxury: {
            name: 'Luxury',
            dailyBudget: 400,
            categories: {
                accommodation: { percentage: 50 },
                transportation: { percentage: 20 },
                food: { percentage: 15 },
                activities: { percentage: 10 },
                miscellaneous: { percentage: 5 }
            }
        }
    };
};

export default BudgetInput;