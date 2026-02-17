<?php
require_once 'config.php';

class CartManager {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getOrCreateCart($user_id = null) {
        startSession();
        
        if ($user_id) {
            $stmt = $this->db->prepare("SELECT id FROM cart WHERE user_id = :user_id");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            $cart = $stmt->fetch();
            
            if ($cart) {
                return $cart['id'];
            }
            
            $stmt = $this->db->prepare("INSERT INTO cart (user_id) VALUES (:user_id)");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            return $this->db->lastInsertId();
        } else {
            if (!isset($_SESSION['cart_id'])) {
                $session_id = session_id();
                $stmt = $this->db->prepare("INSERT INTO cart (session_id) VALUES (:session_id)");
                $stmt->bindParam(':session_id', $session_id);
                $stmt->execute();
                $_SESSION['cart_id'] = $this->db->lastInsertId();
            }
            return $_SESSION['cart_id'];
        }
    }

    public function addToCart($product_id, $quantity = 1, $user_id = null) {
        $cart_id = $this->getOrCreateCart($user_id);
        
        $stmt = $this->db->prepare("SELECT price FROM products WHERE id = :product_id");
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();
        $product = $stmt->fetch();
        
        if (!$product) {
            return ['success' => false, 'message' => 'Product not found'];
        }

        $stmt = $this->db->prepare("SELECT id, quantity FROM cart_items WHERE cart_id = :cart_id AND product_id = :product_id");
        $stmt->bindParam(':cart_id', $cart_id);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();
        $existing = $stmt->fetch();

        if ($existing) {
            $new_quantity = $existing['quantity'] + $quantity;
            $stmt = $this->db->prepare("UPDATE cart_items SET quantity = :quantity WHERE id = :id");
            $stmt->bindParam(':quantity', $new_quantity);
            $stmt->bindParam(':id', $existing['id']);
            $stmt->execute();
        } else {
            $stmt = $this->db->prepare("INSERT INTO cart_items (cart_id, product_id, quantity, price) 
                                        VALUES (:cart_id, :product_id, :quantity, :price)");
            $stmt->bindParam(':cart_id', $cart_id);
            $stmt->bindParam(':product_id', $product_id);
            $stmt->bindParam(':quantity', $quantity);
            $stmt->bindParam(':price', $product['price']);
            $stmt->execute();
        }

        return ['success' => true, 'message' => 'Product added to cart'];
    }

    public function getCartItems($user_id = null) {
        $cart_id = $this->getOrCreateCart($user_id);
        
        $stmt = $this->db->prepare("SELECT ci.*, p.name, p.image_url FROM cart_items ci 
                                    JOIN products p ON ci.product_id = p.id 
                                    WHERE ci.cart_id = :cart_id");
        $stmt->bindParam(':cart_id', $cart_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function updateCartItem($item_id, $quantity) {
        if ($quantity <= 0) {
            return $this->removeCartItem($item_id);
        }

        $stmt = $this->db->prepare("UPDATE cart_items SET quantity = :quantity WHERE id = :id");
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':id', $item_id);
        return $stmt->execute();
    }

    public function removeCartItem($item_id) {
        $stmt = $this->db->prepare("DELETE FROM cart_items WHERE id = :id");
        $stmt->bindParam(':id', $item_id);
        return $stmt->execute();
    }

    public function clearCart($user_id = null) {
        $cart_id = $this->getOrCreateCart($user_id);
        $stmt = $this->db->prepare("DELETE FROM cart_items WHERE cart_id = :cart_id");
        $stmt->bindParam(':cart_id', $cart_id);
        return $stmt->execute();
    }

    public function getCartTotal($user_id = null) {
        $cart_id = $this->getOrCreateCart($user_id);
        
        $stmt = $this->db->prepare("SELECT SUM(quantity * price) as total FROM cart_items WHERE cart_id = :cart_id");
        $stmt->bindParam(':cart_id', $cart_id);
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['total'] ?? 0;
    }

    public function getCartCount($user_id = null) {
        $cart_id = $this->getOrCreateCart($user_id);
        
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM cart_items WHERE cart_id = :cart_id");
        $stmt->bindParam(':cart_id', $cart_id);
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['count'] ?? 0;
    }
}
?>
