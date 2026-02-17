// MONOCHRA Admin Panel JavaScript
const API_URL = '../php/api.php';

// Load Dashboard Statistics
async function loadDashboardStats() {
    try {
        // Get total revenue
        const revenueResponse = await fetch(`${API_URL}?action=get_total_revenue`);
        const revenueData = await revenueResponse.json();
        
        // Get total orders
        const ordersResponse = await fetch(`${API_URL}?action=get_total_orders`);
        const ordersData = await ordersResponse.json();
        
        // Get products count
        const productsResponse = await fetch(`${API_URL}?action=get_products`);
        const productsData = await productsResponse.json();
        
        // Update stat cards
        if (revenueData.success) {
            document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = 
                '$' + (revenueData.data || 0).toLocaleString();
        }
        
        if (ordersData.success) {
            document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = 
                ordersData.data || 0;
        }
        
        if (productsData.success && productsData.data) {
            document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = 
                productsData.data.length;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load Products Table
async function loadProductsTable() {
    try {
        const response = await fetch(`${API_URL}?action=get_products`);
        const data = await response.json();
        
        if (data.success && data.data) {
            displayProductsTable(data.data);
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
                            ${product.description || ''}
                        </div>
                    </div>
                </div>
            </td>
            <td>${product.sku}</td>
            <td>${product.category_name || 'N/A'}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>
                <span class="status-badge ${product.quantity > 0 ? 'active' : 'out-of-stock'}">
                    ${product.quantity > 0 ? 'Active' : 'Out of Stock'}
                </span>
            </td>
            <td>
                <button class="btn-icon" onclick="viewProduct(${product.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Add Product
async function addProduct(formData) {
    try {
        const response = await fetch(`${API_URL}?action=add_product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Product added successfully', 'success');
            closeProductModal();
            loadProductsTable();
        } else {
            showNotification(data.message || 'Error adding product', 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Error adding product', 'error');
    }
}

// Edit Product
async function editProduct(productId) {
    try {
        const response = await fetch(`${API_URL}?action=get_product&id=${productId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            populateEditForm(data.data);
            openProductModal();
        }
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

function populateEditForm(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productSKU').value = product.sku;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productCategory').value = product.category_id;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productStatus').value = product.is_active ? 'active' : 'inactive';
}

// Update Product
async function updateProduct(productId, formData) {
    try {
        const response = await fetch(`${API_URL}?action=update_product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: productId, ...formData })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Product updated successfully', 'success');
            closeProductModal();
            loadProductsTable();
        } else {
            showNotification(data.message || 'Error updating product', 'error');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Error updating product', 'error');
    }
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_URL}?action=delete_product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: productId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Product deleted successfully', 'success');
            loadProductsTable();
        } else {
            showNotification(data.message || 'Error deleting product', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
    }
}

// View Product
function viewProduct(productId) {
    window.open(`../html/product-detail.html?id=${productId}`, '_blank');
}

// Modal Functions
function openProductModal() {
    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    document.getElementById('productForm').reset();
}

// Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d1e7dd' : '#f8d7da'};
        color: ${type === 'success' ? '#0f5132' : '#842029'};
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        gap: 15px;
        align-items: center;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load dashboard stats if on dashboard page
    if (document.querySelector('.stats-grid')) {
        loadDashboardStats();
    }
    
    // Load products table if on products page
    if (document.querySelector('.data-table') && window.location.pathname.includes('products')) {
        loadProductsTable();
    }
    
    // Close modal on outside click
    window.onclick = function(event) {
        const modal = document.getElementById('productModal');
        if (event.target === modal) {
            closeProductModal();
        }
    }
});
