# Database Functions Documentation

## Overview
Functions are reusable SQL code blocks that return a single value. This document contains all custom functions for the MONOCHRA e-commerce system.

---

## 1. Price & Currency Functions

### 1.1 Format Price
**Purpose:** Format price with currency symbol

```sql
DELIMITER //

CREATE FUNCTION fn_format_price(p_price DECIMAL(10,2))
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    RETURN CONCAT('$', FORMAT(p_price, 2));
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_format_price(189.99);
-- Returns: $189.99

SELECT name, fn_format_price(price) as formatted_price FROM products;
```

### 1.2 Calculate Discount
**Purpose:** Calculate discounted price

```sql
DELIMITER //

CREATE FUNCTION fn_calculate_discount(
    p_price DECIMAL(10,2),
    p_discount_percent INT
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    RETURN p_price - (p_price * p_discount_percent / 100);
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_calculate_discount(100.00, 20);
-- Returns: 80.00

SELECT name, price, fn_calculate_discount(price, 15) as sale_price FROM products;
```

### 1.3 Calculate Tax
**Purpose:** Calculate tax amount

```sql
DELIMITER //

CREATE FUNCTION fn_calculate_tax(
    p_amount DECIMAL(10,2),
    p_tax_rate DECIMAL(5,2)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    RETURN ROUND(p_amount * p_tax_rate / 100, 2);
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_calculate_tax(100.00, 10);
-- Returns: 10.00
```

---

## 2. Stock Management Functions

### 2.1 Get Stock Status
**Purpose:** Return stock status label

```sql
DELIMITER //

CREATE FUNCTION fn_stock_status(p_quantity INT)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE v_status VARCHAR(20);
    
    IF p_quantity = 0 THEN
        SET v_status = 'Out of Stock';
    ELSEIF p_quantity <= 5 THEN
        SET v_status = 'Critical';
    ELSEIF p_quantity <= 20 THEN
        SET v_status = 'Low Stock';
    ELSE
        SET v_status = 'In Stock';
    END IF;
    
    RETURN v_status;
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT name, quantity, fn_stock_status(quantity) as status FROM products;
```

### 2.2 Calculate Stock Percentage
**Purpose:** Calculate stock level as percentage

```sql
DELIMITER //

CREATE FUNCTION fn_stock_percentage(
    p_current_qty INT,
    p_max_qty INT
)
RETURNS INT
DETERMINISTIC
BEGIN
    IF p_max_qty = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((p_current_qty / p_max_qty) * 100);
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT name, fn_stock_percentage(quantity, 100) as stock_percent FROM products;
```

### 2.3 Check Stock Availability
**Purpose:** Check if product has enough stock

```sql
DELIMITER //

CREATE FUNCTION fn_has_stock(
    p_product_id INT,
    p_required_qty INT
)
RETURNS BOOLEAN
READS SQL DATA
BEGIN
    DECLARE v_available_qty INT;
    
    SELECT quantity INTO v_available_qty
    FROM products
    WHERE id = p_product_id;
    
    RETURN v_available_qty >= p_required_qty;
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_has_stock(1, 5);
-- Returns: 1 (true) or 0 (false)
```

---

## 3. Order Functions

### 3.1 Generate Order Number
**Purpose:** Create unique order number

```sql
DELIMITER //

CREATE FUNCTION fn_generate_order_number()
RETURNS VARCHAR(50)
NOT DETERMINISTIC
BEGIN
    DECLARE v_order_num VARCHAR(50);
    DECLARE v_year VARCHAR(4);
    DECLARE v_random VARCHAR(6);
    
    SET v_year = YEAR(NOW());
    SET v_random = LPAD(FLOOR(RAND() * 1000000), 6, '0');
    SET v_order_num = CONCAT('ORD-', v_year, '-', v_random);
    
    RETURN v_order_num;
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_generate_order_number();
-- Returns: ORD-2026-123456
```

### 3.2 Calculate Shipping Cost
**Purpose:** Calculate shipping based on subtotal

```sql
DELIMITER //

CREATE FUNCTION fn_calculate_shipping(p_subtotal DECIMAL(10,2))
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE v_shipping DECIMAL(10,2);
    
    IF p_subtotal >= 100 THEN
        SET v_shipping = 0.00;  -- Free shipping
    ELSEIF p_subtotal >= 50 THEN
        SET v_shipping = 5.00;  -- Reduced shipping
    ELSE
        SET v_shipping = 10.00; -- Standard shipping
    END IF;
    
    RETURN v_shipping;
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_calculate_shipping(75.00);
-- Returns: 5.00
```

### 3.3 Get Order Status Label
**Purpose:** Return user-friendly status text

```sql
DELIMITER //

CREATE FUNCTION fn_order_status_label(p_status VARCHAR(20))
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    RETURN CASE p_status
        WHEN 'pending' THEN 'Pending Payment'
        WHEN 'processing' THEN 'Processing Order'
        WHEN 'shipped' THEN 'Shipped'
        WHEN 'delivered' THEN 'Delivered'
        WHEN 'cancelled' THEN 'Cancelled'
        ELSE 'Unknown Status'
    END;
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT order_number, fn_order_status_label(status) as status_text FROM orders;
```

---

## 4. Product Functions

### 4.1 Generate SKU
**Purpose:** Create unique product SKU

```sql
DELIMITER //

CREATE FUNCTION fn_generate_sku(p_category_id INT)
RETURNS VARCHAR(100)
NOT DETERMINISTIC
BEGIN
    DECLARE v_category_code VARCHAR(3);
    DECLARE v_random VARCHAR(6);
    
    -- Get category code (first 3 letters)
    SELECT UPPER(LEFT(name, 3)) INTO v_category_code
    FROM categories
    WHERE id = p_category_id;
    
    SET v_random = LPAD(FLOOR(RAND() * 1000000), 6, '0');
    
    RETURN CONCAT(v_category_code, '-', v_random);
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_generate_sku(1);
-- Returns: CLO-123456
```

### 4.2 Create Product Slug
**Purpose:** Generate URL-friendly slug

```sql
DELIMITER //

CREATE FUNCTION fn_create_slug(p_text VARCHAR(255))
RETURNS VARCHAR(255)
DETERMINISTIC
BEGIN
    DECLARE v_slug VARCHAR(255);
    
    -- Convert to lowercase
    SET v_slug = LOWER(p_text);
    
    -- Replace spaces with hyphens
    SET v_slug = REPLACE(v_slug, ' ', '-');
    
    -- Remove special characters (basic version)
    SET v_slug = REPLACE(v_slug, '&', 'and');
    SET v_slug = REPLACE(v_slug, ',', '');
    SET v_slug = REPLACE(v_slug, '.', '');
    SET v_slug = REPLACE(v_slug, '!', '');
    SET v_slug = REPLACE(v_slug, '?', '');
    
    RETURN v_slug;
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_create_slug('Minimalist Wool Coat');
-- Returns: minimalist-wool-coat
```

### 4.3 Calculate Average Rating
**Purpose:** Get product's average rating

```sql
DELIMITER //

CREATE FUNCTION fn_avg_rating(p_product_id INT)
RETURNS DECIMAL(3,2)
READS SQL DATA
BEGIN
    DECLARE v_avg_rating DECIMAL(3,2);
    
    SELECT COALESCE(AVG(rating), 0) INTO v_avg_rating
    FROM reviews
    WHERE product_id = p_product_id;
    
    RETURN v_avg_rating;
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT name, fn_avg_rating(id) as avg_rating FROM products;
```

---

## 5. User & Customer Functions

### 5.1 Get Customer Full Name
**Purpose:** Concatenate first and last name

```sql
DELIMITER //

CREATE FUNCTION fn_customer_name(p_user_id INT)
RETURNS VARCHAR(255)
READS SQL DATA
BEGIN
    DECLARE v_full_name VARCHAR(255);
    
    SELECT CONCAT(first_name, ' ', last_name) INTO v_full_name
    FROM users
    WHERE id = p_user_id;
    
    RETURN COALESCE(v_full_name, 'Guest');
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_customer_name(1);
-- Returns: Admin User
```

### 5.2 Calculate Customer Lifetime Value
**Purpose:** Total amount spent by customer

```sql
DELIMITER //

CREATE FUNCTION fn_customer_ltv(p_user_id INT)
RETURNS DECIMAL(10,2)
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);
    
    SELECT COALESCE(SUM(total), 0) INTO v_total
    FROM orders
    WHERE user_id = p_user_id
    AND status != 'cancelled';
    
    RETURN v_total;
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT id, email, fn_customer_ltv(id) as lifetime_value FROM users;
```

### 5.3 Count Customer Orders
**Purpose:** Get total orders for customer

```sql
DELIMITER //

CREATE FUNCTION fn_customer_order_count(p_user_id INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_count INT;
    
    SELECT COUNT(*) INTO v_count
    FROM orders
    WHERE user_id = p_user_id
    AND status != 'cancelled';
    
    RETURN v_count;
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT id, email, fn_customer_order_count(id) as total_orders FROM users;
```

---

## 6. Date & Time Functions

### 6.1 Format Date
**Purpose:** Format date in readable format

```sql
DELIMITER //

CREATE FUNCTION fn_format_date(p_date DATETIME)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    RETURN DATE_FORMAT(p_date, '%b %d, %Y');
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_format_date(NOW());
-- Returns: Feb 17, 2026
```

### 6.2 Days Since Order
**Purpose:** Calculate days since order was placed

```sql
DELIMITER //

CREATE FUNCTION fn_days_since_order(p_order_date DATETIME)
RETURNS INT
DETERMINISTIC
BEGIN
    RETURN DATEDIFF(NOW(), p_order_date);
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT order_number, fn_days_since_order(created_at) as days_ago FROM orders;
```

### 6.3 Is Recent Order
**Purpose:** Check if order is within last N days

```sql
DELIMITER //

CREATE FUNCTION fn_is_recent_order(
    p_order_date DATETIME,
    p_days INT
)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    RETURN DATEDIFF(NOW(), p_order_date) <= p_days;
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT order_number, fn_is_recent_order(created_at, 7) as is_recent FROM orders;
```

---

## 7. Validation Functions

### 7.1 Validate Email
**Purpose:** Check if email format is valid

```sql
DELIMITER //

CREATE FUNCTION fn_is_valid_email(p_email VARCHAR(255))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    RETURN p_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_is_valid_email('test@example.com');
-- Returns: 1 (true)
```

### 7.2 Validate Phone
**Purpose:** Check if phone format is valid

```sql
DELIMITER //

CREATE FUNCTION fn_is_valid_phone(p_phone VARCHAR(20))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    -- Basic validation: 10-15 digits
    RETURN p_phone REGEXP '^[0-9]{10,15}$';
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_is_valid_phone('1234567890');
-- Returns: 1 (true)
```

### 7.3 Validate Price Range
**Purpose:** Check if price is within acceptable range

```sql
DELIMITER //

CREATE FUNCTION fn_is_valid_price(
    p_price DECIMAL(10,2),
    p_min DECIMAL(10,2),
    p_max DECIMAL(10,2)
)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    RETURN p_price >= p_min AND p_price <= p_max;
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_is_valid_price(50.00, 10.00, 1000.00);
-- Returns: 1 (true)
```

---

## 8. Analytics Functions

### 8.1 Calculate Conversion Rate
**Purpose:** Calculate percentage of orders vs visitors

```sql
DELIMITER //

CREATE FUNCTION fn_conversion_rate(
    p_orders INT,
    p_visitors INT
)
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    IF p_visitors = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((p_orders / p_visitors) * 100, 2);
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_conversion_rate(50, 1000);
-- Returns: 5.00
```

### 8.2 Calculate Growth Rate
**Purpose:** Calculate percentage growth

```sql
DELIMITER //

CREATE FUNCTION fn_growth_rate(
    p_old_value DECIMAL(10,2),
    p_new_value DECIMAL(10,2)
)
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    IF p_old_value = 0 THEN
        RETURN 100.00;
    END IF;
    
    RETURN ROUND(((p_new_value - p_old_value) / p_old_value) * 100, 2);
END//

DELIMITER ;
```

**Usage:**
```sql
SELECT fn_growth_rate(1000.00, 1250.00);
-- Returns: 25.00
```

---

## Installation Instructions

### Install All Functions
```bash
mysql -u root -p monochra_db < functions.sql
```

### Verify Functions
```sql
-- Show all functions
SHOW FUNCTION STATUS WHERE Db = 'monochra_db';

-- Show specific function
SHOW CREATE FUNCTION fn_format_price;
```

### Drop Function
```sql
DROP FUNCTION IF EXISTS function_name;
```

---

## Testing Functions

### Test Price Functions
```sql
SELECT 
    fn_format_price(189.99) as formatted,
    fn_calculate_discount(100.00, 20) as discounted,
    fn_calculate_tax(100.00, 10) as tax;
```

### Test Stock Functions
```sql
SELECT 
    name,
    quantity,
    fn_stock_status(quantity) as status,
    fn_stock_percentage(quantity, 100) as percent
FROM products;
```

### Test Order Functions
```sql
SELECT 
    fn_generate_order_number() as order_num,
    fn_calculate_shipping(75.00) as shipping,
    fn_order_status_label('processing') as status;
```

---

## Summary

| Function | Purpose | Return Type |
|----------|---------|-------------|
| fn_format_price | Format currency | VARCHAR(20) |
| fn_calculate_discount | Apply discount | DECIMAL(10,2) |
| fn_calculate_tax | Calculate tax | DECIMAL(10,2) |
| fn_stock_status | Stock status label | VARCHAR(20) |
| fn_stock_percentage | Stock as percent | INT |
| fn_has_stock | Check availability | BOOLEAN |
| fn_generate_order_number | Create order # | VARCHAR(50) |
| fn_calculate_shipping | Shipping cost | DECIMAL(10,2) |
| fn_order_status_label | Status text | VARCHAR(50) |
| fn_generate_sku | Create SKU | VARCHAR(100) |
| fn_create_slug | URL slug | VARCHAR(255) |
| fn_avg_rating | Average rating | DECIMAL(3,2) |
| fn_customer_name | Full name | VARCHAR(255) |
| fn_customer_ltv | Lifetime value | DECIMAL(10,2) |
| fn_customer_order_count | Order count | INT |
| fn_format_date | Format date | VARCHAR(50) |
| fn_days_since_order | Days ago | INT |
| fn_is_recent_order | Recent check | BOOLEAN |
| fn_is_valid_email | Email validation | BOOLEAN |
| fn_is_valid_phone | Phone validation | BOOLEAN |
| fn_is_valid_price | Price validation | BOOLEAN |
| fn_conversion_rate | Conversion % | DECIMAL(5,2) |
| fn_growth_rate | Growth % | DECIMAL(5,2) |

**Total Functions: 23**
