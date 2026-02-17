<?php
require_once 'config.php';
require_once 'products.php';
require_once 'cart.php';
require_once 'orders.php';
require_once 'auth.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($action) {
        // Product endpoints
        case 'get_products':
            $pm = new ProductManager();
            $products = $pm->getAllProducts(PRODUCTS_PER_PAGE);
            jsonResponse(true, 'Products retrieved', $products);
            break;

        case 'get_product':
            $id = $_GET['id'] ?? null;
            if (!$id) jsonResponse(false, 'Product ID required');
            $pm = new ProductManager();
            $product = $pm->getProductById($id);
            if (!$product) jsonResponse(false, 'Product not found');
            jsonResponse(true, 'Product retrieved', $product);
            break;

        case 'search_products':
            $search = $_GET['q'] ?? '';
            if (strlen($search) < 2) jsonResponse(false, 'Search term too short');
            $pm = new ProductManager();
            $products = $pm->searchProducts($search);
            jsonResponse(true, 'Search results', $products);
            break;

        case 'get_categories':
            $pm = new ProductManager();
            $categories = $pm->getCategories();
            jsonResponse(true, 'Categories retrieved', $categories);
            break;

        case 'get_category_products':
            $category_id = $_GET['category_id'] ?? null;
            if (!$category_id) jsonResponse(false, 'Category ID required');
            $pm = new ProductManager();
            $products = $pm->getProductsByCategory($category_id, PRODUCTS_PER_PAGE);
            jsonResponse(true, 'Category products retrieved', $products);
            break;

        // Cart endpoints
        case 'add_to_cart':
            if ($method !== 'POST') jsonResponse(false, 'POST method required');
            $data = json_decode(file_get_contents('php://input'), true);
            $product_id = $data['product_id'] ?? null;
            $quantity = $data['quantity'] ?? 1;
            $user_id = $_SESSION['user_id'] ?? null;
            
            if (!$product_id) jsonResponse(false, 'Product ID required');
            
            $cm = new CartManager();
            $result = $cm->addToCart($product_id, $quantity, $user_id);
            jsonResponse($result['success'], $result['message']);
            break;

        case 'get_cart':
            $user_id = $_SESSION['user_id'] ?? null;
            $cm = new CartManager();
            $items = $cm->getCartItems($user_id);
            $total = $cm->getCartTotal($user_id);
            $count = $cm->getCartCount($user_id);
            jsonResponse(true, 'Cart retrieved', ['items' => $items, 'total' => $total, 'count' => $count]);
            break;

        case 'update_cart_item':
            if ($method !== 'POST') jsonResponse(false, 'POST method required');
            $data = json_decode(file_get_contents('php://input'), true);
            $item_id = $data['item_id'] ?? null;
            $quantity = $data['quantity'] ?? null;
            
            if (!$item_id || $quantity === null) jsonResponse(false, 'Item ID and quantity required');
            
            $cm = new CartManager();
            $cm->updateCartItem($item_id, $quantity);
            jsonResponse(true, 'Cart item updated');
            break;

        case 'remove_cart_item':
            if ($method !== 'POST') jsonResponse(false, 'POST method required');
            $data = json_decode(file_get_contents('php://input'), true);
            $item_id = $data['item_id'] ?? null;
            
            if (!$item_id) jsonResponse(false, 'Item ID required');
            
            $cm = new CartManager();
            $cm->removeCartItem($item_id);
            jsonResponse(true, 'Item removed from cart');
            break;

        case 'clear_cart':
            if ($method !== 'POST') jsonResponse(false, 'POST method required');
            $user_id = $_SESSION['user_id'] ?? null;
            $cm = new CartManager();
            $cm->clearCart($user_id);
            jsonResponse(true, 'Cart cleared');
            break;

        // Order endpoints
        case 'create_order':
            if ($method !== 'POST') jsonResponse(false, 'POST method required');
            requireLogin();
            
            $data = json_decode(file_get_contents('php://input'), true);
            $user_id = $_SESSION['user_id'];
            
            $cm = new CartManager();
            $cart_items = $cm->getCartItems($user_id);
            
            if (empty($cart_items)) jsonResponse(false, 'Cart is empty');
            
            $subtotal = $cm->getCartTotal($user_id);
            $tax = $subtotal * 0.08;
            $shipping = $subtotal > 100 ? 0 : 10;
            $total = $subtotal + $tax + $shipping;
            
            $om = new OrderManager();
            $result = $om->createOrder(
                $user_id,
                $cart_items,
                $data['shipping_address'],
                $data['billing_address'],
                ['subtotal' => $subtotal, 'tax' => $tax, 'shipping' => $shipping, 'total' => $total]
            );
            
            if ($result['success']) {
                $cm->clearCart($user_id);
            }
            
            jsonResponse($result['success'], $result['message'] ?? '', $result);
            break;

        case 'get_order':
            $order_id = $_GET['order_id'] ?? null;
            if (!$order_id) jsonResponse(false, 'Order ID required');
            
            $om = new OrderManager();
            $order = $om->getOrderById($order_id);
            $items = $om->getOrderItems($order_id);
            
            if (!$order) jsonResponse(false, 'Order not found');
            jsonResponse(true, 'Order retrieved', ['order' => $order, 'items' => $items]);
            break;

        case 'get_user_orders':
            requireLogin();
            $user_id = $_SESSION['user_id'];
            $om = new OrderManager();
            $orders = $om->getUserOrders($user_id);
            jsonResponse(true, 'Orders retrieved', $orders);
            break;

        // Auth endpoints
        case 'register':
            if ($method !== 'POST') jsonResponse(false, 'POST method required');
            $data = json_decode(file_get_contents('php://input'), true);
            
            $am = new AuthManager();
            $result = $am->register(
                $data['email'] ?? '',
                $data['password'] ?? '',
                $data['first_name'] ?? '',
                $data['last_name'] ?? ''
            );
            jsonResponse($result['success'], $result['message']);
            break;

        case 'login':
            if ($method !== 'POST') jsonResponse(false, 'POST method required');
            $data = json_decode(file_get_contents('php://input'), true);
            
            $am = new AuthManager();
            $result = $am->login($data['email'] ?? '', $data['password'] ?? '');
            jsonResponse($result['success'], $result['message'], $result['user'] ?? []);
            break;

        case 'logout':
            $am = new AuthManager();
            $result = $am->logout();
            jsonResponse($result['success'], $result['message']);
            break;

        case 'get_user':
            requireLogin();
            $user_id = $_SESSION['user_id'];
            $am = new AuthManager();
            $user = $am->getUserById($user_id);
            jsonResponse(true, 'User retrieved', $user);
            break;

        // Admin endpoints
        case 'add_product':
            if ($method !== 'POST') jsonResponse(false, 'POST method required');
            requireAdmin();
            $data = json_decode(file_get_contents('php://input'), true);
            $pm = new ProductManager();
            $result = $pm->addProduct($data);
            jsonResponse($result, $result ? 'Product added' : 'Failed to add product');
            break;

        case 'update_product':
            if ($method !== 'POST') jsonResponse(false, 'POST method required');
            requireAdmin();
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? null;
            if (!$id) jsonResponse(false, 'Product ID required');
            $pm = new ProductManager();
            $result = $pm->updateProduct($id, $data);
            jsonResponse($result, $result ? 'Product updated' : 'Failed to update product');
            break;

        case 'delete_product':
            if ($method !== 'POST') jsonResponse(false, 'POST method required');
            requireAdmin();
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? null;
            if (!$id) jsonResponse(false, 'Product ID required');
            $pm = new ProductManager();
            $result = $pm->deleteProduct($id);
            jsonResponse($result, $result ? 'Product deleted' : 'Failed to delete product');
            break;

        case 'get_total_revenue':
            $om = new OrderManager();
            $revenue = $om->getTotalRevenue();
            jsonResponse(true, 'Revenue retrieved', $revenue);
            break;

        case 'get_total_orders':
            $om = new OrderManager();
            $count = $om->getTotalOrders();
            jsonResponse(true, 'Orders count retrieved', $count);
            break;

        default:
            jsonResponse(false, 'Invalid action');
    }
} catch (Exception $e) {
    jsonResponse(false, 'Error: ' . $e->getMessage());
}
?>
