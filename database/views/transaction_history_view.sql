-- Transaction History View
-- Provides aggregated transaction data for listing page
-- One row per transaction with item count, user info, resident info, building/unit details

CREATE OR ALTER VIEW TransactionHistoryView AS
SELECT
    t.id AS transaction_id,
    t.transaction_date,
    t.transaction_type,
    tt.transaction_type AS transaction_type_name,
    u.id AS user_id,
    u.name AS user_name,
    r.id AS resident_id,
    r.name AS resident_name,
    b.id AS building_id,
    b.code AS building_code,
    un.id AS unit_id,
    un.unit_number AS unit_number,
    COUNT(ti.id) AS item_count,
    SUM(ti.quantity) AS total_quantity
FROM Transactions t
INNER JOIN Users u ON t.user_id = u.id
LEFT JOIN Residents r ON t.resident_id = r.id
LEFT JOIN Units un ON r.unit_id = un.id
LEFT JOIN Buildings b ON un.building_id = b.id
INNER JOIN TransactionTypes tt ON t.transaction_type = tt.id
LEFT JOIN TransactionItems ti ON t.id = ti.transaction_id
GROUP BY
    t.id,
    t.transaction_date,
    t.transaction_type,
    tt.transaction_type,
    u.id,
    u.name,
    r.id,
    r.name,
    b.id,
    b.code,
    un.id,
    un.unit_number;
GO
