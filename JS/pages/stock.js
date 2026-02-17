// Stock Management Page Script
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', async function() {
        await loadStockData();
        initializeFilters();
    });

    async function loadStockData() {
        try {
            const result = await API.products.getAll();
            
            if (result.success && result.data) {
                displayStockTable(result.data);
            }
        } catch (error) {
            console.error('Error loading stock:', error);
        }
    }

    function displayStockTable(products) {
        const tbody = document.getElementById('stockTableBody');
        if (!tbody) return;

        tbody.innerHTML = products.map(product => {
            const stockPercentage = Math.min((product.quantity / 100) * 100, 100);
            const stockStatus = getStockStatus(product.quantity);
            
            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${product.image_url}" style="width: 40px; height: 40px; object-fit: cover;">
                            <span>${product.name}</span>
                        </div>
                    </td>
                    <td>${product.sku}</td>
                    <td>${product.category_name || 'N/A'}</td>
                    <td>${Helpers.formatPrice(product.price)}</td>
                    <td>${product.quantity}</td>
                    <td>
                        <div class="stock-level">
                            <div class="stock-bar">
                                <div class="stock-fill ${stockStatus.class}" style="width: ${stockPercentage}%;"></div>
                            </div>
                            <span style="font-size: 11px;">${Math.round(stockPercentage)}%</span>
                        </div>
                    </td>
                    <td><span class="status-badge ${stockStatus.class}">${stockStatus.label}</span></td>
                    <td>
                        <button class="btn-icon" onclick="editStock(${product.id})" title="Edit Stock">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="adjustStock(${product.id}, 'add')" title="Add Stock">
                            <i class="fas fa-plus"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function getStockStatus(quantity) {
        if (quantity === 0) {
            return { label: 'Out of Stock', class: 'out-of-stock', color: '#dc3545' };
        } else if (quantity <= 5) {
            return { label: 'Critical', class: 'critical', color: '#dc3545' };
        } else if (quantity <= 20) {
            return { label: 'Low Stock', class: 'low', color: '#fd7e14' };
        } else {
            return { label: 'In Stock', class: '', color: '#28a745' };
        }
    }

    function initializeFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('searchStock');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', applyFilters);
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', applyFilters);
        }
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce(applyFilters, 300));
        }
    }

    async function applyFilters() {
        await loadStockData();
        // Additional filtering logic can be added here
    }

    // Global functions for onclick handlers
    window.adjustStock = async function(productId, action) {
        const amount = prompt(`Enter amount to ${action}:`, '10');
        if (!amount || isNaN(amount)) return;

        const adjustment = action === 'add' ? parseInt(amount) : -parseInt(amount);
        
        try {
            // Update product quantity
            const product = await API.products.getById(productId);
            if (!product.success) {
                Notifications.error('Product not found');
                return;
            }

            const newQuantity = Math.max(0, product.data.quantity + adjustment);
            
            const result = await API.products.update(productId, {
                ...product.data,
                quantity: newQuantity
            });

            if (result.success) {
                Notifications.success(`Stock ${action === 'add' ? 'added' : 'removed'} successfully`);
                await loadStockData();
            } else {
                Notifications.error('Failed to update stock');
            }
        } catch (error) {
            console.error('Error adjusting stock:', error);
            Notifications.error('Error adjusting stock');
        }
    };

    window.editStock = async function(productId) {
        const newQuantity = prompt('Enter new stock quantity:');
        if (!newQuantity || isNaN(newQuantity)) return;

        try {
            const product = await API.products.getById(productId);
            if (!product.success) {
                Notifications.error('Product not found');
                return;
            }

            const result = await API.products.update(productId, {
                ...product.data,
                quantity: parseInt(newQuantity)
            });

            if (result.success) {
                Notifications.success('Stock updated successfully');
                await loadStockData();
            } else {
                Notifications.error('Failed to update stock');
            }
        } catch (error) {
            console.error('Error editing stock:', error);
            Notifications.error('Error editing stock');
        }
    };
})();
