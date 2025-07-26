// Enhanced Main JavaScript file for Ganpati Donation & Expense Tracker
// Integrates with DataManager, FormValidator, and AnalyticsEngine

// Initialize with sample data (will be replaced by DataManager)
let donations = [
    {
        id: 'GP1704009600001ABC',
        name: 'Rajesh Kumar',
        email: 'rajesh@email.com',
        phone: '+91 98765 43210',
        wing: 'A',
        floor: 3,
        flat: '302',
        flatDisplay: 'Wing A - 302',
        amount: 1001,
        paymentMode: 'UPI',
        date: '2024-01-01',
        note: 'Ganpati Bappa Morya',
        timestamp: '2024-01-01T10:00:00.000Z',
        status: 'confirmed'
    },
    {
        id: 'GP1704009600002DEF',
        name: 'Priya Sharma',
        email: 'priya@email.com',
        phone: '+91 87654 32109',
        wing: 'B',
        floor: 0,
        flat: '001+002',
        flatDisplay: 'Wing B - 001+002',
        amount: 501,
        paymentMode: 'Cash',
        date: '2024-01-02',
        note: 'Happy to contribute',
        timestamp: '2024-01-02T11:00:00.000Z',
        status: 'confirmed'
    },
    {
        id: 'GP1704009600003GHI',
        name: 'Amit Patel',
        email: 'amit@email.com',
        phone: '+91 76543 21098',
        wing: 'C',
        floor: 7,
        flat: '701+702+703+704',
        flatDisplay: 'Wing C - 701+702+703+704',
        amount: 2001,
        paymentMode: 'Bank Transfer',
        date: '2024-01-03',
        note: 'For decoration - Entire 7th floor',
        timestamp: '2024-01-03T12:00:00.000Z',
        status: 'confirmed'
    }
];

let expenses = [
    {
        id: 'EX1704009600001ABC',
        item: 'Decoration Materials',
        cost: 1500,
        date: '2024-01-05',
        reason: 'Flowers, lights, and decorative items for mandap',
        category: 'Decoration',
        timestamp: '2024-01-05T09:00:00.000Z',
        status: 'approved'
    },
    {
        id: 'EX1704009600002DEF',
        item: 'Sound System',
        cost: 800,
        date: '2024-01-06',
        reason: 'Rental for speakers and microphones',
        category: 'Sound & Music',
        timestamp: '2024-01-06T10:00:00.000Z',
        status: 'approved'
    },
    {
        id: 'EX1704009600003GHI',
        item: 'Prasad Ingredients',
        cost: 600,
        date: '2024-01-07',
        reason: 'Modak ingredients and fruits for prasad',
        category: 'Food & Prasad',
        timestamp: '2024-01-07T08:00:00.000Z',
        status: 'approved'
    }
];

// Make arrays globally accessible
window.donations = donations;
window.expenses = expenses;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupNavigation();
    updateAnalytics();
    displayRecentActivities();
    setupFormHandlers();
}

// Navigation functionality
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

// Update analytics on homepage
function updateAnalytics() {
    const totalDonationsEl = document.getElementById('total-donations');
    const totalExpensesEl = document.getElementById('total-expenses');
    const balanceEl = document.getElementById('balance');
    const totalDonorsEl = document.getElementById('total-donors');
    
    if (totalDonationsEl) {
        try {
            const totalDonations = donations.reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);
            const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.cost || 0), 0);
            const balance = totalDonations - totalExpenses;
            const totalDonors = donations.length;
            
            totalDonationsEl.textContent = `₹${totalDonations.toLocaleString('en-IN')}`;
            if (totalExpensesEl) totalExpensesEl.textContent = `₹${totalExpenses.toLocaleString('en-IN')}`;
            if (balanceEl) {
                balanceEl.textContent = `₹${balance.toLocaleString('en-IN')}`;
                balanceEl.className = balance >= 0 ? 'success' : 'error';
            }
            if (totalDonorsEl) totalDonorsEl.textContent = totalDonors;
        } catch (error) {
            console.error('Error updating analytics:', error);
        }
    }
}

// Display recent activities
function displayRecentActivities() {
    const recentDonationsEl = document.getElementById('recent-donations');
    const recentExpensesEl = document.getElementById('recent-expenses');
    
    if (recentDonationsEl) {
        const recentDonations = donations.slice(-5).reverse();
        if (recentDonations.length > 0) {
            recentDonationsEl.innerHTML = recentDonations.map(donation => `
                <div class="activity-item">
                    <h4>${donation.name} ${donation.flatDisplay ? `(${donation.flatDisplay})` : ''}</h4>
                    <p>₹${parseFloat(donation.amount).toLocaleString('en-IN')} - ${donation.date}</p>
                    <p>${donation.paymentMode}</p>
                </div>
            `).join('');
        }
    }
    
    if (recentExpensesEl) {
        const recentExpenses = expenses.slice(-5).reverse();
        if (recentExpenses.length > 0) {
            recentExpensesEl.innerHTML = recentExpenses.map(expense => `
                <div class="activity-item">
                    <h4>${expense.item}</h4>
                    <p>₹${parseFloat(expense.cost).toLocaleString('en-IN')} - ${expense.date}</p>
                    <p>${expense.reason}</p>
                </div>
            `).join('');
        }
    }
}

// Setup form handlers
function setupFormHandlers() {
    // Donation form
    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationSubmit);
    }
    
    // Expense form
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

// Enhanced donation form submission with validation and data management
function handleDonationSubmit(e) {
    e.preventDefault();
    
    // Validate form using FormValidator
    if (!window.formValidator.validateForm(e.target)) {
        return;
    }
    
    const formData = new FormData(e.target);
    
    // Create donation object with proper data types
    const donation = {
        id: generateUniqueId(),
        name: formData.get('name').trim(),
        email: formData.get('email') || '',
        phone: formData.get('phone') || '',
        wing: formData.get('wing'),
        floor: parseInt(formData.get('floor')),
        flat: formData.get('flat'),
        flatDisplay: `Wing ${formData.get('wing')} - ${formData.get('flat')}`,
        amount: parseFloat(formData.get('amount')),
        paymentMode: formData.get('paymentMode'),
        date: formData.get('date'),
        note: formData.get('note') || '',
        timestamp: new Date().toISOString(),
        status: 'confirmed'
    };
    
    // Use DataManager to add donation with validation
    const result = window.dataManager.addDonation(donation);
    
    if (!result.success) {
        showMessage(`Error: ${result.error}`, 'error');
        return;
    }
    
    // Show success message
    showMessage('Donation recorded successfully! Thank you for your contribution.', 'success');
    
    // Reset form
    e.target.reset();
    
    // Update analytics and displays
    updateAnalytics();
    displayRecentActivities();
    
    // Update page-specific displays
    if (typeof displayRecentDonationsList === 'function') {
        displayRecentDonationsList();
    }
    
    if (typeof refreshDonationsTable === 'function') {
        refreshDonationsTable();
    }
    
    // Auto-export and show insights
    setTimeout(() => {
        exportToExcel('donations');
        showMessage('Live database updated! Excel file auto-generated.', 'info');
        
        // Show analytics insights
        const insights = window.analyticsEngine.getInsights();
        if (insights.length > 0) {
            const topInsight = insights[0];
            setTimeout(() => {
                showMessage(`Insight: ${topInsight.message}`, topInsight.type);
            }, 2000);
        }
    }, 1500);
    
    // Show receipt option
    showReceiptOption(result.data);
}

// Enhanced expense form submission with validation and data management
function handleExpenseSubmit(e) {
    e.preventDefault();
    
    // Validate form using FormValidator
    if (!window.formValidator.validateForm(e.target)) {
        return;
    }
    
    const formData = new FormData(e.target);
    
    // Create expense object with proper data types
    const expense = {
        id: generateUniqueId(),
        item: formData.get('item').trim(),
        cost: parseFloat(formData.get('cost')),
        date: formData.get('date'),
        reason: formData.get('reason').trim(),
        category: formData.get('category') || 'Miscellaneous',
        timestamp: new Date().toISOString(),
        status: 'approved'
    };
    
    // Use DataManager to add expense with validation
    const result = window.dataManager.addExpense(expense);
    
    if (!result.success) {
        showMessage(`Error: ${result.error}`, 'error');
        return;
    }
    
    // Show success message
    showMessage('Expense recorded successfully!', 'success');
    
    // Reset form
    e.target.reset();
    
    // Update analytics and displays
    updateAnalytics();
    displayRecentActivities();
    displayExpenses();
    
    // Show analytics insights
    setTimeout(() => {
        const insights = window.analyticsEngine.getInsights();
        if (insights.length > 0) {
            const relevantInsight = insights.find(i => i.type === 'warning') || insights[0];
            showMessage(`Insight: ${relevantInsight.message}`, relevantInsight.type);
        }
    }, 1000);
}

// Handle contact form submission
function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contact = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
    };
    
    // In a real application, this would be sent to a server
    console.log('Contact form submitted:', contact);
    
    // Show success message
    showMessage('Thank you for your message! We will get back to you soon.', 'success');
    
    // Reset form
    e.target.reset();
}

// Generate unique ID
function generateUniqueId() {
    return 'GP' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Show message to user
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.style.cssText = `
        position: fixed;
        inset-block-start: 100px;
        inset-inline-end: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    messageEl.textContent = message;
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageEl.remove(), 300);
    }, 5000);
}

// Show receipt option
function showReceiptOption(donation) {
    const receiptModal = document.createElement('div');
    receiptModal.className = 'receipt-modal';
    receiptModal.style.cssText = `
        position: fixed;
        inset-block-start: 0;
        inset-inline-start: 0;
        inline-size: 100%;
        block-size: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
    `;
    
    receiptModal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 10px; max-inline-size: 400px; text-align: center;">
            <h3>Donation Successful!</h3>
            <p>Your donation ID: <strong>${donation.id}</strong></p>
            <p>Amount: <strong>₹${parseFloat(donation.amount).toLocaleString('en-IN')}</strong></p>
            <div style="margin-block-start: 2rem;">
                <button onclick="downloadReceipt('${donation.id}')" class="btn btn-primary" style="margin-inline-end: 1rem;">Download Receipt</button>
                <button onclick="closeReceiptModal()" class="btn btn-secondary">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(receiptModal);
    
    // Close modal when clicking outside
    receiptModal.addEventListener('click', (e) => {
        if (e.target === receiptModal) {
            closeReceiptModal();
        }
    });
}

// Close receipt modal
function closeReceiptModal() {
    const modal = document.querySelector('.receipt-modal');
    if (modal) {
        modal.remove();
    }
}

// Download receipt
function downloadReceipt(donationId) {
    const donation = donations.find(d => d.id === donationId);
    if (!donation) {
        showMessage('Donation not found!', 'error');
        return;
    }
    
    // Create receipt content
    const receiptContent = `
        GANPATI DONATION RECEIPT
        ========================
        
        Receipt ID: ${donation.id}
        Date: ${donation.date}
        Time: ${new Date(donation.timestamp).toLocaleString()}
        
        Donor Details:
        Name: ${donation.name}
        Address: ${donation.flatDisplay || 'N/A'}
        Wing: ${donation.wing || 'N/A'}
        Floor: ${donation.floor || 'N/A'}
        Flat: ${donation.flat || 'N/A'}
        Email: ${donation.email || 'N/A'}
        Phone: ${donation.phone || 'N/A'}
        
        Donation Details:
        Amount: ₹${parseFloat(donation.amount).toLocaleString('en-IN')}
        Payment Mode: ${donation.paymentMode}
        Note: ${donation.note || 'N/A'}
        
        Thank you for your generous contribution to Ganpati Utsav!
        
        Ganpati Bappa Morya!
    `;
    
    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ganpati_Receipt_${donation.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    closeReceiptModal();
    showMessage('Receipt downloaded successfully!', 'success');
}

// Display expenses table
function displayExpenses() {
    const expenseTableBody = document.getElementById('expense-table-body');
    if (!expenseTableBody) return;
    
    if (expenses.length === 0) {
        expenseTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No expenses recorded yet</td></tr>';
        return;
    }
    
    expenseTableBody.innerHTML = expenses.map((expense, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${expense.item}</td>
            <td>₹${parseFloat(expense.cost).toLocaleString('en-IN')}</td>
            <td>${expense.date}</td>
            <td>${expense.reason}</td>
            <td>
                <button onclick="deleteExpense('${expense.id}')" class="btn btn-sm" style="background: #dc3545; color: white; padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Enhanced delete expense with data management
function deleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
        const result = window.dataManager.deleteExpense(expenseId);
        
        if (!result.success) {
            showMessage(`Error: ${result.error}`, 'error');
            return;
        }
        
        displayExpenses();
        updateAnalytics();
        displayRecentActivities();
        showMessage('Expense deleted successfully!', 'success');
        
        // Show updated insights
        setTimeout(() => {
            const insights = window.analyticsEngine.getInsights();
            if (insights.length > 0) {
                const insight = insights[0];
                showMessage(`Updated: ${insight.message}`, insight.type);
            }
        }, 1000);
    }
}

// Enhanced export functionality using DataManager
function exportToExcel(type) {
    try {
        window.dataManager.exportData('csv');
        showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`, 'success');
    } catch (error) {
        showMessage(`Export failed: ${error.message}`, 'error');
    }
}

// New function to export analytics reports
function exportAnalyticsReport(reportType = 'financial', format = 'html') {
    try {
        const report = window.analyticsEngine.generateReport(reportType);
        window.analyticsEngine.exportReport(report, format);
        showMessage(`${reportType} report exported successfully!`, 'success');
    } catch (error) {
        showMessage(`Report export failed: ${error.message}`, 'error');
    }
}

// New function to show analytics dashboard
function showAnalyticsDashboard() {
    const analytics = window.analyticsEngine.generateFinancialAnalytics();
    const insights = window.analyticsEngine.getInsights();
    
    // Create dashboard modal
    const modal = document.createElement('div');
    modal.className = 'analytics-modal';
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
        z-index: 10001;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 90%; max-height: 90%; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Analytics Dashboard</h2>
                <button onclick="this.closest('.analytics-modal').remove()" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: #ff6b35; margin-bottom: 0.5rem;">₹${analytics.overview.totalDonations.toLocaleString('en-IN')}</h3>
                    <p style="margin: 0; color: #666;">Total Donations</p>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: #dc3545; margin-bottom: 0.5rem;">₹${analytics.overview.totalExpenses.toLocaleString('en-IN')}</h3>
                    <p style="margin: 0; color: #666;">Total Expenses</p>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: ${analytics.overview.balance >= 0 ? '#28a745' : '#dc3545'}; margin-bottom: 0.5rem;">₹${analytics.overview.balance.toLocaleString('en-IN')}</h3>
                    <p style="margin: 0; color: #666;">Balance</p>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: #17a2b8; margin-bottom: 0.5rem;">${analytics.overview.utilizationRate.toFixed(1)}%</h3>
                    <p style="margin: 0; color: #666;">Utilization Rate</p>
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3>Key Insights</h3>
                ${insights.map(insight => `
                    <div style="padding: 1rem; margin: 0.5rem 0; border-left: 4px solid ${
                        insight.type === 'success' ? '#28a745' :
                        insight.type === 'warning' ? '#ffc107' :
                        insight.type === 'error' ? '#dc3545' : '#17a2b8'
                    }; background: #f8f9fa; border-radius: 0 8px 8px 0;">
                        ${insight.message}
                    </div>
                `).join('')}
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="exportAnalyticsReport('financial', 'html')" style="background: #ff6b35; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Export Report</button>
                <button onclick="exportAnalyticsReport('financial', 'json')" style="background: #17a2b8; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Export Data</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Search functionality
function searchData(query, type) {
    const searchQuery = query.toLowerCase();
    let filteredData;
    
    if (type === 'donations') {
        filteredData = donations.filter(d =>
            d.name.toLowerCase().includes(searchQuery) ||
            d.id.toLowerCase().includes(searchQuery) ||
            d.paymentMode.toLowerCase().includes(searchQuery) ||
            (d.wing && d.wing.toLowerCase().includes(searchQuery)) ||
            (d.floor && d.floor.toLowerCase().includes(searchQuery)) ||
            (d.flat && d.flat.toLowerCase().includes(searchQuery)) ||
            (d.flatDisplay && d.flatDisplay.toLowerCase().includes(searchQuery))
        );
    } else {
        filteredData = expenses.filter(e => 
            e.item.toLowerCase().includes(searchQuery) ||
            e.reason.toLowerCase().includes(searchQuery) ||
            e.category.toLowerCase().includes(searchQuery)
        );
    }
    
    return filteredData;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);