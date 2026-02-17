// Cart Page Script
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (document.querySelector('.cart-wrapper')) {
            CartModule.loadCartPage();
        }
    });

    // Make functions globally available for onclick handlers
    window.updateQuantity = async function(itemId, newQuantity) {
        await CartModule.updateItem(itemId, newQuantity);
    };

    window.removeItem = async function(itemId) {
        await CartModule.removeItem(itemId);
    };
})();
