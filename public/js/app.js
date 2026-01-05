const API_URL = 'http://localhost:3000/api';

// State
let categories = [];
let reminders = [];
let payments = [];
let paidStatus = new Set(); // Stores "reminderId-month-year" strings
let currentUpcomingPage = 1;
const ITEMS_PER_PAGE = 5;

// DOM Elements
const currentDateEl = document.getElementById('currentDate');
const upcomingListEl = document.getElementById('upcomingList');
const remindersTableBody = document.getElementById('remindersTableBody');
const historyListEl = document.getElementById('historyList');
const paidThisMonthEl = document.getElementById('paidThisMonth');
const pendingThisMonthEl = document.getElementById('pendingThisMonth');
const upcomingCountEl = document.getElementById('upcomingCount');

// Modals
const reminderModal = document.getElementById('reminderModal');
const categoryModal = document.getElementById('categoryModal');
const paymentModal = document.getElementById('paymentModal');

// Forms
const reminderForm = document.getElementById('reminderForm');
const categoryForm = document.getElementById('categoryForm');
const paymentForm = document.getElementById('paymentForm');

// Inputs
const categorySelect = document.getElementById('category');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    setupDate();
    loadData();
    setupEventListeners();
});

function setupDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('es-ES', options);
}

function setupEventListeners() {
    // Modal Toggles
    document.getElementById('btnAddReminder').addEventListener('click', () => openModal(reminderModal));
    document.getElementById('closeModal').addEventListener('click', () => closeModal(reminderModal));

    document.getElementById('btnManageCategories').addEventListener('click', () => {
        renderCategoriesGrid();
        openModal(categoryModal);
    });
    document.getElementById('closeCategoryModal').addEventListener('click', () => closeModal(categoryModal));

    document.getElementById('closePaymentModal').addEventListener('click', () => closeModal(paymentModal));

    // Forms
    reminderForm.addEventListener('submit', handleAddReminder);
    categoryForm.addEventListener('submit', handleAddCategory);
    paymentForm.addEventListener('submit', handlePayment);

    // Export CSV
    document.getElementById('btnExportCSV').addEventListener('click', exportToCSV);

    // Pagination
    document.getElementById('prevUpcoming').addEventListener('click', () => {
        if (currentUpcomingPage > 1) {
            currentUpcomingPage--;
            renderDashboard();
        }
    });

    document.getElementById('nextUpcoming').addEventListener('click', () => {
        const totalItems = getUpcomingItems().length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        if (currentUpcomingPage < totalPages) {
            currentUpcomingPage++;
            renderDashboard();
        }
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
}

async function loadData() {
    try {
        const [catRes, remRes, payRes] = await Promise.all([
            fetch(`${API_URL}/categories`),
            fetch(`${API_URL}/reminders`),
            fetch(`${API_URL}/payments`)
        ]);

        categories = await catRes.json();
        reminders = await remRes.json();
        payments = await payRes.json();

        // Process payments to know what's paid
        paidStatus.clear();
        payments.forEach(p => {
            paidStatus.add(`${p.reminder_id}-${p.period_month}-${p.period_year}`);
        });

        renderCategories();
        renderDashboard();
        renderRemindersTable();
        renderHistory();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// --- Rendering ---

function renderCategories() {
    categorySelect.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
}

function getUpcomingItems() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let upcomingItems = [];

    reminders.forEach(rem => {
        let dueMonth = currentMonth;
        let dueYear = currentYear;
        const isCurrentMonthPaid = paidStatus.has(`${rem.id}-${currentMonth}-${currentYear}`);

        if (isCurrentMonthPaid) {
            dueMonth++;
            if (dueMonth > 11) {
                dueMonth = 0;
                dueYear++;
            }
        }

        const dueDate = new Date(dueYear, dueMonth, rem.day_of_month);
        const isPaid = paidStatus.has(`${rem.id}-${dueMonth}-${dueYear}`);

        if (!isPaid) {
            upcomingItems.push({
                ...rem,
                dueDate: dueDate,
                daysUntil: Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
            });
        }
    });

    upcomingItems.sort((a, b) => a.dueDate - b.dueDate);
    return upcomingItems;
}

function renderDashboard() {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();

    let totalPaid = 0;
    let totalPending = 0;

    // Calculate stats separately (all items of the month)
    reminders.forEach(rem => {
        const isPaid = paidStatus.has(`${rem.id}-${currentMonth}-${currentYear}`);
        if (isPaid) {
            const payment = payments.find(p => p.reminder_id === rem.id && p.period_month === currentMonth && p.period_year === currentYear);
            totalPaid += payment ? payment.amount : (rem.amount_approx || 0);
        } else {
            totalPending += rem.amount_approx || 0;
        }
    });

    const upcomingItems = getUpcomingItems();
    const totalItems = upcomingItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

    // Fix current page if it's out of bounds after deletion/payment
    if (currentUpcomingPage > totalPages) {
        currentUpcomingPage = totalPages;
    }

    // Render Stats
    paidThisMonthEl.textContent = formatCurrency(totalPaid);
    pendingThisMonthEl.textContent = formatCurrency(totalPending);
    upcomingCountEl.textContent = totalItems;

    // Render Pagination Controls
    const prevBtn = document.getElementById('prevUpcoming');
    const nextBtn = document.getElementById('nextUpcoming');
    const pageInfo = document.getElementById('upcomingPageInfo');

    prevBtn.disabled = currentUpcomingPage === 1;
    nextBtn.disabled = currentUpcomingPage === totalPages;
    pageInfo.textContent = `${currentUpcomingPage} / ${totalPages}`;

    // Render Upcoming List
    upcomingListEl.innerHTML = '';
    if (totalItems === 0) {
        upcomingListEl.innerHTML = '<div class="empty-state"><p>¡Todo al día! No hay vencimientos próximos.</p></div>';
        document.getElementById('upcomingPagination').style.visibility = 'hidden';
    } else {
        document.getElementById('upcomingPagination').style.visibility = 'visible';

        const start = (currentUpcomingPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = upcomingItems.slice(start, end);

        pageItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'upcoming-item';
            div.innerHTML = `
                <div class="upcoming-info">
                    <span class="upcoming-title">${item.title}</span>
                    <span class="upcoming-date">
                        <i class="fa-regular fa-clock"></i> Vence el ${item.dueDate.toLocaleDateString('es-AR')}
                    </span>
                </div>
                <div class="upcoming-actions">
                    <span class="upcoming-amount">${item.amount_approx ? formatCurrency(item.amount_approx) : '-'}</span>
                    <button class="action-btn pay" onclick="openPaymentModal(${item.id}, ${item.amount_approx || 0}, '${item.title}', ${item.dueDate.getMonth()}, ${item.dueDate.getFullYear()})" title="Marcar como Pagado">
                        <i class="fa-solid fa-check-circle"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteReminder(${item.id})" title="Eliminar Servicio">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            upcomingListEl.appendChild(div);
        });
    }
}

function renderRemindersTable() {
    remindersTableBody.innerHTML = '';
    reminders.forEach(rem => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rem.title}</td>
            <td><span class="category-tag" style="background-color: ${rem.category_color || '#666'}">${rem.category_name || 'General'}</span></td>
            <td>Día ${rem.day_of_month}</td>
            <td>${rem.amount_approx ? formatCurrency(rem.amount_approx) : '-'}</td>
            <td>
                <button class="action-btn delete" onclick="deleteReminder(${rem.id})" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        remindersTableBody.appendChild(row);
    });
}

function renderHistory() {
    historyListEl.innerHTML = '';
    // Show last 5 payments
    payments.slice(0, 5).forEach(pay => {
        const li = document.createElement('li');
        li.className = 'history-item';
        const date = new Date(pay.paid_at).toLocaleDateString('es-AR');
        li.innerHTML = `
            <div>
                <strong>${pay.reminder_title}</strong>
                <div class="history-date">Pagado el ${date}</div>
            </div>
            <div style="color: var(--success-color); font-weight: 600;">
                ${formatCurrency(pay.amount)}
            </div>
        `;
        historyListEl.appendChild(li);
    });
}

// --- Actions ---

async function handleAddReminder(e) {
    e.preventDefault();
    const formData = new FormData(reminderForm);
    const data = {
        title: formData.get('title'),
        category_id: formData.get('category_id'),
        day_of_month: formData.get('day_of_month'),
        amount_approx: formData.get('amount_approx')
    };

    await fetch(`${API_URL}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    closeModal(reminderModal);
    reminderForm.reset();
    loadData();
}

async function handleAddCategory(e) {
    e.preventDefault();
    const name = document.getElementById('catName').value;
    const color = document.getElementById('catColor').value;

    await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
    });

    categoryForm.reset();
    await loadData(); // Reload to update select list
    renderCategoriesGrid(); // Update the grid in the modal
}

function renderCategoriesGrid() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';

    if (categories.length === 0) {
        grid.innerHTML = '<p class="empty-state">No hay categorías creadas.</p>';
        return;
    }

    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.innerHTML = `
            <div class="category-color-box" style="background-color: ${cat.color}"></div>
            <span class="category-name">${cat.name}</span>
            <button class="action-btn delete" onclick="deleteCategory(${cat.id})" title="Eliminar Categoría">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        grid.appendChild(div);
    });
}

window.deleteCategory = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta categoría? Los servicios asociados quedarán sin categoría.')) {
        await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
        await loadData();
        renderCategoriesGrid();
    }
};

// Global function for onclick access
window.openPaymentModal = (id, amount, title, month, year) => {
    document.getElementById('payReminderId').value = id;
    document.getElementById('payAmount').value = amount;
    document.getElementById('paymentConfirmText').textContent = `Confirmar pago de ${title} para el periodo ${month + 1}/${year}`;

    // Store period in dataset for the form handler
    paymentForm.dataset.month = month;
    paymentForm.dataset.year = year;

    openModal(paymentModal);
};

async function handlePayment(e) {
    e.preventDefault();
    const reminderId = document.getElementById('payReminderId').value;
    const amount = document.getElementById('payAmount').value;
    const month = paymentForm.dataset.month;
    const year = paymentForm.dataset.year;

    await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            reminder_id: reminderId,
            amount: amount,
            period_month: month,
            period_year: year
        })
    });

    closeModal(paymentModal);
    paymentForm.reset();
    loadData();
}

window.deleteReminder = async (id) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
        await fetch(`${API_URL}/reminders/${id}`, { method: 'DELETE' });
        loadData();
    }
};

// --- Utilities ---

function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    }).format(amount);
}

// Export to CSV
function exportToCSV() {
    if (payments.length === 0) {
        alert('No hay pagos registrados para exportar.');
        return;
    }

    // CSV Headers
    const headers = ['Fecha de Pago', 'Servicio', 'Monto', 'Período (Mes/Año)', 'ID Pago'];

    // CSV Rows
    const rows = payments.map(payment => {
        const date = new Date(payment.paid_at).toLocaleDateString('es-AR');
        const period = `${payment.period_month + 1}/${payment.period_year}`;
        return [
            date,
            payment.reminder_title,
            payment.amount,
            period,
            payment.id
        ];
    });

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = `pagos_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

