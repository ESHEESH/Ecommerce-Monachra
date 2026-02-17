# MONOCHRA Database Documentation

## Database Connection Configuration

### XAMPP Localhost Settings
```
Host: localhost
Database: monochra_db
Username: root
Password: (empty)
Port: 3306 (default)
```

### Connection Status
✅ Connected to XAMPP MySQL Server
- Configuration file: `php/config.php`
- Test connection: `php/test-connection.php`

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ PK id           │
│    email        │◄──────────┐
│    password     │           │
│    first_name   │           │
│    last_name    │           │
│    phone        │           │
│    is_admin     │           │
│    created_at   │           │
│    updated_at   │           │
└─────────────────┘           │
        │                     │
        │ 1:N                 │
        ▼                     │
┌─────────────────┐           │
│     CART        │           │
│─────────────────│           │
│ PK id           │           │
│ FK user_id      │───────────┘
│    session_id   │
│    created_at   │
│    updated_at   │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐           ┌─────────────────┐
│   CART_ITEMS    │           │   CATEGORIES    │
│─────────────────│           │─────────────────│
│ PK id           │           │ PK id           │
│ FK cart_id      │           │    name         │
│ FK product_id   │───┐       │    slug         │
│    quantity     │   │       │    description  │
│    price        │   │       │    created_at   │
│    created_at   │   │       └─────────────────┘
└─────────────────┘   │               │
                      │               │ 1:N
┌─────────────────┐   │               ▼
│     ORDERS      │   │       ┌─────────────────┐
│─────────────────│   │       │    PRODUCTS     │
│ PK id           │   │       │─────────────────│
│ FK user_id      │   │       │ PK id           │
│    order_number │   │       │ FK category_id  │
│    subtotal     │   │       │    name         │
│    tax          │   │       │    slug         │
│    shipping     │   │       │    description  │
│    total        │   │       │    price        │
│    status       │   │       │    sku          │
│    payment_stat │   │       │    quantity     │
│    shipping_add │   │       │    image_url    │
│    billing_addr │   │       │    is_active    │
│    notes        │   │       │    created_at   │
│    created_at   │   │       │    updated_at   │
│    updated_at   │   │       └─────────────────┘
└─────────────────┘   │               │
        │             │               │
        │ 1:N         │               │
        ▼             │               │
┌─────────────────┐   │               │
│  ORDER_ITEMS    │   │               │
│─────────────────│   │               │
│ PK id           │   │               │
│ FK order_id     │   │               │
│ FK product_id   │───┼───────────────┤
│    quantity     │   │               │
│    price        │   │               │
│    created_at   │   │               │
└─────────────────┘   │               │
                      │               │
┌─────────────────┐   │               │
│STOCK_MOVEMENTS  │   │               │
│─────────────────│   │               │
│ PK id           │   │               │
│ FK product_id   │───┤               │
│    quantity_chg │   │               │
│    reason       │   │               │
│    reference_id │   │               │
│    notes        │   │               │
│    created_at   │   │               │
└─────────────────┘   │               │
                      │               │
┌─────────────────┐   │               │
│    REVIEWS      │   │               │
│─────────────────│   │               │
│ PK id           │   │               │
│ FK product_id   │───┤               │
│ FK user_id      │   │               │
│    rating       │   │               │
│    title        │   │               │
│    comment      │   │               │
│    is_verified  │   │               │
│    created_at   │   │               │
└─────────────────┘   │               │
                      │               │
┌─────────────────┐   │               │
│   WISHLIST      │   │               │
│─────────────────│   │               │
│ PK id           │   │               │
│ FK user_id      │   │               │
│ FK product_id   │───┘               │
│    created_at   │                   │
└─────────────────┘                   │
                                      │
┌─────────────────┐                   │
│PRODUCT_IMAGES   │                   │
│─────────────────│                   │
│ PK id           │                   │
│ FK product_id   │───────────────────┘
│    image_url    │
│    alt_text     │
│    is_primary   │
│    created_at   │
└─────────────────┘
```

---

## Database Schema

### Tables Overview

| Table | Purpose | Records |
|-------|---------|---------|
| users | Customer and admin accounts | Variable |
| categories | Product categories | 6 |
| products | Product catalog | 8 (sample) |
| product_images | Additional product images | Variable |
| cart | Shopping carts | Variable |
| cart_items | Items in carts | Variable |
| orders | Customer orders | Variable |
| order_items | Products in orders | Variable |
| stock_movements | Inventory tracking | Variable |
| reviews | Product reviews | Variable |
| wishlist | Customer wishlists | Variable |

### Relationships

1. **users → cart** (1:1) - Each user has one cart
2. **cart → cart_items** (1:N) - Cart contains multiple items
3. **products → cart_items** (1:N) - Product can be in multiple carts
4. **categories → products** (1:N) - Category has multiple products
5. **users → orders** (1:N) - User can have multiple orders
6. **orders → order_items** (1:N) - Order contains multiple items
7. **products → order_items** (1:N) - Product can be in multiple orders
8. **products → stock_movements** (1:N) - Product has stock history
9. **products → reviews** (1:N) - Product has multiple reviews
10. **users → reviews** (1:N) - User can write multiple reviews
11. **users → wishlist** (1:N) - User has wishlist items
12. **products → wishlist** (1:N) - Product can be in multiple wishlists
13. **products → product_images** (1:N) - Product has multiple images

---

## Indexes

### Performance Indexes
```sql
-- Products table
INDEX idx_category (category_id)
INDEX idx_active (is_active)

-- Orders table
INDEX idx_status (status)
INDEX idx_user (user_id)

-- Stock movements table
INDEX idx_product (product_id)
INDEX idx_date (created_at)
```

### Unique Constraints
```sql
-- Users
UNIQUE (email)

-- Categories
UNIQUE (name, slug)

-- Products
UNIQUE (slug, sku)

-- Cart
UNIQUE (user_id) -- One cart per user

-- Cart items
UNIQUE (cart_id, product_id) -- One product per cart

-- Wishlist
UNIQUE (user_id, product_id) -- One product per wishlist
```

---

## Data Types & Constraints

### Common Patterns

**Primary Keys:**
- All tables use `INT AUTO_INCREMENT`

**Timestamps:**
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

**Prices:**
- `DECIMAL(10, 2)` - Supports up to $99,999,999.99

**Status Fields:**
- ENUM types for predefined values
- Ensures data integrity

**Foreign Keys:**
- `ON DELETE CASCADE` - Delete related records
- `ON DELETE SET NULL` - Keep record, remove reference
- `ON DELETE RESTRICT` - Prevent deletion if referenced

---

## Sample Data

### Default Admin Account
```
Email: admin@monochra.com
Password: password (hashed)
Role: Admin
```

### Categories (6)
1. Clothing
2. Shoes
3. Beauty
4. Skincare
5. Accessories
6. Bags

### Products (8)
1. Minimalist Wool Coat - $189.00
2. Matte Liquid Lipstick - $24.00
3. Leather Chelsea Boots - $299.00
4. Hydrating Face Serum - $45.00
5. Structured Blazer - $169.00
6. Minimalist Tote Bag - $129.00
7. Wide Leg Trousers - $89.00
8. Sterling Silver Ring - $39.00

---

## Connection Testing

### Test Database Connection
```bash
# Navigate to your project in browser
http://localhost/monochra/php/test-connection.php
```

### Expected Output
```
✓ Database connection successful
✓ Database: monochra_db
✓ Tables: 11
✓ Products: 8
✓ Categories: 6
✓ Users: 1
```

### Troubleshooting

**Connection Failed:**
1. Ensure XAMPP MySQL is running
2. Check database name: `monochra_db`
3. Verify credentials in `php/config.php`
4. Import `database.sql` if database doesn't exist

**Tables Not Found:**
```bash
# Import database schema
mysql -u root -p monochra_db < database.sql
```

---

## Security Features

### Password Hashing
- Uses PHP `password_hash()` with bcrypt
- Cost factor: 10
- Automatic salt generation

### SQL Injection Prevention
- PDO prepared statements
- Parameter binding
- Input sanitization

### Session Management
- Session lifetime: 3600 seconds (1 hour)
- Secure session handling
- Admin role verification

### Input Validation
- Email format validation
- Price range validation
- Quantity constraints
- Rating limits (1-5)

---

## Backup & Maintenance

### Backup Database
```bash
mysqldump -u root -p monochra_db > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
mysql -u root -p monochra_db < backup_20260217.sql
```

### Optimize Tables
```sql
OPTIMIZE TABLE products, orders, cart_items;
```

### Check Table Status
```sql
SHOW TABLE STATUS FROM monochra_db;
```

---

## Next Steps

1. ✅ Database connected to XAMPP localhost
2. ✅ Schema created with relationships
3. ✅ Sample data loaded
4. 📝 Add triggers (see TRIGGERS.md)
5. 📝 Add stored procedures (see STORED_PROCEDURES.md)
6. 📝 Add functions (see FUNCTIONS.md)
