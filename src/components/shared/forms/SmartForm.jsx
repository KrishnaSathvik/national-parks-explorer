// src/components/shared/forms/SmartForm.jsx
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
    FaSave,
    FaCheck,
    FaExclamationTriangle,
    FaSpinner,
    FaEye,
    FaEyeSlash,
    FaInfoCircle,
    FaAsterisk
} from 'react-icons/fa';
import { LoadingSpinner } from '../ui/LoadingStates';
import { useToast } from '../ui/SmartToast';

/**
 * Enhanced form handling component with validation, auto-save, and mobile optimization
 * Provides consistent form behavior across the trip planner application
 */

// Form Context for managing form state
const FormContext = createContext();

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a SmartForm');
    }
    return context;
};

// Main SmartForm Component
const SmartForm = ({
                       initialValues = {},
                       validationSchema = null,
                       onSubmit,
                       onValidate = null,
                       autoSave = false,
                       autoSaveDelay = 2000,
                       validateOnChange = true,
                       validateOnBlur = true,
                       className = "",
                       children,
                       disabled = false,
                       loading = false,
                       submitText = "Submit",
                       resetOnSubmit = false,
                       showProgress = false,
                       stepCount = 0,
                       currentStep = 0
                   }) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [autoSaveTimer, setAutoSaveTimer] = useState(null);
    const { toast } = useToast();

    // Auto-save functionality
    useEffect(() => {
        if (autoSave && isDirty && !isSubmitting) {
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }

            const timer = setTimeout(() => {
                handleAutoSave();
            }, autoSaveDelay);

            setAutoSaveTimer(timer);

            return () => clearTimeout(timer);
        }
    }, [values, isDirty, autoSave, autoSaveDelay, isSubmitting]);

    // Validation function
    const validateField = useCallback(async (fieldName, value) => {
        if (!validationSchema) return null;

        try {
            // If using Yup schema
            if (validationSchema.validateAt) {
                await validationSchema.validateAt(fieldName, { [fieldName]: value });
                return null;
            }

            // Custom validation function
            if (typeof validationSchema === 'function') {
                const result = await validationSchema(fieldName, value, values);
                return result;
            }

            // Simple validation rules object
            if (validationSchema[fieldName]) {
                const rules = validationSchema[fieldName];

                if (rules.required && (!value || value.toString().trim() === '')) {
                    return 'This field is required';
                }

                if (rules.minLength && value.toString().length < rules.minLength) {
                    return `Minimum ${rules.minLength} characters required`;
                }

                if (rules.maxLength && value.toString().length > rules.maxLength) {
                    return `Maximum ${rules.maxLength} characters allowed`;
                }

                if (rules.pattern && !rules.pattern.test(value)) {
                    return rules.message || 'Invalid format';
                }

                if (rules.min && parseFloat(value) < rules.min) {
                    return `Minimum value is ${rules.min}`;
                }

                if (rules.max && parseFloat(value) > rules.max) {
                    return `Maximum value is ${rules.max}`;
                }
            }

            return null;
        } catch (error) {
            return error.message || 'Validation error';
        }
    }, [validationSchema, values]);

    // Validate all fields
    const validateForm = useCallback(async () => {
        const newErrors = {};
        const fieldNames = Object.keys(values);

        for (const fieldName of fieldNames) {
            const error = await validateField(fieldName, values[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
            }
        }

        // Custom form validation
        if (onValidate) {
            const customErrors = await onValidate(values);
            Object.assign(newErrors, customErrors);
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values, validateField, onValidate]);

    // Handle field change
    const handleChange = useCallback(async (fieldName, value) => {
        const newValues = { ...values, [fieldName]: value };
        setValues(newValues);
        setIsDirty(true);

        // Validate on change if enabled
        if (validateOnChange) {
            const error = await validateField(fieldName, value);
            setErrors(prev => ({
                ...prev,
                [fieldName]: error
            }));
        }
    }, [values, validateOnChange, validateField]);

    // Handle field blur
    const handleBlur = useCallback(async (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));

        if (validateOnBlur) {
            const error = await validateField(fieldName, values[fieldName]);
            setErrors(prev => ({
                ...prev,
                [fieldName]: error
            }));
        }
    }, [values, validateOnBlur, validateField]);

    // Handle form submission
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (disabled || loading || isSubmitting) return;

        setIsSubmitting(true);

        try {
            // Validate form
            const isValid = await validateForm();

            if (!isValid) {
                toast.error('Please fix the errors before submitting');
                return;
            }

            // Submit form
            await onSubmit(values);

            toast.success('Form submitted successfully!');
            setIsDirty(false);

            if (resetOnSubmit) {
                setValues(initialValues);
                setErrors({});
                setTouched({});
            }

        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(error.message || 'Failed to submit form');
        } finally {
            setIsSubmitting(false);
        }
    }, [values, disabled, loading, isSubmitting, validateForm, onSubmit, toast, resetOnSubmit, initialValues]);

    // Auto-save handler
    const handleAutoSave = useCallback(async () => {
        if (!onSubmit || isSubmitting) return;

        try {
            const isValid = await validateForm();
            if (isValid) {
                await onSubmit(values, { autoSave: true });
                toast.success('Changes auto-saved', { duration: 2000 });
                setIsDirty(false);
            }
        } catch (error) {
            console.error('Auto-save error:', error);
            toast.warning('Auto-save failed');
        }
    }, [onSubmit, isSubmitting, validateForm, values, toast]);

    // Reset form
    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsDirty(false);
    }, [initialValues]);

    // Context value
    const contextValue = {
        values,
        errors,
        touched,
        isDirty,
        isSubmitting,
        loading,
        disabled,
        handleChange,
        handleBlur,
        setFieldValue: (field, value) => handleChange(field, value),
        setFieldError: (field, error) => setErrors(prev => ({ ...prev, [field]: error })),
        validateField,
        resetForm
    };

    return (
        <FormContext.Provider value={contextValue}>
            <form
                onSubmit={handleSubmit}
                className={`smart-form ${className}`}
                noValidate
            >
                {/* Progress indicator */}
                {showProgress && stepCount > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>Step {currentStep + 1} of {stepCount}</span>
                            <span>{Math.round(((currentStep + 1) / stepCount) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentStep + 1) / stepCount) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Auto-save indicator */}
                {autoSave && isDirty && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <LoadingSpinner size="sm" />
                        <span>Auto-saving...</span>
                    </div>
                )}

                {/* Form content */}
                <div className="form-fields space-y-6">
                    {children}
                </div>

                {/* Submit button and actions */}
                <div className="form-actions mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={disabled || loading || isSubmitting}
                                className={`
                                    inline-flex items-center justify-center gap-2 px-6 py-3 
                                    bg-gradient-to-r from-pink-500 to-purple-500 text-white 
                                    rounded-xl font-semibold transition-all duration-200
                                    ${(disabled || loading || isSubmitting)
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:shadow-lg hover:scale-105 active:scale-95'
                                }
                                    min-w-[120px]
                                `}
                            >
                                {(loading || isSubmitting) ? (
                                    <>
                                        <LoadingSpinner size="sm" color="white" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaCheck className="w-4 h-4" />
                                        <span>{submitText}</span>
                                    </>
                                )}
                            </button>

                            {isDirty && !autoSave && (
                                <span className="text-sm text-orange-600 flex items-center gap-1">
                                    <FaAsterisk className="w-2 h-2" />
                                    Unsaved changes
                                </span>
                            )}
                        </div>

                        {isDirty && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Reset changes
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </FormContext.Provider>
    );
};

// Smart Input Field Component
export const SmartField = ({
                               name,
                               label,
                               type = "text",
                               placeholder = "",
                               required = false,
                               disabled = false,
                               className = "",
                               helpText = "",
                               showPasswordToggle = false,
                               prefix = null,
                               suffix = null,
                               ...props
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

    const [showPassword, setShowPassword] = useState(false);
    const fieldValue = values[name] || '';
    const fieldError = errors[name];
    const fieldTouched = touched[name];
    const hasError = fieldError && fieldTouched;
    const isDisabled = disabled || formDisabled || loading;

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className={`smart-field ${className}`}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input container */}
            <div className="relative">
                {/* Prefix */}
                {prefix && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {prefix}
                    </div>
                )}

                {/* Input field */}
                <input
                    id={name}
                    name={name}
                    type={inputType}
                    value={fieldValue}
                    placeholder={placeholder}
                    disabled={isDisabled}
                    onChange={(e) => handleChange(name, e.target.value)}
                    onBlur={() => handleBlur(name)}
                    className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200
                        ${prefix ? 'pl-10' : ''}
                        ${suffix || showPasswordToggle ? 'pr-10' : ''}
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
                    {...props}
                />

                {/* Password toggle */}
                {showPasswordToggle && type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? (
                            <FaEyeSlash className="w-4 h-4" />
                        ) : (
                            <FaEye className="w-4 h-4" />
                        )}
                    </button>
                )}

                {/* Suffix */}
                {suffix && !showPasswordToggle && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {suffix}
                    </div>
                )}

                {/* Error icon */}
                {hasError && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                        <FaExclamationTriangle className="w-4 h-4" />
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

            {/* Error message */}
            {hasError && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-2">
                    <FaExclamationTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{fieldError}</span>
                </p>
            )}
        </div>
    );
};

// Smart Textarea Component
export const SmartTextarea = ({
                                  name,
                                  label,
                                  placeholder = "",
                                  required = false,
                                  disabled = false,
                                  className = "",
                                  helpText = "",
                                  rows = 4,
                                  maxLength = null,
                                  ...props
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

    const fieldValue = values[name] || '';
    const fieldError = errors[name];
    const fieldTouched = touched[name];
    const hasError = fieldError && fieldTouched;
    const isDisabled = disabled || formDisabled || loading;

    return (
        <div className={`smart-textarea ${className}`}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Textarea */}
            <div className="relative">
                <textarea
                    id={name}
                    name={name}
                    value={fieldValue}
                    placeholder={placeholder}
                    disabled={isDisabled}
                    rows={rows}
                    maxLength={maxLength}
                    onChange={(e) => handleChange(name, e.target.value)}
                    onBlur={() => handleBlur(name)}
                    className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200 resize-none
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
                    {...props}
                />

                {/* Character counter */}
                {maxLength && (
                    <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                        {fieldValue.length}/{maxLength}
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

            {/* Error message */}
            {hasError && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-2">
                    <FaExclamationTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{fieldError}</span>
                </p>
            )}
        </div>
    );
};

// Smart Select Component
export const SmartSelect = ({
                                name,
                                label,
                                options = [],
                                placeholder = "Select an option",
                                required = false,
                                disabled = false,
                                className = "",
                                helpText = "",
                                ...props
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

    const fieldValue = values[name] || '';
    const fieldError = errors[name];
    const fieldTouched = touched[name];
    const hasError = fieldError && fieldTouched;
    const isDisabled = disabled || formDisabled || loading;

    return (
        <div className={`smart-select ${className}`}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Select */}
            <select
                id={name}
                name={name}
                value={fieldValue}
                disabled={isDisabled}
                onChange={(e) => handleChange(name, e.target.value)}
                onBlur={() => handleBlur(name)}
                className={`
                    w-full px-4 py-3 border rounded-xl transition-all duration-200
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
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

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
                    <span>{fieldError}</span>
                </p>
            )}
        </div>
    );
};

// Hook for form validation schemas
export const useValidationSchema = () => {
    // Trip-specific validation rules
    const tripValidation = {
        title: {
            required: true,
            minLength: 3,
            maxLength: 100,
            message: 'Trip title must be between 3-100 characters'
        },
        description: {
            maxLength: 500,
            message: 'Description must be under 500 characters'
        },
        startDate: {
            required: true,
            message: 'Start date is required'
        },
        endDate: {
            required: true,
            message: 'End date is required'
        },
        budget: {
            min: 0,
            max: 1000000,
            message: 'Budget must be a positive number'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        }
    };

    return { tripValidation };
};

export default SmartForm;
export { SmartField, SmartTextarea, SmartSelect };