// Product Detail Page Script
(function() {
    'use strict';

    let currentProduct = null;
    let selectedSize = 'M';
    let selectedQuantity = 1;
    let basePrice = 0;

    // Size price modifiers (additional cost for larger sizes)
    const sizePriceModifiers = {
        'XS': 0,
        'S': 0,
        'M': 0,
        'L': 10,    // +$10 for L
        'XL': 20    // +$20 for XL
    };

    document.addEventListener('DOMContentLoaded', async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId) {
            await loadProduct(productId);
        }
        
        initializeEventListeners();
    });

    async function loadProduct(productId) {
        try {
            const result = await API.products.getById(productId);
            
            if (result.success && result.data) {
                currentProduct = result.data;
                basePrice = parseFloat(currentProduct.price);
                displayProduct(currentProduct);
            } else {
                Notifications.error('Product not found');
                setTimeout(() => window.location.href = 'shop.html', 2000);
            }
        } catch (error) {
            console.error('Error loading product:', error);
            Notifications.error('Failed to load product');
        }
    }

    function displayProduct(product) {
        // Update title and meta
        document.title = `${product.name} - MONOCHRA`;
        
        // Update product name
        document.querySelector('.product-details h1').textContent = product.name;
        
        // Update subtitle/description
        const subtitle = document.querySelector('.product-subtitle');
        if (subtitle) {
            subtitle.textContent = product.description || 'Premium quality product';
        }
        
        // Update main image
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            mainImage.src = `../${product.image_url}`;
            mainImage.alt = product.name;
        }
        
        // Update thumbnails (use same image for now)
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach(thumb => {
            thumb.src = `../${product.image_url}`;
            thumb.alt = product.name;
        });
        
        // Update price
        updatePrice();
        
        // Update breadcrumb
        const breadcrumb = document.querySelector('.container > div');
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <a href="index.html" style="color: var(--text-secondary);">Home</a> / 
                <a href="shop.html" style="color: var(--text-secondary);">${product.category_name || 'Shop'}</a> / 
                <span>${product.name}</span>
            `;
        }
        
        // Update description accordion
        const descriptionContent = document.querySelector('.accordion-content');
        if (descriptionContent && product.description) {
            descriptionContent.textContent = product.description;
        }
    }

    function initializeEventListeners() {
        // Size selection
        document.querySelectorAll('.size-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                selectedSize = this.textContent.trim();
                updatePrice();
            });
        });

        // Quantity controls
        const decreaseBtn = document.querySelector('.quantity-btn:first-child');
        const increaseBtn = document.querySelector('.quantity-btn:last-child');
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', decreaseQuantity);
        }
        if (increaseBtn) {
            increaseBtn.addEventListener('click', increaseQuantity);
        }

        // Add to cart button
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', addToCart);
        }

        // Wishlist button
        const wishlistBtn = document.querySelector('.wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', addToWishlist);
        }

        // Accordion
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', function() {
                toggleAccordion(this);
            });
        });
    }

    function updatePrice() {
        if (!currentProduct) return;
        
        // Calculate price: base price + size modifier
        const sizeModifier = sizePriceModifiers[selectedSize] || 0;
        const unitPrice = basePrice + sizeModifier;
        const totalPrice = unitPrice * selectedQuantity;
        
        // Update displayed price
        const priceElement = document.querySelector('.current-price');
        if (priceElement) {
            if (selectedQuantity > 1) {
                priceElement.innerHTML = `
                    ${Helpers.formatPrice(totalPrice)}
                    <span style="font-size: 14px; color: var(--text-secondary); margin-left: 10px;">
                        (${Helpers.formatPrice(unitPrice)} × ${selectedQuantity})
                    </span>
                `;
            } else {
                priceElement.textContent = Helpers.formatPrice(unitPrice);
            }
        }
        
        // Show size price modifier if applicable
        if (sizeModifier > 0) {
            const taxInfo = document.querySelector('.tax-info');
            if (taxInfo) {
                taxInfo.innerHTML = `
                    Size ${selectedSize}: +${Helpers.formatPrice(sizeModifier)} | 
                    Tax included. Shipping calculated at checkout.
                `;
            }
        }
    }

    function increaseQuantity() {
        selectedQuantity++;
        document.getElementById('quantity').textContent = selectedQuantity;
        updatePrice();
    }

    function decreaseQuantity() {
        if (selectedQuantity > 1) {
            selectedQuantity--;
            document.getElementById('quantity').textContent = selectedQuantity;
            updatePrice();
        }
    }

    async function addToCart() {
        if (!currentProduct) return;
        
        try {
            // Calculate final price with size modifier
            const sizeModifier = sizePriceModifiers[selectedSize] || 0;
            const finalPrice = basePrice + sizeModifier;
            
            const result = await API.cart.addItem(
                currentProduct.id,
                selectedQuantity,
                finalPrice
            );
            
            if (result.success) {
                Notifications.success(`Added ${selectedQuantity} × ${currentProduct.name} (Size: ${selectedSize}) to cart`);
                
                // Update cart badge
                if (window.CartModule) {
                    await CartModule.updateCartBadge();
                }
            } else {
                Notifications.error('Failed to add to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            Notifications.error('Error adding to cart');
        }
    }

    async function addToWishlist() {
        if (!currentProduct) return;
        
        try {
            // Check if user is logged in
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            
            if (!user) {
                Notifications.info('Please log in to add items to your wishlist');
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }
            
            // Add to wishlist (you'll need to implement this API endpoint)
            // For now, we'll use localStorage
            let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            
            // Check if already in wishlist
            if (wishlist.includes(currentProduct.id)) {
                Notifications.info('Already in your wishlist');
                return;
            }
            
            wishlist.push(currentProduct.id);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            
            // Show custom notification with box
            showFavoriteNotification();
            
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            Notifications.error('Error adding to wishlist');
        }
    }

    function showFavoriteNotification() {
        // Create custom notification box
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 40px 60px;
            border: 2px solid #000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 10000;
            text-align: center;
            animation: fadeInScale 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">
                <i class="fas fa-heart" style="color: #000;"></i>
            </div>
            <div style="font-size: 18px; font-weight: 500; letter-spacing: 2px; margin-bottom: 10px;">
                ADDED TO FAVORITES
            </div>
            <div style="font-size: 14px; color: #666; letter-spacing: 1px;">
                ${currentProduct.name}
            </div>
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(notification);
        
        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeInScale 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.body.removeChild(overlay);
            }, 300);
        }, 2000);
    }

    function toggleAccordion(header) {
        const content = header.nextElementSibling;
        const icon = header.querySelector('i');
        
        content.classList.toggle('active');
        icon.classList.toggle('fa-plus');
        icon.classList.toggle('fa-minus');
    }

    // Make functions globally available
    window.changeImage = function(thumbnail) {
        const mainImage = document.getElementById('mainImage');
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        mainImage.src = thumbnail.src;
        
        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
    };
})();
