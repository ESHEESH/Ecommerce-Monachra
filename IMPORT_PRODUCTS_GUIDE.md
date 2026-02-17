# Product Import Guide

## Overview
This guide explains how to import the new tops and pants products into your MONOCHRA database.

---

## Products to Import

### Pants (11 items) - Price Range: $200-$1000
1. Classic Tailored Trousers - $245
2. Wide Leg Palazzo Pants - $289
3. High-Waist Cigarette Pants - $325
4. Pleated Wool Trousers - $395
5. Cropped Straight Leg Pants - $275
6. Relaxed Fit Chinos - $220
7. Slim Fit Dress Pants - $340
8. Barrel Leg Trousers - $425
9. Pinstripe Business Pants - $380
10. Cargo Utility Pants - $295
11. Flared Pleated Denim Skirt - $265

### Tops (6 items) - Price Range: $150-$1000
1. Cotton Linen Knit Polo - $185
2. Classic Knit Polo Shirt - $165
3. Lace Bows Knit Sweater - $295
4. Ribbed Turtleneck Top - $210
5. Oversized Knit Cardigan - $340
6. Baby Soft Knitwear - $225

**Total: 17 new products**
**Total Stock Value: ~$13,000**

---

## Import Methods

### Method 1: Using phpMyAdmin (Recommended)

1. **Open phpMyAdmin**
   - Start XAMPP Control Panel
   - Click "Admin" next to MySQL
   - Or visit: http://localhost/phpmyadmin

2. **Select Database**
   - Click on `monochra_db` in the left sidebar

3. **Import SQL File**
   - Click the "SQL" tab at the top
   - Copy the contents of `import_products.sql`
   - Paste into the SQL query box
   - Click "Go" button

4. **Verify Import**
   - Click on "products" table
   - You should see 25 products total (8 original + 17 new)

### Method 2: Using MySQL Command Line

```bash
# Navigate to your project directory
cd C:\xampp\htdocs\monochra

# Run the import
mysql -u root -p monochra_db < import_products.sql

# Enter password when prompted (leave blank for default XAMPP)
```

### Method 3: Using PHP Script

Create a file `import.php` in your project root:

```php
<?php
require_once 'php/config.php';

$db = Database::getInstance()->getConnection();
$sql = file_get_contents('import_products.sql');

try {
    $db->exec($sql);
    echo "✓ Products imported successfully!";
} catch(PDOException $e) {
    echo "✗ Error: " . $e->getMessage();
}
?>
```

Then visit: http://localhost/monochra/import.php

---

## Verification Steps

### 1. Check Product Count
```sql
SELECT COUNT(*) as total_products FROM products;
-- Should return: 25
```

### 2. Check New Products
```sql
SELECT name, sku, price, quantity 
FROM products 
WHERE sku LIKE 'PNT-%' OR sku LIKE 'TOP-%'
ORDER BY sku;
-- Should return: 17 products
```

### 3. Check Stock Movements
```sql
SELECT COUNT(*) as stock_logs 
FROM stock_movements 
WHERE notes LIKE '%imported products%';
-- Should return: 17
```

### 4. Check Total Inventory Value
```sql
SELECT 
    CONCAT('$', FORMAT(SUM(price * quantity), 2)) as total_value
FROM products;
```

---

## Admin Dashboard Integration

### Dashboard Now Shows:
✅ **Real Product Count** - Dynamically loaded from database
✅ **Total Stock Value** - Calculated from all products
✅ **Low Stock Alerts** - Products with quantity ≤ 20
✅ **Recent Orders** - From orders table

### Statistics Page Now Shows:
✅ **Revenue Chart** - Monthly revenue from orders
✅ **Category Distribution** - Product count by category
✅ **Top Products Table** - Best-selling items
✅ **Real-time Stats** - All data from database

### Stock Management Shows:
✅ **All 25 Products** - Including new imports
✅ **Stock Levels** - With color-coded progress bars
✅ **Category Filters** - Filter by Clothing, Shoes, etc.
✅ **Stock Actions** - Add, Edit, Remove stock

---

## Image Path Configuration

The products are configured to use relative paths:
- Pants: `pants/filename.jfif`
- Tops: `tops/filename.jfif`

### To Display Images Correctly:

1. **In HTML pages**, use:
   ```html
   <img src="../pants/download (4).jfif">
   ```

2. **In JavaScript**, the API returns:
   ```javascript
   product.image_url // Returns: "pants/download (4).jfif"
   ```

3. **Full path in browser**:
   ```
   http://localhost/monochra/pants/download (4).jfif
   ```

---

## Troubleshooting

### Issue: Products not showing
**Solution:**
```sql
-- Check if products exist
SELECT * FROM products WHERE sku LIKE 'PNT-%' LIMIT 1;

-- If empty, re-run import
SOURCE import_products.sql;
```

### Issue: Images not loading
**Solution:**
1. Verify folders exist: `pants/` and `tops/`
2. Check file permissions (should be readable)
3. Verify image paths in database match actual files

### Issue: Duplicate SKU error
**Solution:**
```sql
-- Delete existing imports first
DELETE FROM products WHERE sku LIKE 'PNT-%' OR sku LIKE 'TOP-%';

-- Then re-import
SOURCE import_products.sql;
```

### Issue: Stock movements not logged
**Solution:**
```sql
-- Manually log stock movements
INSERT INTO stock_movements (product_id, quantity_change, reason, notes)
SELECT id, quantity, 'restock', 'Initial inventory'
FROM products
WHERE sku LIKE 'PNT-%' OR sku LIKE 'TOP-%';
```

---

## Testing the Import

### 1. Test Dashboard
```
Visit: http://localhost/monochra/html/dashboard.html
Expected: See updated product count and stats
```

### 2. Test Stock Page
```
Visit: http://localhost/monochra/html/stock.html
Expected: See all 25 products with stock levels
```

### 3. Test Statistics
```
Visit: http://localhost/monochra/html/statistics.html
Expected: See category distribution chart updated
```

### 4. Test Shop Page
```
Visit: http://localhost/monochra/html/shop.html
Expected: See all products including new ones
```

---

## Next Steps After Import

1. ✅ **Verify all products imported** - Check database
2. ✅ **Test image loading** - Visit shop page
3. ✅ **Check stock levels** - Visit stock management
4. ✅ **Review pricing** - Ensure prices are correct
5. ✅ **Test filtering** - Try category filters
6. ✅ **Test cart** - Add products to cart
7. ✅ **Test checkout** - Place a test order

---

## Database Schema Updates

The import adds:
- **17 new products** to `products` table
- **17 stock movements** to `stock_movements` table
- All products linked to **category_id = 1** (Clothing)

### Product Fields:
```
id: Auto-increment
category_id: 1 (Clothing)
name: Descriptive product name
slug: URL-friendly version
description: Product details
price: DECIMAL(10,2)
sku: Unique identifier (PNT-XXX or TOP-XXX)
quantity: Initial stock level
image_url: Relative path to image
is_active: TRUE
created_at: Current timestamp
updated_at: Current timestamp
```

---

## Summary

✅ **17 new products ready to import**
✅ **SQL file created**: `import_products.sql`
✅ **Dashboard connected to database**
✅ **Statistics page shows real data**
✅ **Stock management fully functional**
✅ **All admin pages integrated**

**Total Products After Import: 25**
**Total Categories: 6**
**Total Stock Value: ~$13,000**

Run the import and your e-commerce site will be fully stocked!
