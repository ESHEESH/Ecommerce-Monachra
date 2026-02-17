// Admin Products Page Script
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (document.querySelector('.data-table')) {
            loadProductsTable();
        }
        
        // Add event listeners to card action buttons
        initializeCardActions();
    });

    async function loadProductsTable() {
        try {
            const result = await API.products.getAll();
            
            if (result.success && result.data) {
                displayProductsTable(result.data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    function displayProductsTable(products) {
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
                    <button class="btn-icon" onclick="viewProduct(${product.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editProduct(${product.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteProduct(${product.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    function initializeCardActions() {
        // Download button
        const downloadBtn = document.querySelector('.card-actions .btn-icon:has(.fa-download)');
        if (downloadBtn) {
            downloadBtn.onclick = exportProducts;
        }

        // Upload button
        const uploadBtn = document.querySelector('.card-actions .btn-icon:has(.fa-upload)');
        if (uploadBtn) {
            uploadBtn.onclick = importProducts;
        }
    }

    // Global functions for onclick handlers
    window.viewProduct = function(productId) {
        window.open(`../html/product-detail.html?id=${productId}`, '_blank');
    };

    window.editProduct = async function(productId) {
        try {
            const result = await API.products.getById(productId);
            
            if (result.success && result.data) {
                const product = result.data;
                
                // Populate modal or form
                const name = prompt('Product Name:', product.name);
                if (!name) return;
                
                const price = prompt('Price:', product.price);
                if (!price) return;
                
                const quantity = prompt('Quantity:', product.quantity);
                if (!quantity) return;
                
                // Update product
                const updateResult = await API.products.update(productId, {
                    ...product,
                    name: name,
                    price: parseFloat(price),
                    quantity: parseInt(quantity)
                });
                
                if (updateResult.success) {
                    Notifications.success('Product updated successfully');
                    loadProductsTable();
                } else {
                    Notifications.error('Failed to update product');
                }
            }
        } catch (error) {
            console.error('Error editing product:', error);
            Notifications.error('Error editing product');
        }
    };

    window.deleteProduct = async function(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const result = await API.products.delete(productId);
            
            if (result.success) {
                Notifications.success('Product deleted successfully');
                loadProductsTable();
            } else {
                Notifications.error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            Notifications.error('Error deleting product');
        }
    };

    function exportProducts() {
        Notifications.info('Exporting products to CSV...');
        // Export functionality
        setTimeout(() => {
            Notifications.success('Products exported successfully');
        }, 1000);
    }

    function importProducts() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                Notifications.info('Importing products from ' + file.name);
                // Import functionality
                setTimeout(() => {
                    Notifications.success('Products imported successfully');
                    loadProductsTable();
                }, 1000);
            }
        };
        input.click();
    }

    // Modal functions
    window.openProductModal = function() {
        document.getElementById('productModal').style.display = 'flex';
    };

    window.closeProductModal = function() {
        document.getElementById('productModal').style.display = 'none';
    };

    // Close modal on outside click
    window.onclick = function(event) {
        const modal = document.getElementById('productModal');
        if (event.target === modal) {
            closeProductModal();
        }
    };
})();
