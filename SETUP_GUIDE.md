# MONOCHRA - XAMPP Setup Guide

## Step 1: Move Project to XAMPP

1. Copy your entire `monochra` folder to:
   ```
   C:\xampp\htdocs\monochra
   ```

## Step 2: Start XAMPP Services

1. Open XAMPP Control Panel
2. Start **Apache** (for PHP)
3. Start **MySQL** (for database)

## Step 3: Create Database

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click on "New" in the left sidebar
3. Create a database named: `monochra_db`
4. Click on the `monochra_db` database
5. Click on "Import" tab
6. Click "Choose File" and select: `C:\xampp\htdocs\monochra\database.sql`
7. Click "Go" at the bottom

## Step 4: Configure Database Connection

Your `php/config.php` is already configured for XAMPP defaults:
- Host: `localhost`
- Database: `monochra_db`
- User: `root`
- Password: (empty)

If your XAMPP MySQL has a password, update line 10 in `php/config.php`:
```php
define('DB_PASS', 'your_password_here');
```

## Step 5: Test Your Setup

Open your browser and visit:

**Frontend:**
- Homepage: `http://localhost/monochra/html/index.html`
- Cart: `http://localhost/monochra/html/cart.html`
- Products: `http://localhost/monochra/html/products.html`

**API Test:**
- Get Products: `http://localhost/monochra/php/api.php?action=get_products`
- Get Categories: `http://localhost/monochra/php/api.php?action=get_categories`

**Admin Login:**
- Email: `admin@monochra.com`
- Password: `admin123`

## Step 6: Verify Database Import

1. Go to `http://localhost/phpmyadmin`
2. Click on `monochra_db` database
3. You should see these tables:
   - users
   - products
   - categories
   - cart
   - cart_items
   - orders
   - order_items
   - stock_movements
   - reviews
   - wishlist
   - product_images

4. Click on `products` table and browse - you should see 8 sample products

## Troubleshooting

### Error: "Connection failed"
- Make sure MySQL is running in XAMPP
- Check database credentials in `php/config.php`

### Error: "Table doesn't exist"
- Re-import the `database.sql` file
- Make sure you selected the correct database

### Error: "404 Not Found"
- Verify your project is in `C:\xampp\htdocs\monochra`
- Check that Apache is running in XAMPP

### Blank page or PHP code showing
- Make sure Apache is running
- Check that you're accessing via `http://localhost/` not `file://`

## Next Steps

Once everything is working:
1. Update the frontend JavaScript to connect to the API
2. Test adding products to cart
3. Test checkout flow
4. Customize the design and products

## Default Credentials

**Admin Account:**
- Email: admin@monochra.com
- Password: admin123

**Sample Products:**
- 8 products pre-loaded across 6 categories
- All products have stock and are active

## File Structure

```
C:\xampp\htdocs\monochra\
├── html/           (Frontend pages)
├── css/            (Stylesheets)
├── JS/             (JavaScript files)
├── php/            (Backend PHP files)
│   ├── config.php  (Database config)
│   ├── api.php     (API endpoints)
│   ├── products.php
│   ├── cart.php
│   ├── orders.php
│   └── auth.php
└── database.sql    (Database schema)
```

## Important URLs

- Frontend: `http://localhost/monochra/html/`
- API: `http://localhost/monochra/php/api.php`
- phpMyAdmin: `http://localhost/phpmyadmin`
