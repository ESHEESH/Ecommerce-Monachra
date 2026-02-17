# MONOCHRA - Troubleshooting Guide

## Network Error on Signup

### Possible Causes:

1. **Database not imported**
   - Go to `http://localhost/phpmyadmin`
   - Import `database.sql`
   - Check if `monochra_db` exists

2. **XAMPP not running**
   - Start Apache
   - Start MySQL

3. **Wrong file path**
   - Make sure project is in `C:\xampp\htdocs\monochra`

4. **PHP errors**
   - Check `C:\xampp\apache\logs\error.log`

### Quick Fix:

Open browser console (F12) when signing up and check:
- What URL is being called?
- What error message appears?
- Is the response 404, 500, or network error?

### Test API Connection:

Visit: `http://localhost/monochra/php/api.php?action=get_categories`

Should see:
```json
{
  "success": true,
  "data": [...]
}
```

If you see error, the problem is in PHP/database setup.

## Cart Issues

The cart page shows dummy items because:
1. HTML has hardcoded items
2. JavaScript loads real items but doesn't replace them

**Fix:** I'll update cart.html to remove hardcoded items.

## Admin Dashboard Not Working

The dashboard buttons don't work because:
1. No event listeners attached
2. Missing page scripts
3. Filters not connected to backend

**Fix:** I'll create all missing admin pages and connect them.

## Quick Diagnostic:

Run this in browser console on any page:
```javascript
// Test if modules loaded
console.log('Helpers:', typeof Helpers);
console.log('API:', typeof API);
console.log('Notifications:', typeof Notifications);

// Test API
API.categories.getAll().then(console.log);
```

Should show:
```
Helpers: object
API: object  
Notifications: object
{success: true, data: Array(6)}
```

If any show 'undefined', scripts aren't loading correctly.
