// Admin Dashboard Page Script
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (document.querySelector('.stats-grid')) {
            AdminModule.loadDashboardStats();
        }
    });
})();
