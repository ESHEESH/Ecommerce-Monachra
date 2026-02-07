<?php
/**
 * MONOCHRA E-Commerce - Database Configuration
 * Monochrome Black/White/Grey Theme
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'monochra_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Site Configuration
define('SITE_NAME', 'MONOCHRA');
define('SITE_URL', 'http://localhost/monochra');
define('ADMIN_EMAIL', 'admin@monochra.com');

// Path Configuration
define('BASE_PATH', dirname(__DIR__));
define('UPLOAD_PATH', BASE_PATH . '/uploads/');
define('PRODUCT_IMAGE_PATH', UPLOAD_PATH . 'products/');

// Security
define('SESSION_LIFETIME', 3600); // 1 hour
define('PASSWORD_SALT', 'your_random_salt_here'); // Change this!

// Pagination
define('PRODUCTS_PER_PAGE', 12);
define('ORDERS_PER_PAGE', 20);

// Stock Levels
define('LOW_STOCK_THRESHOLD', 10);
define('CRITICAL_STOCK_THRESHOLD', 5);

// Database Connection Class
class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch(PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }

    // Prevent cloning
    private function __clone() {}
}

// Helper Functions
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function redirect($url) {
    header("Location: " . $url);
    exit();
}

function formatPrice($price) {
    return '$' . number_format($price, 2);
}

function getStockStatus($quantity, $max_quantity = 100) {
    $percentage = ($quantity / $max_quantity) * 100;
    
    if ($quantity == 0) {
        return ['status' => 'out-of-stock', 'label' => 'Out of Stock', 'class' => 'out-of-stock'];
    } elseif ($quantity <= CRITICAL_STOCK_THRESHOLD) {
        return ['status' => 'critical', 'label' => 'Critical', 'class' => 'low-stock'];
    } elseif ($quantity <= LOW_STOCK_THRESHOLD) {
        return ['status' => 'low', 'label' => 'Low Stock', 'class' => 'low-stock'];
    } else {
        return ['status' => 'in-stock', 'label' => 'In Stock', 'class' => 'active'];
    }
}

function generateSKU($prefix = 'PRD') {
    return $prefix . '-' . strtoupper(bin2hex(random_bytes(4)));
}

function uploadProductImage($file, $product_id) {
    $allowed_types = ['image/jpeg', 'image/png', 'image/webp'];
    $max_size = 10 * 1024 * 1024; // 10MB

    if (!in_array($file['type'], $allowed_types)) {
        return ['success' => false, 'message' => 'Invalid file type'];
    }

    if ($file['size'] > $max_size) {
        return ['success' => false, 'message' => 'File too large'];
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = $product_id . '_' . time() . '_' . uniqid() . '.' . $extension;
    $filepath = PRODUCT_IMAGE_PATH . $filename;

    if (!file_exists(PRODUCT_IMAGE_PATH)) {
        mkdir(PRODUCT_IMAGE_PATH, 0777, true);
    }

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return ['success' => true, 'filename' => $filename, 'path' => $filepath];
    }

    return ['success' => false, 'message' => 'Upload failed'];
}

// Session Management
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

function isLoggedIn() {
    startSession();
    return isset($_SESSION['user_id']);
}

function isAdmin() {
    startSession();
    return isset($_SESSION['user_id']) && isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
}

function requireLogin() {
    if (!isLoggedIn()) {
        redirect(SITE_URL . '/login.php');
    }
}

function requireAdmin() {
    if (!isAdmin()) {
        redirect(SITE_URL . '/admin/login.php');
    }
}

// Response Functions
function jsonResponse($success, $message = '', $data = []) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

// Error Handling
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("Error [$errno]: $errstr in $errfile on line $errline");
    if (ini_get('display_errors')) {
        echo "An error occurred. Please check the error log.";
    }
    return true;
});

// Initialize session
startSession();
?>