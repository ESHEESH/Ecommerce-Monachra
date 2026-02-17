## MONOCHRA - Code Architecture

### Project Structure

```
monochra/
├── html/                          # Frontend pages
│   ├── _includes/                 # Reusable HTML snippets
│   │   ├── scripts.html          # Customer scripts loader
│   │   └── admin-scripts.html    # Admin scripts loader
│   ├── index.html                # Homepage
│   ├── shop.html                 # Products listing
│   ├── cart.html                 # Shopping cart
│   ├── login.html                # User login
│   ├── signup.html               # User registration
│   ├── profile.html              # User profile
│   ├── dashboard.html            # Admin dashboard
│   ├── products.html             # Admin products
│   └── stock.html                # Admin stock
│
├── php/                           # Backend API
│   ├── config.php                # Database configuration
│   ├── api.php                   # Main API router
│   ├── products.php              # Product manager class
│   ├── cart.php                  # Cart manager class
│   ├── orders.php                # Order manager class
│   └── auth.php                  # Auth manager class
│
├── JS/                            # Frontend JavaScript
│   ├── utils/                    # Utility functions
│   │   ├── api.js               # API client
│   │   ├── helpers.js           # Helper functions
│   │   └── notifications.js     # Notification system
│   │
│   ├── modules/                  # Feature modules
│   │   ├── auth.module.js       # Authentication
│   │   ├── cart.module.js       # Shopping cart
│   │   ├── products.module.js   # Products display
│   │   └── admin.module.js      # Admin functions
│   │
│   ├── app.js                    # Main application entry
│   ├── main.js                   # Legacy (deprecated)
│   └── admin.js                  # Legacy (deprecated)
│
├── css/                           # Stylesheets
│   ├── main.css                  # Customer styles
│   └── admin.css                 # Admin styles
│
└── database.sql                   # Database schema
```

### Architecture Layers

#### 1. Presentation Layer (HTML)
- **Purpose**: User interface and page structure
- **Files**: `html/*.html`
- **Responsibilities**:
  - Display content
  - User interaction elements
  - Include scripts and styles

#### 2. Business Logic Layer (JavaScript Modules)
- **Purpose**: Application logic and data management
- **Files**: `JS/modules/*.js`
- **Responsibilities**:
  - Handle user actions
  - Process data
  - Communicate with API
  - Update UI

#### 3. Utility Layer (JavaScript Utils)
- **Purpose**: Reusable helper functions
- **Files**: `JS/utils/*.js`
- **Responsibilities**:
  - API communication
  - Data formatting
  - Notifications
  - Common utilities

#### 4. Data Layer (PHP Backend)
- **Purpose**: Database operations and business rules
- **Files**: `php/*.php`
- **Responsibilities**:
  - Database queries
  - Data validation
  - Authentication
  - API endpoints

### Module Descriptions

#### Utils Layer

**api.js**
- Centralized API communication
- RESTful endpoint wrappers
- Error handling
- Request/response formatting

**helpers.js**
- Date/price formatting
- Validation functions
- Storage management
- DOM utilities

**notifications.js**
- Toast notifications
- Success/error messages
- Auto-dismiss functionality

#### Modules Layer

**auth.module.js**
- User login/logout
- Registration
- Session management
- Form validation

**cart.module.js**
- Add/remove items
- Update quantities
- Cart display
- Badge updates

**products.module.js**
- Product listing
- Filtering/sorting
- Search functionality
- Category navigation

**admin.module.js**
- Dashboard statistics
- Product CRUD operations
- Table management
- Admin-specific features

### Data Flow

```
User Action
    ↓
HTML Event
    ↓
Module Function (e.g., CartModule.addToCart)
    ↓
API Call (via API.cart.add)
    ↓
PHP Backend (api.php)
    ↓
Manager Class (e.g., CartManager)
    ↓
Database Query
    ↓
Response back through layers
    ↓
UI Update + Notification
```

### Loading Order

**Customer Pages:**
1. helpers.js (utilities first)
2. api.js (API client)
3. notifications.js (notification system)
4. auth.module.js (authentication)
5. cart.module.js (cart functionality)
6. products.module.js (products)
7. app.js (initialize everything)

**Admin Pages:**
1. helpers.js
2. api.js
3. notifications.js
4. admin.module.js
5. app.js

### API Endpoints

**Products**
- `GET /api.php?action=get_products` - Get all products
- `GET /api.php?action=get_product&id=1` - Get single product
- `GET /api.php?action=get_category_products&category_id=1` - Get by category
- `GET /api.php?action=search_products&q=query` - Search products
- `POST /api.php?action=add_product` - Add product (admin)
- `POST /api.php?action=update_product` - Update product (admin)
- `POST /api.php?action=delete_product` - Delete product (admin)

**Cart**
- `GET /api.php?action=get_cart` - Get cart items
- `POST /api.php?action=add_to_cart` - Add to cart
- `POST /api.php?action=update_cart_item` - Update quantity
- `POST /api.php?action=remove_cart_item` - Remove item
- `POST /api.php?action=clear_cart` - Clear cart

**Auth**
- `POST /api.php?action=register` - Register user
- `POST /api.php?action=login` - Login
- `GET /api.php?action=logout` - Logout
- `GET /api.php?action=get_user` - Get current user

**Orders**
- `POST /api.php?action=create_order` - Create order
- `GET /api.php?action=get_order&order_id=1` - Get order
- `GET /api.php?action=get_user_orders` - Get user orders
- `GET /api.php?action=get_total_revenue` - Get revenue (admin)
- `GET /api.php?action=get_total_orders` - Get order count (admin)

### Design Patterns Used

**1. Module Pattern**
- Each feature is encapsulated in its own module
- Prevents global namespace pollution
- Easy to maintain and test

**2. Singleton Pattern**
- API client is a single instance
- Database connection uses singleton

**3. Factory Pattern**
- Notification system creates different types
- API responses are standardized

**4. Observer Pattern**
- Cart badge updates when cart changes
- UI updates on data changes

### Best Practices

**JavaScript**
- Use async/await for API calls
- Handle errors gracefully
- Validate data before sending
- Use const/let instead of var
- Comment complex logic

**PHP**
- Use prepared statements (PDO)
- Validate and sanitize input
- Use classes for organization
- Return consistent JSON responses
- Log errors properly

**Security**
- Password hashing (bcrypt)
- SQL injection prevention
- XSS protection
- CSRF tokens (to be added)
- Session management

### Migration from Legacy Code

**Old Structure:**
```
JS/main.js (1000+ lines)
JS/admin.js (1000+ lines)
```

**New Structure:**
```
JS/
├── utils/          (reusable utilities)
├── modules/        (feature-specific code)
└── app.js          (initialization)
```

**Benefits:**
- Easier to find code
- Better code reuse
- Simpler testing
- Faster development
- Better collaboration

### How to Add New Features

**1. Create a new module:**
```javascript
// JS/modules/wishlist.module.js
const WishlistModule = {
    async add(productId) {
        // Implementation
    }
};
```

**2. Add API endpoint:**
```php
// php/api.php
case 'add_to_wishlist':
    // Implementation
    break;
```

**3. Update API client:**
```javascript
// JS/utils/api.js
wishlist: {
    add: (productId) => API.request('add_to_wishlist', 'POST', { product_id: productId })
}
```

**4. Include in HTML:**
```html
<script src="../JS/modules/wishlist.module.js"></script>
```

### Testing Strategy

**Unit Tests** (to be added)
- Test individual functions
- Mock API calls
- Test edge cases

**Integration Tests** (to be added)
- Test module interactions
- Test API endpoints
- Test database operations

**Manual Testing**
- Test user flows
- Test on different browsers
- Test responsive design

### Performance Optimization

**Frontend:**
- Lazy load images
- Debounce search
- Cache API responses
- Minimize DOM manipulation

**Backend:**
- Use indexes on database
- Cache frequent queries
- Optimize SQL queries
- Use prepared statements

### Future Improvements

1. Add TypeScript for type safety
2. Implement service workers for offline support
3. Add unit tests
4. Implement CI/CD pipeline
5. Add error logging service
6. Implement caching strategy
7. Add image optimization
8. Implement lazy loading
9. Add analytics tracking
10. Implement A/B testing

### Documentation

- **SETUP_GUIDE.md** - Installation instructions
- **PAGES_GUIDE.md** - Page descriptions
- **ARCHITECTURE.md** - This file
- **API_DOCS.md** - API documentation (to be created)

### Support

For questions or issues:
1. Check documentation files
2. Review code comments
3. Check console for errors
4. Verify database connection
5. Check PHP error logs
