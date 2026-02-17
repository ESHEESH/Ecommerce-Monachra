# Database Triggers Documentation

## Overview
Triggers automatically execute SQL code in response to specific database events. This document contains all triggers for the MONOCHRA e-commerce system.

---

## 1. Stock Management Triggers

### 1.1 Auto-Update Stock on Order Creation
**Purpose:** Automatically decrease product stock when an order is placed

```sql
DELIMITER //

CREATE TRIGGER after_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    -- Decrease product quantity
    UPDATE products 
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Log stock movement
    INSERT INTO stock_movements (product_id, quantity_change, reason, reference_id, notes)
    VALUES (NEW.product_id, -NEW.quantity, 'purchase', NEW.order_id, 'Order placed');
END//

DELIMITER ;
```

### 1.2 Restore Stock on Order Cancellation
**Purpose:** Return products to stock when order is cancelled

```sql
DELIMITER //

CREATE TRIGGER after_order_cancel
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        -- Restore stock for all items in the order
        UPDATE products p
        INNER JOIN order_items oi ON p.id = oi.product_id
        SET p.quantity = p.quantity + oi.quantity
        WHERE oi.order_id = NEW.id;
        
        -- Log stock movements
        INSERT INTO stock_movements (product_id, quantity_change, reason, reference_id, notes)
        SELECT 
            oi.product_id,
            oi.quantity,
            'return',
            NEW.id,
            CONCAT('Order #', NEW.order_number, ' cancelled')
        FROM order_items oi
        WHERE oi.order_id = NEW.id;
    END IF;
END//

DELIMITER ;
```

### 1.3 Prevent Negative Stock
**Purpose:** Ensure stock never goes below zero

```sql
DELIMITER //

CREATE TRIGGER before_product_update_stock
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock quantity cannot be negative';
    END IF;
END//

DELIMITER ;
```

---

## 2. Order Management Triggers

### 2.1 Generate Order Number
**Purpose:** Automatically create unique order number on insert

```sql
DELIMITER //

CREATE TRIGGER before_order_insert
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    IF NEW.order_number IS NULL THEN
        SET NEW.order_number = CONCAT('ORD-', YEAR(NOW()), LPAD(FLOOR(RAND() * 10000), 4, '0'));
    END IF;
END//

DELIMITER ;
```

### 2.2 Calculate Order Total
**Purpose:** Auto-calculate order total from items

```sql
DELIMITER //

CREATE TRIGGER after_order_item_change
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE order_subtotal DECIMAL(10,2);
    
    -- Calculate subtotal
    SELECT SUM(quantity * price) INTO order_subtotal
    FROM order_items
    WHERE order_id = NEW.order_id;
    
    -- Update order totals
    UPDATE orders
    SET 
        subtotal = order_subtotal,
        tax = order_subtotal * 0.10,  -- 10% tax
        shipping = IF(order_subtotal > 100, 0, 10),  -- Free shipping over $100
        total = order_subtotal + (order_subtotal * 0.10) + IF(order_subtotal > 100, 0, 10)
    WHERE id = NEW.order_id;
END//

DELIMITER ;
```

### 2.3 Update Order Timestamp
**Purpose:** Track when order status changes

```sql
DELIMITER //

CREATE TRIGGER before_order_status_update
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        SET NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
END//

DELIMITER ;
```

---

## 3. Cart Management Triggers

### 3.1 Update Cart Timestamp
**Purpose:** Track cart activity

```sql
DELIMITER //

CREATE TRIGGER after_cart_item_activity
AFTER INSERT ON cart_items
FOR EACH ROW
BEGIN
    UPDATE cart
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.cart_id;
END//

DELIMITER ;
```

### 3.2 Prevent Duplicate Cart Items
**Purpose:** Merge quantities instead of creating duplicates

```sql
DELIMITER //

CREATE TRIGGER before_cart_item_insert
BEFORE INSERT ON cart_items
FOR EACH ROW
BEGIN
    DECLARE existing_quantity INT;
    
    -- Check if item already exists
    SELECT quantity INTO existing_quantity
    FROM cart_items
    WHERE cart_id = NEW.cart_id AND product_id = NEW.product_id;
    
    -- If exists, update quantity instead
    IF existing_quantity IS NOT NULL THEN
        UPDATE cart_items
        SET quantity = quantity + NEW.quantity
        WHERE cart_id = NEW.cart_id AND product_id = NEW.product_id;
        
        -- Prevent the insert
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Item already in cart, quantity updated';
    END IF;
END//

DELIMITER ;
```

---

## 4. Product Management Triggers

### 4.1 Generate Product Slug
**Purpose:** Auto-create URL-friendly slug from product name

```sql
DELIMITER //

CREATE TRIGGER before_product_insert
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
    IF NEW.slug IS NULL THEN
        SET NEW.slug = LOWER(REPLACE(TRIM(NEW.name), ' ', '-'));
    END IF;
END//

DELIMITER ;
```

### 4.2 Update Product Timestamp
**Purpose:** Track product modifications

```sql
DELIMITER //

CREATE TRIGGER before_product_update
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;
```

### 4.3 Validate Product Price
**Purpose:** Ensure prices are positive

```sql
DELIMITER //

CREATE TRIGGER before_product_price_check
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
    IF NEW.price <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Product price must be greater than zero';
    END IF;
END//

DELIMITER ;
```

---

## 5. Review Management Triggers

### 5.1 Validate Rating Range
**Purpose:** Ensure ratings are between 1-5

```sql
DELIMITER //

CREATE TRIGGER before_review_insert
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
    IF NEW.rating < 1 OR NEW.rating > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
    END IF;
END//

DELIMITER ;
```

### 5.2 Auto-Verify Purchased Reviews
**Purpose:** Mark review as verified if user purchased the product

```sql
DELIMITER //

CREATE TRIGGER before_review_verification
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
    DECLARE has_purchased INT;
    
    -- Check if user has purchased this product
    SELECT COUNT(*) INTO has_purchased
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE o.user_id = NEW.user_id 
    AND oi.product_id = NEW.product_id
    AND o.status = 'delivered';
    
    -- Set verified status
    IF has_purchased > 0 THEN
        SET NEW.is_verified = TRUE;
    END IF;
END//

DELIMITER ;
```

---

## 6. User Management Triggers

### 6.1 Create Cart on User Registration
**Purpose:** Automatically create a cart for new users

```sql
DELIMITER //

CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO cart (user_id) VALUES (NEW.id);
END//

DELIMITER ;
```

### 6.2 Validate Email Format
**Purpose:** Ensure valid email addresses

```sql
DELIMITER //

CREATE TRIGGER before_user_email_check
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid email format';
    END IF;
END//

DELIMITER ;
```

---

## Installation Instructions

### Install All Triggers
```bash
# Connect to MySQL
mysql -u root -p monochra_db

# Copy and paste each trigger from this document
# Or run from SQL file:
source triggers.sql
```

### Verify Triggers
```sql
-- Show all triggers
SHOW TRIGGERS FROM monochra_db;

-- Show specific trigger
SHOW CREATE TRIGGER after_order_item_insert;
```

### Drop Trigger (if needed)
```sql
DROP TRIGGER IF EXISTS trigger_name;
```

---

## Testing Triggers

### Test Stock Update Trigger
```sql
-- Check current stock
SELECT id, name, quantity FROM products WHERE id = 1;

-- Place an order (trigger should decrease stock)
INSERT INTO orders (user_id, order_number, total, status) 
VALUES (1, 'TEST-001', 189.00, 'pending');

INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (LAST_INSERT_ID(), 1, 2, 189.00);

-- Verify stock decreased
SELECT id, name, quantity FROM products WHERE id = 1;

-- Check stock movement log
SELECT * FROM stock_movements WHERE product_id = 1 ORDER BY created_at DESC LIMIT 1;
```

### Test Order Cancellation Trigger
```sql
-- Cancel the order (trigger should restore stock)
UPDATE orders SET status = 'cancelled' WHERE order_number = 'TEST-001';

-- Verify stock restored
SELECT id, name, quantity FROM products WHERE id = 1;
```

---

## Trigger Performance

### Best Practices
1. Keep triggers simple and fast
2. Avoid complex calculations in triggers
3. Don't call external procedures from triggers
4. Use triggers for data integrity, not business logic
5. Log trigger errors for debugging

### Monitoring
```sql
-- Check trigger execution time
SHOW PROFILE FOR QUERY 1;

-- Disable trigger temporarily
DROP TRIGGER trigger_name;

-- Re-enable by recreating
CREATE TRIGGER ...
```

---

## Troubleshooting

### Common Issues

**Error: Trigger already exists**
```sql
DROP TRIGGER IF EXISTS trigger_name;
-- Then recreate
```

**Error: Can't update table in trigger**
- Don't update the same table that fired the trigger
- Use BEFORE triggers for validation
- Use AFTER triggers for related table updates

**Error: Recursive trigger calls**
- Avoid triggers that cause infinite loops
- Use conditional logic to prevent recursion

---

## Summary

| Trigger | Event | Purpose |
|---------|-------|---------|
| after_order_item_insert | INSERT order_items | Decrease stock |
| after_order_cancel | UPDATE orders | Restore stock |
| before_product_update_stock | UPDATE products | Prevent negative stock |
| before_order_insert | INSERT orders | Generate order number |
| after_order_item_change | INSERT order_items | Calculate totals |
| before_order_status_update | UPDATE orders | Update timestamp |
| after_cart_item_activity | INSERT cart_items | Update cart timestamp |
| before_cart_item_insert | INSERT cart_items | Prevent duplicates |
| before_product_insert | INSERT products | Generate slug |
| before_product_update | UPDATE products | Update timestamp |
| before_product_price_check | INSERT products | Validate price |
| before_review_insert | INSERT reviews | Validate rating |
| before_review_verification | INSERT reviews | Auto-verify |
| after_user_insert | INSERT users | Create cart |
| before_user_email_check | INSERT users | Validate email |

**Total Triggers: 15**
