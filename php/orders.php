<?php
require_once 'config.php';

class OrderManager {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function createOrder($user_id, $cart_items, $shipping_address, $billing_address, $totals) {
        try {
            $this->db->beginTransaction();

            $order_number = 'ORD-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
            
            $stmt = $this->db->prepare("INSERT INTO orders 
                                        (user_id, order_number, subtotal, tax, shipping, total, shipping_address, billing_address) 
                                        VALUES (:user_id, :order_number, :subtotal, :tax, :shipping, :total, :shipping_address, :billing_address)");
            
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':order_number', $order_number);
            $stmt->bindParam(':subtotal', $totals['subtotal']);
            $stmt->bindParam(':tax', $totals['tax']);
            $stmt->bindParam(':shipping', $totals['shipping']);
            $stmt->bindParam(':total', $totals['total']);
            $stmt->bindParam(':shipping_address', $shipping_address);
            $stmt->bindParam(':billing_address', $billing_address);
            $stmt->execute();

            $order_id = $this->db->lastInsertId();

            foreach ($cart_items as $item) {
                $stmt = $this->db->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) 
                                            VALUES (:order_id, :product_id, :quantity, :price)");
                $stmt->bindParam(':order_id', $order_id);
                $stmt->bindParam(':product_id', $item['product_id']);
                $stmt->bindParam(':quantity', $item['quantity']);
                $stmt->bindParam(':price', $item['price']);
                $stmt->execute();

                $stmt = $this->db->prepare("UPDATE products SET quantity = quantity - :quantity WHERE id = :product_id");
                $stmt->bindParam(':quantity', $item['quantity']);
                $stmt->bindParam(':product_id', $item['product_id']);
                $stmt->execute();

                $stmt = $this->db->prepare("INSERT INTO stock_movements (product_id, quantity_change, reason, reference_id) 
                                            VALUES (:product_id, :quantity_change, 'purchase', :reference_id)");
                $stmt->bindParam(':product_id', $item['product_id']);
                $quantity_change = -$item['quantity'];
                $stmt->bindParam(':quantity_change', $quantity_change);
                $stmt->bindParam(':reference_id', $order_id);
                $stmt->execute();
            }

            $this->db->commit();
            return ['success' => true, 'order_id' => $order_id, 'order_number' => $order_number];
        } catch (Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function getOrderById($order_id) {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = :id");
        $stmt->bindParam(':id', $order_id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function getOrderItems($order_id) {
        $stmt = $this->db->prepare("SELECT oi.*, p.name, p.image_url FROM order_items oi 
                                    JOIN products p ON oi.product_id = p.id 
                                    WHERE oi.order_id = :order_id");
        $stmt->bindParam(':order_id', $order_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getUserOrders($user_id) {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function updateOrderStatus($order_id, $status) {
        $stmt = $this->db->prepare("UPDATE orders SET status = :status WHERE id = :id");
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $order_id);
        return $stmt->execute();
    }

    public function updatePaymentStatus($order_id, $payment_status) {
        $stmt = $this->db->prepare("UPDATE orders SET payment_status = :payment_status WHERE id = :id");
        $stmt->bindParam(':payment_status', $payment_status);
        $stmt->bindParam(':id', $order_id);
        return $stmt->execute();
    }

    public function getAllOrders($limit = 20, $offset = 0) {
        $stmt = $this->db->prepare("SELECT o.*, u.email, u.first_name, u.last_name FROM orders o 
                                    LEFT JOIN users u ON o.user_id = u.id 
                                    ORDER BY o.created_at DESC 
                                    LIMIT :limit OFFSET :offset");
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getTotalRevenue() {
        $stmt = $this->db->prepare("SELECT SUM(total) as revenue FROM orders WHERE payment_status = 'completed'");
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['revenue'] ?? 0;
    }

    public function getTotalOrders() {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM orders");
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['count'] ?? 0;
    }
}
?>
