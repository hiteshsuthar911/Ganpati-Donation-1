/**
 * Advanced Analytics Engine for Ganpati Tracker
 * Provides comprehensive data analysis, reporting, and insights
 */

class AnalyticsEngine {
    constructor() {
        this.reports = {};
        this.charts = {};
        this.insights = {};
        this.init();
    }

    init() {
        this.setupReportTemplates();
        this.scheduleAnalytics();
    }

    setupReportTemplates() {
        this.reportTemplates = {
            financial: {
                name: 'Financial Summary Report',
                sections: ['overview', 'donations', 'expenses', 'balance', 'trends'],
                format: ['pdf', 'excel', 'html']
            },
            donor: {
                name: 'Donor Analysis Report',
                sections: ['demographics', 'contributions', 'patterns', 'retention'],
                format: ['pdf', 'excel', 'html']
            },
            expense: {
                name: 'Expense Analysis Report',
                sections: ['categories', 'trends', 'efficiency', 'budget'],
                format: ['pdf', 'excel', 'html']
            },
            performance: {
                name: 'Performance Dashboard',
                sections: ['kpis', 'goals', 'comparisons', 'forecasts'],
                format: ['html', 'json']
            }
        };
    }

    // Core Analytics Methods
    generateFinancialAnalytics() {
        const donations = window.donations || [];
        const expenses = window.expenses || [];
        
        const analytics = {
            overview: this.getFinancialOverview(donations, expenses),
            donationAnalytics: this.getDonationAnalytics(donations),
            expenseAnalytics: this.getExpenseAnalytics(expenses),
            trends: this.getFinancialTrends(donations, expenses),
            projections: this.getFinancialProjections(donations, expenses),
            efficiency: this.getEfficiencyMetrics(donations, expenses),
            risks: this.getRiskAnalysis(donations, expenses)
        };

        return analytics;
    }

    getFinancialOverview(donations, expenses) {
        const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.cost, 0);
        const balance = totalDonations - totalExpenses;
        
        return {
            totalDonations,
            totalExpenses,
            balance,
            balancePercentage: totalDonations > 0 ? (balance / totalDonations) * 100 : 0,
            donationCount: donations.length,
            expenseCount: expenses.length,
            averageDonation: donations.length > 0 ? totalDonations / donations.length : 0,
            averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
            largestDonation: donations.length > 0 ? Math.max(...donations.map(d => d.amount)) : 0,
            largestExpense: expenses.length > 0 ? Math.max(...expenses.map(e => e.cost)) : 0,
            utilizationRate: totalDonations > 0 ? (totalExpenses / totalDonations) * 100 : 0
        };
    }

    getDonationAnalytics(donations) {
        const analytics = {
            byPaymentMode: this.groupBy(donations, 'paymentMode'),
            byWing: this.groupBy(donations, 'wing'),
            byFloor: this.groupBy(donations, 'floor'),
            byAmount: this.getDonationAmountDistribution(donations),
            byDate: this.getDonationsByDate(donations),
            topDonors: this.getTopDonors(donations),
            repeatDonors: this.getRepeatDonors(donations),
            donationFrequency: this.getDonationFrequency(donations),
            geographicDistribution: this.getGeographicDistribution(donations)
        };

        return analytics;
    }

    getDonationsByDate(donations) {
        const dateGroups = {};
        
        donations.forEach(donation => {
            const date = donation.date;
            if (!dateGroups[date]) {
                dateGroups[date] = {
                    count: 0,
                    total: 0,
                    donations: []
                };
            }
            dateGroups[date].count++;
            dateGroups[date].total += donation.amount;
            dateGroups[date].donations.push(donation);
        });

        return dateGroups;
    }

    getDonationFrequency(donations) {
        const frequency = {
            daily: {},
            weekly: {},
            monthly: {}
        };

        donations.forEach(donation => {
            const date = new Date(donation.date);
            const dayKey = date.toISOString().split('T')[0];
            const weekKey = this.getWeekKey(date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            // Daily frequency
            frequency.daily[dayKey] = (frequency.daily[dayKey] || 0) + 1;
            
            // Weekly frequency
            frequency.weekly[weekKey] = (frequency.weekly[weekKey] || 0) + 1;
            
            // Monthly frequency
            frequency.monthly[monthKey] = (frequency.monthly[monthKey] || 0) + 1;
        });

        return frequency;
    }

    getGeographicDistribution(donations) {
        const distribution = {};
        
        donations.forEach(donation => {
            const location = `Wing ${donation.wing}`;
            if (!distribution[location]) {
                distribution[location] = {
                    count: 0,
                    total: 0,
                    floors: {}
                };
            }
            
            distribution[location].count++;
            distribution[location].total += donation.amount;
            
            const floor = `Floor ${donation.floor}`;
            if (!distribution[location].floors[floor]) {
                distribution[location].floors[floor] = {
                    count: 0,
                    total: 0
                };
            }
            distribution[location].floors[floor].count++;
            distribution[location].floors[floor].total += donation.amount;
        });

        return distribution;
    }

    getWeekKey(date) {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${String(week).padStart(2, '0')}`;
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    getExpenseAnalytics(expenses) {
        const analytics = {
            byCategory: this.groupBy(expenses, 'category'),
            byDate: this.getExpensesByDate(expenses),
            byAmount: this.getExpenseAmountDistribution(expenses),
            efficiency: this.getExpenseEfficiency(expenses),
            trends: this.getExpenseTrends(expenses),
            budgetAnalysis: this.getBudgetAnalysis(expenses),
            categoryPerformance: this.getCategoryPerformance(expenses),
            costOptimization: this.getCostOptimizationSuggestions(expenses)
        };

        return analytics;
    }

    getExpensesByDate(expenses) {
        const dateGroups = {};
        
        expenses.forEach(expense => {
            const date = expense.date;
            if (!dateGroups[date]) {
                dateGroups[date] = {
                    count: 0,
                    total: 0,
                    expenses: []
                };
            }
            dateGroups[date].count++;
            dateGroups[date].total += expense.cost;
            dateGroups[date].expenses.push(expense);
        });

        return dateGroups;
    }

    getExpenseAmountDistribution(expenses) {
        const ranges = [
            { min: 0, max: 500, label: '₹0-500' },
            { min: 501, max: 1000, label: '₹501-1000' },
            { min: 1001, max: 5000, label: '₹1001-5000' },
            { min: 5001, max: 10000, label: '₹5001-10000' },
            { min: 10001, max: 50000, label: '₹10001-50000' },
            { min: 50001, max: Infinity, label: '₹50000+' }
        ];

        const distribution = ranges.map(range => {
            const count = expenses.filter(e => e.cost >= range.min && e.cost <= range.max).length;
            const total = expenses.filter(e => e.cost >= range.min && e.cost <= range.max)
                .reduce((sum, e) => sum + e.cost, 0);
            
            return {
                range: range.label,
                count,
                total,
                percentage: expenses.length > 0 ? (count / expenses.length) * 100 : 0
            };
        });

        return distribution;
    }

    getExpenseEfficiency(expenses) {
        const categoryEfficiency = {};
        const categories = this.groupBy(expenses, 'category');
        
        Object.entries(categories).forEach(([category, categoryExpenses]) => {
            const total = categoryExpenses.reduce((sum, e) => sum + e.cost, 0);
            const average = total / categoryExpenses.length;
            const count = categoryExpenses.length;
            
            categoryEfficiency[category] = {
                total,
                average,
                count,
                efficiency: this.calculateEfficiencyScore(category, average, count)
            };
        });

        return categoryEfficiency;
    }

    calculateEfficiencyScore(category, average, count) {
        // Simple efficiency scoring based on category benchmarks
        const benchmarks = {
            'Decoration': { optimal: 2000, weight: 0.3 },
            'Food & Prasad': { optimal: 1500, weight: 0.25 },
            'Sound & Music': { optimal: 1000, weight: 0.2 },
            'Transportation': { optimal: 800, weight: 0.15 },
            'Utilities': { optimal: 1200, weight: 0.2 },
            'Miscellaneous': { optimal: 500, weight: 0.1 },
            'Donation': { optimal: 5000, weight: 0.4 },
            'Maintenance': { optimal: 1800, weight: 0.25 }
        };

        const benchmark = benchmarks[category] || { optimal: 1000, weight: 0.2 };
        const deviation = Math.abs(average - benchmark.optimal) / benchmark.optimal;
        const score = Math.max(0, 100 - (deviation * 100));
        
        return Math.round(score);
    }

    getExpenseTrends(expenses) {
        const trends = {
            monthly: this.getMonthlyExpenseTrends(expenses),
            category: this.getCategoryTrends(expenses)
        };

        return trends;
    }

    getMonthlyExpenseTrends(expenses) {
        const monthlyData = {};
        
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { total: 0, count: 0 };
            }
            
            monthlyData[monthKey].total += expense.cost;
            monthlyData[monthKey].count++;
        });

        return monthlyData;
    }

    getCategoryTrends(expenses) {
        const categoryTrends = {};
        const categories = this.groupBy(expenses, 'category');
        
        Object.entries(categories).forEach(([category, categoryExpenses]) => {
            const monthlyData = {};
            
            categoryExpenses.forEach(expense => {
                const date = new Date(expense.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { total: 0, count: 0 };
                }
                
                monthlyData[monthKey].total += expense.cost;
                monthlyData[monthKey].count++;
            });
            
            categoryTrends[category] = monthlyData;
        });

        return categoryTrends;
    }

    getBudgetAnalysis(expenses) {
        // Simple budget analysis - in real app, this would compare against predefined budgets
        const totalExpenses = expenses.reduce((sum, e) => sum + e.cost, 0);
        const categoryTotals = {};
        
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.cost;
        });

        // Assumed budget limits for demonstration
        const budgetLimits = {
            'Decoration': 15000,
            'Food & Prasad': 10000,
            'Sound & Music': 8000,
            'Transportation': 5000,
            'Utilities': 6000,
            'Miscellaneous': 3000,
            'Donation': 20000,
            'Maintenance': 7000
        };

        const budgetAnalysis = {};
        Object.entries(categoryTotals).forEach(([category, spent]) => {
            const budget = budgetLimits[category] || 5000;
            const utilization = (spent / budget) * 100;
            const remaining = Math.max(0, budget - spent);
            
            budgetAnalysis[category] = {
                budget,
                spent,
                remaining,
                utilization: Math.round(utilization),
                status: utilization > 100 ? 'over' : utilization > 80 ? 'warning' : 'good'
            };
        });

        return budgetAnalysis;
    }

    getCategoryPerformance(expenses) {
        const categories = this.groupBy(expenses, 'category');
        const performance = {};
        
        Object.entries(categories).forEach(([category, categoryExpenses]) => {
            const total = categoryExpenses.reduce((sum, e) => sum + e.cost, 0);
            const count = categoryExpenses.length;
            const average = total / count;
            
            // Calculate performance metrics
            const efficiency = this.calculateEfficiencyScore(category, average, count);
            const frequency = count; // Number of transactions
            const consistency = this.calculateConsistency(categoryExpenses);
            
            performance[category] = {
                total,
                count,
                average,
                efficiency,
                frequency,
                consistency,
                score: Math.round((efficiency + consistency) / 2)
            };
        });

        return performance;
    }

    calculateConsistency(expenses) {
        if (expenses.length < 2) return 100;
        
        const amounts = expenses.map(e => e.cost);
        const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
        const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
        const standardDeviation = Math.sqrt(variance);
        const coefficientOfVariation = (standardDeviation / mean) * 100;
        
        // Lower coefficient of variation means higher consistency
        return Math.max(0, 100 - coefficientOfVariation);
    }

    getCostOptimizationSuggestions(expenses) {
        const suggestions = [];
        const categories = this.groupBy(expenses, 'category');
        
        Object.entries(categories).forEach(([category, categoryExpenses]) => {
            const total = categoryExpenses.reduce((sum, e) => sum + e.cost, 0);
            const average = total / categoryExpenses.length;
            const count = categoryExpenses.length;
            
            // Generate suggestions based on spending patterns
            if (average > 5000 && category !== 'Donation') {
                suggestions.push({
                    category,
                    type: 'cost_reduction',
                    message: `Consider bulk purchasing for ${category} to reduce average cost of ₹${average.toFixed(0)}`,
                    potential_savings: average * 0.15 * count
                });
            }
            
            if (count > 10) {
                suggestions.push({
                    category,
                    type: 'consolidation',
                    message: `${count} transactions in ${category}. Consider consolidating purchases to reduce transaction costs`,
                    potential_savings: count * 50 // Assumed transaction cost
                });
            }
        });

        return suggestions;
    }

    // Detailed Analytics Methods
    getDonationAmountDistribution(donations) {
        const ranges = [
            { min: 0, max: 100, label: '₹0-100' },
            { min: 101, max: 500, label: '₹101-500' },
            { min: 501, max: 1000, label: '₹501-1000' },
            { min: 1001, max: 5000, label: '₹1001-5000' },
            { min: 5001, max: 10000, label: '₹5001-10000' },
            { min: 10001, max: Infinity, label: '₹10000+' }
        ];

        const distribution = ranges.map(range => {
            const count = donations.filter(d => d.amount >= range.min && d.amount <= range.max).length;
            const total = donations.filter(d => d.amount >= range.min && d.amount <= range.max)
                .reduce((sum, d) => sum + d.amount, 0);
            
            return {
                range: range.label,
                count,
                total,
                percentage: donations.length > 0 ? (count / donations.length) * 100 : 0
            };
        });

        return distribution;
    }

    getTopDonors(donations, limit = 10) {
        const donorMap = new Map();
        
        donations.forEach(donation => {
            const key = `${donation.name}_${donation.wing}_${donation.flat}`;
            if (donorMap.has(key)) {
                const existing = donorMap.get(key);
                existing.totalAmount += donation.amount;
                existing.donationCount++;
                existing.donations.push(donation);
            } else {
                donorMap.set(key, {
                    name: donation.name,
                    wing: donation.wing,
                    flat: donation.flat,
                    totalAmount: donation.amount,
                    donationCount: 1,
                    donations: [donation],
                    averageDonation: donation.amount
                });
            }
        });

        const topDonors = Array.from(donorMap.values())
            .map(donor => ({
                ...donor,
                averageDonation: donor.totalAmount / donor.donationCount
            }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, limit);

        return topDonors;
    }

    getRepeatDonors(donations) {
        const donorMap = new Map();
        
        donations.forEach(donation => {
            const key = `${donation.name}_${donation.wing}_${donation.flat}`;
            if (donorMap.has(key)) {
                donorMap.get(key).count++;
            } else {
                donorMap.set(key, { 
                    name: donation.name, 
                    wing: donation.wing, 
                    flat: donation.flat, 
                    count: 1 
                });
            }
        });

        const repeatDonors = Array.from(donorMap.values())
            .filter(donor => donor.count > 1)
            .sort((a, b) => b.count - a.count);

        return {
            count: repeatDonors.length,
            percentage: donorMap.size > 0 ? (repeatDonors.length / donorMap.size) * 100 : 0,
            donors: repeatDonors
        };
    }

    getFinancialTrends(donations, expenses) {
        const trends = {
            monthly: this.getMonthlyTrends(donations, expenses),
            weekly: this.getWeeklyTrends(donations, expenses),
            daily: this.getDailyTrends(donations, expenses),
            seasonal: this.getSeasonalTrends(donations, expenses)
        };

        return trends;
    }

    getMonthlyTrends(donations, expenses) {
        const monthlyData = {};
        
        // Process donations
        donations.forEach(donation => {
            const date = new Date(donation.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { donations: 0, expenses: 0, donationCount: 0, expenseCount: 0 };
            }
            
            monthlyData[monthKey].donations += donation.amount;
            monthlyData[monthKey].donationCount++;
        });

        // Process expenses
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { donations: 0, expenses: 0, donationCount: 0, expenseCount: 0 };
            }
            
            monthlyData[monthKey].expenses += expense.cost;
            monthlyData[monthKey].expenseCount++;
        });

        // Calculate trends
        const sortedMonths = Object.keys(monthlyData).sort();
        const trends = sortedMonths.map((month, index) => {
            const data = monthlyData[month];
            const balance = data.donations - data.expenses;
            
            let growth = 0;
            if (index > 0) {
                const prevMonth = monthlyData[sortedMonths[index - 1]];
                const prevBalance = prevMonth.donations - prevMonth.expenses;
                growth = prevBalance !== 0 ? ((balance - prevBalance) / prevBalance) * 100 : 0;
            }
            
            return {
                month,
                ...data,
                balance,
                growth
            };
        });

        return trends;
    }

    getWeeklyTrends(donations, expenses) {
        const weeklyData = {};
        
        // Process donations
        donations.forEach(donation => {
            const date = new Date(donation.date);
            const weekKey = this.getWeekKey(date);
            
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = { donations: 0, expenses: 0, donationCount: 0, expenseCount: 0 };
            }
            
            weeklyData[weekKey].donations += donation.amount;
            weeklyData[weekKey].donationCount++;
        });

        // Process expenses
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const weekKey = this.getWeekKey(date);
            
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = { donations: 0, expenses: 0, donationCount: 0, expenseCount: 0 };
            }
            
            weeklyData[weekKey].expenses += expense.cost;
            weeklyData[weekKey].expenseCount++;
        });

        // Calculate trends
        const sortedWeeks = Object.keys(weeklyData).sort();
        const trends = sortedWeeks.map((week, index) => {
            const data = weeklyData[week];
            const balance = data.donations - data.expenses;
            
            let growth = 0;
            if (index > 0) {
                const prevWeek = weeklyData[sortedWeeks[index - 1]];
                const prevBalance = prevWeek.donations - prevWeek.expenses;
                growth = prevBalance !== 0 ? ((balance - prevBalance) / prevBalance) * 100 : 0;
            }
            
            return {
                week,
                ...data,
                balance,
                growth
            };
        });

        return trends;
    }

    getDailyTrends(donations, expenses) {
        const dailyData = {};
        
        // Process donations
        donations.forEach(donation => {
            const date = donation.date;
            
            if (!dailyData[date]) {
                dailyData[date] = { donations: 0, expenses: 0, donationCount: 0, expenseCount: 0 };
            }
            
            dailyData[date].donations += donation.amount;
            dailyData[date].donationCount++;
        });

        // Process expenses
        expenses.forEach(expense => {
            const date = expense.date;
            
            if (!dailyData[date]) {
                dailyData[date] = { donations: 0, expenses: 0, donationCount: 0, expenseCount: 0 };
            }
            
            dailyData[date].expenses += expense.cost;
            dailyData[date].expenseCount++;
        });

        // Calculate trends
        const sortedDates = Object.keys(dailyData).sort();
        const trends = sortedDates.map((date, index) => {
            const data = dailyData[date];
            const balance = data.donations - data.expenses;
            
            let growth = 0;
            if (index > 0) {
                const prevDate = dailyData[sortedDates[index - 1]];
                const prevBalance = prevDate.donations - prevDate.expenses;
                growth = prevBalance !== 0 ? ((balance - prevBalance) / prevBalance) * 100 : 0;
            }
            
            return {
                date,
                ...data,
                balance,
                growth
            };
        });

        return trends;
    }

    getSeasonalTrends(donations, expenses) {
        const seasonalData = {
            spring: { donations: 0, expenses: 0, donationCount: 0, expenseCount: 0 },
            summer: { donations: 0, expenses: 0, donationCount: 0, expenseCount: 0 },
            monsoon: { donations: 0, expenses: 0, donationCount: 0, expenseCount: 0 },
            winter: { donations: 0, expenses: 0, donationCount: 0, expenseCount: 0 }
        };

        const getSeason = (date) => {
            const month = new Date(date).getMonth() + 1;
            if (month >= 3 && month <= 5) return 'spring';
            if (month >= 6 && month <= 8) return 'summer';
            if (month >= 9 && month <= 11) return 'monsoon';
            return 'winter';
        };

        // Process donations
        donations.forEach(donation => {
            const season = getSeason(donation.date);
            seasonalData[season].donations += donation.amount;
            seasonalData[season].donationCount++;
        });

        // Process expenses
        expenses.forEach(expense => {
            const season = getSeason(expense.date);
            seasonalData[season].expenses += expense.cost;
            seasonalData[season].expenseCount++;
        });

        // Calculate balances
        Object.keys(seasonalData).forEach(season => {
            seasonalData[season].balance = seasonalData[season].donations - seasonalData[season].expenses;
        });

        return seasonalData;
    }

    getEfficiencyMetrics(donations, expenses) {
        const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.cost, 0);
        
        return {
            utilizationRate: totalDonations > 0 ? (totalExpenses / totalDonations) * 100 : 0,
            costPerDonor: donations.length > 0 ? totalExpenses / donations.length : 0,
            averageTransactionSize: donations.length > 0 ? totalDonations / donations.length : 0,
            expenseEfficiency: expenses.length > 0 ? totalExpenses / expenses.length : 0
        };
    }

    getFinancialProjections(donations, expenses) {
        const monthlyTrends = this.getMonthlyTrends(donations, expenses);
        
        if (monthlyTrends.length < 2) {
            return { error: 'Insufficient data for projections' };
        }

        // Calculate average monthly growth
        const growthRates = monthlyTrends.slice(1).map(month => month.growth);
        const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
        
        // Project next 3 months
        const lastMonth = monthlyTrends[monthlyTrends.length - 1];
        const projections = [];
        
        for (let i = 1; i <= 3; i++) {
            const projectedBalance = lastMonth.balance * Math.pow(1 + (avgGrowthRate / 100), i);
            const projectedDonations = lastMonth.donations * Math.pow(1 + (avgGrowthRate / 100), i);
            const projectedExpenses = lastMonth.expenses * Math.pow(1 + (avgGrowthRate / 100), i);
            
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + i);
            const monthKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
            
            projections.push({
                month: monthKey,
                projectedDonations,
                projectedExpenses,
                projectedBalance,
                confidence: Math.max(0, 100 - (i * 20)) // Decreasing confidence
            });
        }

        return {
            avgGrowthRate,
            projections,
            methodology: 'Linear trend projection based on historical growth rates'
        };
    }

    // Advanced Analytics
    getRiskAnalysis(donations, expenses) {
        const risks = [];
        const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.cost, 0);
        const balance = totalDonations - totalExpenses;

        // Financial risks
        if (balance < 0) {
            risks.push({
                type: 'financial',
                level: 'high',
                description: 'Expenses exceed donations',
                impact: Math.abs(balance),
                recommendation: 'Reduce expenses or increase fundraising efforts'
            });
        } else if (balance < totalDonations * 0.1) {
            risks.push({
                type: 'financial',
                level: 'medium',
                description: 'Low remaining balance',
                impact: balance,
                recommendation: 'Monitor expenses closely and plan for contingencies'
            });
        }

        // Concentration risk
        const topDonors = this.getTopDonors(donations, 5);
        const top5Percentage = topDonors.reduce((sum, donor) => sum + donor.totalAmount, 0) / totalDonations * 100;
        
        if (top5Percentage > 50) {
            risks.push({
                type: 'concentration',
                level: 'medium',
                description: 'High dependency on few donors',
                impact: top5Percentage,
                recommendation: 'Diversify donor base to reduce dependency risk'
            });
        }

        // Expense category risks
        const expensesByCategory = this.groupBy(expenses, 'category');
        Object.entries(expensesByCategory).forEach(([category, categoryExpenses]) => {
            const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.cost, 0);
            const categoryPercentage = (categoryTotal / totalExpenses) * 100;
            
            if (categoryPercentage > 40) {
                risks.push({
                    type: 'expense_concentration',
                    level: 'medium',
                    description: `High concentration in ${category} expenses`,
                    impact: categoryPercentage,
                    recommendation: `Review and optimize ${category} spending`
                });
            }
        });

        return risks;
    }

    // Reporting Methods
    generateReport(type, options = {}) {
        const analytics = this.generateFinancialAnalytics();
        
        switch (type) {
            case 'financial':
                return this.generateFinancialReport(analytics, options);
            case 'donor':
                return this.generateDonorReport(analytics, options);
            case 'expense':
                return this.generateExpenseReport(analytics, options);
            case 'performance':
                return this.generatePerformanceReport(analytics, options);
            default:
                throw new Error('Unknown report type');
        }
    }

    generateFinancialReport(analytics, options) {
        const report = {
            title: 'Ganpati Tracker - Financial Summary Report',
            generatedAt: new Date().toISOString(),
            period: options.period || 'All Time',
            sections: {}
        };

        // Executive Summary
        report.sections.executiveSummary = {
            title: 'Executive Summary',
            data: {
                totalDonations: analytics.overview.totalDonations,
                totalExpenses: analytics.overview.totalExpenses,
                balance: analytics.overview.balance,
                utilizationRate: analytics.overview.utilizationRate,
                donorCount: analytics.donationAnalytics.topDonors.length,
                averageDonation: analytics.overview.averageDonation
            }
        };

        // Donation Analysis
        report.sections.donations = {
            title: 'Donation Analysis',
            data: {
                byPaymentMode: analytics.donationAnalytics.byPaymentMode,
                byAmount: analytics.donationAnalytics.byAmount,
                topDonors: analytics.donationAnalytics.topDonors.slice(0, 10),
                repeatDonors: analytics.donationAnalytics.repeatDonors
            }
        };

        // Expense Analysis
        report.sections.expenses = {
            title: 'Expense Analysis',
            data: {
                byCategory: analytics.expenseAnalytics.byCategory,
                byAmount: analytics.expenseAnalytics.byAmount,
                efficiency: analytics.expenseAnalytics.efficiency
            }
        };

        // Trends and Projections
        report.sections.trends = {
            title: 'Trends and Projections',
            data: {
                monthly: analytics.trends.monthly,
                projections: analytics.projections
            }
        };

        // Risk Analysis
        report.sections.risks = {
            title: 'Risk Analysis',
            data: analytics.risks
        };

        return report;
    }

    // Export Methods
    exportReport(report, format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return this.exportJSON(report);
            case 'csv':
                return this.exportCSV(report);
            case 'pdf':
                return this.exportPDF(report);
            case 'html':
                return this.exportHTML(report);
            default:
                throw new Error('Unsupported export format');
        }
    }

    exportJSON(report) {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        this.downloadFile(blob, `ganpati_report_${Date.now()}.json`);
    }

    exportHTML(report) {
        const html = this.generateHTMLReport(report);
        const blob = new Blob([html], { type: 'text/html' });
        this.downloadFile(blob, `ganpati_report_${Date.now()}.html`);
    }

    generateHTMLReport(report) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${report.title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 40px; }
                .section { margin-bottom: 30px; }
                .section h2 { color: #ff6b35; border-bottom: 2px solid #ff6b35; padding-bottom: 10px; }
                .metric { display: inline-block; margin: 10px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
                .metric-value { font-size: 24px; font-weight: bold; color: #ff6b35; }
                .metric-label { font-size: 14px; color: #666; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #ff6b35; color: white; }
                .risk-high { color: #dc3545; }
                .risk-medium { color: #ffc107; }
                .risk-low { color: #28a745; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${report.title}</h1>
                <p>Generated on: ${new Date(report.generatedAt).toLocaleString()}</p>
                <p>Period: ${report.period}</p>
            </div>
            
            ${Object.entries(report.sections).map(([key, section]) => `
                <div class="section">
                    <h2>${section.title}</h2>
                    ${this.renderSectionHTML(section.data)}
                </div>
            `).join('')}
        </body>
        </html>
        `;
    }

    renderSectionHTML(data) {
        // This would be expanded based on the specific data structure
        return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Utility Methods
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    }

    scheduleAnalytics() {
        // Run analytics every hour
        setInterval(() => {
            this.generateFinancialAnalytics();
        }, 60 * 60 * 1000);
    }

    // Real-time insights
    getInsights() {
        const analytics = this.generateFinancialAnalytics();
        const insights = [];

        // Financial insights
        if (analytics.overview.balance < 0) {
            insights.push({
                type: 'warning',
                message: 'Expenses exceed donations. Consider reducing costs or increasing fundraising.',
                priority: 'high'
            });
        }

        // Donation insights
        const repeatDonorPercentage = analytics.donationAnalytics.repeatDonors.percentage;
        if (repeatDonorPercentage > 30) {
            insights.push({
                type: 'success',
                message: `${repeatDonorPercentage.toFixed(1)}% of donors are repeat contributors. Great retention!`,
                priority: 'medium'
            });
        }

        // Expense insights
        const expensesByCategory = analytics.expenseAnalytics.byCategory;
        const topCategory = Object.entries(expensesByCategory)
            .sort(([,a], [,b]) => b.reduce((sum, e) => sum + e.cost, 0) - a.reduce((sum, e) => sum + e.cost, 0))[0];
        
        if (topCategory) {
            const categoryTotal = topCategory[1].reduce((sum, e) => sum + e.cost, 0);
            const percentage = (categoryTotal / analytics.overview.totalExpenses) * 100;
            
            if (percentage > 40) {
                insights.push({
                    type: 'info',
                    message: `${topCategory[0]} accounts for ${percentage.toFixed(1)}% of total expenses.`,
                    priority: 'medium'
                });
            }
        }

        return insights;
    }
}

// Initialize Analytics Engine
window.analyticsEngine = new AnalyticsEngine();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsEngine;
}