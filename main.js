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
}
