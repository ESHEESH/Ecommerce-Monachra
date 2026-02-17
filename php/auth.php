<?php
require_once 'config.php';

class AuthManager {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function register($email, $password, $first_name, $last_name) {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Email already registered'];
        }

        $hashed_password = password_hash($password, PASSWORD_BCRYPT);
        
        $stmt = $this->db->prepare("INSERT INTO users (email, password, first_name, last_name) 
                                    VALUES (:email, :password, :first_name, :last_name)");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $hashed_password);
        $stmt->bindParam(':first_name', $first_name);
        $stmt->bindParam(':last_name', $last_name);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Registration successful'];
        }
        
        return ['success' => false, 'message' => 'Registration failed'];
    }

    public function login($email, $password) {
        $stmt = $this->db->prepare("SELECT id, email, password, first_name, is_admin FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            return ['success' => false, 'message' => 'Invalid email or password'];
        }

        startSession();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['is_admin'] = $user['is_admin'];

        return ['success' => true, 'message' => 'Login successful', 'user' => $user];
    }

    public function logout() {
        startSession();
        session_destroy();
        return ['success' => true, 'message' => 'Logged out successfully'];
    }

    public function getUserById($user_id) {
        $stmt = $this->db->prepare("SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = :id");
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function updateProfile($user_id, $data) {
        $stmt = $this->db->prepare("UPDATE users SET first_name = :first_name, last_name = :last_name, phone = :phone WHERE id = :id");
        $stmt->bindParam(':first_name', $data['first_name']);
        $stmt->bindParam(':last_name', $data['last_name']);
        $stmt->bindParam(':phone', $data['phone']);
        $stmt->bindParam(':id', $user_id);
        return $stmt->execute();
    }

    public function changePassword($user_id, $old_password, $new_password) {
        $stmt = $this->db->prepare("SELECT password FROM users WHERE id = :id");
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
        $user = $stmt->fetch();

        if (!password_verify($old_password, $user['password'])) {
            return ['success' => false, 'message' => 'Current password is incorrect'];
        }

        $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
        $stmt = $this->db->prepare("UPDATE users SET password = :password WHERE id = :id");
        $stmt->bindParam(':password', $hashed_password);
        $stmt->bindParam(':id', $user_id);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Password changed successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to change password'];
    }
}
?>
