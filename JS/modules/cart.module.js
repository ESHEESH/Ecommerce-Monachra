// Cart Module
const CartModule = {
    async addToCart(productId, quantity = 1) {
        try {
            const result = await API.cart.add(productId, quantity);
            
            if (result.success) {
                Notifications.success('Added to cart!');
                this.updateBadge();
            } else {
                Notifications.error(result.message || 'Error adding to cart');
            }
            
            return result;
        } catch (error) {
            console.error('Error adding to cart:', error);
            Notifications.error('Error adding to cart');
            return { success: false };
        }
    },

    async getCart() {
        try {
            const result = await API.cart.get();
            return result.data || { items: [], total: 0, count: 0 };
        } catch (error) {
            console.error('Error fetching cart:', error);
            return { items: [], total: 0, count: 0 };
        }
    },

    async updateItem(itemId, quantity) {
        if (quantity < 1) return;
        
        try {
            const result = await API.cart.update(itemId, quantity);
            
            if (result.success) {
                await this.loadCartPage();
                this.updateBadge();
            }
            
            return result;
        } catch (error) {
            console.error('Error updating cart:', error);
            return { success: false };
        }
    },

    async removeItem(itemId) {
        if (!confirm('Remove this item from your cart?')) return;
        
        try {
            const result = await API.cart.remove(itemId);
            
            if (result.success) {
                Notifications.success('Item removed');
                await this.loadCartPage();
                this.updateBadge();
            }
            
            return result;
        } catch (error) {
            console.error('Error removing item:', error);
            return { success: false };
        }
    },

    async loadCartPage() {
        const cartData = await this.getCart();
        this.displayItems(cartData.items);
        this.updateSummary(cartData);
    },

    displayItems(items) {
        const container = document.querySelector('.cart-items');
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <h2>Your bag is empty</h2>
                    <a href="shop.html" class="btn">Continue Shopping</a>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <img src="${item.image_url}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <div class="item-price">${Helpers.formatPrice(item.price)}</div>
                </div>
                <div class="item-controls">
                    <div class="mini-quantity">
                        <button onclick="CartModule.updateItem(${item.id}, ${item.quantity - 1})">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="CartModule.updateItem(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="CartModule.removeItem(${item.id})">
                        <i class="far fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    updateSummary(cartData) {
        const subtotal = cartData.total || 0;
        const tax = subtotal * 0.08;
        const shipping = subtotal > 100 ? 0 : 10;
        const total = subtotal + tax + shipping;

        const summaryRows = document.querySelectorAll('.summary-row');
        summaryRows.forEach(row => {
            const spans = row.querySelectorAll('span');
            if (spans.length < 2) return;
            
            const label = spans[0].textContent.toLowerCase();
            if (label.includes('subtotal')) {
                spans[1].textContent = Helpers.formatPrice(subtotal);
            } else if (label.includes('tax')) {
                spans[1].textContent = Helpers.formatPrice(tax);
            } else if (label.includes('shipping')) {
                spans[1].textContent = shipping === 0 ? 'Free' : Helpers.formatPrice(shipping);
            } else if (label.includes('total')) {
                spans[1].textContent = Helpers.formatPrice(total);
            }
        });
    },

    async updateBadge() {
        const cartData = await this.getCart();
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = cartData.count || 0;
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartModule;
}
