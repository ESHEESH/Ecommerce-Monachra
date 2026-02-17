<?php
/**
 * Product Import Script
 * Run this file to import tops and pants products
 * Visit: http://localhost/monochra/import.php
 */

require_once 'php/config.php';

// Set content type
header('Content-Type: text/html; charset=utf-8');

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Import Products - MONOCHRA</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            padding: 40px 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            font-size: 32px;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .status {
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: #000;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 14px;
            letter-spacing: 1px;
            border: none;
            cursor: pointer;
        }
        .btn:hover {
            background: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f8f8f8;
            font-weight: 600;
            font-size: 12px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            background: #000;
            color: white;
            border-radius: 3px;
            font-size: 11px;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>MONOCHRA</h1>
        <div class="subtitle">Product Import Tool</div>

<?php

if (isset($_POST['import'])) {
    try {
        $db = Database::getInstance()->getConnection();
        
        // Start transaction
        $db->beginTransaction();
        
        // Pants Products
        $pants = [
            ['Classic Tailored Trousers', 'classic-tailored-trousers', 'Premium wool blend trousers with a timeless silhouette', 245.00, 'PNT-001', 25, 'pants/download (4).jfif'],
            ['Wide Leg Palazzo Pants', 'wide-leg-palazzo-pants', 'Flowing palazzo pants in luxurious fabric', 289.00, 'PNT-002', 30, 'pants/download (5).jfif'],
            ['High-Waist Cigarette Pants', 'high-waist-cigarette-pants', 'Sleek cigarette cut with modern high waist', 325.00, 'PNT-003', 20, 'pants/download (6).jfif'],
            ['Pleated Wool Trousers', 'pleated-wool-trousers', 'Classic pleated design in premium wool', 395.00, 'PNT-004', 18, 'pants/download (7).jfif'],
            ['Cropped Straight Leg Pants', 'cropped-straight-leg-pants', 'Contemporary cropped length with clean lines', 275.00, 'PNT-005', 28, 'pants/download (8).jfif'],
            ['Relaxed Fit Chinos', 'relaxed-fit-chinos', 'Comfortable chinos with relaxed silhouette', 220.00, 'PNT-006', 35, 'pants/download (9).jfif'],
            ['Slim Fit Dress Pants', 'slim-fit-dress-pants', 'Tailored slim fit for formal occasions', 340.00, 'PNT-007', 22, 'pants/download (10).jfif'],
            ['Barrel Leg Trousers', 'barrel-leg-trousers', 'Trendy barrel leg silhouette', 425.00, 'PNT-008', 15, 'pants/download (11).jfif'],
            ['Pinstripe Business Pants', 'pinstripe-business-pants', 'Professional pinstripe pattern', 380.00, 'PNT-009', 20, 'pants/download (12).jfif'],
            ['Cargo Utility Pants', 'cargo-utility-pants', 'Modern cargo style with multiple pockets', 295.00, 'PNT-010', 32, 'pants/download (13).jfif'],
            ['Flared Pleated Denim Skirt', 'flared-pleated-denim-skirt', 'High-rise denim miniskirt with pleated details', 265.00, 'PNT-011', 24, 'pants/Flared pleated high-rise denim miniskirt.jfif']
        ];
        
        // Tops Products
        $tops = [
            ['Cotton Linen Knit Polo', 'cotton-linen-knit-polo', 'Breathable cotton-linen blend polo shirt', 185.00, 'TOP-001', 40, 'tops/COTTON LINEN KNIT POLO SHIRT.jfif'],
            ['Classic Knit Polo Shirt', 'classic-knit-polo-shirt', 'Timeless knit polo in premium cotton', 165.00, 'TOP-002', 45, 'tops/KNIT POLO SHIRT.jfif'],
            ['Lace Bows Knit Sweater', 'lace-bows-knit-sweater', 'Elegant sweater with delicate lace bow details', 295.00, 'TOP-003', 28, 'tops/LACE BOWS KNIT SWEATER.jfif'],
            ['Ribbed Turtleneck Top', 'ribbed-turtleneck-top', 'Cozy ribbed knit turtleneck', 210.00, 'TOP-004', 35, 'tops/download (4).jfif'],
            ['Oversized Knit Cardigan', 'oversized-knit-cardigan', 'Relaxed oversized cardigan in soft knit', 340.00, 'TOP-005', 22, 'tops/download (5).jfif'],
            ['Baby Soft Knitwear', 'baby-soft-knitwear', 'Ultra-soft premium knitwear', 225.00, 'TOP-006', 30, 'tops/Baby Girls_ Knitwear _ ZARA United States.jfif']
        ];
        
        $allProducts = array_merge($pants, $tops);
        $imported = 0;
        $productIds = [];
        
        $stmt = $db->prepare("
            INSERT INTO products (category_id, name, slug, description, price, sku, quantity, image_url, is_active)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, TRUE)
        ");
        
        foreach ($allProducts as $product) {
            $stmt->execute($product);
            $productIds[] = $db->lastInsertId();
            $imported++;
        }
        
        // Log stock movements
        $stockStmt = $db->prepare("
            INSERT INTO stock_movements (product_id, quantity_change, reason, notes)
            VALUES (?, ?, 'restock', 'Initial inventory - imported products')
        ");
        
        foreach ($productIds as $index => $productId) {
            $quantity = $allProducts[$index][5];
            $stockStmt->execute([$productId, $quantity]);
        }
        
        $db->commit();
        
        echo '<div class="status success">';
        echo '<strong>✓ Import Successful!</strong><br>';
        echo "Imported {$imported} products successfully.<br>";
        echo "Stock movements logged for all products.";
        echo '</div>';
        
        // Show imported products
        $result = $db->query("
            SELECT name, sku, CONCAT('$', FORMAT(price, 2)) as price, quantity, image_url
            FROM products
            WHERE sku LIKE 'PNT-%' OR sku LIKE 'TOP-%'
            ORDER BY sku
        ");
        
        echo '<h3 style="margin-top: 30px;">Imported Products</h3>';
        echo '<table>';
        echo '<thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Image</th></tr></thead>';
        echo '<tbody>';
        
        while ($row = $result->fetch()) {
            echo '<tr>';
            echo '<td>' . htmlspecialchars($row['name']) . '</td>';
            echo '<td><span class="badge">' . htmlspecialchars($row['sku']) . '</span></td>';
            echo '<td>' . htmlspecialchars($row['price']) . '</td>';
            echo '<td>' . htmlspecialchars($row['quantity']) . '</td>';
            echo '<td><img src="' . htmlspecialchars($row['image_url']) . '" style="width: 40px; height: 40px; object-fit: cover;"></td>';
            echo '</tr>';
        }
        
        echo '</tbody></table>';
        
        echo '<a href="html/dashboard.html" class="btn">Go to Dashboard</a>';
        echo '<a href="html/stock.html" class="btn" style="margin-left: 10px;">View Stock</a>';
        
    } catch (PDOException $e) {
        $db->rollBack();
        echo '<div class="status error">';
        echo '<strong>✗ Import Failed</strong><br>';
        echo 'Error: ' . htmlspecialchars($e->getMessage());
        echo '</div>';
        
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            echo '<div class="status info">';
            echo '<strong>Note:</strong> Products may already be imported. ';
            echo '<a href="?clear=1">Click here to clear and re-import</a>';
            echo '</div>';
        }
    }
    
} elseif (isset($_GET['clear'])) {
    try {
        $db = Database::getInstance()->getConnection();
        
        // Delete existing imports
        $db->exec("DELETE FROM products WHERE sku LIKE 'PNT-%' OR sku LIKE 'TOP-%'");
        
        echo '<div class="status success">';
        echo '<strong>✓ Cleared Successfully</strong><br>';
        echo 'Previous imports have been removed. You can now import again.';
        echo '</div>';
        
        echo '<form method="post">';
        echo '<button type="submit" name="import" class="btn">Import Products Now</button>';
        echo '</form>';
        
    } catch (PDOException $e) {
        echo '<div class="status error">';
        echo '<strong>✗ Clear Failed</strong><br>';
        echo 'Error: ' . htmlspecialchars($e->getMessage());
        echo '</div>';
    }
    
} else {
    // Show import form
    echo '<div class="status info">';
    echo '<strong>Ready to Import</strong><br>';
    echo 'This will import 17 new products (11 pants + 6 tops) into your database.';
    echo '</div>';
    
    echo '<h3>What will be imported:</h3>';
    echo '<ul style="margin: 20px 0; line-height: 1.8;">';
    echo '<li><strong>11 Pants</strong> - Price range: $220 - $425</li>';
    echo '<li><strong>6 Tops</strong> - Price range: $165 - $340</li>';
    echo '<li><strong>Total Stock Value:</strong> ~$13,000</li>';
    echo '</ul>';
    
    echo '<form method="post">';
    echo '<button type="submit" name="import" class="btn">Import Products Now</button>';
    echo '</form>';
    
    echo '<div style="margin-top: 30px; padding: 20px; background: #f8f8f8; border-radius: 4px;">';
    echo '<strong>Note:</strong> Make sure your XAMPP MySQL server is running before importing.';
    echo '</div>';
}

?>

    </div>
</body>
</html>
