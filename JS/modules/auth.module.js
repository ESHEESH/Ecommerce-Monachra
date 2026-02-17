// Authentication Module
const AuthModule = {
    async login(email, password) {
        try {
            const result = await API.auth.login(email, password);
            
            if (result.success) {
                Notifications.success('Login successful!');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            } else {
                Notifications.error(result.message || 'Login failed');
            }
            
            return result;
        } catch (error) {
            console.error('Login error:', error);
            Notifications.error('An error occurred');
            return { success: false };
        }
    },

    async register(userData) {
        try {
            console.log('Registering user:', userData);
            const result = await API.auth.register(userData);
            console.log('Registration result:', result);
            
            if (result.success) {
                Notifications.success('Account created! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                Notifications.error(result.message || 'Registration failed');
            }
            
            return result;
        } catch (error) {
            console.error('Registration error:', error);
            Notifications.error('An error occurred. Please check the console.');
            return { success: false };
        }
    },

    async logout() {
        try {
            await API.auth.logout();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = 'login.html';
        }
    },

    async getCurrentUser() {
        try {
            const result = await API.auth.getUser();
            
            if (result.success && result.data) {
                return result.data;
            } else {
                window.location.href = 'login.html';
                return null;
            }
        } catch (error) {
            console.error('Error getting user:', error);
            window.location.href = 'login.html';
            return null;
        }
    },

    validateLoginForm(email, password) {
        if (!email || !password) {
            Notifications.error('Please fill in all fields');
            return false;
        }

        if (!Helpers.isValidEmail(email)) {
            Notifications.error('Please enter a valid email');
            return false;
        }

        return true;
    },

    validateRegisterForm(data) {
        if (!data.first_name || !data.last_name || !data.email || !data.password) {
            Notifications.error('Please fill in all fields');
            return false;
        }

        if (!Helpers.isValidEmail(data.email)) {
            Notifications.error('Please enter a valid email');
            return false;
        }

        if (data.password.length < 6) {
            Notifications.error('Password must be at least 6 characters');
            return false;
        }

        return true;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthModule;
}
