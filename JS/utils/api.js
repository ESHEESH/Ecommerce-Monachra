// API Utility Module
const API = {
    baseURL: '../php/api.php',

    async request(action, method = 'GET', data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            let url = `${this.baseURL}?action=${action}`;

            if (method === 'POST' && data) {
                options.body = JSON.stringify(data);
            } else if (method === 'GET' && data) {
                const params = new URLSearchParams(data);
                url += `&${params.toString()}`;
            }

            console.log('API Request:', url, options); // Debug log
            const response = await fetch(url, options);
            const result = await response.json();
            console.log('API Response:', result); // Debug log
            return result;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Network error: ' + error.message };
        }
    },

    // Product endpoints
    products: {
        getAll: () => API.request('get_products'),
        getById: (id) => API.request('get_product', 'GET', { id }),
        getByCategory: (categoryId) => API.request('get_category_products', 'GET', { category_id: categoryId }),
        search: (query) => API.request('search_products', 'GET', { q: query }),
        add: (data) => API.request('add_product', 'POST', data),
        update: (id, data) => API.request('update_product', 'POST', { id, ...data }),
        delete: (id) => API.request('delete_product', 'POST', { id })
    },

    // Category endpoints
    categories: {
        getAll: () => API.request('get_categories')
    },

    // Cart endpoints
    cart: {
        get: () => API.request('get_cart'),
        add: (productId, quantity = 1) => API.request('add_to_cart', 'POST', { product_id: productId, quantity }),
        update: (itemId, quantity) => API.request('update_cart_item', 'POST', { item_id: itemId, quantity }),
        remove: (itemId) => API.request('remove_cart_item', 'POST', { item_id: itemId }),
        clear: () => API.request('clear_cart', 'POST')
    },

    // Order endpoints
    orders: {
        create: (data) => API.request('create_order', 'POST', data),
        getById: (orderId) => API.request('get_order', 'GET', { order_id: orderId }),
        getUserOrders: () => API.request('get_user_orders'),
        getTotalRevenue: () => API.request('get_total_revenue'),
        getTotalCount: () => API.request('get_total_orders')
    },

    // Auth endpoints
    auth: {
        register: (data) => API.request('register', 'POST', data),
        login: (email, password) => API.request('login', 'POST', { email, password }),
        logout: () => API.request('logout'),
        getUser: () => API.request('get_user')
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
