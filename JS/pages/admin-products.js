// Admin Products Page Script
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (document.querySelector('.data-table')) {
            AdminModule.loadProductsTable();
        }
    });

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
