// Signup Page Script
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
        const form = document.getElementById('signupForm');
        
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validation
            if (!firstName || !lastName || !email || !password) {
                Notifications.error('Please fill in all fields');
                return;
            }
            
            if (password !== confirmPassword) {
                Notifications.error('Passwords do not match');
                return;
            }
            
            if (password.length < 6) {
                Notifications.error('Password must be at least 6 characters');
                return;
            }

            if (!Helpers.isValidEmail(email)) {
                Notifications.error('Please enter a valid email address');
                return;
            }
            
            // Register user
            const userData = {
                email: email,
                password: password,
                first_name: firstName,
                last_name: lastName
            };
            
            await AuthModule.register(userData);
        });
    });
})();
