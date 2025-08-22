// Personal Finance Tracker - Basic Functionality

// --- Data Storage ---
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// --- DOM Elements ---
const form = document.getElementById('add-transaction-form');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const dateInput = document.getElementById('date');
const message = document.getElementById('form-message');
const tableBody = document.getElementById('transaction-table');
const totalIncome = document.getElementById('total-income');
const totalExpenses = document.getElementById('total-expenses');
const netBalance = document.getElementById('net-balance');
const searchInput = document.getElementById('search');
const filterType = document.getElementById('filter-type');
const chartCanvas = document.getElementById('finance-chart');

let chart;

// --- Utility Functions ---
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function formatAmount(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// --- Render Functions ---
function renderTransactions() {
    let filtered = transactions;
    const search = searchInput.value.trim().toLowerCase();
    const type = filterType.value;

    if (type) {
        filtered = filtered.filter(t => t.type === type);
    }
    if (search) {
        filtered = filtered.filter(t =>
            t.title.toLowerCase().includes(search) ||
            t.amount.toString().includes(search) ||
            t.date.includes(search)
        );
    }

    tableBody.innerHTML = '';
    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#aaa;">No transactions found</td></tr>`;
        return;
    }
    filtered.forEach((t, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.title}</td>
            <td>${formatAmount(t.amount)}</td>
            <td style="color:${t.type === 'income' ? '#4caf50' : '#e74c3c'};font-weight:600;text-transform:capitalize;">
                <i class="fa-solid fa-${t.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i> ${t.type}
            </td>
            <td>${t.date}</td>
            <td>
                <button class="action-btn" data-idx="${t.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function renderSummary() {
    const income = transactions.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    totalIncome.textContent = formatAmount(income);
    totalExpenses.textContent = formatAmount(expense);
    netBalance.textContent = formatAmount(income - expense);
}

function renderChart() {
    const income = transactions.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    if (chart) chart.destroy();
    chart = new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#4caf50', '#e74c3c'],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#ffd803' : '#232946'
                    }
                }
            }
        }
    });
}

// --- Event Handlers ---

// Add Transaction
form.addEventListener('submit', function (e) {
    e.preventDefault();
    const title = titleInput.value.trim();
    const amount = amountInput.value.trim();
    const type = typeInput.value;
    const date = dateInput.value;

    if (!title || !amount || !type || !date) {
        message.textContent = 'Please fill all fields!';
        return;
    }
    if (Number(amount) <= 0) {
        message.textContent = 'Amount must be positive!';
        return;
    }

    transactions.push({
        id: Date.now(),
        title,
        amount: Number(amount),
        type,
        date
    });
    saveTransactions();
    form.reset();
    message.textContent = '';
    renderAll();
});

// Delete Transaction
tableBody.addEventListener('click', function (e) {
    if (e.target.closest('.action-btn')) {
        const id = Number(e.target.closest('.action-btn').dataset.idx);
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        renderAll();
    }
});

// Search & Filter
searchInput.addEventListener('input', renderTransactions);
filterType.addEventListener('change', renderTransactions);

// Dark mode chart color update
const observer = new MutationObserver(() => {
    renderChart();
});
observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

// --- Render All ---
function renderAll() {
    renderTransactions();
    renderSummary();
    renderChart();
}

// --- Initial Render ---
renderAll();