// Profile Page Script
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', async function() {
        await loadUserProfile();
        initializeProfileMenu();
        initializeLogoutButtons();
    });

    async function loadUserProfile() {
        const user = await AuthModule.getCurrentUser();
        if (!user) return;

        // Update profile info
        updateElement('userName', `${user.first_name} ${user.last_name}`);
        updateElement('userEmail', user.email);
        updateElement('memberSince', Helpers.formatDate(user.created_at));
        
        // Update form fields
        updateInputValue('editFirstName', user.first_name);
        updateInputValue('editLastName', user.last_name);
    }

    function updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function updateInputValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }

    function initializeProfileMenu() {
        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                
                // Update active menu item
                document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
                
                // Show selected section
                document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
                document.getElementById(section).classList.add('active');
                
                // Load orders if orders section
                if (section === 'orders') {
                    loadUserOrders();
                }
            });
        });
    }

    async function loadUserOrders() {
        try {
            const response = await API.orders.getUserOrders();
            const container = document.getElementById('ordersContainer');
            
            if (!container) return;
            
            if (response.success && response.data && response.data.length > 0) {
                container.innerHTML = response.data.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <div>
                                <div class="order-number">${order.order_number}</div>
                                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">
                                    ${Helpers.formatDate(order.created_at)}
                                </div>
                            </div>
                            <span class="order-status ${order.status}">${order.status}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 13px;">Total: ${Helpers.formatPrice(order.total)}</span>
                            <a href="#" style="font-size: 12px; text-decoration: underline;">View Details</a>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p style="color: var(--text-secondary);">No orders yet</p>';
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    function initializeLogoutButtons() {
        const logoutButtons = ['logoutBtn', 'sidebarLogout'];
        
        logoutButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    AuthModule.logout();
                });
            }
        });
    }
})();
