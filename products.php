<?php
/**
 * MONOCHRA - Products Management
 */

require_once 'config.php';

class Product {
    private $db;
    private $table = 'products';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get all products with optional filters
     */
    public function getAllProducts($filters = []) {
        $sql = "SELECT p.*, c.category_name, 
                (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image,
                (SELECT COUNT(*) FROM reviews WHERE product_id = p.product_id) as review_count,
                (SELECT AVG(rating) FROM reviews WHERE product_id = p.product_id) as avg_rating
                FROM {$this->table} p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE 1=1";

        $params = [];

        // Apply filters
        if (!empty($filters['category_id'])) {
            $sql .= " AND p.category_id = :category_id";
            $params[':category_id'] = $filters['category_id'];
        }

        if (!empty($filters['status'])) {
            $sql .= " AND p.status = :status";
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (p.product_name LIKE :search OR p.description LIKE :search OR p.sku LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['min_price'])) {
            $sql .= " AND p.base_price >= :min_price";
            $params[':min_price'] = $filters['min_price'];
        }

        if (!empty($filters['max_price'])) {
            $sql .= " AND p.base_price <= :max_price";
            $params[':max_price'] = $filters['max_price'];
        }

        // Order by
        $orderBy = isset($filters['order_by']) ? $filters['order_by'] : 'date_added';
        $orderDir = isset($filters['order_dir']) ? $filters['order_dir'] : 'DESC';
        $sql .= " ORDER BY p.{$orderBy} {$orderDir}";

        // Pagination
        if (isset($filters['limit'])) {
            $sql .= " LIMIT :limit OFFSET :offset";
            $params[':limit'] = (int)$filters['limit'];
            $params[':offset'] = isset($filters['offset']) ? (int)$filters['offset'] : 0;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Get product by ID
     */
    public function getProductById($product_id) {
        $sql = "SELECT p.*, c.category_name
                FROM {$this->table} p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE p.product_id = :product_id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':product_id' => $product_id]);
        return $stmt->fetch();
    }

    /**
     * Get product images
     */
    public function getProductImages($product_id) {
        $sql = "SELECT * FROM product_images WHERE product_id = :product_id ORDER BY sort_order ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':product_id' => $product_id]);
        return $stmt->fetchAll();
    }

    /**
     * Get product variants
     */
    public function getProductVariants($product_id) {
        $sql = "SELECT * FROM product_variants WHERE product_id = :product_id ORDER BY size, color";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':product_id' => $product_id]);
        return $stmt->fetchAll();
    }

    /**
     * Create new product
     */
    public function createProduct($data) {
        $sql = "INSERT INTO {$this->table} 
                (category_id, product_name, description, base_price, stock_quantity, sku, brand, status)
                VALUES 
                (:category_id, :product_name, :description, :base_price, :stock_quantity, :sku, :brand, :status)";
        
        $stmt = $this->db->prepare($sql);
        
        $params = [
            ':category_id' => $data['category_id'],
            ':product_name' => sanitize($data['product_name']),
            ':description' => sanitize($data['description']),
            ':base_price' => $data['base_price'],
            ':stock_quantity' => $data['stock_quantity'],
            ':sku' => !empty($data['sku']) ? $data['sku'] : generateSKU(),
            ':brand' => isset($data['brand']) ? sanitize($data['brand']) : '',
            ':status' => isset($data['status']) ? $data['status'] : 'active'
        ];

        if ($stmt->execute($params)) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    /**
     * Update product
     */
    public function updateProduct($product_id, $data) {
        $sql = "UPDATE {$this->table} SET
                category_id = :category_id,
                product_name = :product_name,
                description = :description,
                base_price = :base_price,
                stock_quantity = :stock_quantity,
                brand = :brand,
                status = :status
                WHERE product_id = :product_id";
        
        $stmt = $this->db->prepare($sql);
        
        $params = [
            ':product_id' => $product_id,
            ':category_id' => $data['category_id'],
            ':product_name' => sanitize($data['product_name']),
            ':description' => sanitize($data['description']),
            ':base_price' => $data['base_price'],
            ':stock_quantity' => $data['stock_quantity'],
            ':brand' => isset($data['brand']) ? sanitize($data['brand']) : '',
            ':status' => $data['status']
        ];

        return $stmt->execute($params);
    }

    /**
     * Delete product
     */
    public function deleteProduct($product_id) {
        // Delete related records first
        $this->db->prepare("DELETE FROM product_images WHERE product_id = :product_id")
                 ->execute([':product_id' => $product_id]);
        
        $this->db->prepare("DELETE FROM product_variants WHERE product_id = :product_id")
                 ->execute([':product_id' => $product_id]);
        
        // Delete product
        $sql = "DELETE FROM {$this->table} WHERE product_id = :product_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':product_id' => $product_id]);
    }

    /**
     * Add product image
     */
    public function addProductImage($product_id, $image_url, $is_primary = 0, $sort_order = 0) {
        $sql = "INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
                VALUES (:product_id, :image_url, :is_primary, :sort_order)";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':product_id' => $product_id,
            ':image_url' => $image_url,
            ':is_primary' => $is_primary,
            ':sort_order' => $sort_order
        ]);
    }

    /**
     * Update stock quantity
     */
    public function updateStock($product_id, $quantity, $operation = 'set') {
        if ($operation === 'add') {
            $sql = "UPDATE {$this->table} SET stock_quantity = stock_quantity + :quantity WHERE product_id = :product_id";
        } elseif ($operation === 'subtract') {
            $sql = "UPDATE {$this->table} SET stock_quantity = stock_quantity - :quantity WHERE product_id = :product_id AND stock_quantity >= :quantity";
        } else {
            $sql = "UPDATE {$this->table} SET stock_quantity = :quantity WHERE product_id = :product_id";
        }
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':product_id' => $product_id,
            ':quantity' => $quantity
        ]);
    }

    /**
     * Get low stock products
     */
    public function getLowStockProducts($threshold = LOW_STOCK_THRESHOLD) {
        $sql = "SELECT p.*, c.category_name
                FROM {$this->table} p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE p.stock_quantity <= :threshold AND p.status = 'active'
                ORDER BY p.stock_quantity ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':threshold' => $threshold]);
        return $stmt->fetchAll();
    }

    /**
     * Get product statistics
     */
    public function getProductStats() {
        $stats = [];

        // Total products
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM {$this->table}");
        $stats['total_products'] = $stmt->fetch()['total'];

        // Active products
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM {$this->table} WHERE status = 'active'");
        $stats['active_products'] = $stmt->fetch()['total'];

        // Out of stock
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM {$this->table} WHERE stock_quantity = 0");
        $stats['out_of_stock'] = $stmt->fetch()['total'];

        // Low stock
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM {$this->table} WHERE stock_quantity > 0 AND stock_quantity <= :threshold");
        $stmt->execute([':threshold' => LOW_STOCK_THRESHOLD]);
        $stats['low_stock'] = $stmt->fetch()['total'];

        // Average price
        $stmt = $this->db->query("SELECT AVG(base_price) as avg_price FROM {$this->table} WHERE status = 'active'");
        $stats['avg_price'] = round($stmt->fetch()['avg_price'], 2);

        // Total stock value
        $stmt = $this->db->query("SELECT SUM(base_price * stock_quantity) as total_value FROM {$this->table}");
        $stats['stock_value'] = round($stmt->fetch()['total_value'], 2);

        return $stats;
    }

    /**
     * Search products
     */
    public function searchProducts($query, $limit = 10) {
        $sql = "SELECT p.*, c.category_name,
                (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image
                FROM {$this->table} p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE (p.product_name LIKE :query OR p.description LIKE :query OR p.sku LIKE :query)
                AND p.status = 'active'
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':query', '%' . $query . '%', PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
?>