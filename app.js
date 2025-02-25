// Data structure
const defaultData = {
    income: {
        salary: 0,
    },
    savingsGoals: [],
    expenses: [],
};

// Initialize or load existing data
let financeData = JSON.parse(localStorage.getItem('financeData')) || defaultData;

// Save data to localStorage
function saveData() {
    localStorage.setItem('financeData', JSON.stringify(financeData));
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'ZAR'
    }).format(amount);
}

// Update summary section
function updateSummary() {
    const totalIncome = financeData.income.salary;
    const totalExpenses = financeData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingBalance = totalIncome - totalExpenses;

    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('remainingBalance').textContent = formatCurrency(remainingBalance);
}

// Handle income form submission
document.getElementById('incomeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const salary = parseFloat(document.getElementById('salary').value);
    
    financeData.income.salary = salary;
    saveData();
    updateSummary();
    
    showToast('Income updated successfully!');
});

// Handle savings goal form submission
document.getElementById('savingsGoalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newGoal = {
        id: Date.now(),
        name: document.getElementById('goalName').value,
        targetAmount: parseFloat(document.getElementById('targetAmount').value),
        duration: parseInt(document.getElementById('duration').value),
        currentAmount: 0,
        createdAt: new Date().toISOString()
    };
    
    financeData.savingsGoals.push(newGoal);
    saveData();
    updateSavingsGoals();
    e.target.reset();
    
    showToast('Savings goal added successfully!');
});

// Handle expense form submission
document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newExpense = {
        id: Date.now(),
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        date: document.getElementById('expenseDate').value,
        createdAt: new Date().toISOString()
    };
    
    financeData.expenses.push(newExpense);
    saveData();
    updateSummary();
    updateExpensesList();
    e.target.reset();
    
    showToast('Expense added successfully!');
});

// Toast notification system
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Initialize the app
function initializeApp() {
    updateSummary();
    updateSavingsGoals();
    updateExpensesList();
}

// Call initialization when the page loads
document.addEventListener('DOMContentLoaded', initializeApp);

// Update savings goals list
function updateSavingsGoals() {
    const container = document.getElementById('savingsGoalsList');
    container.innerHTML = '';
    
    financeData.savingsGoals.forEach(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const monthlyContribution = goal.targetAmount / goal.duration;
        const weeklyContribution = monthlyContribution / 4; // Assuming 4 weeks per month
        const remaining = goal.targetAmount - goal.currentAmount;
        
        const goalElement = document.createElement('div');
        goalElement.className = 'border rounded-lg p-4 mb-4';
        goalElement.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold">${goal.name}</h3>
                <div class="space-x-2">
                    <button onclick="showContributionModal(${goal.id})" 
                            class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                        Add Contribution
                    </button>
                    <button onclick="deleteGoal(${goal.id})" 
                            class="text-red-500 hover:text-red-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                     style="width: ${progress}%"></div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                <div>
                    <span class="font-semibold">Progress:</span>
                    <span>${formatCurrency(goal.currentAmount)} / ${formatCurrency(goal.targetAmount)}</span>
                </div>
                <div>
                    <span class="font-semibold">Remaining:</span>
                    <span>${formatCurrency(remaining)}</span>
                </div>
                <div>
                    <span class="font-semibold">Monthly Need:</span>
                    <span>${formatCurrency(monthlyContribution)}</span>
                </div>
                <div>
                    <span class="font-semibold">Weekly Need:</span>
                    <span>${formatCurrency(weeklyContribution)}</span>
                </div>
                <div>
                    <span class="font-semibold">Progress:</span>
                    <span>${progress.toFixed(1)}%</span>
                </div>
                <div>
                    <span class="font-semibold">Duration:</span>
                    <span>${goal.duration} months</span>
                </div>
            </div>
            ${goal.contributions ? `
                <div class="mt-2">
                    <h4 class="font-semibold text-sm mb-1">Recent Contributions</h4>
                    <div class="text-sm text-gray-600 space-y-1">
                        ${goal.contributions.slice(-3).map(contribution => `
                            <div class="flex justify-between">
                                <span>${new Date(contribution.date).toLocaleDateString()}</span>
                                <span>${formatCurrency(contribution.amount)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        container.appendChild(goalElement);
    });
}

// Update expenses list
function updateExpensesList() {
    const container = document.getElementById('expensesList');
    container.innerHTML = '';
    
    const sortedExpenses = [...financeData.expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10); // Show only last 10 expenses
    
    sortedExpenses.forEach(expense => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'flex justify-between items-center border-b py-2';
        expenseElement.innerHTML = `
            <div>
                <span class="font-semibold">${expense.category}</span>
                <span class="text-gray-600 text-sm ml-2">${new Date(expense.date).toLocaleDateString()}</span>
            </div>
            <div class="flex items-center">
                <span class="font-semibold mr-4">${formatCurrency(expense.amount)}</span>
                <button onclick="deleteExpense(${expense.id})" class="text-red-500 hover:text-red-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        `;
        container.appendChild(expenseElement);
    });
}

// Delete functions
function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this savings goal?')) {
        financeData.savingsGoals = financeData.savingsGoals.filter(goal => goal.id !== goalId);
        saveData();
        updateSavingsGoals();
        showToast('Savings goal deleted successfully!');
    }
}

function deleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
        financeData.expenses = financeData.expenses.filter(expense => expense.id !== expenseId);
        saveData();
        updateExpensesList();
        updateSummary();
        showToast('Expense deleted successfully!');
    }
}

// Show contribution modal
function showContributionModal(goalId) {
    document.getElementById('contributionModal').classList.remove('hidden');
    document.getElementById('contributionGoalId').value = goalId;
    document.getElementById('contributionAmount').value = '';
}

// Close contribution modal
function closeContributionModal() {
    document.getElementById('contributionModal').classList.add('hidden');
}

// Handle contribution form submission
document.getElementById('contributionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const goalId = parseInt(document.getElementById('contributionGoalId').value);
    const amount = parseFloat(document.getElementById('contributionAmount').value);
    
    const goalIndex = financeData.savingsGoals.findIndex(goal => goal.id === goalId);
    if (goalIndex !== -1) {
        financeData.savingsGoals[goalIndex].currentAmount += amount;
        
        // Add contribution to history if not exists
        if (!financeData.savingsGoals[goalIndex].contributions) {
            financeData.savingsGoals[goalIndex].contributions = [];
        }
        
        financeData.savingsGoals[goalIndex].contributions.push({
            amount: amount,
            date: new Date().toISOString()
        });
        
        saveData();
        updateSavingsGoals();
        closeContributionModal();
        showToast('Contribution added successfully!');
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('contributionModal');
    if (event.target === modal) {
        closeContributionModal();
    }
} 