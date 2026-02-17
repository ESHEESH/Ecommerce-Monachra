<?php
require_once 'config.php';

class ProductManager {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllProducts($limit = null, $offset = 0) {
        $query = "SELECT p.*, c.name as category_name FROM products p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  WHERE p.is_active = TRUE 
                  ORDER BY p.created_at DESC";
        
        if ($limit) {
            $query .= " LIMIT :limit OFFSET :offset";
        }

        $stmt = $this->db->prepare($query);
        if ($limit) {
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getProductById($id) {
        $stmt = $this->db->prepare("SELECT p.*, c.name as category_name FROM products p 
                                    LEFT JOIN categories c ON p.category_id = c.id 
                                    WHERE p.id = :id AND p.is_active = TRUE");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function getProductsByCategory($category_id, $limit = null, $offset = 0) {
        $query = "SELECT p.*, c.name as category_name FROM products p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  WHERE p.category_id = :category_id AND p.is_active = TRUE 
                  ORDER BY p.created_at DESC";
        
        if ($limit) {
            $query .= " LIMIT :limit OFFSET :offset";
        }

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
        if ($limit) {
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function searchProducts($search_term) {
        $search = "%{$search_term}%";
        $stmt = $this->db->prepare("SELECT p.*, c.name as category_name FROM products p 
                                    LEFT JOIN categories c ON p.category_id = c.id 
                                    WHERE (p.name LIKE :search OR p.description LIKE :search) 
                                    AND p.is_active = TRUE 
                                    ORDER BY p.name ASC");
        $stmt->bindParam(':search', $search);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getCategories() {
        $stmt = $this->db->prepare("SELECT * FROM categories ORDER BY name ASC");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function addProduct($data) {
        $stmt = $this->db->prepare("INSERT INTO products 
                                    (category_id, name, slug, description, price, sku, quantity, image_url) 
                                    VALUES (:category_id, :name, :slug, :description, :price, :sku, :quantity, :image_url)");
        
        $slug = strtolower(str_replace(' ', '-', $data['name']));
        
        $stmt->bindParam(':category_id', $data['category_id']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':price', $data['price']);
        $stmt->bindParam(':sku', $data['sku']);
        $stmt->bindParam(':quantity', $data['quantity']);
        $stmt->bindParam(':image_url', $data['image_url']);
        
        return $stmt->execute();
    }

    public function updateProduct($id, $data) {
        $stmt = $this->db->prepare("UPDATE products SET 
                                    category_id = :category_id,
                                    name = :name,
                                    description = :description,
                                    price = :price,
                                    quantity = :quantity,
                                    image_url = :image_url
                                    WHERE id = :id");
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':category_id', $data['category_id']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':price', $data['price']);
        $stmt->bindParam(':quantity', $data['quantity']);
        $stmt->bindParam(':image_url', $data['image_url']);
        
        return $stmt->execute();
    }

    public function deleteProduct($id) {
        $stmt = $this->db->prepare("DELETE FROM products WHERE id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function getLowStockProducts($threshold = 10) {
        $stmt = $this->db->prepare("SELECT * FROM products WHERE quantity <= :threshold AND is_active = TRUE");
        $stmt->bindParam(':threshold', $threshold);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
?>
