# Navicat Lite Query Guide - ZYLO Database

**Database:** `nexgen` (Aiven MariaDB)  
**Tables:** 17 main tables  
**Type:** Multi-vendor e-commerce marketplace

---

## PART 1: CONNECTION SETUP

### Step 1: Create New Connection in Navicat Lite

1. **Open Navicat Lite**
2. Click **File → New Connection → MySQL**
3. Fill in the details:

```
Connection Name:  Aiven MariaDB
Host Name:        mariadb-xxxxx.aivencloud.com  (from Aiven console)
Port:             3306
User Name:        avnadmin
Password:         [Your password from Aiven]
Database:         nexgen
```

4. Click **Test Connection** → Should show "Connection successful"
5. Click **OK** to save

---

## PART 2: DATABASE STRUCTURE OVERVIEW

### 17 Tables in `nexgen` Database

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `user` | Accounts (buyers/sellers/admins) | id, email, role, status |
| `seller` | Seller accounts & stores | id, userId, storeName, storeSlug |
| `store` | Individual seller stores | id, sellerId, name, slug |
| `product` | Products | id, sellerId, storeId, categoryId, title, basePrice |
| `productvariant` | Product options (size, color, etc.) | id, productId, sku, stockQuantity |
| `productimage` | Product images | id, productId, url, isPrimary |
| `category` | Product categories | id, slug, name, parentCategoryId |
| `cart` | Shopping carts | id, createdBy, status |
| `cartitem` | Items in cart | id, cartId, variantId, quantity |
| `order` | Customer orders | id, userId, totalAmount, status |
| `orderitem` | Products in order | id, orderId, variantId, sellerId, quantity |
| `orderstatushistory` | Order status changes | id, orderId, status, changedAt |
| `address` | User addresses (shipping/billing) | id, userId, streetAddress, city |
| `transaction` | Payment records | id, orderId, provider, amount, status |
| `review` | Product reviews | id, userId, productId, rating, comment |
| `promotion` | Discounts & promotions | id, code, discountType, discountValue |
| `credential` | Login credentials & passwords | providerId, userId, passwordHash |

---

## PART 3: ESSENTIAL QUERIES

### USER QUERIES

#### 1. All Active Users
```sql
SELECT id, email, name, role, status, createdAt
FROM user
WHERE status = 'active'
ORDER BY createdAt DESC;
```

#### 2. Count Users by Role
```sql
SELECT 
  role,
  COUNT(*) as total_users
FROM user
GROUP BY role;
```

#### 3. Seller Accounts with Store Info
```sql
SELECT 
  u.id,
  u.email,
  u.name,
  s.storeName,
  s.storeSlug,
  s.verified,
  s.rating,
  s.createdAt
FROM user u
LEFT JOIN seller s ON u.id = s.userId
WHERE u.role = 'seller'
ORDER BY s.createdAt DESC;
```

#### 4. Users with Their Addresses
```sql
SELECT 
  u.email,
  u.name,
  a.streetAddress,
  a.city,
  a.state,
  a.country,
  a.isDefault
FROM user u
LEFT JOIN address a ON u.id = a.userId
WHERE u.id = 'USER_ID_HERE';
```

---

### PRODUCT QUERIES

#### 5. All Published Products with Category & Seller
```sql
SELECT 
  p.id,
  p.title,
  p.basePrice,
  p.status,
  c.name as category,
  s.storeName,
  COUNT(DISTINCT pv.id) as variant_count,
  p.createdAt
FROM product p
LEFT JOIN category c ON p.categoryId = c.id
LEFT JOIN seller s ON p.sellerId = s.id
LEFT JOIN productvariant pv ON p.id = pv.productId
WHERE p.status = 'published'
GROUP BY p.id
ORDER BY p.createdAt DESC;
```

#### 6. Products Low in Stock
```sql
SELECT 
  p.id,
  p.title,
  pv.sku,
  pv.stockQuantity,
  COALESCE(pv.priceOverride, p.basePrice) as price
FROM product p
JOIN productvariant pv ON p.id = pv.productId
WHERE pv.stockQuantity < 10
ORDER BY pv.stockQuantity ASC;
```

#### 7. Product Variants with Pricing
```sql
SELECT 
  p.title,
  pv.id,
  pv.sku,
  pv.stockQuantity,
  p.basePrice as base_price,
  pv.priceOverride,
  COALESCE(pv.priceOverride, p.basePrice) as effective_price,
  pv.attributes
FROM productvariant pv
JOIN product p ON pv.productId = p.id
WHERE p.id = 'PRODUCT_ID_HERE'
ORDER BY pv.id;
```

#### 8. Products by Category with Image Count
```sql
SELECT 
  c.name as category,
  COUNT(DISTINCT p.id) as product_count,
  COUNT(DISTINCT pi.id) as total_images,
  SUM(pv.stockQuantity) as total_stock
FROM category c
LEFT JOIN product p ON c.id = p.categoryId
LEFT JOIN productimage pi ON p.id = pi.productId
LEFT JOIN productvariant pv ON p.id = pv.productId
GROUP BY c.id, c.name
ORDER BY product_count DESC;
```

---

### ORDER QUERIES

#### 9. Recent Orders with Customer & Total
```sql
SELECT 
  o.id,
  u.email as customer_email,
  u.name as customer_name,
  o.totalAmount,
  o.taxAmount,
  o.shippingCost,
  o.status,
  o.createdAt
FROM `order` o
JOIN user u ON o.userId = u.id
ORDER BY o.createdAt DESC
LIMIT 20;
```

#### 10. Orders by Status
```sql
SELECT 
  status,
  COUNT(*) as order_count,
  SUM(totalAmount) as total_revenue,
  AVG(totalAmount) as avg_order_value
FROM `order`
GROUP BY status
ORDER BY order_count DESC;
```

#### 11. Order Details with Items
```sql
SELECT 
  o.id as order_id,
  u.email as customer,
  p.title as product,
  pv.sku,
  oi.quantity,
  oi.unitPrice,
  (oi.quantity * oi.unitPrice) as item_total,
  s.storeName as seller,
  o.status
FROM `order` o
JOIN user u ON o.userId = u.id
JOIN orderitem oi ON o.id = oi.orderId
JOIN productvariant pv ON oi.variantId = pv.id
JOIN product p ON pv.productId = p.id
JOIN seller s ON oi.sellerId = s.id
WHERE o.id = 'ORDER_ID_HERE'
ORDER BY oi.id;
```

#### 12. Order Status History
```sql
SELECT 
  o.id as order_id,
  u.email,
  osh.status,
  osh.changedAt,
  osh.notes
FROM orderstatushistory osh
JOIN `order` o ON osh.orderId = o.id
JOIN user u ON o.userId = u.id
WHERE o.id = 'ORDER_ID_HERE'
ORDER BY osh.changedAt DESC;
```

---

### SELLER & REVENUE QUERIES

#### 13. Top Sellers by Order Count
```sql
SELECT 
  s.id,
  s.storeName,
  s.storeSlug,
  s.verified,
  s.rating,
  COUNT(DISTINCT oi.orderId) as total_orders,
  SUM(oi.quantity * oi.unitPrice) as total_revenue
FROM seller s
LEFT JOIN orderitem oi ON s.id = oi.sellerId
GROUP BY s.id
ORDER BY total_revenue DESC
LIMIT 10;
```

#### 14. Seller Ledger - Pending Payouts
```sql
SELECT 
  s.storeName,
  sl.id,
  sl.amount,
  sl.feeDeducted,
  sl.netPayout,
  sl.payoutStatus,
  sl.processedAt,
  oi.id as orderitem_id
FROM sellerledger sl
JOIN seller s ON sl.sellerId = s.id
JOIN orderitem oi ON sl.orderItemId = oi.id
WHERE sl.payoutStatus = 'pending'
ORDER BY sl.amount DESC;
```

#### 15. Seller Revenue by Month
```sql
SELECT 
  s.storeName,
  YEAR(oi.createdAt) as year,
  MONTH(oi.createdAt) as month,
  COUNT(DISTINCT oi.orderId) as orders,
  SUM(oi.quantity * oi.unitPrice) as revenue
FROM seller s
JOIN orderitem oi ON s.id = oi.sellerId
GROUP BY s.id, YEAR(oi.createdAt), MONTH(oi.createdAt)
ORDER BY year DESC, month DESC;
```

---

### CART QUERIES

#### 16. Active Shopping Carts with Items
```sql
SELECT 
  c.id as cart_id,
  u.email,
  COUNT(ci.id) as item_count,
  SUM(ci.quantity) as total_items,
  c.createdAt
FROM cart c
JOIN user u ON c.createdBy = u.id
LEFT JOIN cartitem ci ON c.id = ci.cartId
WHERE c.status = 'active'
GROUP BY c.id
ORDER BY c.createdAt DESC;
```

#### 17. Cart Details
```sql
SELECT 
  c.id as cart_id,
  u.email,
  p.title as product,
  pv.sku,
  ci.quantity,
  COALESCE(pv.priceOverride, p.basePrice) as price,
  ci.quantity * COALESCE(pv.priceOverride, p.basePrice) as line_total
FROM cart c
JOIN user u ON c.createdBy = u.id
JOIN cartitem ci ON c.id = ci.cartId
JOIN productvariant pv ON ci.variantId = pv.id
JOIN product p ON pv.productId = p.id
WHERE c.id = 'CART_ID_HERE'
ORDER BY ci.createdAt DESC;
```

---

### REVIEW & RATING QUERIES

#### 18. Product Reviews Summary
```sql
SELECT 
  p.title,
  COUNT(r.id) as review_count,
  ROUND(AVG(r.rating), 2) as avg_rating,
  MIN(r.rating) as min_rating,
  MAX(r.rating) as max_rating
FROM review r
RIGHT JOIN product p ON r.productId = p.id
GROUP BY p.id
ORDER BY review_count DESC;
```

#### 19. Recent Reviews with Details
```sql
SELECT 
  p.title as product,
  u.email as reviewer,
  r.rating,
  r.comment,
  r.createdAt
FROM review r
JOIN user u ON r.userId = u.id
JOIN product p ON r.productId = p.id
ORDER BY r.createdAt DESC
LIMIT 20;
```

---

### PROMOTION QUERIES

#### 20. Active Promotions
```sql
SELECT 
  id,
  name,
  code,
  type,
  discountType,
  discountValue,
  minSpend,
  usageLimit,
  usageCount,
  startsAt,
  endsAt,
  isActive
FROM promotion
WHERE isActive = 1
  AND startsAt <= NOW()
  AND endsAt >= NOW()
ORDER BY endsAt ASC;
```

#### 21. Promotion Usage Stats
```sql
SELECT 
  name,
  code,
  usageCount,
  usageLimit,
  ROUND((usageCount / usageLimit) * 100, 2) as usage_percentage,
  startsAt,
  endsAt
FROM promotion
WHERE isActive = 1
ORDER BY usage_percentage DESC;
```

---

### TRANSACTION QUERIES

#### 22. Payment Status Report
```sql
SELECT 
  status,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM `transaction`
GROUP BY status;
```

#### 23. Recent Transactions
```sql
SELECT 
  t.id,
  o.id as order_id,
  u.email as customer,
  t.provider,
  t.amount,
  t.status,
  t.createdAt
FROM `transaction` t
JOIN `order` o ON t.orderId = o.id
JOIN user u ON o.userId = u.id
ORDER BY t.createdAt DESC
LIMIT 20;
```

---

## PART 4: ADVANCED QUERIES

#### 24. Dashboard: Sales Overview (Last 7 Days)
```sql
SELECT 
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.totalAmount) as total_revenue,
  COUNT(DISTINCT o.userId) as unique_customers,
  ROUND(AVG(o.totalAmount), 2) as avg_order_value,
  DATE(o.createdAt) as date
FROM `order` o
WHERE o.createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND o.status != 'cancelled'
GROUP BY DATE(o.createdAt)
ORDER BY date DESC;
```

#### 25. Customer Lifetime Value
```sql
SELECT 
  u.id,
  u.email,
  u.name,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.totalAmount) as lifetime_value,
  MAX(o.createdAt) as last_order_date,
  MIN(o.createdAt) as first_order_date
FROM user u
LEFT JOIN `order` o ON u.id = o.userId
WHERE u.role = 'buyer'
GROUP BY u.id
ORDER BY lifetime_value DESC
LIMIT 20;
```

#### 26. Inventory Alert: Critical Stock Levels
```sql
SELECT 
  p.id,
  p.title,
  s.storeName,
  pv.sku,
  pv.stockQuantity,
  COALESCE(pv.priceOverride, p.basePrice) as price,
  (SELECT COUNT(*) FROM orderitem WHERE variantId = pv.id AND orderitem.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as sold_last_month
FROM productvariant pv
JOIN product p ON pv.productId = p.id
JOIN seller s ON p.sellerId = s.id
WHERE pv.stockQuantity < 5
ORDER BY pv.stockQuantity ASC;
```

#### 27. Seller Performance Scorecard
```sql
SELECT 
  s.storeName,
  s.verified,
  s.rating,
  COUNT(DISTINCT p.id) as active_products,
  COUNT(DISTINCT oi.orderId) as total_sales,
  SUM(oi.quantity * oi.unitPrice) as gross_revenue,
  SUM(sl.feeDeducted) as platform_fees,
  SUM(sl.netPayout) as net_payout,
  COUNT(CASE WHEN sl.payoutStatus = 'pending' THEN 1 END) as pending_payouts
FROM seller s
LEFT JOIN product p ON s.id = p.sellerId AND p.status = 'published'
LEFT JOIN orderitem oi ON s.id = oi.sellerId
LEFT JOIN sellerledger sl ON oi.id = sl.orderItemId
GROUP BY s.id
ORDER BY gross_revenue DESC;
```

---

## PART 5: QUICK REFERENCE - SQL SNIPPETS

### Update Product Stock
```sql
UPDATE productvariant
SET stockQuantity = stockQuantity - 1,
    updatedAt = NOW()
WHERE id = 'VARIANT_ID_HERE'
  AND stockQuantity > 0;
```

### Bulk Update Order Status
```sql
UPDATE `order`
SET status = 'shipped',
    updatedAt = NOW()
WHERE id IN ('ORDER_ID_1', 'ORDER_ID_2', 'ORDER_ID_3');
```

### Insert Order Status Change
```sql
INSERT INTO orderstatushistory (id, orderId, status, changedAt, notes)
VALUES (UUID(), 'ORDER_ID_HERE', 'shipped', NOW(), 'Package picked up by courier');
```

### Delete Inactive Carts (30+ days old)
```sql
DELETE FROM cart
WHERE status = 'active'
  AND createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND id NOT IN (SELECT cartId FROM cartitem);
```

---

## PART 6: HELPFUL NAVICAT LITE TIPS

### Filter & Sort in Query Results
1. Run any query
2. Right-click column header → **Sort Ascending/Descending**
3. Click funnel icon → **Add Filter**

### Export Query Results
1. Run query
2. Right-click result grid → **Export**
3. Choose: CSV, Excel, JSON, etc.

### Save Custom Queries
1. Write query in **SQL Editor**
2. File → **Save** (Ctrl+S)
3. Saved queries appear in **Query** menu

### Create Views (Saved Complex Queries)
```sql
CREATE VIEW v_seller_performance AS
[Your complex query here]
```
Then use as: `SELECT * FROM v_seller_performance`

### Schedule Automated Exports
Right-click database → **Tools** → **Scheduled Task**

---

## PART 7: COMMON TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Can't connect to Aiven | Verify hostname & password in Aiven console. Check firewall allows port 3306. |
| Query returns empty | Add `WHERE` conditions. Check table names (lowercase). Use backticks for reserved words like `order` |
| Slow queries | Add indexes. See `@@index` in Prisma schema for existing ones. |
| Decimal precision issues | Use `CAST()` or `DECIMAL()` functions. All prices stored as DECIMAL(12,2) |
| Special characters in names | Wrap in backticks: `` `column-name` `` |

---

**Last Updated:** May 6, 2026  
**Database:** Aiven MariaDB (nexgen)  
**Schema Version:** Current
