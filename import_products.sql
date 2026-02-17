-- Import New Products: Tops and Pants
-- Run this file to add the imported products to the database

USE monochra_db;

-- First, let's ensure we have a Clothing category
-- (It should already exist from the initial setup)

-- Insert Pants Products (Price range: $200-$1000)
INSERT INTO products (category_id, name, slug, description, price, sku, quantity, image_url, is_active) VALUES
-- Pants 1-11
(1, 'Classic Tailored Trousers', 'classic-tailored-trousers', 'Premium wool blend trousers with a timeless silhouette', 245.00, 'PNT-001', 25, 'pants/download (4).jfif', TRUE),
(1, 'Wide Leg Palazzo Pants', 'wide-leg-palazzo-pants', 'Flowing palazzo pants in luxurious fabric', 289.00, 'PNT-002', 30, 'pants/download (5).jfif', TRUE),
(1, 'High-Waist Cigarette Pants', 'high-waist-cigarette-pants', 'Sleek cigarette cut with modern high waist', 325.00, 'PNT-003', 20, 'pants/download (6).jfif', TRUE),
(1, 'Pleated Wool Trousers', 'pleated-wool-trousers', 'Classic pleated design in premium wool', 395.00, 'PNT-004', 18, 'pants/download (7).jfif', TRUE),
(1, 'Cropped Straight Leg Pants', 'cropped-straight-leg-pants', 'Contemporary cropped length with clean lines', 275.00, 'PNT-005', 28, 'pants/download (8).jfif', TRUE),
(1, 'Relaxed Fit Chinos', 'relaxed-fit-chinos', 'Comfortable chinos with relaxed silhouette', 220.00, 'PNT-006', 35, 'pants/download (9).jfif', TRUE),
(1, 'Slim Fit Dress Pants', 'slim-fit-dress-pants', 'Tailored slim fit for formal occasions', 340.00, 'PNT-007', 22, 'pants/download (10).jfif', TRUE),
(1, 'Barrel Leg Trousers', 'barrel-leg-trousers', 'Trendy barrel leg silhouette', 425.00, 'PNT-008', 15, 'pants/download (11).jfif', TRUE),
(1, 'Pinstripe Business Pants', 'pinstripe-business-pants', 'Professional pinstripe pattern', 380.00, 'PNT-009', 20, 'pants/download (12).jfif', TRUE),
(1, 'Cargo Utility Pants', 'cargo-utility-pants', 'Modern cargo style with multiple pockets', 295.00, 'PNT-010', 32, 'pants/download (13).jfif', TRUE),
(1, 'Flared Pleated Denim Skirt', 'flared-pleated-denim-skirt', 'High-rise denim miniskirt with pleated details', 265.00, 'PNT-011', 24, 'pants/Flared pleated high-rise denim miniskirt.jfif', TRUE);

-- Insert Tops Products (Price range: $150-$1000)
INSERT INTO products (category_id, name, slug, description, price, sku, quantity, image_url, is_active) VALUES
-- Tops 1-6
(1, 'Cotton Linen Knit Polo', 'cotton-linen-knit-polo', 'Breathable cotton-linen blend polo shirt', 185.00, 'TOP-001', 40, 'tops/COTTON LINEN KNIT POLO SHIRT.jfif', TRUE),
(1, 'Classic Knit Polo Shirt', 'classic-knit-polo-shirt', 'Timeless knit polo in premium cotton', 165.00, 'TOP-002', 45, 'tops/KNIT POLO SHIRT.jfif', TRUE),
(1, 'Lace Bows Knit Sweater', 'lace-bows-knit-sweater', 'Elegant sweater with delicate lace bow details', 295.00, 'TOP-003', 28, 'tops/LACE BOWS KNIT SWEATER.jfif', TRUE),
(1, 'Ribbed Turtleneck Top', 'ribbed-turtleneck-top', 'Cozy ribbed knit turtleneck', 210.00, 'TOP-004', 35, 'tops/download (4).jfif', TRUE),
(1, 'Oversized Knit Cardigan', 'oversized-knit-cardigan', 'Relaxed oversized cardigan in soft knit', 340.00, 'TOP-005', 22, 'tops/download (5).jfif', TRUE),
(1, 'Baby Soft Knitwear', 'baby-soft-knitwear', 'Ultra-soft premium knitwear', 225.00, 'TOP-006', 30, 'tops/Baby Girls_ Knitwear _ ZARA United States.jfif', TRUE);

-- Log initial stock movements for all new products
INSERT INTO stock_movements (product_id, quantity_change, reason, notes)
SELECT id, quantity, 'restock', 'Initial inventory - imported products'
FROM products
WHERE sku LIKE 'PNT-%' OR sku LIKE 'TOP-%';

-- Verify the import
SELECT 
    'Products Added' as summary,
    COUNT(*) as total_count,
    SUM(quantity) as total_stock,
    CONCAT('$', FORMAT(SUM(price * quantity), 2)) as total_value
FROM products
WHERE sku LIKE 'PNT-%' OR sku LIKE 'TOP-%';

-- Show all new products
SELECT 
    id,
    name,
    sku,
    CONCAT('$', FORMAT(price, 2)) as price,
    quantity,
    image_url
FROM products
WHERE sku LIKE 'PNT-%' OR sku LIKE 'TOP-%'
ORDER BY sku;
