/**
 * Enhanced Data Manager for Ganpati Tracker
 * Provides robust data validation, storage, and management
 */

class DataManager {
    constructor() {
        this.storageKey = 'ganpati_tracker_data';
        this.backupKey = 'ganpati_tracker_backup';
        this.version = '1.0.0';
        this.init();
    }

    init() {
        this.loadData();
        this.setupAutoBackup();
        this.validateDataIntegrity();
    }

    // Data Models with Validation
    static donationSchema = {
        id: { type: 'string', required: true, pattern: /^GP\d{13}[A-Z]{3}$/ },
        name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
        email: { type: 'email', required: false },
        phone: { type: 'phone', required: false, pattern: /^\+?[\d\s\-\(\)]{10,15}$/ },
        wing: { type: 'string', required: true, enum: ['A', 'B', 'C', 'D', 'E'] },
        floor: { type: 'number', required: true, min: 0, max: 50 },
        flat: { type: 'string', required: true, minLength: 1, maxLength: 20 },
        amount: { type: 'number', required: true, min: 1, max: 1000000 },
        paymentMode: { type: 'string', required: true, enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online'] },
        date: { type: 'date', required: true },
        note: { type: 'string', required: false, maxLength: 500 },
        timestamp: { type: 'datetime', required: true },
        status: { type: 'string', required: false, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' }
    };

    static expenseSchema = {
        id: { type: 'string', required: true, pattern: /^EX\d{13}[A-Z]{3}$/ },
        item: { type: 'string', required: true, minLength: 2, maxLength: 200 },
        cost: { type: 'number', required: true, min: 0.01, max: 1000000 },
        date: { type: 'date', required: true },
        reason: { type: 'string', required: true, minLength: 5, maxLength: 1000 },
        category: { type: 'string', required: true, enum: ['Decoration', 'Food & Prasad', 'Sound & Music', 'Transportation', 'Utilities', 'Miscellaneous', 'Donation', 'Maintenance'] },
        timestamp: { type: 'datetime', required: true },
        approvedBy: { type: 'string', required: false, maxLength: 100 },
        receiptUrl: { type: 'url', required: false },
        status: { type: 'string', required: false, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
    };

    // Data Validation Methods
    validateData(data, schema) {
        const errors = [];
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            
            // Check required fields
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            
            // Skip validation for optional empty fields
            if (!rules.required && (value === undefined || value === null || value === '')) {
                continue;
            }
            
            // Type validation
            if (!this.validateType(value, rules.type)) {
                errors.push(`${field} must be of type ${rules.type}`);
                continue;
            }
            
            // Additional validations
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters`);
            }
            
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${field} must be no more than ${rules.maxLength} characters`);
            }
            
            if (rules.min && parseFloat(value) < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
            }
            
            if (rules.max && parseFloat(value) > rules.max) {
                errors.push(`${field} must be no more than ${rules.max}`);
            }
            
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
            }
            
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${field} format is invalid`);
            }
        }
        
        return errors;
    }

    validateType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return !isNaN(parseFloat(value)) && isFinite(value);
            case 'date':
                return !isNaN(Date.parse(value));
            case 'datetime':
                return !isNaN(Date.parse(value));
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'phone':
                return /^\+?[\d\s\-\(\)]{10,15}$/.test(value);
            case 'url':
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            default:
                return true;
        }
    }

    // Data Sanitization
    sanitizeData(data, schema) {
        const sanitized = { ...data };
        
        for (const [field, rules] of Object.entries(schema)) {
            let value = sanitized[field];
            
            if (value === undefined || value === null) {
                if (rules.default !== undefined) {
                    sanitized[field] = rules.default;
                }
                continue;
            }
            
            // Convert types
            switch (rules.type) {
                case 'number':
                    sanitized[field] = parseFloat(value);
                    break;
                case 'string':
                    sanitized[field] = String(value).trim();
                    break;
                case 'date':
                case 'datetime':
                    sanitized[field] = new Date(value).toISOString();
                    break;
            }
            
            // Sanitize strings
            if (typeof sanitized[field] === 'string') {
                sanitized[field] = this.sanitizeString(sanitized[field]);
            }
        }
        
        return sanitized;
    }

    sanitizeString(str) {
        return str
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/['"]/g, '') // Remove quotes that could break JSON
            .trim();
    }

    // Enhanced Data Storage
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                if (data.version === this.version) {
                    window.donations = data.donations || [];
                    window.expenses = data.expenses || [];
                    return;
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.loadBackup();
        }
        
        // Initialize with empty arrays if no valid data
        window.donations = window.donations || [];
        window.expenses = window.expenses || [];
    }

    saveData() {
        try {
            const data = {
                version: this.version,
                donations: window.donations || [],
                expenses: window.expenses || [],
                lastSaved: new Date().toISOString(),
                checksum: this.generateChecksum()
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Backup and Recovery
    createBackup() {
        try {
            const backup = {
                version: this.version,
                donations: window.donations || [],
                expenses: window.expenses || [],
                timestamp: new Date().toISOString(),
                checksum: this.generateChecksum()
            };
            
            localStorage.setItem(this.backupKey, JSON.stringify(backup));
            return true;
        } catch (error) {
            console.error('Error creating backup:', error);
            return false;
        }
    }

    loadBackup() {
        try {
            const backup = localStorage.getItem(this.backupKey);
            if (backup) {
                const data = JSON.parse(backup);
                window.donations = data.donations || [];
                window.expenses = data.expenses || [];
                console.log('Data restored from backup');
                return true;
            }
        } catch (error) {
            console.error('Error loading backup:', error);
        }
        return false;
    }

    setupAutoBackup() {
        // Create backup every 5 minutes
        setInterval(() => {
            this.createBackup();
        }, 5 * 60 * 1000);
        
        // Save data every minute
        setInterval(() => {
            this.saveData();
        }, 60 * 1000);
    }

    // Data Integrity
    generateChecksum() {
        const data = JSON.stringify({
            donations: window.donations || [],
            expenses: window.expenses || []
        });
        
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    validateDataIntegrity() {
        const donations = window.donations || [];
        const expenses = window.expenses || [];
        
        // Check for duplicates
        const donationIds = donations.map(d => d.id);
        const expenseIds = expenses.map(e => e.id);
        
        const duplicateDonations = donationIds.filter((id, index) => donationIds.indexOf(id) !== index);
        const duplicateExpenses = expenseIds.filter((id, index) => expenseIds.indexOf(id) !== index);
        
        if (duplicateDonations.length > 0) {
            console.warn('Duplicate donation IDs found:', duplicateDonations);
        }
        
        if (duplicateExpenses.length > 0) {
            console.warn('Duplicate expense IDs found:', duplicateExpenses);
        }
        
        // Validate all records
        let invalidDonations = 0;
        let invalidExpenses = 0;
        
        donations.forEach(donation => {
            const errors = this.validateData(donation, DataManager.donationSchema);
            if (errors.length > 0) {
                invalidDonations++;
                console.warn(`Invalid donation ${donation.id}:`, errors);
            }
        });
        
        expenses.forEach(expense => {
            const errors = this.validateData(expense, DataManager.expenseSchema);
            if (errors.length > 0) {
                invalidExpenses++;
                console.warn(`Invalid expense ${expense.id}:`, errors);
            }
        });
        
        if (invalidDonations > 0 || invalidExpenses > 0) {
            console.warn(`Data integrity issues: ${invalidDonations} invalid donations, ${invalidExpenses} invalid expenses`);
        }
    }

    // Enhanced CRUD Operations
    addDonation(donationData) {
        try {
            // Sanitize data
            const sanitized = this.sanitizeData(donationData, DataManager.donationSchema);
            
            // Validate data
            const errors = this.validateData(sanitized, DataManager.donationSchema);
            if (errors.length > 0) {
                throw new Error(`Validation failed: ${errors.join(', ')}`);
            }
            
            // Check for duplicates
            const existing = (window.donations || []).find(d => d.id === sanitized.id);
            if (existing) {
                throw new Error('Donation with this ID already exists');
            }
            
            // Add donation
            window.donations = window.donations || [];
            window.donations.push(sanitized);
            
            // Save data
            this.saveData();
            
            return { success: true, data: sanitized };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    addExpense(expenseData) {
        try {
            // Sanitize data
            const sanitized = this.sanitizeData(expenseData, DataManager.expenseSchema);
            
            // Validate data
            const errors = this.validateData(sanitized, DataManager.expenseSchema);
            if (errors.length > 0) {
                throw new Error(`Validation failed: ${errors.join(', ')}`);
            }
            
            // Check for duplicates
            const existing = (window.expenses || []).find(e => e.id === sanitized.id);
            if (existing) {
                throw new Error('Expense with this ID already exists');
            }
            
            // Add expense
            window.expenses = window.expenses || [];
            window.expenses.push(sanitized);
            
            // Save data
            this.saveData();
            
            return { success: true, data: sanitized };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateDonation(id, updateData) {
        try {
            const donations = window.donations || [];
            const index = donations.findIndex(d => d.id === id);
            
            if (index === -1) {
                throw new Error('Donation not found');
            }
            
            const updated = { ...donations[index], ...updateData };
            const sanitized = this.sanitizeData(updated, DataManager.donationSchema);
            
            const errors = this.validateData(sanitized, DataManager.donationSchema);
            if (errors.length > 0) {
                throw new Error(`Validation failed: ${errors.join(', ')}`);
            }
            
            donations[index] = sanitized;
            this.saveData();
            
            return { success: true, data: sanitized };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteDonation(id) {
        try {
            const donations = window.donations || [];
            const index = donations.findIndex(d => d.id === id);
            
            if (index === -1) {
                throw new Error('Donation not found');
            }
            
            const deleted = donations.splice(index, 1)[0];
            this.saveData();
            
            return { success: true, data: deleted };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteExpense(id) {
        try {
            const expenses = window.expenses || [];
            const index = expenses.findIndex(e => e.id === id);
            
            if (index === -1) {
                throw new Error('Expense not found');
            }
            
            const deleted = expenses.splice(index, 1)[0];
            this.saveData();
            
            return { success: true, data: deleted };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Advanced Search and Filtering
    searchDonations(criteria) {
        const donations = window.donations || [];
        return donations.filter(donation => {
            return Object.entries(criteria).every(([key, value]) => {
                if (!value) return true;
                
                const donationValue = donation[key];
                if (typeof donationValue === 'string') {
                    return donationValue.toLowerCase().includes(value.toLowerCase());
                }
                return donationValue === value;
            });
        });
    }

    searchExpenses(criteria) {
        const expenses = window.expenses || [];
        return expenses.filter(expense => {
            return Object.entries(criteria).every(([key, value]) => {
                if (!value) return true;
                
                const expenseValue = expense[key];
                if (typeof expenseValue === 'string') {
                    return expenseValue.toLowerCase().includes(value.toLowerCase());
                }
                return expenseValue === value;
            });
        });
    }

    // Analytics and Reporting
    getAnalytics() {
        const donations = window.donations || [];
        const expenses = window.expenses || [];
        
        const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.cost, 0);
        
        return {
            totalDonations,
            totalExpenses,
            balance: totalDonations - totalExpenses,
            donationCount: donations.length,
            expenseCount: expenses.length,
            averageDonation: donations.length > 0 ? totalDonations / donations.length : 0,
            averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
            topDonors: this.getTopDonors(5),
            expensesByCategory: this.getExpensesByCategory(),
            monthlyTrends: this.getMonthlyTrends()
        };
    }

    getTopDonors(limit = 5) {
        const donations = window.donations || [];
        const donorTotals = {};
        
        donations.forEach(donation => {
            const key = `${donation.name}_${donation.wing}_${donation.flat}`;
            donorTotals[key] = (donorTotals[key] || 0) + donation.amount;
        });
        
        return Object.entries(donorTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([key, amount]) => {
                const [name, wing, flat] = key.split('_');
                return { name, wing, flat, amount };
            });
    }

    getExpensesByCategory() {
        const expenses = window.expenses || [];
        const categoryTotals = {};
        
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.cost;
        });
        
        return categoryTotals;
    }

    getMonthlyTrends() {
        const donations = window.donations || [];
        const expenses = window.expenses || [];
        const trends = {};
        
        [...donations, ...expenses].forEach(item => {
            const date = new Date(item.date || item.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!trends[monthKey]) {
                trends[monthKey] = { donations: 0, expenses: 0 };
            }
            
            if (item.amount !== undefined) {
                trends[monthKey].donations += item.amount;
            } else {
                trends[monthKey].expenses += item.cost;
            }
        });
        
        return trends;
    }

    // Data Export/Import
    exportData(format = 'json') {
        const data = {
            version: this.version,
            exportDate: new Date().toISOString(),
            donations: window.donations || [],
            expenses: window.expenses || [],
            analytics: this.getAnalytics()
        };
        
        switch (format.toLowerCase()) {
            case 'json':
                return this.exportJSON(data);
            case 'csv':
                return this.exportCSV(data);
            case 'excel':
                return this.exportExcel(data);
            default:
                throw new Error('Unsupported export format');
        }
    }

    exportJSON(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ganpati_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportCSV(data) {
        // Export donations
        const donationHeaders = Object.keys(DataManager.donationSchema);
        const donationCSV = [
            donationHeaders.join(','),
            ...data.donations.map(d => donationHeaders.map(h => `"${d[h] || ''}"`).join(','))
        ].join('\n');
        
        // Export expenses
        const expenseHeaders = Object.keys(DataManager.expenseSchema);
        const expenseCSV = [
            expenseHeaders.join(','),
            ...data.expenses.map(e => expenseHeaders.map(h => `"${e[h] || ''}"`).join(','))
        ].join('\n');
        
        // Create combined CSV
        const combinedCSV = `DONATIONS\n${donationCSV}\n\nEXPENSES\n${expenseCSV}`;
        
        const blob = new Blob([combinedCSV], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ganpati_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate imported data
                    if (!data.donations || !data.expenses) {
                        throw new Error('Invalid data format');
                    }
                    
                    // Backup current data
                    this.createBackup();
                    
                    // Import data
                    window.donations = data.donations;
                    window.expenses = data.expenses;
                    
                    // Validate integrity
                    this.validateDataIntegrity();
                    
                    // Save
                    this.saveData();
                    
                    resolve({ success: true, message: 'Data imported successfully' });
                } catch (error) {
                    reject({ success: false, error: error.message });
                }
            };
            reader.readAsText(file);
        });
    }
}

// Initialize Data Manager
window.dataManager = new DataManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}