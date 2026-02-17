// Admin Module
const AdminModule = {
    async loadDashboardStats() {
        try {
            const [revenue, orders, products] = await Promise.all([
                API.orders.getTotalRevenue(),
                API.orders.getTotalCount(),
                API.products.getAll()
            ]);

            this.updateStatCard(1, revenue.success ? Helpers.formatPrice(revenue.data) : '$0');
            this.updateStatCard(2, orders.success ? orders.data : '0');
            this.updateStatCard(4, products.success ? products.data.length : '0');
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    },

    updateStatCard(index, value) {
        const card = document.querySelector(`.stat-card:nth-child(${index}) .stat-value`);
        if (card) card.textContent = value;
    },

    async loadProductsTable() {
        try {
            const result = await API.products.getAll();
            
            if (result.success && result.data) {
                this.displayProductsTable(result.data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    },

    displayProductsTable(products) {
        const tbody = document.querySelector('.data-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${product.image_url}" style="width: 50px; height: 50px; object-fit: cover;">
                        <div>
                            <div style="font-weight: 500;">${product.name}</div>
                            <div style="font-size: 11px; color: var(--text-secondary);">
                                ${Helpers.truncate(product.description || '', 50)}
                            </div>
                        </div>
                    </div>
                </td>
                <td>${product.sku}</td>
                <td>${product.category_name || 'N/A'}</td>
                <td>${Helpers.formatPrice(product.price)}</td>
                <td>${product.quantity}</td>
                <td>
                    <span class="status-badge ${product.quantity > 0 ? 'active' : 'out-of-stock'}">
                        ${product.quantity > 0 ? 'Active' : 'Out of Stock'}
                    </span>
                </td>
                <td>
                    <button class="btn-icon" onclick="AdminModule.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="AdminModule.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async editProduct(productId) {
        // Implementation for edit
        Notifications.info('Edit functionality coming soon');
    },

    async deleteProduct(productId) {
        if (!confirm('Delete this product?')) return;
        
        try {
            const result = await API.products.delete(productId);
            
            if (result.success) {
                Notifications.success('Product deleted');
                this.loadProductsTable();
            } else {
                Notifications.error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            Notifications.error('Error deleting product');
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminModule;
}
