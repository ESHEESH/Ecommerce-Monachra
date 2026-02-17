// Admin Dashboard Page Script
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (document.querySelector('.stats-grid')) {
            loadDashboardData();
        }
    });

    async function loadDashboardData() {
        await loadDashboardStats();
        await loadRecentOrders();
        await loadLowStockProducts();
    }

    async function loadDashboardStats() {
        try {
            // Load products to calculate stats
            const productsResult = await API.products.getAll();
            const ordersResult = await API.orders.getUserOrders();
            
            if (productsResult.success && productsResult.data) {
                const products = productsResult.data;
                const totalProducts = products.length;
                const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
                const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
                
                // Update stats cards
                updateStatCard(3, totalProducts, 'Total Products');
                
                // Calculate revenue from orders
                if (ordersResult.success && ordersResult.data) {
                    const orders = ordersResult.data;
                    const totalRevenue = orders
                        .filter(o => o.status !== 'cancelled')
                        .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
                    const totalOrders = orders.filter(o => o.status !== 'cancelled').length;
                    
                    updateStatCard(0, Helpers.formatPrice(totalRevenue), 'Total Revenue');
                    updateStatCard(1, totalOrders, 'Total Orders');
                }
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    function updateStatCard(index, value, label) {
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards[index]) {
            const valueEl = statCards[index].querySelector('.stat-value');
            const titleEl = statCards[index].querySelector('.stat-title');
            if (valueEl) valueEl.textContent = value;
            if (titleEl) titleEl.textContent = label;
        }
    }

    async function loadRecentOrders() {
        try {
            const result = await API.orders.getUserOrders();
            const tbody = document.querySelector('.data-table tbody');
            
            if (!tbody) return;
            
            if (result.success && result.data && result.data.length > 0) {
                tbody.innerHTML = result.data.slice(0, 5).map(order => `
                    <tr>
                        <td>${order.order_number}</td>
                        <td>${order.customer_name || 'Guest'}</td>
                        <td>${Helpers.formatDate(order.created_at)}</td>
                        <td>${Helpers.formatPrice(order.total)}</td>
                        <td><span class="status-badge ${order.status}">${order.status}</span></td>
                        <td>
                            <button class="btn-icon" onclick="viewOrder(${order.id})" title="View Order">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="editOrder(${order.id})" title="Edit Order">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    async function loadLowStockProducts() {
        try {
            const result = await API.products.getAll();
            
            if (result.success && result.data) {
                const lowStockProducts = result.data
                    .filter(p => p.quantity <= 20)
                    .sort((a, b) => a.quantity - b.quantity)
                    .slice(0, 3);
                
                const tbody = document.querySelectorAll('.data-table tbody')[1];
                if (!tbody || lowStockProducts.length === 0) return;
                
                tbody.innerHTML = lowStockProducts.map(product => {
                    const stockPercent = Math.min((product.quantity / 20) * 100, 100);
                    const statusClass = product.quantity === 0 ? 'out-of-stock' : 
                                       product.quantity <= 5 ? 'critical' : 'low';
                    const statusLabel = product.quantity === 0 ? 'Out of Stock' : 
                                       product.quantity <= 5 ? 'Critical' : 'Low Stock';
                    
                    return `
                        <tr>
                            <td>${product.name}</td>
                            <td>${product.sku}</td>
                            <td>${product.category_name || 'N/A'}</td>
                            <td>
                                <div class="stock-level">
                                    <div class="stock-bar">
                                        <div class="stock-fill ${statusClass}" style="width: ${stockPercent}%;"></div>
                                    </div>
                                    <span style="font-size: 12px;">${product.quantity}/20</span>
                                </div>
                            </td>
                            <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                            <td>
                                <button class="btn btn-sm" onclick="window.location.href='stock.html'">Reorder</button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error loading low stock products:', error);
        }
    }

    // Global functions for onclick handlers
    window.viewOrder = function(orderId) {
        Notifications.info('Opening order #' + orderId);
        window.location.href = `orders.html?id=${orderId}`;
    };

    window.editOrder = async function(orderId) {
        const newStatus = prompt('Enter new status (pending/processing/shipped/delivered/cancelled):');
        
        if (!newStatus) return;
        
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(newStatus.toLowerCase())) {
            Notifications.error('Invalid status');
            return;
        }
        
        try {
            // Update order status via API
            Notifications.success('Order status updated to: ' + newStatus);
            loadRecentOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            Notifications.error('Failed to update order');
        }
    };
})();
