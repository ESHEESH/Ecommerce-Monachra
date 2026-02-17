# MONOCHRA - Pages Guide

## Customer Pages

### 1. Homepage (`html/index.html`)
- Hero banner
- Category grid
- Featured products (8 products)
- Connected to database via API
- Links to shop page and categories

### 2. Shop Page (`html/shop.html`)
- Browse all products
- Filter by category (URL: `shop.html?category=1`)
- Filter by price range
- Filter by stock availability
- Sort by: Newest, Price (Low/High), Name
- Fully connected to database

### 3. Cart Page (`html/cart.html`)
- View cart items
- Update quantities
- Remove items
- See order summary (subtotal, tax, shipping)
- Apply promo codes
- Proceed to checkout

### 4. Login Page (`html/login.html`)
- Email and password login
- Remember me checkbox
- Link to signup page
- Redirects to profile after login

### 5. Signup Page (`html/signup.html`)
- Create new account
- First name, last name, email, password
- Password confirmation
- Terms & conditions checkbox
- Redirects to login after successful signup

### 6. Profile Page (`html/profile.html`)
- Account overview
- View order history
- Edit account details
- Logout functionality
- Protected page (requires login)

## Admin Pages

### 7. Dashboard (`html/dashboard.html`)
- Sales statistics
- Revenue charts
- Recent orders
- Low stock alerts

### 8. Products Management (`html/products.html`)
- View all products
- Add new products
- Edit existing products
- Delete products
- Filter by category and status

### 9. Stock Management (`html/stock.html`)
- Track inventory levels
- Low stock alerts
- Stock movement history
- Update quantities

## Navigation Structure

### Main Navigation (All Pages)
```
All Products | Clothing | Shoes | Beauty | Skincare | Accessories | Bags | Sale
```

### Category IDs
- 1: Clothing
- 2: Shoes
- 3: Beauty
- 4: Skincare
- 5: Accessories
- 6: Bags

## URL Patterns

### Shop with Categories
```
shop.html                    → All products
shop.html?category=1         → Clothing
shop.html?category=2         → Shoes
shop.html?category=3         → Beauty
shop.html?category=4         → Skincare
shop.html?category=5         → Accessories
shop.html?category=6         → Bags
```

### API Endpoints
```
api.php?action=get_products              → Get all products
api.php?action=get_product&id=1          → Get single product
api.php?action=get_categories            → Get all categories
api.php?action=get_category_products&category_id=1  → Get products by category
api.php?action=search_products&q=coat    → Search products
api.php?action=add_to_cart               → Add to cart (POST)
api.php?action=get_cart                  → Get cart items
api.php?action=login                     → Login (POST)
api.php?action=register                  → Register (POST)
api.php?action=get_user                  → Get user profile
api.php?action=get_user_orders           → Get user orders
```

## Features Implemented

### Authentication
- ✅ User registration
- ✅ User login
- ✅ Session management
- ✅ Protected pages
- ✅ Logout

### Shopping
- ✅ Browse products
- ✅ Filter by category
- ✅ Filter by price
- ✅ Sort products
- ✅ Search products
- ✅ Add to cart
- ✅ Update cart
- ✅ Remove from cart
- ✅ Cart badge counter

### User Account
- ✅ View profile
- ✅ View order history
- ✅ Edit account details
- ✅ Account overview

### Database
- ✅ Products table
- ✅ Categories table
- ✅ Users table
- ✅ Cart table
- ✅ Orders table
- ✅ Stock movements
- ✅ Sample data loaded

## Testing Checklist

1. **Homepage**
   - [ ] Products load from database
   - [ ] Categories display correctly
   - [ ] Navigation links work

2. **Shop Page**
   - [ ] All products display
   - [ ] Category filtering works
   - [ ] Price filtering works
   - [ ] Sorting works
   - [ ] Add to cart works

3. **Authentication**
   - [ ] Can create new account
   - [ ] Can login
   - [ ] Can logout
   - [ ] Profile page requires login

4. **Cart**
   - [ ] Items display correctly
   - [ ] Can update quantities
   - [ ] Can remove items
   - [ ] Totals calculate correctly
   - [ ] Cart badge updates

5. **Profile**
   - [ ] User info displays
   - [ ] Orders display
   - [ ] Can edit profile

## Next Steps

To complete the ecommerce:

1. **Checkout Page** - Create checkout flow with shipping/billing
2. **Payment Integration** - Add GCash/PayPal/Maya
3. **Order Confirmation** - Email notifications
4. **Product Detail Page** - Individual product pages
5. **Admin Dashboard** - Complete admin functionality
6. **Email System** - Order confirmations, password reset
7. **Reviews** - Product reviews and ratings
8. **Wishlist** - Save favorite products

## File Structure

```
monochra/
├── html/
│   ├── index.html          ✅ Homepage
│   ├── shop.html           ✅ Shop/Products page
│   ├── cart.html           ✅ Shopping cart
│   ├── login.html          ✅ Login page
│   ├── signup.html         ✅ Signup page
│   ├── profile.html        ✅ User profile
│   ├── dashboard.html      ✅ Admin dashboard
│   ├── products.html       ✅ Admin products
│   └── stock.html          ✅ Admin stock
├── php/
│   ├── config.php          ✅ Database config
│   ├── api.php             ✅ API endpoints
│   ├── products.php        ✅ Product manager
│   ├── cart.php            ✅ Cart manager
│   ├── orders.php          ✅ Order manager
│   └── auth.php            ✅ Auth manager
├── JS/
│   └── main.js             ✅ Frontend JavaScript
├── css/
│   ├── main.css            ✅ Main styles
│   └── admin.css           ✅ Admin styles
└── database.sql            ✅ Database schema
```

## Quick Start

1. Import `database.sql` to phpMyAdmin
2. Start XAMPP (Apache + MySQL)
3. Visit `http://localhost/monochra/html/index.html`
4. Create account or login with:
   - Email: admin@monochra.com
   - Password: admin123

## Support

Check `SETUP_GUIDE.md` for detailed setup instructions.
