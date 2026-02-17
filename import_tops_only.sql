-- Import Only Tops Products
-- Using the actual images from tops folder

USE monochra_db;

-- Insert Tops Products with detailed descriptions
INSERT INTO products (category_id, name, slug, description, price, sku, quantity, image_url, is_active) VALUES
(1, 'Cotton Linen Knit Polo Shirt', 'cotton-linen-knit-polo-shirt', 
'Premium cotton-linen blend polo shirt featuring breathable fabric perfect for warm weather. Classic collar design with button placket. Relaxed fit for all-day comfort. Available in multiple sizes with slight price variations.', 
185.00, 'TOP-001', 40, 'tops/COTTON LINEN KNIT POLO SHIRT.jfif', TRUE),

(1, 'Classic Knit Polo Shirt', 'classic-knit-polo-shirt', 
'Timeless knit polo crafted from premium cotton. Features ribbed collar and cuffs for a polished look. Versatile piece that transitions seamlessly from casual to smart-casual. Soft, breathable fabric ensures comfort throughout the day.', 
165.00, 'TOP-002', 45, 'tops/KNIT POLO SHIRT.jfif', TRUE),

(1, 'Lace Bows Knit Sweater', 'lace-bows-knit-sweater', 
'Elegant knit sweater adorned with delicate lace bow details. Feminine silhouette with a touch of romance. Crafted from soft, high-quality yarn for luxurious comfort. Perfect for special occasions or elevated everyday wear.', 
295.00, 'TOP-003', 28, 'tops/LACE BOWS KNIT SWEATER.jfif', TRUE),

(1, 'Ribbed Turtleneck Top', 'ribbed-turtleneck-top', 
'Cozy ribbed knit turtleneck in a flattering slim fit. Features stretchy ribbed texture that hugs the body beautifully. Classic turtleneck design provides warmth and style. Essential layering piece for cooler seasons.', 
210.00, 'TOP-004', 35, 'tops/download (4).jfif', TRUE),

(1, 'Oversized Knit Cardigan', 'oversized-knit-cardigan', 
'Relaxed oversized cardigan in ultra-soft knit fabric. Features open front design and dropped shoulders for a contemporary look. Cozy and comfortable with a modern silhouette. Perfect for layering over any outfit.', 
340.00, 'TOP-005', 22, 'tops/download (5).jfif', TRUE),

(1, 'Baby Soft Knitwear', 'baby-soft-knitwear', 
'Ultra-soft premium knitwear with cloud-like texture. Luxuriously gentle against the skin with superior comfort. Timeless design suitable for various occasions. Crafted from the finest materials for lasting quality.', 
225.00, 'TOP-006', 30, 'tops/Baby Girls_ Knitwear _ ZARA United States.jfif', TRUE);

-- Log initial stock movements
INSERT INTO stock_movements (product_id, quantity_change, reason, notes)
SELECT id, quantity, 'restock', 'Initial inventory - tops collection'
FROM products
WHERE sku LIKE 'TOP-%';

-- Verify the import
SELECT 
    'Tops Products Added' as summary,
    COUNT(*) as total_count,
    SUM(quantity) as total_stock,
    CONCAT('$', FORMAT(SUM(price * quantity), 2)) as total_value
FROM products
WHERE sku LIKE 'TOP-%';

-- Show all new products
SELECT 
    id,
    name,
    sku,
    CONCAT('$', FORMAT(price, 2)) as price,
    quantity,
    image_url
FROM products
WHERE sku LIKE 'TOP-%'
ORDER BY sku;
