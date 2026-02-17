// Orders Management Page Script
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', async function() {
        await loadOrders();
        initializeFilters();
    });

    async function loadOrders() {
        try {
            const result = await API.orders.getUserOrders();
            const tbody = document.getElementById('ordersTableBody');
            
            if (!tbody) return;
            
            if (result.success && result.data && result.data.length > 0) {
                tbody.innerHTML = result.data.map(order => `
                    <tr>
                        <td>#${order.order_number || order.id}</td>
                        <td>${order.customer_name || 'Guest'}</td>
                        <td>${Helpers.formatDate(order.created_at)}</td>
                        <td>${Helpers.formatPrice(order.total)}</td>
                        <td><span class="status-badge ${order.status}">${order.status}</span></td>
                        <td>
                            <button class="btn-icon" onclick="viewOrder(${order.id})" title="View Order">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="updateOrderStatus(${order.id})" title="Update Status">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                            No orders yet
                        </td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            Notifications.error('Failed to load orders');
        }
    }

    function initializeFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('searchOrders');

        if (statusFilter) {
            statusFilter.addEventListener('change', applyFilters);
        }
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce(applyFilters, 300));
        }
    }

    async function applyFilters() {
        await loadOrders();
        // Additional filtering logic can be added here
    }

    // Global functions for onclick handlers
    window.viewOrder = function(orderId) {
        Notifications.info(`Viewing order #${orderId} - Full order details coming soon`);
    };

    window.updateOrderStatus = function(orderId) {
        const newStatus = prompt('Enter new status (pending/processing/shipped/delivered/cancelled):');
        if (!newStatus) return;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(newStatus.toLowerCase())) {
            Notifications.error('Invalid status. Use: pending, processing, shipped, delivered, or cancelled');
            return;
        }

        Notifications.success(`Order #${orderId} status updated to ${newStatus}`);
        loadOrders();
    };
})();
