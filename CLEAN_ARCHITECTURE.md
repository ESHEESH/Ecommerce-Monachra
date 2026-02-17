# MONOCHRA - Clean Architecture Guide

## ✅ Separation of Concerns Achieved

All inline scripts have been removed from HTML files and organized into separate JavaScript files.

## 📁 New File Structure

```
monochra/
├── html/                          # Pure HTML (no inline scripts)
│   ├── index.html
│   ├── shop.html
│   ├── cart.html
│   ├── login.html
│   ├── signup.html
│   ├── profile.html
│   ├── dashboard.html
│   └── products.html
│
├── JS/
│   ├── utils/                     # Reusable utilities
│   │   ├── api.js                # API client
│   │   ├── helpers.js            # Helper functions
│   │   └── notifications.js      # Toast notifications
│   │
│   ├── modules/                   # Feature modules
│   │   ├── auth.module.js        # Authentication
│   │   ├── cart.module.js        # Shopping cart
│   │   ├── products.module.js    # Products
│   │   └── admin.module.js       # Admin functions
│   │
│   ├── pages/                     # Page-specific scripts
│   │   ├── login.js              # Login page
│   │   ├── signup.js             # Signup page
│   │   ├── shop.js               # Shop page
│   │   ├── cart.js               # Cart page
│   │   ├── profile.js            # Profile page
│   │   ├── dashboard.js          # Dashboard page
│   │   └── admin-products.js     # Admin products page
│   │
│   └── app.js                     # Main application entry
│
├── php/                           # Backend API
│   ├── config.php
│   ├── api.php
│   ├── products.php
│   ├── cart.php
│   ├── orders.php
│   └── auth.php
│
└── css/
    ├── main.css
    └── admin.css
```

## 🎯 How Each Page Loads Scripts

### Customer Pages (Login, Signup, Shop, Cart, Profile)

**Example: login.html**
```html
<!-- HTML only - no inline scripts -->
<body>
    <!-- HTML content here -->
    
    <!-- External scripts at bottom -->
    <script src="../JS/utils/helpers.js"></script>
    <script src="../JS/utils/api.js"></script>
    <script src="../JS/utils/notifications.js"></script>
    <script src="../JS/modules/auth.module.js"></script>
    <script src="../JS/pages/login.js"></script>
</body>
```

### Admin Pages (Dashboard, Products)

**Example: dashboard.html**
```html
<body>
    <!-- HTML content here -->
    
    <!-- External scripts at bottom -->
    <script src="../JS/utils/helpers.js"></script>
    <script src="../JS/utils/api.js"></script>
    <script src="../JS/utils/notifications.js"></script>
    <script src="../JS/modules/admin.module.js"></script>
    <script src="../JS/pages/dashboard.js"></script>
</body>
```

## 📋 Script Loading Order

**Always load in this order:**

1. **Utils** (Foundation)
   - helpers.js
   - api.js
   - notifications.js

2. **Modules** (Features)
   - auth.module.js
   - cart.module.js
   - products.module.js
   - admin.module.js

3. **Page Scripts** (Page-specific)
   - login.js, signup.js, shop.js, etc.

## 🔧 Page-Specific Scripts

### JS/pages/login.js
- Password visibility toggle
- Form validation
- Login submission
- Uses: AuthModule, Helpers, Notifications

### JS/pages/signup.js
- Password visibility toggle
- Form validation
- Password confirmation check
- Registration submission
- Uses: AuthModule, Helpers, Notifications

### JS/pages/shop.js
- Load categories
- Load products by category
- Sorting functionality
- Price/stock filtering
- Uses: ProductsModule, API, Helpers

### JS/pages/cart.js
- Load cart items
- Update quantities
- Remove items
- Calculate totals
- Uses: CartModule

### JS/pages/profile.js
- Load user profile
- Display orders
- Profile menu navigation
- Logout functionality
- Uses: AuthModule, API, Helpers

### JS/pages/dashboard.js
- Load dashboard statistics
- Display charts
- Uses: AdminModule

### JS/pages/admin-products.js
- Load products table
- Modal management
- CRUD operations
- Uses: AdminModule

## ✨ Benefits of This Architecture

### 1. **Maintainability**
- Easy to find code (each page has its own file)
- Changes to one page don't affect others
- Clear separation of concerns

### 2. **Reusability**
- Utils can be used across all pages
- Modules encapsulate features
- No code duplication

### 3. **Testability**
- Each file can be tested independently
- Mock dependencies easily
- Unit tests are straightforward

### 4. **Scalability**
- Easy to add new pages
- Easy to add new features
- Modular structure grows well

### 5. **Collaboration**
- Multiple developers can work on different files
- Less merge conflicts
- Clear ownership of code

### 6. **Performance**
- Only load scripts needed for each page
- Browser can cache individual files
- Smaller initial load

## 🚀 Adding a New Page

**Step 1:** Create HTML file (no inline scripts)
```html
<!-- html/new-page.html -->
<body>
    <!-- Your HTML here -->
    
    <script src="../JS/utils/helpers.js"></script>
    <script src="../JS/utils/api.js"></script>
    <script src="../JS/utils/notifications.js"></script>
    <script src="../JS/modules/your-module.js"></script>
    <script src="../JS/pages/new-page.js"></script>
</body>
```

**Step 2:** Create page script
```javascript
// JS/pages/new-page.js
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // Your page initialization here
    });
})();
```

**Step 3:** Create module if needed
```javascript
// JS/modules/your-module.js
const YourModule = {
    async yourFunction() {
        // Your logic here
    }
};
```

## 🔍 Code Organization Principles

### 1. **Single Responsibility**
Each file has one clear purpose:
- `login.js` - Only handles login page
- `auth.module.js` - Only handles authentication
- `api.js` - Only handles API calls

### 2. **DRY (Don't Repeat Yourself)**
Common code is in utils:
- `Helpers.formatPrice()` - Used everywhere
- `API.products.getAll()` - Reusable API call
- `Notifications.success()` - Consistent notifications

### 3. **Encapsulation**
Each module is self-contained:
```javascript
(function() {
    'use strict';
    // Private scope
    // No global pollution
})();
```

### 4. **Dependency Injection**
Modules depend on interfaces, not implementations:
```javascript
// Uses API module (can be mocked for testing)
const result = await API.auth.login(email, password);
```

## 📝 Best Practices

### HTML Files
✅ No inline JavaScript
✅ No inline event handlers (onclick, onsubmit)
✅ Load scripts at bottom of body
✅ Use semantic HTML

### JavaScript Files
✅ Use strict mode
✅ Use IIFE to avoid global scope pollution
✅ Use async/await for API calls
✅ Handle errors gracefully
✅ Add comments for complex logic

### Module Files
✅ Export clear public API
✅ Keep private functions private
✅ Document parameters and return values
✅ Handle edge cases

### Page Scripts
✅ Initialize on DOMContentLoaded
✅ Clean up event listeners
✅ Use modules, don't duplicate logic
✅ Keep page-specific code here only

## 🐛 Debugging

### Check Script Loading
Open browser console and type:
```javascript
typeof Helpers      // should be 'object'
typeof API          // should be 'object'
typeof AuthModule   // should be 'object'
```

### Check API Connection
```javascript
API.categories.getAll().then(console.log)
```

### Check Notifications
```javascript
Notifications.success('Test!')
```

## 📚 Documentation Files

- **ARCHITECTURE.md** - Overall architecture
- **CLEAN_ARCHITECTURE.md** - This file (separation of concerns)
- **SETUP_GUIDE.md** - Installation instructions
- **PAGES_GUIDE.md** - Page descriptions

## 🎓 Learning Resources

To understand this architecture better:
1. Read about Module Pattern in JavaScript
2. Learn about Separation of Concerns
3. Study SOLID principles
4. Understand MVC/MVVM patterns

## ✅ Migration Complete

All inline scripts have been removed and organized into:
- 7 page-specific scripts
- 4 feature modules
- 3 utility modules
- 1 main app entry point

Total: **15 well-organized JavaScript files** instead of scattered inline code!
