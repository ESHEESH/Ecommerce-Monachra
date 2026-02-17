// Statistics Page Script
(function() {
    'use strict';

    let revenueChart = null;
    let categoryChart = null;

    document.addEventListener('DOMContentLoaded', async function() {
        await loadStatistics();
        initializeCharts();
    });

    async function loadStatistics() {
        try {
            const productsResult = await API.products.getAll();
            const ordersResult = await API.orders.getUserOrders();
            
            if (productsResult.success && productsResult.data) {
                updateProductStats(productsResult.data);
                updateCategoryChart(productsResult.data);
                updateTopProductsTable(productsResult.data);
            }
            
            if (ordersResult.success && ordersResult.data) {
                updateRevenueStats(ordersResult.data);
                updateRevenueChart(ordersResult.data);
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    function updateProductStats(products) {
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const avgPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0) / totalProducts;
        
        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards[0]) {
            statCards[0].querySelector('.stat-value').textContent = totalProducts;
        }
        if (statCards[2]) {
            statCards[2].querySelector('.stat-value').textContent = totalStock;
        }
        if (statCards[3]) {
            statCards[3].querySelector('.stat-value').textContent = Helpers.formatPrice(avgPrice);
        }
    }

    function updateRevenueStats(orders) {
        const validOrders = orders.filter(o => o.status !== 'cancelled');
        const totalRevenue = validOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
        
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards[1]) {
            statCards[1].querySelector('.stat-value').textContent = Helpers.formatPrice(totalRevenue);
        }
    }

    function initializeCharts() {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            revenueChart = new Chart(revenueCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Revenue',
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#000000',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }

        // Category Chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            categoryChart = new Chart(categoryCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#000000',
                            '#424242',
                            '#757575',
                            '#9e9e9e',
                            '#e0e0e0',
                            '#bdbdbd'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    function updateRevenueChart(orders) {
        if (!revenueChart) return;
        
        // Group orders by month
        const monthlyRevenue = new Array(12).fill(0);
        const currentYear = new Date().getFullYear();
        
        orders.forEach(order => {
            if (order.status === 'cancelled') return;
            
            const orderDate = new Date(order.created_at);
            if (orderDate.getFullYear() === currentYear) {
                const month = orderDate.getMonth();
                monthlyRevenue[month] += parseFloat(order.total || 0);
            }
        });
        
        revenueChart.data.datasets[0].data = monthlyRevenue;
        revenueChart.update();
    }

    function updateCategoryChart(products) {
        if (!categoryChart) return;
        
        // Group products by category
        const categoryCount = {};
        products.forEach(product => {
            const category = product.category_name || 'Uncategorized';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        
        categoryChart.data.labels = Object.keys(categoryCount);
        categoryChart.data.datasets[0].data = Object.values(categoryCount);
        categoryChart.update();
    }

    function updateTopProductsTable(products) {
        const tbody = document.querySelector('.data-table tbody');
        if (!tbody) return;
        
        // Sort by quantity (as a proxy for popularity since we don't have sales data yet)
        const topProducts = products
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
        
        tbody.innerHTML = topProducts.map((product, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="../${product.image_url}" style="width: 40px; height: 40px; object-fit: cover;">
                        <span>${product.name}</span>
                    </div>
                </td>
                <td>${product.category_name || 'N/A'}</td>
                <td>${Helpers.formatPrice(product.price)}</td>
                <td>${product.quantity}</td>
                <td>${Helpers.formatPrice(product.price * product.quantity)}</td>
            </tr>
        `).join('');
    }
})();
