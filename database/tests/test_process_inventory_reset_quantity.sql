-- Unit test for ProcessInventoryResetQuantity stored procedure
-- Tests transaction GUID handling, validation, error cases, and successful updates

PRINT '========================================';
PRINT 'Testing ProcessInventoryResetQuantity';
PRINT '========================================';
PRINT '';

-- Setup: Get a test item to work with
DECLARE @test_item_id INT = 2; -- Using item ID 2 as test item
DECLARE @test_user_id INT = 1;
DECLARE @initial_quantity INT;

-- Store initial quantity
SELECT @initial_quantity = quantity FROM Items WHERE id = @test_item_id;

PRINT '--- Initial State ---';
PRINT 'Test Item ID: ' + CAST(@test_item_id AS NVARCHAR(10));
PRINT 'Initial Quantity: ' + CAST(@initial_quantity AS NVARCHAR(10));
PRINT '';

-- TEST 1: Successful quantity reset
PRINT '--- TEST 1: Successful Quantity Reset ---';
DECLARE @txn_id_1 UNIQUEIDENTIFIER = NEWID();
PRINT 'Transaction ID: ' + CAST(@txn_id_1 AS NVARCHAR(50));

EXEC ProcessInventoryResetQuantity
    @user_id = @test_user_id,
    @item_id = @test_item_id,
    @new_quantity = 100,
    @additional_notes = '{"comments":"Test reset","howYouKnow":"counted"}',
    @new_transaction_id = @txn_id_1;

SELECT 'Item after reset:' AS Description, name, quantity
FROM Items
WHERE id = @test_item_id;

SELECT 'Transaction logged:' AS Description, id, user_id, transaction_type
FROM Transactions
WHERE id = @txn_id_1;

SELECT 'Transaction item logged:' AS Description, transaction_id, item_id, quantity, additional_notes
FROM TransactionItems
WHERE transaction_id = @txn_id_1;
PRINT '';

-- TEST 2: Duplicate transaction ID (should fail)
PRINT '--- TEST 2: Duplicate Transaction ID (Should Return Error) ---';
PRINT 'Using same transaction ID: ' + CAST(@txn_id_1 AS NVARCHAR(50));

-- Create temp table to capture result
CREATE TABLE #DuplicateResult (
    Status NVARCHAR(50),
    ErrorCode NVARCHAR(50),
    message NVARCHAR(MAX)
);

INSERT INTO #DuplicateResult
EXEC ProcessInventoryResetQuantity
    @user_id = @test_user_id,
    @item_id = @test_item_id,
    @new_quantity = 200,
    @additional_notes = '{"comments":"Duplicate attempt","howYouKnow":"counted"}',
    @new_transaction_id = @txn_id_1;

-- Verify the error response
SELECT 'Result from duplicate transaction attempt:' AS Description, Status, ErrorCode, message
FROM #DuplicateResult;

-- Check if we got the expected error
IF EXISTS (SELECT 1 FROM #DuplicateResult WHERE Status = 'Error' AND ErrorCode = 'DUPLICATE_TRANSACTION')
    PRINT 'PASS: Duplicate transaction properly detected and rejected';
ELSE
    PRINT 'FAIL: Expected DUPLICATE_TRANSACTION error not returned';

SELECT 'Quantity should be unchanged (still 100):' AS Description, name, quantity
FROM Items
WHERE id = @test_item_id;

DROP TABLE #DuplicateResult;
PRINT '';

-- TEST 3: Another successful reset with new transaction ID
PRINT '--- TEST 3: Another Successful Reset with New Transaction ID ---';
DECLARE @txn_id_2 UNIQUEIDENTIFIER = NEWID();
PRINT 'Transaction ID: ' + CAST(@txn_id_2 AS NVARCHAR(50));

EXEC ProcessInventoryResetQuantity
    @user_id = @test_user_id,
    @item_id = @test_item_id,
    @new_quantity = 50,
    @additional_notes = '{"comments":"Second reset","howYouKnow":"estimated"}',
    @new_transaction_id = @txn_id_2;

SELECT 'Item after second reset:' AS Description, name, quantity
FROM Items
WHERE id = @test_item_id;

SELECT 'Both transactions exist:' AS Description, id, transaction_type, transaction_date
FROM Transactions
WHERE id IN (@txn_id_1, @txn_id_2)
ORDER BY transaction_date;
PRINT '';

-- TEST 4: NULL item ID (should fail)
PRINT '--- TEST 4: NULL Item ID (Should Return Error) ---';
DECLARE @txn_id_3 UNIQUEIDENTIFIER = NEWID();
PRINT 'Transaction ID: ' + CAST(@txn_id_3 AS NVARCHAR(50));
PRINT 'Attempting NULL item ID';

-- Create temp table to capture result
CREATE TABLE #NullItemResult (
    Status NVARCHAR(50),
    message NVARCHAR(MAX)
);

INSERT INTO #NullItemResult
EXEC ProcessInventoryResetQuantity
    @user_id = @test_user_id,
    @item_id = NULL,
    @new_quantity = 10,
    @additional_notes = '{"comments":"Null item test","howYouKnow":"counted"}',
    @new_transaction_id = @txn_id_3;

-- Verify the error response
SELECT 'Result from NULL item ID attempt:' AS Description, Status, message
FROM #NullItemResult;

-- Check if we got the expected error
IF EXISTS (SELECT 1 FROM #NullItemResult WHERE Status = 'Error' AND message = 'Invalid item id')
    PRINT 'PASS: NULL item ID properly detected and rejected with correct message';
ELSE
    PRINT 'FAIL: Expected specific error message not returned';

-- Verify transaction was never created (validations happen before transaction starts)
IF EXISTS (SELECT 1 FROM Transactions WHERE id = @txn_id_3)
    PRINT 'ERROR: Transaction should not exist in DB!';
ELSE
    PRINT 'PASS: No transaction created for NULL item ID';

DROP TABLE #NullItemResult;
PRINT '';

-- TEST 5: Invalid (non-existent) item ID (should fail)
PRINT '--- TEST 5: Invalid Item ID (Should Return Error) ---';
DECLARE @txn_id_4 UNIQUEIDENTIFIER = NEWID();
DECLARE @invalid_item_id INT = 999999;
PRINT 'Transaction ID: ' + CAST(@txn_id_4 AS NVARCHAR(50));
PRINT 'Invalid Item ID: ' + CAST(@invalid_item_id AS NVARCHAR(10));

-- Create temp table to capture result
CREATE TABLE #InvalidItemResult (
    Status NVARCHAR(50),
    message NVARCHAR(MAX)
);

INSERT INTO #InvalidItemResult
EXEC ProcessInventoryResetQuantity
    @user_id = @test_user_id,
    @item_id = @invalid_item_id,
    @new_quantity = 10,
    @additional_notes = '{"comments":"Invalid item","howYouKnow":"counted"}',
    @new_transaction_id = @txn_id_4;

-- Verify the error response
SELECT 'Result from invalid item attempt:' AS Description, Status, message
FROM #InvalidItemResult;

-- Check if we got an error status
IF EXISTS (SELECT 1 FROM #InvalidItemResult WHERE Status = 'Error' AND message = 'Item not found')
    PRINT 'PASS: Invalid item properly detected and rejected with correct message';
ELSE
    PRINT 'FAIL: Expected Error status not returned';

-- Verify transaction was never created (validations happen before transaction starts)
IF EXISTS (SELECT 1 FROM Transactions WHERE id = @txn_id_4)
    PRINT 'ERROR: Transaction should not exist in DB!';
ELSE
    PRINT 'PASS: No transaction created for invalid item';

DROP TABLE #InvalidItemResult;
PRINT '';

-- TEST 6: NULL quantity (should fail)
PRINT '--- TEST 6: NULL Quantity (Should Return Error) ---';
DECLARE @txn_id_5 UNIQUEIDENTIFIER = NEWID();
PRINT 'Transaction ID: ' + CAST(@txn_id_5 AS NVARCHAR(50));
PRINT 'Attempting NULL quantity';

-- Create temp table to capture result
CREATE TABLE #NullQtyResult (
    Status NVARCHAR(50),
    message NVARCHAR(MAX)
);

INSERT INTO #NullQtyResult
EXEC ProcessInventoryResetQuantity
    @user_id = @test_user_id,
    @item_id = @test_item_id,
    @new_quantity = NULL,
    @additional_notes = '{"comments":"Null quantity test","howYouKnow":"counted"}',
    @new_transaction_id = @txn_id_5;

-- Verify the error response
SELECT 'Result from NULL quantity attempt:' AS Description, Status, message
FROM #NullQtyResult;

-- Check if we got the expected error
IF EXISTS (SELECT 1 FROM #NullQtyResult WHERE Status = 'Error' AND message = 'Invalid quantity (must be non-negative)')
    PRINT 'PASS: NULL quantity properly detected and rejected with correct message';
ELSE
    PRINT 'FAIL: Expected specific error message not returned';

-- Verify transaction was never created (validation happens before transaction starts)
IF EXISTS (SELECT 1 FROM Transactions WHERE id = @txn_id_5)
    PRINT 'ERROR: Transaction should not exist in DB!';
ELSE
    PRINT 'PASS: No transaction created for NULL quantity';

DROP TABLE #NullQtyResult;
PRINT '';

-- TEST 7: Negative quantity (should fail)
PRINT '--- TEST 7: Negative Quantity (Should Return Error) ---';
DECLARE @txn_id_6 UNIQUEIDENTIFIER = NEWID();
PRINT 'Transaction ID: ' + CAST(@txn_id_6 AS NVARCHAR(50));
PRINT 'Attempting negative quantity: -5';

-- Create temp table to capture result
CREATE TABLE #NegativeQtyResult (
    Status NVARCHAR(50),
    message NVARCHAR(MAX)
);

INSERT INTO #NegativeQtyResult
EXEC ProcessInventoryResetQuantity
    @user_id = @test_user_id,
    @item_id = @test_item_id,
    @new_quantity = -5,
    @additional_notes = '{"comments":"Negative test","howYouKnow":"counted"}',
    @new_transaction_id = @txn_id_6;

-- Verify the error response
SELECT 'Result from negative quantity attempt:' AS Description, Status, message
FROM #NegativeQtyResult;

-- Check if we got the expected error
IF EXISTS (SELECT 1 FROM #NegativeQtyResult WHERE Status = 'Error' AND message = 'Invalid quantity (must be non-negative)')
    PRINT 'PASS: Negative quantity properly detected and rejected with correct message';
ELSE
    PRINT 'FAIL: Expected specific error message not returned';

SELECT 'Quantity should be unchanged (still 50):' AS Description, name, quantity
FROM Items
WHERE id = @test_item_id;

-- Verify transaction was never created (validation happens before transaction starts)
IF EXISTS (SELECT 1 FROM Transactions WHERE id = @txn_id_6)
    PRINT 'ERROR: Transaction should not exist in DB!';
ELSE
    PRINT 'PASS: No transaction created for invalid quantity';

DROP TABLE #NegativeQtyResult;
PRINT '';

-- TEST 8: Reset to zero (should succeed)
PRINT '--- TEST 8: Reset to Zero (Valid Case) ---';
DECLARE @txn_id_7 UNIQUEIDENTIFIER = NEWID();
PRINT 'Transaction ID: ' + CAST(@txn_id_7 AS NVARCHAR(50));

EXEC ProcessInventoryResetQuantity
    @user_id = @test_user_id,
    @item_id = @test_item_id,
    @new_quantity = 0,
    @additional_notes = '{"comments":"Reset to zero","howYouKnow":"counted"}',
    @new_transaction_id = @txn_id_7;

SELECT 'Item reset to zero:' AS Description, name, quantity
FROM Items
WHERE id = @test_item_id;

SELECT 'Transaction logged:' AS Description, id, user_id, transaction_type
FROM Transactions
WHERE id = @txn_id_7;
PRINT '';

-- TEST 9: Verify transaction type is CORRECTION (type 3)
PRINT '--- TEST 9: Verify Transaction Type ---';
SELECT 'All test transactions (should be type 3 = CORRECTION):' AS Description,
    id,
    transaction_type,
    CASE transaction_type
        WHEN 3 THEN 'CORRECTION'
        ELSE 'WRONG TYPE!'
    END AS TypeCheck
FROM Transactions
WHERE id IN (@txn_id_1, @txn_id_2, @txn_id_7)
ORDER BY transaction_date;
PRINT '';

-- Restore initial quantity
PRINT '--- Cleanup: Restoring Initial State ---';
DECLARE @txn_id_restore UNIQUEIDENTIFIER = NEWID();
EXEC ProcessInventoryResetQuantity
    @user_id = @test_user_id,
    @item_id = @test_item_id,
    @new_quantity = @initial_quantity,
    @additional_notes = '{"comments":"Restore original quantity","howYouKnow":"test cleanup"}',
    @new_transaction_id = @txn_id_restore;

SELECT 'Final state (restored to initial):' AS Description, name, quantity
FROM Items
WHERE id = @test_item_id;

PRINT '';
PRINT '========================================';
PRINT 'Test Suite Complete';
PRINT '========================================';
