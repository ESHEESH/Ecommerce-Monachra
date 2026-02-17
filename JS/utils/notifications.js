// Notification Utility Module
const Notifications = {
    show(message, type = 'info', duration = 3000) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add styles
        this.applyStyles(notification, type);

        // Add to DOM
        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    },

    applyStyles(element, type) {
        const colors = {
            success: { bg: '#d1e7dd', text: '#0f5132', border: '#badbcc' },
            error: { bg: '#f8d7da', text: '#842029', border: '#f5c2c7' },
            warning: { bg: '#fff3cd', text: '#856404', border: '#ffecb5' },
            info: { bg: '#cfe2ff', text: '#084298', border: '#b6d4fe' }
        };

        const color = colors[type] || colors.info;

        element.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: ${color.text};
            border: 1px solid ${color.border};
            padding: 15px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            gap: 15px;
            align-items: center;
            min-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    },

    warning(message) {
        this.show(message, 'warning');
    },

    info(message) {
        this.show(message, 'info');
    }
};

// Add animation styles
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .notification.fade-out {
            animation: slideOut 0.3s ease-out forwards;
        }
        @keyframes slideOut {
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            color: inherit;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        .notification-close:hover {
            opacity: 1;
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    `;
    document.head.appendChild(style);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Notifications;
}
