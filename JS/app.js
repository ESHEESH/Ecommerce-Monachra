// Main Application Entry Point
// This file initializes the application and loads required modules

(function() {
    'use strict';

    // Initialize app on DOM ready
    document.addEventListener('DOMContentLoaded', initializeApp);

    function initializeApp() {
        // Update cart badge on all pages
        if (typeof CartModule !== 'undefined') {
            CartModule.updateBadge();
        }

        // Initialize search functionality
        initializeSearch();

        // Page-specific initialization
        const path = window.location.pathname;
        
        if (path.includes('index.html') || path.endsWith('/')) {
            initHomePage();
        } else if (path.includes('shop.html')) {
            initShopPage();
        } else if (path.includes('cart.html')) {
            initCartPage();
        } else if (path.includes('profile.html')) {
            initProfilePage();
        } else if (path.includes('dashboard.html')) {
            initDashboardPage();
        } else if (path.includes('products.html') && path.includes('html')) {
            initAdminProductsPage();
        }

        // Global event listeners
        initGlobalListeners();
    }

    function initHomePage() {
        if (typeof ProductsModule !== 'undefined') {
            ProductsModule.loadAll();
        }
    }

    function initShopPage() {
        if (typeof ProductsModule !== 'undefined') {
            const categoryId = Helpers.getUrlParam('category');
            
            if (categoryId) {
                ProductsModule.loadByCategory(categoryId);
            } else {
                ProductsModule.loadAll();
            }

            // Sort functionality
            const sortSelect = document.getElementById('sortSelect');
            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    ProductsModule.sort(e.target.value);
                });
            }
        }
    }

    function initCartPage() {
        if (typeof CartModule !== 'undefined') {
            CartModule.loadCartPage();
        }
    }

    function initProfilePage() {
        if (typeof AuthModule !== 'undefined') {
            loadUserProfile();
        }
    }

    function initDashboardPage() {
        if (typeof AdminModule !== 'undefined') {
            AdminModule.loadDashboardStats();
        }
    }

    function initAdminProductsPage() {
        if (typeof AdminModule !== 'undefined') {
            AdminModule.loadProductsTable();
        }
    }

    function initializeSearch() {
        const searchInput = document.querySelector('.search-bar input');
        if (!searchInput) return;

        const debouncedSearch = Helpers.debounce(async (query) => {
            if (query.length < 2) {
                hideSearchResults();
                return;
            }

            const results = await ProductsModule.search(query);
            displaySearchResults(results);
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        searchInput.addEventListener('focus', (e) => {
            if (e.target.value.length >= 2) {
                debouncedSearch(e.target.value);
            }
        });
    }

    function displaySearchResults(products) {
        let resultsContainer = document.querySelector('.search-results');
        
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.className = 'search-results';
            resultsContainer.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid var(--border-color);
                max-height: 400px;
                overflow-y: auto;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            `;
            document.querySelector('.search-bar').appendChild(resultsContainer);
        }
        
        if (products.length === 0) {
            resultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No products found</div>';
        } else {
            resultsContainer.innerHTML = products.slice(0, 5).map(product => `
                <a href="shop.html?id=${product.id}" style="display: flex; padding: 12px; gap: 12px; text-decoration: none; color: inherit; border-bottom: 1px solid var(--border-color);">
                    <img src="${product.image_url}" style="width: 50px; height: 50px; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="font-weight: 500; margin-bottom: 4px;">${product.name}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">${Helpers.formatPrice(product.price)}</div>
                    </div>
                </a>
            `).join('');
        }
        
        resultsContainer.style.display = 'block';
    }

    function hideSearchResults() {
        const resultsContainer = document.querySelector('.search-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }

    function initGlobalListeners() {
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar')) {
                hideSearchResults();
            }
        });

        // Handle logout buttons
        document.querySelectorAll('[data-action="logout"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof AuthModule !== 'undefined') {
                    AuthModule.logout();
                }
            });
        });
    }

    async function loadUserProfile() {
        const user = await AuthModule.getCurrentUser();
        if (!user) return;

        // Update profile info
        const elements = {
            userName: document.getElementById('userName'),
            userEmail: document.getElementById('userEmail'),
            memberSince: document.getElementById('memberSince'),
            editFirstName: document.getElementById('editFirstName'),
            editLastName: document.getElementById('editLastName')
        };

        if (elements.userName) {
            elements.userName.textContent = `${user.first_name} ${user.last_name}`;
        }
        if (elements.userEmail) {
            elements.userEmail.textContent = user.email;
        }
        if (elements.memberSince) {
            elements.memberSince.textContent = Helpers.formatDate(user.created_at);
        }
        if (elements.editFirstName) {
            elements.editFirstName.value = user.first_name;
        }
        if (elements.editLastName) {
            elements.editLastName.value = user.last_name;
        }
    }

})();
