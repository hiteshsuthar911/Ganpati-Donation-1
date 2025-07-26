/**
 * Enhanced Form Validation System
 * Provides real-time validation, error handling, and user feedback
 */

class FormValidator {
    constructor() {
        this.validationRules = {};
        this.errorMessages = {};
        this.init();
    }

    init() {
        this.setupValidationRules();
        this.setupErrorMessages();
        this.attachEventListeners();
    }

    setupValidationRules() {
        this.validationRules = {
            // Donation form rules
            donation: {
                name: {
                    required: true,
                    minLength: 2,
                    maxLength: 100,
                    pattern: /^[a-zA-Z\s\.]+$/,
                    sanitize: true
                },
                email: {
                    required: false,
                    type: 'email',
                    maxLength: 255
                },
                phone: {
                    required: false,
                    pattern: /^\+?[\d\s\-\(\)]{10,15}$/,
                    sanitize: true
                },
                wing: {
                    required: true,
                    enum: ['A', 'B', 'C', 'D', 'E']
                },
                floor: {
                    required: true,
                    type: 'number',
                    min: 0,
                    max: 50
                },
                flat: {
                    required: true,
                    minLength: 1,
                    maxLength: 20,
                    pattern: /^[\d\+\-]+$/
                },
                amount: {
                    required: true,
                    type: 'number',
                    min: 1,
                    max: 1000000,
                    step: 0.01
                },
                paymentMode: {
                    required: true,
                    enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online']
                },
                date: {
                    required: true,
                    type: 'date',
                    maxDate: new Date().toISOString().split('T')[0]
                },
                note: {
                    required: false,
                    maxLength: 500,
                    sanitize: true
                }
            },
            // Expense form rules
            expense: {
                item: {
                    required: true,
                    minLength: 2,
                    maxLength: 200,
                    sanitize: true
                },
                cost: {
                    required: true,
                    type: 'number',
                    min: 0.01,
                    max: 1000000,
                    step: 0.01
                },
                date: {
                    required: true,
                    type: 'date',
                    maxDate: new Date().toISOString().split('T')[0]
                },
                reason: {
                    required: true,
                    minLength: 5,
                    maxLength: 1000,
                    sanitize: true
                },
                category: {
                    required: true,
                    enum: ['Decoration', 'Food & Prasad', 'Sound & Music', 'Transportation', 'Utilities', 'Miscellaneous', 'Donation', 'Maintenance']
                }
            },
            // Contact form rules
            contact: {
                name: {
                    required: true,
                    minLength: 2,
                    maxLength: 100,
                    pattern: /^[a-zA-Z\s\.]+$/,
                    sanitize: true
                },
                email: {
                    required: true,
                    type: 'email',
                    maxLength: 255
                },
                message: {
                    required: true,
                    minLength: 10,
                    maxLength: 2000,
                    sanitize: true
                }
            }
        };
    }

    setupErrorMessages() {
        this.errorMessages = {
            required: 'This field is required',
            minLength: 'Must be at least {min} characters long',
            maxLength: 'Must be no more than {max} characters long',
            min: 'Must be at least {min}',
            max: 'Must be no more than {max}',
            pattern: 'Invalid format',
            email: 'Please enter a valid email address',
            number: 'Please enter a valid number',
            date: 'Please enter a valid date',
            enum: 'Please select a valid option',
            maxDate: 'Date cannot be in the future',
            minDate: 'Date is too far in the past',
            phone: 'Please enter a valid phone number',
            duplicate: 'This value already exists',
            custom: 'Invalid value'
        };
    }

    attachEventListeners() {
        // Real-time validation on input
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        });

        // Validation on blur
        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        }, true);

        // Form submission validation
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form[data-validate]')) {
                if (!this.validateForm(e.target)) {
                    e.preventDefault();
                }
            }
        });
    }

    validateField(field) {
        const formType = this.getFormType(field);
        if (!formType || !this.validationRules[formType]) {
            return true;
        }

        const fieldName = field.name || field.id;
        const rules = this.validationRules[formType][fieldName];
        
        if (!rules) {
            return true;
        }

        const value = field.value.trim();
        const errors = this.validateValue(value, rules, fieldName);
        
        this.displayFieldErrors(field, errors);
        
        return errors.length === 0;
    }

    validateForm(form) {
        const formType = form.dataset.validate;
        if (!formType || !this.validationRules[formType]) {
            return true;
        }

        let isValid = true;
        const formData = new FormData(form);
        const errors = {};

        // Validate each field
        for (const [fieldName, rules] of Object.entries(this.validationRules[formType])) {
            const value = formData.get(fieldName) || '';
            const fieldErrors = this.validateValue(value.trim(), rules, fieldName);
            
            if (fieldErrors.length > 0) {
                errors[fieldName] = fieldErrors;
                isValid = false;
            }
        }

        // Display all errors
        this.displayFormErrors(form, errors);

        // Custom validation for specific forms
        if (isValid) {
            isValid = this.customFormValidation(form, formType, formData);
        }

        return isValid;
    }

    validateValue(value, rules, fieldName) {
        const errors = [];

        // Required validation
        if (rules.required && (!value || value === '')) {
            errors.push(this.getErrorMessage('required', rules));
            return errors; // Don't validate further if required field is empty
        }

        // Skip other validations if field is empty and not required
        if (!rules.required && (!value || value === '')) {
            return errors;
        }

        // Type validation
        if (rules.type) {
            if (!this.validateType(value, rules.type)) {
                errors.push(this.getErrorMessage(rules.type, rules));
                return errors; // Don't validate further if type is wrong
            }
        }

        // Length validations
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(this.getErrorMessage('minLength', { ...rules, min: rules.minLength }));
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(this.getErrorMessage('maxLength', { ...rules, max: rules.maxLength }));
        }

        // Numeric validations
        if (rules.type === 'number') {
            const numValue = parseFloat(value);
            
            if (rules.min !== undefined && numValue < rules.min) {
                errors.push(this.getErrorMessage('min', rules));
            }
            
            if (rules.max !== undefined && numValue > rules.max) {
                errors.push(this.getErrorMessage('max', rules));
            }
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(this.getErrorMessage('pattern', rules));
        }

        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push(this.getErrorMessage('enum', rules));
        }

        // Date validations
        if (rules.type === 'date') {
            const dateValue = new Date(value);
            
            if (rules.maxDate) {
                const maxDate = new Date(rules.maxDate);
                if (dateValue > maxDate) {
                    errors.push(this.getErrorMessage('maxDate', rules));
                }
            }
            
            if (rules.minDate) {
                const minDate = new Date(rules.minDate);
                if (dateValue < minDate) {
                    errors.push(this.getErrorMessage('minDate', rules));
                }
            }
        }

        return errors;
    }

    validateType(value, type) {
        switch (type) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'number':
                return !isNaN(parseFloat(value)) && isFinite(value);
            case 'date':
                return !isNaN(Date.parse(value));
            case 'phone':
                return /^\+?[\d\s\-\(\)]{10,15}$/.test(value);
            default:
                return true;
        }
    }

    customFormValidation(form, formType, formData) {
        switch (formType) {
            case 'donation':
                return this.validateDonationForm(form, formData);
            case 'expense':
                return this.validateExpenseForm(form, formData);
            default:
                return true;
        }
    }

    validateDonationForm(form, formData) {
        const errors = {};
        let isValid = true;

        // Check for duplicate donations (same person, same amount, same date)
        const donations = window.donations || [];
        const name = formData.get('name');
        const amount = parseFloat(formData.get('amount'));
        const date = formData.get('date');
        const wing = formData.get('wing');
        const flat = formData.get('flat');

        const duplicate = donations.find(d => 
            d.name.toLowerCase() === name.toLowerCase() &&
            d.wing === wing &&
            d.flat === flat &&
            Math.abs(d.amount - amount) < 0.01 &&
            d.date === date
        );

        if (duplicate) {
            errors.amount = ['A similar donation already exists for this person on this date'];
            isValid = false;
        }

        // Validate flat number format for the selected wing
        const flatValue = formData.get('flat');
        if (flatValue) {
            const floor = parseInt(formData.get('floor'));
            const flatNumbers = flatValue.split('+').map(f => parseInt(f.trim()));
            
            // Check if flat numbers are reasonable for the floor
            const expectedRange = this.getExpectedFlatRange(floor);
            const invalidFlats = flatNumbers.filter(f => f < expectedRange.min || f > expectedRange.max);
            
            if (invalidFlats.length > 0) {
                errors.flat = [`Flat numbers ${invalidFlats.join(', ')} seem unusual for floor ${floor}`];
                isValid = false;
            }
        }

        this.displayFormErrors(form, errors);
        return isValid;
    }

    validateExpenseForm(form, formData) {
        const errors = {};
        let isValid = true;

        // Check if expense amount is reasonable for the category
        const category = formData.get('category');
        const cost = parseFloat(formData.get('cost'));
        const reasonableLimits = this.getReasonableLimits(category);

        if (cost > reasonableLimits.warning) {
            const confirmMessage = `This ${category} expense of ₹${cost.toLocaleString()} seems high. Are you sure?`;
            if (!confirm(confirmMessage)) {
                errors.cost = ['Please verify the expense amount'];
                isValid = false;
            }
        }

        // Check for duplicate expenses
        const expenses = window.expenses || [];
        const item = formData.get('item');
        const date = formData.get('date');

        const duplicate = expenses.find(e => 
            e.item.toLowerCase() === item.toLowerCase() &&
            Math.abs(e.cost - cost) < 0.01 &&
            e.date === date
        );

        if (duplicate) {
            errors.item = ['A similar expense already exists for this date'];
            isValid = false;
        }

        this.displayFormErrors(form, errors);
        return isValid;
    }

    getExpectedFlatRange(floor) {
        // Assuming 4 flats per floor, starting from 01
        const baseFlat = floor * 100 + 1;
        return {
            min: baseFlat,
            max: baseFlat + 10 // Allow some flexibility
        };
    }

    getReasonableLimits(category) {
        const limits = {
            'Decoration': { warning: 50000 },
            'Food & Prasad': { warning: 30000 },
            'Sound & Music': { warning: 25000 },
            'Transportation': { warning: 15000 },
            'Utilities': { warning: 20000 },
            'Miscellaneous': { warning: 10000 },
            'Donation': { warning: 100000 },
            'Maintenance': { warning: 40000 }
        };
        
        return limits[category] || { warning: 20000 };
    }

    getFormType(field) {
        const form = field.closest('form');
        return form ? form.dataset.validate : null;
    }

    displayFieldErrors(field, errors) {
        // Remove existing error messages
        this.clearFieldErrors(field);

        if (errors.length === 0) {
            field.classList.remove('error');
            field.classList.add('valid');
            return;
        }

        field.classList.add('error');
        field.classList.remove('valid');

        // Create error container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'field-errors';
        errorContainer.innerHTML = errors.map(error => 
            `<span class="error-message">${error}</span>`
        ).join('');

        // Insert after the field
        field.parentNode.insertBefore(errorContainer, field.nextSibling);
    }

    displayFormErrors(form, errors) {
        // Clear existing errors
        form.querySelectorAll('.field-errors').forEach(el => el.remove());
        form.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });

        // Display new errors
        for (const [fieldName, fieldErrors] of Object.entries(errors)) {
            const field = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (field) {
                this.displayFieldErrors(field, fieldErrors);
            }
        }

        // Scroll to first error
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }

    clearFieldErrors(field) {
        const existingErrors = field.parentNode.querySelector('.field-errors');
        if (existingErrors) {
            existingErrors.remove();
        }
    }

    getErrorMessage(type, rules) {
        let message = this.errorMessages[type] || this.errorMessages.custom;
        
        // Replace placeholders
        if (rules.min !== undefined) {
            message = message.replace('{min}', rules.min);
        }
        if (rules.max !== undefined) {
            message = message.replace('{max}', rules.max);
        }
        if (rules.minLength !== undefined) {
            message = message.replace('{min}', rules.minLength);
        }
        if (rules.maxLength !== undefined) {
            message = message.replace('{max}', rules.maxLength);
        }
        
        return message;
    }

    // Sanitization methods
    sanitizeInput(value, rules) {
        if (!rules.sanitize) {
            return value;
        }

        let sanitized = value.trim();
        
        // Remove potentially harmful characters
        sanitized = sanitized.replace(/[<>]/g, '');
        
        // Remove excessive whitespace
        sanitized = sanitized.replace(/\s+/g, ' ');
        
        // Capitalize names properly
        if (rules.capitalize) {
            sanitized = this.capitalizeWords(sanitized);
        }
        
        return sanitized;
    }

    capitalizeWords(str) {
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    // Auto-formatting methods
    formatPhoneNumber(phone) {
        // Remove all non-digits
        const digits = phone.replace(/\D/g, '');
        
        // Format based on length
        if (digits.length === 10) {
            return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        } else if (digits.length === 12 && digits.startsWith('91')) {
            return `+91 ${digits.substr(2, 5)} ${digits.substr(7)}`;
        }
        
        return phone;
    }

    formatAmount(amount) {
        const num = parseFloat(amount);
        if (isNaN(num)) return amount;
        
        return num.toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    // Helper methods for dynamic validation
    addCustomRule(formType, fieldName, rule) {
        if (!this.validationRules[formType]) {
            this.validationRules[formType] = {};
        }
        this.validationRules[formType][fieldName] = rule;
    }

    removeCustomRule(formType, fieldName) {
        if (this.validationRules[formType]) {
            delete this.validationRules[formType][fieldName];
        }
    }

    // Validation summary
    getValidationSummary(form) {
        const formType = form.dataset.validate;
        if (!formType) return null;

        const formData = new FormData(form);
        const summary = {
            isValid: true,
            errors: {},
            warnings: [],
            fieldCount: 0,
            validFields: 0
        };

        for (const [fieldName, rules] of Object.entries(this.validationRules[formType])) {
            summary.fieldCount++;
            const value = formData.get(fieldName) || '';
            const fieldErrors = this.validateValue(value.trim(), rules, fieldName);
            
            if (fieldErrors.length > 0) {
                summary.errors[fieldName] = fieldErrors;
                summary.isValid = false;
            } else {
                summary.validFields++;
            }
        }

        return summary;
    }
}

// Initialize Form Validator
window.formValidator = new FormValidator();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}