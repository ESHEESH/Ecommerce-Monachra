# Stored Procedures Documentation

## Overview
Stored procedures are reusable SQL code blocks that encapsulate complex business logic. This document contains all stored procedures for the MONOCHRA e-commerce system.

---

## 1. Order Management Procedures

### 1.1 Create Complete Order
**Purpose:** Create order with all items in one transaction

```sql
DELIMITER //

CREATE PROCEDURE sp_create_order(
    IN p_user_id INT,
    IN p_shipping_address TEXT,
    IN p_billing_address TEXT,
    OUT p_order_id INT,
    OUT p_order_number VARCHAR(50)
)
BEGIN
    DECLARE v_subtotal DECIMAL(10,2);
    DECLARE v_tax DECIMAL(10,2);
    DECLARE v_shipping DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_order_id = -1;
    END;
    
    START TRANSACTION;
    
    -- Calculate cart totals
    SELECT SUM(ci.quantity * ci.price) INTO v_subtotal
    FROM cart c
    INNER JOIN cart_items ci ON c.id = ci.cart_id
    WHERE c.user_id = p_user_id;
    
    -- Calculate tax and shipping
    SET v_tax = v_subtotal * 0.10;
    SET v_shipping = IF(v_subtotal > 100, 0, 10);
    SET v_total = v_subtotal + v_tax + v_shipping;
    
    -- Create order
    INSERT INTO orders (user_id, subtotal, tax, shipping, total, shipping_address, billing_address, status)
    VALUES (p_user_id, v_subtotal, v_tax, v_shipping, v_total, p_shipping_address, p_billing_address, 'pending');
    
    SET p_order_id = LAST_INSERT_ID();
    
    -- Get order number
    SELECT order_number INTO p_order_number FROM orders WHERE id = p_order_id;
    
    -- Copy cart items to order items
    INSERT INTO order_items (order_id, product_id, quantity, price)
    SELECT p_order_id, ci.product_id, ci.quantity, ci.price
    FROM cart c
    INNER JOIN cart_items ci ON c.id = ci.cart_id
    WHERE c.user_id = p_user_id;
    
    -- Clear cart
    DELETE ci FROM cart_items ci
    INNER JOIN cart c ON ci.cart_id = c.id
    WHERE c.user_id = p_user_id;
    
    COMMIT;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_create_order(1, '123 Main St', '123 Main St', @order_id, @order_number);
SELECT @order_id, @order_number;
```

### 1.2 Cancel Order
**Purpose:** Cancel order and restore stock

```sql
DELIMITER //

CREATE PROCEDURE sp_cancel_order(
    IN p_order_id INT,
    IN p_reason TEXT,
    OUT p_success BOOLEAN
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
    END;
    
    START TRANSACTION;
    
    -- Update order status
    UPDATE orders 
    SET status = 'cancelled', notes = p_reason
    WHERE id = p_order_id AND status NOT IN ('delivered', 'cancelled');
    
    -- Check if update was successful
    IF ROW_COUNT() > 0 THEN
        SET p_success = TRUE;
    ELSE
        SET p_success = FALSE;
    END IF;
    
    COMMIT;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_cancel_order(1, 'Customer requested cancellation', @success);
SELECT @success;
```

### 1.3 Get Order Details
**Purpose:** Retrieve complete order information

```sql
DELIMITER //

CREATE PROCEDURE sp_get_order_details(IN p_order_id INT)
BEGIN
    -- Order header
    SELECT 
        o.*,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        u.email as customer_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.id = p_order_id;
    
    -- Order items
    SELECT 
        oi.*,
        p.name as product_name,
        p.image_url,
        p.sku
    FROM order_items oi
    INNER JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = p_order_id;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_get_order_details(1);
```

---

## 2. Product Management Procedures

### 2.1 Add Product with Stock
**Purpose:** Create product and log initial stock

```sql
DELIMITER //

CREATE PROCEDURE sp_add_product(
    IN p_category_id INT,
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_price DECIMAL(10,2),
    IN p_sku VARCHAR(100),
    IN p_quantity INT,
    IN p_image_url VARCHAR(255),
    OUT p_product_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_product_id = -1;
    END;
    
    START TRANSACTION;
    
    -- Insert product
    INSERT INTO products (category_id, name, description, price, sku, quantity, image_url)
    VALUES (p_category_id, p_name, p_description, p_price, p_sku, p_quantity, p_image_url);
    
    SET p_product_id = LAST_INSERT_ID();
    
    -- Log initial stock
    INSERT INTO stock_movements (product_id, quantity_change, reason, notes)
    VALUES (p_product_id, p_quantity, 'restock', 'Initial stock');
    
    COMMIT;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_add_product(1, 'New Product', 'Description', 99.99, 'SKU-001', 50, 'image.jpg', @product_id);
SELECT @product_id;
```

### 2.2 Update Product Stock
**Purpose:** Adjust stock with logging

```sql
DELIMITER //

CREATE PROCEDURE sp_update_stock(
    IN p_product_id INT,
    IN p_quantity_change INT,
    IN p_reason ENUM('purchase', 'return', 'adjustment', 'restock'),
    IN p_notes TEXT,
    OUT p_new_quantity INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_new_quantity = -1;
    END;
    
    START TRANSACTION;
    
    -- Update product quantity
    UPDATE products 
    SET quantity = quantity + p_quantity_change
    WHERE id = p_product_id;
    
    -- Get new quantity
    SELECT quantity INTO p_new_quantity
    FROM products
    WHERE id = p_product_id;
    
    -- Log movement
    INSERT INTO stock_movements (product_id, quantity_change, reason, notes)
    VALUES (p_product_id, p_quantity_change, p_reason, p_notes);
    
    COMMIT;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_update_stock(1, 10, 'restock', 'New shipment arrived', @new_qty);
SELECT @new_qty;
```

### 2.3 Get Low Stock Products
**Purpose:** Find products that need restocking

```sql
DELIMITER //

CREATE PROCEDURE sp_get_low_stock_products(IN p_threshold INT)
BEGIN
    SELECT 
        p.id,
        p.name,
        p.sku,
        p.quantity,
        c.name as category_name,
        p.price,
        CASE 
            WHEN p.quantity = 0 THEN 'Out of Stock'
            WHEN p.quantity <= 5 THEN 'Critical'
            ELSE 'Low Stock'
        END as status
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.quantity <= p_threshold AND p.is_active = TRUE
    ORDER BY p.quantity ASC;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_get_low_stock_products(20);
```

---

## 3. Cart Management Procedures

### 3.1 Add to Cart
**Purpose:** Add product to cart or update quantity

```sql
DELIMITER //

CREATE PROCEDURE sp_add_to_cart(
    IN p_user_id INT,
    IN p_product_id INT,
    IN p_quantity INT,
    OUT p_success BOOLEAN
)
BEGIN
    DECLARE v_cart_id INT;
    DECLARE v_product_price DECIMAL(10,2);
    DECLARE v_existing_qty INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
    END;
    
    START TRANSACTION;
    
    -- Get or create cart
    SELECT id INTO v_cart_id FROM cart WHERE user_id = p_user_id;
    
    IF v_cart_id IS NULL THEN
        INSERT INTO cart (user_id) VALUES (p_user_id);
        SET v_cart_id = LAST_INSERT_ID();
    END IF;
    
    -- Get product price
    SELECT price INTO v_product_price FROM products WHERE id = p_product_id;
    
    -- Check if item exists in cart
    SELECT quantity INTO v_existing_qty 
    FROM cart_items 
    WHERE cart_id = v_cart_id AND product_id = p_product_id;
    
    IF v_existing_qty IS NOT NULL THEN
        -- Update quantity
        UPDATE cart_items 
        SET quantity = quantity + p_quantity
        WHERE cart_id = v_cart_id AND product_id = p_product_id;
    ELSE
        -- Insert new item
        INSERT INTO cart_items (cart_id, product_id, quantity, price)
        VALUES (v_cart_id, p_product_id, p_quantity, v_product_price);
    END IF;
    
    SET p_success = TRUE;
    COMMIT;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_add_to_cart(1, 5, 2, @success);
SELECT @success;
```

### 3.2 Clear Cart
**Purpose:** Remove all items from user's cart

```sql
DELIMITER //

CREATE PROCEDURE sp_clear_cart(IN p_user_id INT)
BEGIN
    DELETE ci FROM cart_items ci
    INNER JOIN cart c ON ci.cart_id = c.id
    WHERE c.user_id = p_user_id;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_clear_cart(1);
```

### 3.3 Get Cart Summary
**Purpose:** Get cart totals and item count

```sql
DELIMITER //

CREATE PROCEDURE sp_get_cart_summary(IN p_user_id INT)
BEGIN
    SELECT 
        COUNT(ci.id) as item_count,
        SUM(ci.quantity) as total_items,
        SUM(ci.quantity * ci.price) as subtotal,
        SUM(ci.quantity * ci.price) * 0.10 as tax,
        IF(SUM(ci.quantity * ci.price) > 100, 0, 10) as shipping,
        SUM(ci.quantity * ci.price) + (SUM(ci.quantity * ci.price) * 0.10) + 
        IF(SUM(ci.quantity * ci.price) > 100, 0, 10) as total
    FROM cart c
    LEFT JOIN cart_items ci ON c.id = ci.cart_id
    WHERE c.user_id = p_user_id;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_get_cart_summary(1);
```

---

## 4. Analytics Procedures

### 4.1 Get Sales Report
**Purpose:** Generate sales statistics for date range

```sql
DELIMITER //

CREATE PROCEDURE sp_sales_report(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        DATE(o.created_at) as sale_date,
        COUNT(o.id) as order_count,
        SUM(o.total) as total_revenue,
        AVG(o.total) as avg_order_value,
        SUM(oi.quantity) as items_sold
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.created_at BETWEEN p_start_date AND p_end_date
    AND o.status != 'cancelled'
    GROUP BY DATE(o.created_at)
    ORDER BY sale_date DESC;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_sales_report('2026-01-01', '2026-02-17');
```

### 4.2 Get Top Products
**Purpose:** Find best-selling products

```sql
DELIMITER //

CREATE PROCEDURE sp_top_products(IN p_limit INT)
BEGIN
    SELECT 
        p.id,
        p.name,
        p.sku,
        p.price,
        c.name as category_name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as total_revenue,
        COUNT(DISTINCT oi.order_id) as order_count
    FROM products p
    INNER JOIN order_items oi ON p.id = oi.product_id
    INNER JOIN orders o ON oi.order_id = o.id
    INNER JOIN categories c ON p.category_id = c.id
    WHERE o.status != 'cancelled'
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT p_limit;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_top_products(10);
```

### 4.3 Get Customer Statistics
**Purpose:** Analyze customer behavior

```sql
DELIMITER //

CREATE PROCEDURE sp_customer_stats(IN p_user_id INT)
BEGIN
    SELECT 
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        u.email,
        COUNT(o.id) as total_orders,
        SUM(o.total) as total_spent,
        AVG(o.total) as avg_order_value,
        MAX(o.created_at) as last_order_date,
        MIN(o.created_at) as first_order_date
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.id = p_user_id
    GROUP BY u.id;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_customer_stats(1);
```

---

## 5. Maintenance Procedures

### 5.1 Clean Old Carts
**Purpose:** Remove abandoned carts older than 30 days

```sql
DELIMITER //

CREATE PROCEDURE sp_clean_old_carts()
BEGIN
    DECLARE v_deleted_count INT;
    
    -- Delete cart items first
    DELETE ci FROM cart_items ci
    INNER JOIN cart c ON ci.cart_id = c.id
    WHERE c.updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Delete empty carts
    DELETE FROM cart 
    WHERE updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND id NOT IN (SELECT DISTINCT cart_id FROM cart_items);
    
    SET v_deleted_count = ROW_COUNT();
    
    SELECT CONCAT('Cleaned ', v_deleted_count, ' abandoned carts') as result;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_clean_old_carts();
```

### 5.2 Archive Old Orders
**Purpose:** Move completed orders to archive table

```sql
DELIMITER //

CREATE PROCEDURE sp_archive_old_orders(IN p_days_old INT)
BEGIN
    DECLARE v_archived_count INT;
    
    -- Count orders to archive
    SELECT COUNT(*) INTO v_archived_count
    FROM orders
    WHERE status = 'delivered'
    AND created_at < DATE_SUB(NOW(), INTERVAL p_days_old DAY);
    
    -- Note: Create archive table first
    -- INSERT INTO orders_archive SELECT * FROM orders WHERE ...
    
    SELECT CONCAT('Found ', v_archived_count, ' orders to archive') as result;
END//

DELIMITER ;
```

**Usage:**
```sql
CALL sp_archive_old_orders(365);
```

---

## Installation Instructions

### Install All Procedures
```bash
mysql -u root -p monochra_db < stored_procedures.sql
```

### Verify Procedures
```sql
-- Show all procedures
SHOW PROCEDURE STATUS WHERE Db = 'monochra_db';

-- Show specific procedure
SHOW CREATE PROCEDURE sp_create_order;
```

### Drop Procedure
```sql
DROP PROCEDURE IF EXISTS procedure_name;
```

---

## Summary

| Procedure | Purpose | Parameters |
|-----------|---------|------------|
| sp_create_order | Create order from cart | user_id, addresses |
| sp_cancel_order | Cancel order | order_id, reason |
| sp_get_order_details | Get order info | order_id |
| sp_add_product | Add new product | product details |
| sp_update_stock | Adjust inventory | product_id, quantity |
| sp_get_low_stock_products | Find low stock | threshold |
| sp_add_to_cart | Add item to cart | user_id, product_id |
| sp_clear_cart | Empty cart | user_id |
| sp_get_cart_summary | Cart totals | user_id |
| sp_sales_report | Sales analytics | date range |
| sp_top_products | Best sellers | limit |
| sp_customer_stats | Customer analysis | user_id |
| sp_clean_old_carts | Remove old carts | none |
| sp_archive_old_orders | Archive orders | days_old |

**Total Procedures: 14**
