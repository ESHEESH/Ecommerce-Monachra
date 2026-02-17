<?php
// Test Database Connection
header('Content-Type: application/json');

try {
    // Test 1: Can we connect to MySQL?
    $host = 'localhost';
    $user = 'root';
    $pass = '';
    
    $conn = new mysqli($host, $user, $pass);
    
    if ($conn->connect_error) {
        echo json_encode([
            'success' => false,
            'error' => 'MySQL Connection Failed: ' . $conn->connect_error,
            'hint' => 'Make sure XAMPP MySQL is running'
        ]);
        exit;
    }
    
    // Test 2: Does database exist?
    $result = $conn->query("SHOW DATABASES LIKE 'monochra_db'");
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Database monochra_db does not exist',
            'hint' => 'Import database.sql in phpMyAdmin',
            'mysql_connected' => true
        ]);
        exit;
    }
    
    // Test 3: Can we select the database?
    if (!$conn->select_db('monochra_db')) {
        echo json_encode([
            'success' => false,
            'error' => 'Cannot select database',
            'hint' => 'Database exists but cannot be accessed'
        ]);
        exit;
    }
    
    // Test 4: Do tables exist?
    $tables = [];
    $result = $conn->query("SHOW TABLES");
    while ($row = $result->fetch_array()) {
        $tables[] = $row[0];
    }
    
    if (empty($tables)) {
        echo json_encode([
            'success' => false,
            'error' => 'Database exists but has no tables',
            'hint' => 'Import database.sql in phpMyAdmin'
        ]);
        exit;
    }
    
    // Test 5: Check for required tables
    $required = ['users', 'products', 'categories', 'cart', 'orders'];
    $missing = array_diff($required, $tables);
    
    if (!empty($missing)) {
        echo json_encode([
            'success' => false,
            'error' => 'Missing tables: ' . implode(', ', $missing),
            'hint' => 'Re-import database.sql',
            'existing_tables' => $tables
        ]);
        exit;
    }
    
    // Test 6: Check if products exist
    $result = $conn->query("SELECT COUNT(*) as count FROM products");
    $row = $result->fetch_assoc();
    $product_count = $row['count'];
    
    // Test 7: Check if categories exist
    $result = $conn->query("SELECT COUNT(*) as count FROM categories");
    $row = $result->fetch_assoc();
    $category_count = $row['count'];
    
    // All tests passed!
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful!',
        'details' => [
            'mysql_connected' => true,
            'database_exists' => true,
            'tables_exist' => true,
            'table_count' => count($tables),
            'tables' => $tables,
            'product_count' => $product_count,
            'category_count' => $category_count
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'hint' => 'Check PHP error logs'
    ]);
}
?>
