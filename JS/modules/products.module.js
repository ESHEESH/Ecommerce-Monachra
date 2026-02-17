// Products Module
const ProductsModule = {
    allProducts: [],
    currentFilters: {
        category: null,
        minPrice: 0,
        maxPrice: 999999,
        inStock: null
    },

    async loadAll() {
        try {
            Helpers.showLoading('.product-grid');
            const result = await API.products.getAll();
            
            if (result.success && result.data) {
                this.allProducts = result.data;
                this.display(this.allProducts);
            } else {
                document.querySelector('.product-grid').innerHTML = 
                    '<p style="color: var(--text-secondary);">No products found</p>';
            }
        } catch (error) {
            console.error('Error loading products:', error);
            document.querySelector('.product-grid').innerHTML = 
                '<p style="color: var(--text-secondary);">Error loading products</p>';
        }
    },

    async loadByCategory(categoryId) {
        try {
            Helpers.showLoading('.product-grid');
            const result = await API.products.getByCategory(categoryId);
            
            if (result.success && result.data) {
                this.allProducts = result.data;
                this.display(this.allProducts);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    },

    async search(query) {
        if (query.length < 2) return [];
        
        try {
            const result = await API.products.search(query);
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    },

    display(products) {
        const grid = document.querySelector('.product-grid');
        if (!grid) return;

        if (products.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-secondary);">No products found</p>';
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image-wrapper">
                    ${product.quantity <= 5 ? '<span class="new-badge">Low Stock</span>' : ''}
                    <img src="${product.image_url}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${Helpers.truncate(product.description || '', 60)}</p>
                    <div class="product-price">${Helpers.formatPrice(product.price)}</div>
                    <button class="btn btn-sm" onclick="CartModule.addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    },

    filter(filters = {}) {
        this.currentFilters = { ...this.currentFilters, ...filters };
        
        let filtered = this.allProducts.filter(product => {
            const price = parseFloat(product.price);
            const priceMatch = price >= this.currentFilters.minPrice && 
                              price <= this.currentFilters.maxPrice;
            
            const stockMatch = this.currentFilters.inStock === null || 
                             (this.currentFilters.inStock && product.quantity > 0);
            
            return priceMatch && stockMatch;
        });

        this.display(filtered);
    },

    sort(sortBy) {
        let sorted = [...this.allProducts];

        switch(sortBy) {
            case 'price-low':
                sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price-high':
                sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
            default:
                sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        this.display(sorted);
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsModule;
}
