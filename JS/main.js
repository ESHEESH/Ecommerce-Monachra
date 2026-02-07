/**
 * MONOCHRA - Main JavaScript
 * User Interface Scripts
 */

// Global Configuration
const MONOCHRA = {
    apiUrl: '/monochra/php/',
    cartBadge: null,
    
    init: function() {
        this.cartBadge = document.querySelector('.cart-badge');
        this.initEventListeners();
        this.loadCartCount();
    },

    initEventListeners: function() {
        // Search functionality
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(this.handleSearch.bind(this), 300));
        }

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', this.addToCart.bind(this));
        });

        // Size selection
        document.querySelectorAll('.size-option').forEach(option => {
            option.addEventListener('click', this.selectSize);
        });

        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', this.selectColor);
        });

        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', this.toggleMobileMenu);
        }
    },

    handleSearch: function(e) {
        const query = e.target.value.trim();
        if (query.length < 2) return;

        fetch(`${this.apiUrl}search.php?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                this.displaySearchResults(data.products);
            })
            .catch(error => console.error('Search error:', error));
    },

    displaySearchResults: function(products) {
        // Create search results dropdown
        const resultsContainer = document.querySelector('.search-results') || this.createSearchResultsContainer();
        
        if (products.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No products found</div>';
            return;
        }

        resultsContainer.innerHTML = products.map(product => `
            <a href="product-detail.html?id=${product.product_id}" class="search-result-item">
                <img src="${product.primary_image || 'placeholder.jpg'}" alt="${product.product_name}">
                <div>
                    <div class="result-name">${product.product_name}</div>
                    <div class="result-price">$${parseFloat(product.base_price).toFixed(2)}</div>
                </div>
            </a>
        `).join('');

        resultsContainer.style.display = 'block';
    },

    createSearchResultsContainer: function() {
        const container = document.createElement('div');
        container.className = 'search-results';
        document.querySelector('.search-bar').appendChild(container);
        
        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar')) {
                container.style.display = 'none';
            }
        });
        
        return container;
    },

    selectSize: function() {
        document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
    },

    selectColor: function() {
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
    },

    addToCart: function(e) {
        e.preventDefault();
        
        const productId = this.getAttribute('data-product-id') || getUrlParameter('id');
        const selectedSize = document.querySelector('.size-option.selected')?.textContent;
        const selectedColor = document.querySelector('.color-option.selected')?.getAttribute('data-color');
        const quantity = parseInt(document.getElementById('quantity')?.textContent || 1);

        if (!selectedSize) {
            showNotification('Please select a size', 'error');
            return;
        }

        const cartData = {
            product_id: productId,
            size: selectedSize,
            color: selectedColor,
            quantity: quantity
        };

        fetch(`${MONOCHRA.apiUrl}cart.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'add', ...cartData })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Added to cart', 'success');
                this.updateCartCount(data.cart_count);
            } else {
                showNotification(data.message || 'Error adding to cart', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error adding to cart', 'error');
        });
    },

    loadCartCount: function() {
        fetch(`${this.apiUrl}cart.php?action=count`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.updateCartCount(data.count);
                }
            })
            .catch(error => console.error('Error loading cart count:', error));
    },

    updateCartCount: function(count) {
        if (this.cartBadge) {
            this.cartBadge.textContent = count;
            if (count > 0) {
                this.cartBadge.style.display = 'flex';
            } else {
                this.cartBadge.style.display = 'none';
            }
        }
    },

    toggleMobileMenu: function() {
        document.querySelector('.main-nav').classList.toggle('active');
    }
};

// Product Detail Page Functions
const ProductDetail = {
    currentImage: 0,
    images: [],

    init: function() {
        this.images = document.querySelectorAll('.thumbnail');
        this.initImageGallery();
        this.initQuantityControls();
        this.initAccordion();
    },

    initImageGallery: function() {
        document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.addEventListener('click', () => this.changeImage(thumb, index));
        });
    },

    changeImage: function(thumbnail, index) {
        const mainImage = document.getElementById('mainImage');
        const newSrc = thumbnail.src.replace('w=150&h=150', 'w=600&h=800');
        
        mainImage.style.opacity = '0';
        setTimeout(() => {
            mainImage.src = newSrc;
            mainImage.style.opacity = '1';
        }, 200);

        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
        this.currentImage = index;
    },

    initQuantityControls: function() {
        const decreaseBtn = document.querySelector('.quantity-btn:first-child');
        const increaseBtn = document.querySelector('.quantity-btn:last-child');
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => this.changeQuantity(-1));
        }
        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => this.changeQuantity(1));
        }
    },

    changeQuantity: function(change) {
        const quantityEl = document.getElementById('quantity');
        let quantity = parseInt(quantityEl.textContent);
        quantity = Math.max(1, quantity + change);
        quantityEl.textContent = quantity;
    },

    initAccordion: function() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => this.toggleAccordion(header));
        });
    },

    toggleAccordion: function(header) {
        const content = header.nextElementSibling;
        const icon = header.querySelector('i');
        
        // Close all other accordions
        document.querySelectorAll('.accordion-content').forEach(c => {
            if (c !== content) c.classList.remove('active');
        });
        document.querySelectorAll('.accordion-header i').forEach(i => {
            if (i !== icon) {
                i.classList.remove('fa-minus');
                i.classList.add('fa-plus');
            }
        });
        
        // Toggle current
        content.classList.toggle('active');
        icon.classList.toggle('fa-plus');
        icon.classList.toggle('fa-minus');
    }
};

// Cart Page Functions
const Cart = {
    items: [],

    init: function() {
        this.loadCart();
        this.initEventListeners();
    },

    loadCart: function() {
        fetch(`${MONOCHRA.apiUrl}cart.php?action=get`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.items = data.items;
                    this.renderCart();
                    this.updateSummary();
                }
            })
            .catch(error => console.error('Error loading cart:', error));
    },

    renderCart: function() {
        const container = document.querySelector('.cart-items');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <h2>Your bag is empty</h2>
                    <a href="index.html" class="btn">Continue Shopping</a>
                </div>
            `;
            return;
        }

        container.innerHTML = this.items.map(item => `
            <div class="cart-item" data-item-id="${item.cart_item_id}">
                <img src="${item.image_url}" alt="${item.product_name}" class="item-image">
                <div class="item-details">
                    <h3>${item.product_name}</h3>
                    <div class="item-meta">
                        ${item.color ? `Color: ${item.color} | ` : ''}
                        ${item.size ? `Size: ${item.size}` : ''}
                    </div>
                    <div class="item-price">$${parseFloat(item.price).toFixed(2)}</div>
                </div>
                <div class="item-controls">
                    <div class="mini-quantity">
                        <button onclick="Cart.updateQuantity(${item.cart_item_id}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="Cart.updateQuantity(${item.cart_item_id}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="Cart.removeItem(${item.cart_item_id})">
                        <i class="far fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    updateQuantity: function(itemId, change) {
        const item = this.items.find(i => i.cart_item_id === itemId);
        if (!item) return;

        const newQuantity = Math.max(1, item.quantity + change);

        fetch(`${MONOCHRA.apiUrl}cart.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update',
                item_id: itemId,
                quantity: newQuantity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.loadCart();
            }
        })
        .catch(error => console.error('Error:', error));
    },

    removeItem: function(itemId) {
        if (!confirm('Remove this item from your cart?')) return;

        fetch(`${MONOCHRA.apiUrl}cart.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'remove',
                item_id: itemId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.loadCart();
                MONOCHRA.updateCartCount(data.cart_count);
            }
        })
        .catch(error => console.error('Error:', error));
    },

    updateSummary: function() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal > 100 ? 0 : 10;
        const total = subtotal + tax + shipping;

        document.querySelectorAll('.summary-row').forEach(row => {
            const label = row.querySelector('span:first-child').textContent.toLowerCase();
            const valueEl = row.querySelector('span:last-child');
            
            if (label.includes('subtotal')) {
                valueEl.textContent = `$${subtotal.toFixed(2)}`;
            } else if (label.includes('shipping')) {
                valueEl.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
            } else if (label.includes('tax')) {
                valueEl.textContent = `$${tax.toFixed(2)}`;
            } else if (label.includes('total')) {
                valueEl.textContent = `$${total.toFixed(2)}`;
            }
        });
    },

    initEventListeners: function() {
        const promoBtn = document.querySelector('.promo-input button');
        if (promoBtn) {
            promoBtn.addEventListener('click', this.applyPromoCode.bind(this));
        }
    },

    applyPromoCode: function() {
        const input = document.querySelector('.promo-input input');
        const code = input.value.trim();
        
        if (!code) {
            showNotification('Please enter a promo code', 'error');
            return;
        }

        fetch(`${MONOCHRA.apiUrl}cart.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'apply_coupon',
                code: code
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Promo code applied!', 'success');
                this.loadCart();
            } else {
                showNotification(data.message || 'Invalid promo code', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error applying promo code', 'error');
        });
    }
};

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatPrice(price) {
    return '$' + parseFloat(price).toFixed(2);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    MONOCHRA.init();
    
    // Page-specific initialization
    if (document.querySelector('.product-detail-wrapper')) {
        ProductDetail.init();
    }
    
    if (document.querySelector('.cart-wrapper')) {
        Cart.init();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MONOCHRA, ProductDetail, Cart };
}