// Login Page Script
(function() {
    'use strict';

    // Password visibility toggle
    window.togglePassword = function(fieldId) {
        const field = document.getElementById(fieldId);
        const icon = document.getElementById(fieldId + '-eye');
        
        if (field.type === 'password') {
            field.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            field.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };

    // Form submission handler
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('loginForm');
        
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Validation
            if (!email || !password) {
                Notifications.error('Please fill in all fields');
                return;
            }

            if (!Helpers.isValidEmail(email)) {
                Notifications.error('Please enter a valid email address');
                return;
            }
            
            // Login
            await AuthModule.login(email, password);
        });
    });
})();
