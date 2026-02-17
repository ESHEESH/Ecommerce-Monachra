-- Clear All Products Script
-- This will delete all products and related data

USE monochra_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all product-related data
DELETE FROM cart_items;
DELETE FROM order_items;
DELETE FROM stock_movements;
DELETE FROM reviews;
DELETE FROM wishlist;
DELETE FROM product_images;
DELETE FROM products;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto-increment
ALTER TABLE products AUTO_INCREMENT = 1;

-- Verify deletion
SELECT 'Products cleared successfully' as status;
SELECT COUNT(*) as remaining_products FROM products;
