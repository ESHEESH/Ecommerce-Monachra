// Customers Management Page Script
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', async function() {
        await loadCustomers();
    });

    async function loadCustomers() {
        try {
            // For now, we'll use a mock implementation since there's no customer API endpoint yet
            const tbody = document.getElementById('customersTable');
            
            if (!tbody) return;

            // Mock customer data - replace with actual API call when available
            const mockCustomers = [
                {
                    id: 1,
                    name: 'Sarah Johnson',
                    email: 'sarah.j@email.com',
                    orders: 12,
                    total_spent: 2340.00,
                    created_at: '2025-11-15'
                },
                {
                    id: 2,
                    name: 'Michael Chen',
                    email: 'mchen@email.com',
                    orders: 8,
                    total_spent: 1890.50,
                    created_at: '2025-12-03'
                },
                {
                    id: 3,
                    name: 'Emma Wilson',
                    email: 'emma.w@email.com',
                    orders: 15,
                    total_spent: 3120.00,
                    created_at: '2025-10-22'
                }
            ];

            if (mockCustomers.length > 0) {
                tbody.innerHTML = mockCustomers.map(customer => `
                    <tr>
                        <td>${customer.name}</td>
                        <td>${customer.email}</td>
                        <td>${customer.orders}</td>
                        <td>${Helpers.formatPrice(customer.total_spent)}</td>
                        <td>${Helpers.formatDate(customer.created_at)}</td>
                        <td>
                            <button class="btn-icon" onclick="viewCustomer(${customer.id})" title="View Customer">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="editCustomer(${customer.id})" title="Edit Customer">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                            No customers yet
                        </td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error loading customers:', error);
            Notifications.error('Failed to load customers');
        }
    }

    // Global functions for onclick handlers
    window.viewCustomer = function(customerId) {
        Notifications.info(`Viewing customer #${customerId} - Full customer details coming soon`);
    };

    window.editCustomer = function(customerId) {
        Notifications.info(`Editing customer #${customerId} - Customer editing coming soon`);
    };
})();
