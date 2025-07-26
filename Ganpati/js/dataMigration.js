/**
 * Data Migration Utility for Ganpati Tracker
 * Handles migration from old data formats to new enhanced structure
 */

class DataMigration {
    constructor() {
        this.migrationHistory = [];
        this.currentVersion = '1.0.0';
        this.init();
    }

    init() {
        this.loadMigrationHistory();
        this.checkForMigrations();
    }

    // Migration Detection and Execution
    checkForMigrations() {
        const currentData = this.getCurrentData();
        const dataVersion = this.detectDataVersion(currentData);
        
        if (dataVersion !== this.currentVersion) {
            console.log(`Data migration needed: ${dataVersion} → ${this.currentVersion}`);
            this.showMigrationPrompt(dataVersion);
        }
    }

    detectDataVersion(data) {
        // Check for version in data
        if (data && data.version) {
            return data.version;
        }

        // Detect based on data structure
        const donations = data?.donations || window.donations || [];
        const expenses = data?.expenses || window.expenses || [];

        // Check for old format indicators
        if (donations.length > 0) {
            const sample = donations[0];
            
            // Old format: string amounts, missing status field
            if (typeof sample.amount === 'string' || !sample.hasOwnProperty('status')) {
                return '0.9.0'; // Legacy format
            }
            
            // Check for missing fields that indicate older versions
            if (!sample.hasOwnProperty('timestamp') || typeof sample.floor === 'string') {
                return '0.9.5'; // Intermediate format
            }
        }

        // If no data exists, assume current version
        if (donations.length === 0 && expenses.length === 0) {
            return this.currentVersion;
        }

        return this.currentVersion;
    }

    getCurrentData() {
        try {
            const stored = localStorage.getItem('ganpati_tracker_data');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error reading current data:', error);
        }

        return {
            donations: window.donations || [],
            expenses: window.expenses || []
        };
    }

    // Migration Prompt UI
    showMigrationPrompt(fromVersion) {
        const modal = document.createElement('div');
        modal.className = 'migration-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10002;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 500px; text-align: center;">
                <div style="color: #ff6b35; font-size: 3rem; margin-bottom: 1rem;">
                    <i class="fas fa-database"></i>
                </div>
                <h2 style="margin-bottom: 1rem; color: #333;">Data Migration Required</h2>
                <p style="margin-bottom: 1.5rem; color: #666;">
                    Your data needs to be updated to the latest format for better performance and new features.
                </p>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p><strong>From:</strong> Version ${fromVersion}</p>
                    <p><strong>To:</strong> Version ${this.currentVersion}</p>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="dataMigration.startMigration('${fromVersion}')" 
                            style="background: #ff6b35; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-arrow-up"></i> Migrate Now
                    </button>
                    <button onclick="dataMigration.postponeMigration()" 
                            style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-clock"></i> Later
                    </button>
                </div>
                <p style="font-size: 0.8rem; color: #999; margin-top: 1rem;">
                    <i class="fas fa-shield-alt"></i> Your data will be backed up before migration
                </p>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Migration Execution
    async startMigration(fromVersion) {
        try {
            // Close migration prompt
            const modal = document.querySelector('.migration-modal');
            if (modal) modal.remove();

            // Show progress
            this.showMigrationProgress();

            // Create backup
            await this.createPreMigrationBackup();
            this.updateProgress('Backup created', 25);

            // Perform migration
            const migrationResult = await this.performMigration(fromVersion);
            this.updateProgress('Data migrated', 75);

            // Validate migrated data
            const validationResult = await this.validateMigratedData();
            this.updateProgress('Validation complete', 100);

            // Save migration record
            this.recordMigration(fromVersion, this.currentVersion, migrationResult);

            // Show success
            setTimeout(() => {
                this.showMigrationSuccess(migrationResult);
            }, 1000);

        } catch (error) {
            console.error('Migration failed:', error);
            this.showMigrationError(error);
        }
    }

    async performMigration(fromVersion) {
        const currentData = this.getCurrentData();
        let migratedData = { ...currentData };
        let migrationLog = [];

        switch (fromVersion) {
            case '0.9.0':
                migratedData = await this.migrateFrom090(migratedData);
                migrationLog.push('Migrated from v0.9.0: Fixed data types and added status fields');
                // Fall through to next migration
            case '0.9.5':
                migratedData = await this.migrateFrom095(migratedData);
                migrationLog.push('Migrated from v0.9.5: Enhanced data structure');
                break;
            default:
                throw new Error(`Unknown migration path from ${fromVersion}`);
        }

        // Set current version
        migratedData.version = this.currentVersion;
        migratedData.lastMigrated = new Date().toISOString();

        // Update global data
        window.donations = migratedData.donations;
        window.expenses = migratedData.expenses;

        // Save to storage
        window.dataManager.saveData();

        return {
            fromVersion,
            toVersion: this.currentVersion,
            donationsMigrated: migratedData.donations.length,
            expensesMigrated: migratedData.expenses.length,
            log: migrationLog
        };
    }

    // Specific Migration Functions
    async migrateFrom090(data) {
        const migratedData = { ...data };

        // Migrate donations
        migratedData.donations = data.donations.map(donation => ({
            ...donation,
            // Convert string amounts to numbers
            amount: typeof donation.amount === 'string' ? parseFloat(donation.amount) : donation.amount,
            // Convert string floor to number
            floor: typeof donation.floor === 'string' ? parseInt(donation.floor) : donation.floor,
            // Add missing status field
            status: donation.status || 'confirmed',
            // Ensure timestamp exists
            timestamp: donation.timestamp || new Date(donation.date + 'T12:00:00.000Z').toISOString()
        }));

        // Migrate expenses
        migratedData.expenses = data.expenses.map(expense => ({
            ...expense,
            // Convert string costs to numbers
            cost: typeof expense.cost === 'string' ? parseFloat(expense.cost) : expense.cost,
            // Add missing status field
            status: expense.status || 'approved',
            // Ensure timestamp exists
            timestamp: expense.timestamp || new Date(expense.date + 'T12:00:00.000Z').toISOString()
        }));

        return migratedData;
    }

    async migrateFrom095(data) {
        const migratedData = { ...data };

        // Add any additional fields or corrections needed for v0.9.5 → v1.0.0
        migratedData.donations = data.donations.map(donation => ({
            ...donation,
            // Ensure all required fields exist with proper defaults
            email: donation.email || '',
            phone: donation.phone || '',
            note: donation.note || ''
        }));

        migratedData.expenses = data.expenses.map(expense => ({
            ...expense,
            // Ensure category exists
            category: expense.category || 'Miscellaneous'
        }));

        return migratedData;
    }

    // Validation
    async validateMigratedData() {
        const donations = window.donations || [];
        const expenses = window.expenses || [];
        
        let validationResults = {
            donations: { valid: 0, invalid: 0, errors: [] },
            expenses: { valid: 0, invalid: 0, errors: [] }
        };

        // Validate donations
        donations.forEach((donation, index) => {
            const errors = window.dataManager.validateData(donation, window.dataManager.constructor.donationSchema);
            if (errors.length === 0) {
                validationResults.donations.valid++;
            } else {
                validationResults.donations.invalid++;
                validationResults.donations.errors.push({
                    index,
                    id: donation.id,
                    errors
                });
            }
        });

        // Validate expenses
        expenses.forEach((expense, index) => {
            const errors = window.dataManager.validateData(expense, window.dataManager.constructor.expenseSchema);
            if (errors.length === 0) {
                validationResults.expenses.valid++;
            } else {
                validationResults.expenses.invalid++;
                validationResults.expenses.errors.push({
                    index,
                    id: expense.id,
                    errors
                });
            }
        });

        return validationResults;
    }

    // Backup and Recovery
    async createPreMigrationBackup() {
        const currentData = this.getCurrentData();
        const backup = {
            ...currentData,
            backupDate: new Date().toISOString(),
            backupReason: 'Pre-migration backup',
            originalVersion: this.detectDataVersion(currentData)
        };

        localStorage.setItem('ganpati_tracker_pre_migration_backup', JSON.stringify(backup));
        return backup;
    }

    restoreFromBackup() {
        try {
            const backup = localStorage.getItem('ganpati_tracker_pre_migration_backup');
            if (backup) {
                const backupData = JSON.parse(backup);
                
                // Restore data
                window.donations = backupData.donations || [];
                window.expenses = backupData.expenses || [];
                
                // Save restored data
                localStorage.setItem('ganpati_tracker_data', JSON.stringify({
                    version: backupData.originalVersion || '0.9.0',
                    donations: window.donations,
                    expenses: window.expenses,
                    lastSaved: new Date().toISOString()
                }));

                return true;
            }
        } catch (error) {
            console.error('Error restoring backup:', error);
        }
        return false;
    }

    // Progress and UI
    showMigrationProgress() {
        const progressModal = document.createElement('div');
        progressModal.className = 'migration-progress-modal';
        progressModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10003;
        `;

        progressModal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 15px; min-width: 400px; text-align: center;">
                <div style="color: #ff6b35; font-size: 3rem; margin-bottom: 1rem;">
                    <i class="fas fa-cog fa-spin"></i>
                </div>
                <h3 style="margin-bottom: 1rem; color: #333;">Migrating Data...</h3>
                <div style="background: #f8f9fa; border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="background: #e9ecef; height: 8px; border-radius: 4px; overflow: hidden;">
                        <div id="migration-progress-bar" style="background: linear-gradient(90deg, #ff6b35, #f7931e); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                    </div>
                    <p id="migration-status" style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">Starting migration...</p>
                </div>
                <p style="font-size: 0.8rem; color: #999;">
                    Please don't close this window during migration
                </p>
            </div>
        `;

        document.body.appendChild(progressModal);
    }

    updateProgress(status, percentage) {
        const progressBar = document.getElementById('migration-progress-bar');
        const statusText = document.getElementById('migration-status');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (statusText) {
            statusText.textContent = status;
        }
    }

    showMigrationSuccess(result) {
        // Remove progress modal
        const progressModal = document.querySelector('.migration-progress-modal');
        if (progressModal) progressModal.remove();

        // Show success modal
        const successModal = document.createElement('div');
        successModal.className = 'migration-success-modal';
        successModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10003;
        `;

        successModal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 500px; text-align: center;">
                <div style="color: #28a745; font-size: 4rem; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 style="margin-bottom: 1rem; color: #333;">Migration Successful!</h2>
                <p style="margin-bottom: 1.5rem; color: #666;">
                    Your data has been successfully updated to the latest format.
                </p>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: left;">
                    <h4 style="margin-bottom: 0.5rem; color: #333;">Migration Summary:</h4>
                    <p style="margin: 0.25rem 0; color: #666;"><strong>Donations:</strong> ${result.donationsMigrated} records</p>
                    <p style="margin: 0.25rem 0; color: #666;"><strong>Expenses:</strong> ${result.expensesMigrated} records</p>
                    <p style="margin: 0.25rem 0; color: #666;"><strong>Version:</strong> ${result.fromVersion} → ${result.toVersion}</p>
                </div>
                <button onclick="this.closest('.migration-success-modal').remove(); location.reload();" 
                        style="background: #28a745; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-rocket"></i> Continue with New Features
                </button>
            </div>
        `;

        document.body.appendChild(successModal);
    }

    showMigrationError(error) {
        // Remove progress modal
        const progressModal = document.querySelector('.migration-progress-modal');
        if (progressModal) progressModal.remove();

        // Show error modal
        const errorModal = document.createElement('div');
        errorModal.className = 'migration-error-modal';
        errorModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10003;
        `;

        errorModal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 500px; text-align: center;">
                <div style="color: #dc3545; font-size: 4rem; margin-bottom: 1rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 style="margin-bottom: 1rem; color: #333;">Migration Failed</h2>
                <p style="margin-bottom: 1.5rem; color: #666;">
                    There was an error during the migration process. Your original data is safe.
                </p>
                <div style="background: #f8d7da; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: left;">
                    <h4 style="margin-bottom: 0.5rem; color: #721c24;">Error Details:</h4>
                    <p style="margin: 0; color: #721c24; font-family: monospace; font-size: 0.9rem;">${error.message}</p>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="dataMigration.restoreFromBackup(); this.closest('.migration-error-modal').remove();" 
                            style="background: #ffc107; color: #212529; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-undo"></i> Restore Backup
                    </button>
                    <button onclick="this.closest('.migration-error-modal').remove();" 
                            style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(errorModal);
    }

    postponeMigration() {
        const modal = document.querySelector('.migration-modal');
        if (modal) modal.remove();
        
        // Set postpone flag
        localStorage.setItem('ganpati_migration_postponed', new Date().toISOString());
        
        // Show postpone message
        if (window.showMessage) {
            window.showMessage('Migration postponed. You can migrate later from the Analytics dashboard.', 'info');
        }
    }

    // Migration History
    loadMigrationHistory() {
        try {
            const history = localStorage.getItem('ganpati_migration_history');
            this.migrationHistory = history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading migration history:', error);
            this.migrationHistory = [];
        }
    }

    recordMigration(fromVersion, toVersion, result) {
        const record = {
            id: Date.now().toString(),
            fromVersion,
            toVersion,
            timestamp: new Date().toISOString(),
            result,
            success: true
        };

        this.migrationHistory.push(record);
        localStorage.setItem('ganpati_migration_history', JSON.stringify(this.migrationHistory));
    }

    getMigrationHistory() {
        return this.migrationHistory;
    }

    // Manual Migration Trigger
    triggerManualMigration() {
        const currentData = this.getCurrentData();
        const dataVersion = this.detectDataVersion(currentData);
        
        if (dataVersion !== this.currentVersion) {
            this.showMigrationPrompt(dataVersion);
        } else {
            if (window.showMessage) {
                window.showMessage('Your data is already up to date!', 'success');
            }
        }
    }
}

// Initialize Data Migration
window.dataMigration = new DataMigration();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataMigration;
}