// Shop Page Script
(function() {
    'use strict';

    let currentCategory = null;

    document.addEventListener('DOMContentLoaded', function() {
        initializeShopPage();
    });

    async function initializeShopPage() {
        // Load categories
        await loadCategories();
        
        // Get category from URL
        currentCategory = Helpers.getUrlParam('category');
        
        // Load products
        if (currentCategory) {
            await ProductsModule.loadByCategory(currentCategory);
            updateActiveCategory(currentCategory);
        } else {
            await ProductsModule.loadAll();
        }
        
        // Initialize filters and sorting
        initializeSorting();
        initializeFilters();
    }

    async function loadCategories() {
        try {
            const result = await API.categories.getAll();
            
            if (result.success && result.data) {
                const categoryList = document.getElementById('categoryList');
                if (!categoryList) return;
                
                result.data.forEach(cat => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <a href="shop.html?category=${cat.id}" 
                           class="category-link" 
                           data-category="${cat.id}">
                            ${cat.name}
                        </a>
                    `;
                    categoryList.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    function updateActiveCategory(categoryId) {
        document.querySelectorAll('.category-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.category === categoryId) {
                link.classList.add('active');
                const pageTitle = document.getElementById('pageTitle');
                if (pageTitle) {
                    pageTitle.textContent = link.textContent;
                }
            }
        });
    }

    function initializeSorting() {
        const sortSelect = document.getElementById('sortSelect');
        if (!sortSelect) return;
        
        sortSelect.addEventListener('change', (e) => {
            ProductsModule.sort(e.target.value);
        });
    }

    function initializeFilters() {
        // Price filters
        document.querySelectorAll('.price-filter').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const minPrice = parseInt(e.target.dataset.min);
                const maxPrice = parseInt(e.target.dataset.max);
                
                ProductsModule.filter({
                    minPrice: minPrice,
                    maxPrice: maxPrice
                });
            });
        });

        // Stock filters
        document.querySelectorAll('.stock-filter').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const inStock = e.target.dataset.stock === 'in';
                
                ProductsModule.filter({
                    inStock: inStock
                });
            });
        });
    }
})();
