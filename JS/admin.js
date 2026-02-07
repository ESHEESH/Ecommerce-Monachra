/**
 * MONOCHRA - Admin Panel JavaScript
 * Dashboard, Statistics, and Management Scripts
 */

const MonochraAdmin = {
    apiUrl: '/monochra/php/admin/',
    charts: {},

    init: function() {
        this.initSidebar();
        this.initEventListeners();
        this.loadDashboardData();
    },

    initSidebar: function() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.admin-sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                if (!e.target.closest('.admin-sidebar') && !e.target.closest('.sidebar-toggle')) {
                    sidebar?.classList.remove('open');
                }
            }
        });
    },

    initEventListeners: function() {
        // Form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });

        // Delete buttons
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', this.handleDelete.bind(this));
        });

        // Filter changes
        document.querySelectorAll('.filter-item select, .filter-item input').forEach(el => {
            el.addEventListener('change', this.handleFilterChange.bind(this));
        });
    },

    loadDashboardData: function() {
        if (!document.querySelector('.stats-grid')) return;

        fetch(`${this.apiUrl}dashboard.php?action=stats`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.updateStatCards(data.stats);
                    this.loadCharts(data.charts);
                }
            })
            .catch(error => console.error('Error loading dashboard:', error));
    },

    updateStatCards: function(stats) {
        // Update revenue
        const revenueCard = document.querySelector('.stat-card:nth-child(1) .stat-value');
        if (revenueCard && stats.revenue) {
            revenueCard.textContent = `$${stats.revenue.toLocaleString()}`;
        }

        // Update orders
        const ordersCard = document.querySelector('.stat-card:nth-child(2) .stat-value');
        if (ordersCard && stats.orders) {
            ordersCard.textContent = stats.orders;
        }

        // Update customers
        const customersCard = document.querySelector('.stat-card:nth-child(3) .stat-value');
        if (customersCard && stats.customers) {
            customersCard.textContent = stats.customers;
        }

        // Update products
        const productsCard = document.querySelector('.stat-card:nth-child(4) .stat-value');
        if (productsCard && stats.products) {
            productsCard.textContent = stats.products;
        }
    },

    loadCharts: function(chartData) {
        if (document.getElementById('salesChart')) {
            this.initSalesChart(chartData.sales);
        }
        if (document.getElementById('categoryChart')) {
            this.initCategoryChart(chartData.categories);
        }
    },

    initSalesChart: function(data) {
        const ctx = document.getElementById('salesChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sales',
                    data: data?.values || [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#000000',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#000000',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return '$' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e0e0e0'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    initCategoryChart: function(data) {
        const ctx = document.getElementById('categoryChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data?.labels || ['Clothing', 'Shoes', 'Beauty', 'Skincare', 'Accessories'],
                datasets: [{
                    data: data?.values || [35, 25, 20, 15, 5],
                    backgroundColor: [
                        '#000000',
                        '#424242',
                        '#757575',
                        '#9e9e9e',
                        '#bdbdbd'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 11,
                                family: "'Helvetica Neue', Arial, sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#000000',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    },

    handleFormSubmit: function(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const action = form.getAttribute('data-action');

        fetch(form.action || `${this.apiUrl}${action}.php`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification(data.message || 'Success!', 'success');
                if (form.closest('.modal-overlay')) {
                    this.closeModal(form.closest('.modal-overlay'));
                }
                this.reloadData();
            } else {
                this.showNotification(data.message || 'Error occurred', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.showNotification('An error occurred', 'error');
        });
    },

    handleDelete: function(e) {
        const button = e.currentTarget;
        const id = button.getAttribute('data-id');
        const type = button.getAttribute('data-type');

        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

        fetch(`${this.apiUrl}delete.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification(`${type} deleted successfully`, 'success');
                button.closest('tr')?.remove();
                this.reloadData();
            } else {
                this.showNotification(data.message || 'Error deleting item', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.showNotification('Error deleting item', 'error');
        });
    },

    handleFilterChange: function(e) {
        const filters = {};
        document.querySelectorAll('.filter-item select, .filter-item input').forEach(el => {
            if (el.value) {
                filters[el.name] = el.value;
            }
        });

        this.loadFilteredData(filters);
    },

    loadFilteredData: function(filters) {
        const params = new URLSearchParams(filters);
        const endpoint = this.getCurrentEndpoint();

        fetch(`${this.apiUrl}${endpoint}.php?${params}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.updateTable(data.items);
                }
            })
            .catch(error => console.error('Error:', error));
    },

    getCurrentEndpoint: function() {
        const path = window.location.pathname;
        if (path.includes('products')) return 'products';
        if (path.includes('orders')) return 'orders';
        if (path.includes('stock')) return 'stock';
        return 'dashboard';
    },

    updateTable: function(items) {
        const tbody = document.querySelector('.data-table tbody');
        if (!tbody) return;

        tbody.innerHTML = items.map(item => this.renderTableRow(item)).join('');
    },

    renderTableRow: function(item) {
        // This will be customized based on the table type
        // Example for products
        return `
            <tr>
                <td>${item.product_name}</td>
                <td>${item.sku}</td>
                <td>${item.category_name}</td>
                <td>$${parseFloat(item.base_price).toFixed(2)}</td>
                <td>${item.stock_quantity}</td>
                <td><span class="status-badge ${item.status}">${item.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="MonochraAdmin.editItem(${item.product_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" data-action="delete" data-type="product" data-id="${item.product_id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    },

    reloadData: function() {
        // Reload the current page data
        const endpoint = this.getCurrentEndpoint();
        this.loadDashboardData();
    },

    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Modal Management
const ModalManager = {
    open: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    },

    close: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Reset form if exists
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    },

    closeAll: function() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }
};

// Product Management
const ProductManager = {
    uploadedImages: [],

    init: function() {
        this.initImageUpload();
    },

    initImageUpload: function() {
        const uploadWrapper = document.querySelector('.image-upload-wrapper');
        if (!uploadWrapper) return;

        // Click to upload
        uploadWrapper.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.onchange = (e) => this.handleImageUpload(e.target.files);
            input.click();
        });

        // Drag and drop
        uploadWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadWrapper.classList.add('drag-over');
        });

        uploadWrapper.addEventListener('dragleave', () => {
            uploadWrapper.classList.remove('drag-over');
        });

        uploadWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadWrapper.classList.remove('drag-over');
            this.handleImageUpload(e.dataTransfer.files);
        });
    },

    handleImageUpload: function(files) {
        const previewContainer = document.querySelector('.image-preview') || this.createPreviewContainer();

        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'preview-item';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="preview-remove" onclick="ProductManager.removeImage(${this.uploadedImages.length})">
                        <i class="fas fa-times"></i>
                    </button>
                    ${index === 0 ? '<span class="primary-badge">Primary</span>' : ''}
                `;
                previewContainer.appendChild(preview);

                this.uploadedImages.push({
                    file: file,
                    preview: e.target.result,
                    isPrimary: index === 0
                });
            };
            reader.readAsDataURL(file);
        });
    },

    createPreviewContainer: function() {
        const container = document.createElement('div');
        container.className = 'image-preview';
        document.querySelector('.image-upload-wrapper').after(container);
        return container;
    },

    removeImage: function(index) {
        this.uploadedImages.splice(index, 1);
        const previews = document.querySelectorAll('.preview-item');
        if (previews[index]) previews[index].remove();
    }
};

// Stock Management
const StockManager = {
    init: function() {
        this.updateStockLevels();
    },

    updateStockLevels: function() {
        document.querySelectorAll('.stock-bar').forEach(bar => {
            const fill = bar.querySelector('.stock-fill');
            const width = fill.style.width;
            const percentage = parseInt(width);

            if (percentage === 0) {
                fill.classList.add('critical');
            } else if (percentage < 30) {
                fill.classList.add('low');
            }
        });
    },

    adjustStock: function(productId, adjustment, reason) {
        fetch(`${MonochraAdmin.apiUrl}stock.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'adjust',
                product_id: productId,
                adjustment: adjustment,
                reason: reason
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                MonochraAdmin.showNotification('Stock updated successfully', 'success');
                MonochraAdmin.reloadData();
            } else {
                MonochraAdmin.showNotification(data.message || 'Error updating stock', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            MonochraAdmin.showNotification('Error updating stock', 'error');
        });
    }
};

// Order Management
const OrderManager = {
    updateStatus: function(orderId, newStatus) {
        fetch(`${MonochraAdmin.apiUrl}orders.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_status',
                order_id: orderId,
                status: newStatus
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                MonochraAdmin.showNotification('Order status updated', 'success');
                MonochraAdmin.reloadData();
            } else {
                MonochraAdmin.showNotification(data.message || 'Error updating order', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            MonochraAdmin.showNotification('Error updating order', 'error');
        });
    },

    viewDetails: function(orderId) {
        fetch(`${MonochraAdmin.apiUrl}orders.php?action=details&id=${orderId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.displayOrderDetails(data.order);
                }
            })
            .catch(error => console.error('Error:', error));
    },

    displayOrderDetails: function(order) {
        // Create and display order details modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Order #${order.order_number}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="order-details">
                        <h4>Customer Information</h4>
                        <p>${order.customer_name}</p>
                        <p>${order.customer_email}</p>
                        
                        <h4>Order Items</h4>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>${item.product_name}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${parseFloat(item.price_per_unit).toFixed(2)}</td>
                                        <td>$${parseFloat(item.subtotal).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <h4>Order Total: $${parseFloat(order.total_amount).toFixed(2)}</h4>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }
};

// Global Functions (for onclick attributes)
function openProductModal() {
    ModalManager.open('productModal');
}

function closeProductModal() {
    ModalManager.close('productModal');
}

function openStockModal() {
    ModalManager.open('stockModal');
}

function closeStockModal() {
    ModalManager.close('stockModal');
}

function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('i');
    
    content.classList.toggle('active');
    icon.classList.toggle('fa-plus');
    icon.classList.toggle('fa-minus');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    MonochraAdmin.init();
    
    // Page-specific initialization
    if (document.querySelector('.image-upload-wrapper')) {
        ProductManager.init();
    }
    
    if (document.querySelector('.stock-bar')) {
        StockManager.init();
    }

    // Close modals on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            ModalManager.closeAll();
        }
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MonochraAdmin,
        ModalManager,
        ProductManager,
        StockManager,
        OrderManager
    };
}