-- Unit tests for ProcessInventoryResetQuantity Stored Procedure

-- Test 1: Basic successful quantity reset
PRINT 'Test 1: Basic successful quantity reset'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @initial_quantity INT;
DECLARE @final_quantity INT;
DECLARE @item_id INT = 2;
DECLARE @new_quantity INT = 100;

-- Get initial quantity
SELECT @initial_quantity = quantity FROM Items WHERE id = @item_id;

-- Execute the procedure
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @new_quantity,
    @additional_notes = NULL,
    @new_transaction_id = @new_transaction_id;

-- Get final quantity
SELECT @final_quantity = quantity FROM Items WHERE id = @item_id;

-- Assert: Quantity should be set to exactly 100 (not added/subtracted)
IF @final_quantity <> @new_quantity
    THROW 50001, 'Test 1 FAILED: Quantity not reset to new value', 1;

-- Assert: Transaction should be created with type 3 (CORRECTION)
IF NOT EXISTS (
    SELECT 1 FROM Transactions
    WHERE user_id = 1
    AND transaction_type = 3
    AND resident_id IS NULL
)
    THROW 50001, 'Test 1 FAILED: Transaction not created with correct type', 1;

PRINT 'Test 1 PASSED: Basic quantity reset successful';
GO

-- Test 2: Reset with additional notes
PRINT 'Test 2: Reset with additional notes'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @item_id INT = 3;
DECLARE @new_quantity INT = 50;
DECLARE @additional_notes NVARCHAR(MAX) = N'[{"comments":"Counted inventory","howYouKnow":"counted"}]';
DECLARE @stored_notes NVARCHAR(MAX);

-- Execute the procedure
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @new_quantity,
    @additional_notes = @additional_notes,
    @new_transaction_id = @new_transaction_id;

-- Get the stored notes from the transaction we just created
SELECT @stored_notes = additional_notes
FROM TransactionItems
WHERE transaction_id = @new_transaction_id AND item_id = @item_id;

-- Assert: Additional notes should be stored
IF @stored_notes <> @additional_notes
    THROW 50002, 'Test 2 FAILED: Additional notes not stored correctly', 1;

PRINT 'Test 2 PASSED: Additional notes saved successfully';
GO

-- Test 3: Reset quantity to zero
PRINT 'Test 3: Reset quantity to zero'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @item_id INT = 4;
DECLARE @final_quantity INT;

-- Execute the procedure with zero quantity
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = 0,
    @additional_notes = N'Out of stock',
    @new_transaction_id = @new_transaction_id;

-- Get final quantity
SELECT @final_quantity = quantity FROM Items WHERE id = @item_id;

-- Assert: Quantity should be exactly 0
IF @final_quantity <> 0
    THROW 50003, 'Test 3 FAILED: Quantity not reset to zero', 1;

PRINT 'Test 3 PASSED: Zero quantity reset successful';
GO

-- Test 4: Large quantity reset
PRINT 'Test 4: Large quantity reset'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @item_id INT = 5;
DECLARE @final_quantity INT;
DECLARE @large_quantity INT = 9999;

-- Execute the procedure with large quantity
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @large_quantity,
    @additional_notes = N'Bulk delivery',
    @new_transaction_id = @new_transaction_id;

-- Get final quantity
SELECT @final_quantity = quantity FROM Items WHERE id = @item_id;

-- Assert: Quantity should be exactly the large value
IF @final_quantity <> @large_quantity
    THROW 50004, 'Test 4 FAILED: Large quantity not set correctly', 1;

PRINT 'Test 4 PASSED: Large quantity reset successful';
GO

-- Test 5: Invalid item_id should fail
PRINT 'Test 5: Invalid item_id should fail'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();

-- Create temp table to capture result
CREATE TABLE #InvalidItemResult (
    Status NVARCHAR(50),
    message NVARCHAR(MAX)
);

INSERT INTO #InvalidItemResult
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = 999999,
    @new_quantity = 10,
    @additional_notes = NULL,
    @new_transaction_id = @new_transaction_id;

-- Assert: Should return error status
IF NOT EXISTS (SELECT 1 FROM #InvalidItemResult WHERE Status = 'Error' AND message = 'Item not found')
    THROW 50005, 'Test 5 FAILED: Expected error for invalid item_id', 1;

DROP TABLE #InvalidItemResult;
PRINT 'Test 5 PASSED: Invalid item_id rejected correctly';
GO

-- Test 6: Negative quantity should fail
PRINT 'Test 6: Negative quantity should fail'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();

-- Create temp table to capture result
CREATE TABLE #NegativeQtyResult (
    Status NVARCHAR(50),
    message NVARCHAR(MAX)
);

INSERT INTO #NegativeQtyResult
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = 2,
    @new_quantity = -10,
    @additional_notes = NULL,
    @new_transaction_id = @new_transaction_id;

-- Assert: Should return error status
IF NOT EXISTS (SELECT 1 FROM #NegativeQtyResult WHERE Status = 'Error' AND message = 'Invalid quantity (must be non-negative)')
    THROW 50006, 'Test 6 FAILED: Expected error for negative quantity', 1;

DROP TABLE #NegativeQtyResult;
PRINT 'Test 6 PASSED: Negative quantity rejected correctly';
GO

-- Test 7: NULL item_id should fail
PRINT 'Test 7: NULL item_id should fail'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();

-- Create temp table to capture result
CREATE TABLE #NullItemResult (
    Status NVARCHAR(50),
    message NVARCHAR(MAX)
);

INSERT INTO #NullItemResult
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = NULL,
    @new_quantity = 10,
    @additional_notes = NULL,
    @new_transaction_id = @new_transaction_id;

-- Assert: Should return error status
IF NOT EXISTS (SELECT 1 FROM #NullItemResult WHERE Status = 'Error' AND message = 'Invalid item id')
    THROW 50007, 'Test 7 FAILED: Expected error for NULL item_id', 1;

DROP TABLE #NullItemResult;
PRINT 'Test 7 PASSED: NULL item_id rejected correctly';
GO

-- Test 8: NULL quantity should fail
PRINT 'Test 8: NULL quantity should fail'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();

-- Create temp table to capture result
CREATE TABLE #NullQtyResult (
    Status NVARCHAR(50),
    message NVARCHAR(MAX)
);

INSERT INTO #NullQtyResult
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = 2,
    @new_quantity = NULL,
    @additional_notes = NULL,
    @new_transaction_id = @new_transaction_id;

-- Assert: Should return error status
IF NOT EXISTS (SELECT 1 FROM #NullQtyResult WHERE Status = 'Error' AND message = 'Invalid quantity (must be non-negative)')
    THROW 50008, 'Test 8 FAILED: Expected error for NULL quantity', 1;

DROP TABLE #NullQtyResult;
PRINT 'Test 8 PASSED: NULL quantity rejected correctly';
GO

-- Test 9: Verify transaction type is 3 (CORRECTION)
PRINT 'Test 9: Verify transaction type is 3 (CORRECTION)'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @item_id INT = 6;
DECLARE @transaction_type INT;

-- Execute the procedure
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = 75,
    @additional_notes = NULL,
    @new_transaction_id = @new_transaction_id;

-- Get the transaction type
SELECT @transaction_type = transaction_type
FROM Transactions
WHERE id = @new_transaction_id;

-- Assert: Transaction type should be 3 (CORRECTION)
IF @transaction_type <> 3
    THROW 50009, 'Test 9 FAILED: Transaction type should be 3 for CORRECTION', 1;

PRINT 'Test 9 PASSED: Transaction type is correct';
GO

-- Test 10: Verify user_id is stored correctly
PRINT 'Test 10: Verify user_id is stored correctly'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @item_id INT = 7;
DECLARE @stored_user_id INT;

-- Execute the procedure with user_id = 1
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = 25,
    @additional_notes = NULL,
    @new_transaction_id = @new_transaction_id;

-- Get the user_id from the transaction
SELECT @stored_user_id = user_id
FROM Transactions
WHERE id = @new_transaction_id;

-- Assert: User ID should be stored correctly
IF @stored_user_id <> 1
    THROW 50010, 'Test 10 FAILED: User ID not stored correctly', 1;

PRINT 'Test 10 PASSED: User ID stored correctly';
GO

-- Test 11: Multiple resets on same item
PRINT 'Test 11: Multiple resets on same item'
DECLARE @transaction_id_1 UNIQUEIDENTIFIER = NEWID();
DECLARE @transaction_id_2 UNIQUEIDENTIFIER = NEWID();
DECLARE @transaction_id_3 UNIQUEIDENTIFIER = NEWID();
DECLARE @item_id INT = 8;
DECLARE @quantity1 INT = 100;
DECLARE @quantity2 INT = 50;
DECLARE @quantity3 INT = 200;
DECLARE @final_quantity INT;

-- First reset
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @quantity1,
    @additional_notes = N'First reset',
    @new_transaction_id = @transaction_id_1;

-- Second reset
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @quantity2,
    @additional_notes = N'Second reset',
    @new_transaction_id = @transaction_id_2;

-- Third reset
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @quantity3,
    @additional_notes = N'Third reset',
    @new_transaction_id = @transaction_id_3;

-- Get final quantity
SELECT @final_quantity = quantity FROM Items WHERE id = @item_id;

-- Assert: Final quantity should match the last reset
IF @final_quantity <> @quantity3
    THROW 50011, 'Test 11 FAILED: Final quantity should match last reset', 1;

-- Assert: All three transactions should exist
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @transaction_id_1)
    OR NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @transaction_id_2)
    OR NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @transaction_id_3)
    THROW 50011, 'Test 11 FAILED: All three transactions should exist', 1;

PRINT 'Test 11 PASSED: Multiple resets handled correctly';
GO

-- Test 12: Verify quantity is SET, not added
PRINT 'Test 12: Verify quantity is SET (not added/subtracted)'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @item_id INT = 9;
DECLARE @initial_quantity INT;
DECLARE @reset_value INT = 25;
DECLARE @final_quantity INT;

-- Get initial quantity
SELECT @initial_quantity = quantity FROM Items WHERE id = @item_id;

-- Execute reset
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @reset_value,
    @additional_notes = N'Testing SET operation',
    @new_transaction_id = @new_transaction_id;

-- Get final quantity
SELECT @final_quantity = quantity FROM Items WHERE id = @item_id;

-- Assert: Final quantity should be exactly the reset value, regardless of initial value
IF @final_quantity <> @reset_value
    THROW 50012, 'Test 12 FAILED: Quantity should be SET to exact value, not added/subtracted', 1;

-- Assert: Final should NOT equal initial + reset_value (proving it's not addition)
IF @final_quantity = (@initial_quantity + @reset_value) AND @initial_quantity <> 0
    THROW 50012, 'Test 12 FAILED: Quantity appears to have been added instead of set', 1;

PRINT 'Test 12 PASSED: Quantity is correctly SET, not added';
GO

-- Test 13: Verify resident_id is NULL for correction transactions
PRINT 'Test 13: Verify resident_id is NULL for correction transactions'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @item_id INT = 10;
DECLARE @resident_id INT;

-- Execute the procedure
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = 30,
    @additional_notes = NULL,
    @new_transaction_id = @new_transaction_id;

-- Get the resident_id from the transaction
SELECT @resident_id = resident_id
FROM Transactions
WHERE id = @new_transaction_id;

-- Assert: Resident ID should be NULL (corrections not tied to residents)
IF @resident_id IS NOT NULL
    THROW 50013, 'Test 13 FAILED: Resident ID should be NULL for correction transactions', 1;

PRINT 'Test 13 PASSED: Resident ID is correctly NULL';
GO

-- Test 14: Verify TransactionItem quantity matches new_quantity parameter
PRINT 'Test 14: Verify TransactionItem quantity matches new_quantity parameter'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @item_id INT = 11;
DECLARE @new_quantity INT = 123;
DECLARE @transaction_item_quantity INT;

-- Execute the procedure
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @new_quantity,
    @additional_notes = N'Testing transaction item quantity',
    @new_transaction_id = @new_transaction_id;

-- Get the quantity logged in TransactionItems
SELECT @transaction_item_quantity = quantity
FROM TransactionItems
WHERE transaction_id = @new_transaction_id AND item_id = @item_id;

-- Assert: TransactionItem quantity should match the new quantity
IF @transaction_item_quantity <> @new_quantity
    THROW 50014, 'Test 14 FAILED: TransactionItem quantity should match new_quantity parameter', 1;

PRINT 'Test 14 PASSED: TransactionItem quantity logged correctly';
GO

-- Test 15: Duplicate transaction ID should fail
PRINT 'Test 15: Duplicate transaction ID should fail'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @transaction_count INT;
DECLARE @initial_item_qty INT;
DECLARE @after_first_qty INT;
DECLARE @final_qty INT;

-- Get initial quantity
SELECT @initial_item_qty = quantity FROM Items WHERE id = 2;

-- First transaction should succeed
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = 2,
    @new_quantity = 50,
    @additional_notes = NULL,
    @new_transaction_id = @new_transaction_id;

-- Verify first transaction was created
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    THROW 50015, 'Test 15 FAILED: First transaction should have been created', 1;

-- Get quantity after first transaction
SELECT @after_first_qty = quantity FROM Items WHERE id = 2;

-- Second transaction with same ID should be rejected
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = 2,
    @new_quantity = 100,
    @additional_notes = NULL,
    @new_transaction_id = @new_transaction_id;

-- Assert: Should only have ONE transaction with this ID (not two)
SELECT @transaction_count = COUNT(*)
FROM Transactions
WHERE id = @new_transaction_id;

IF @transaction_count <> 1
    THROW 50015, 'Test 15 FAILED: Should only have one transaction with duplicate ID', 1;

-- Assert: Item quantity should only have been set once (to 50, not 100)
SELECT @final_qty = quantity FROM Items WHERE id = 2;

IF @final_qty <> 50
    THROW 50015, 'Test 15 FAILED: Quantity should still be 50 from first transaction', 1;

PRINT 'Test 15 PASSED: Duplicate transaction ID rejected correctly';
GO

PRINT '';
PRINT '========================================';
PRINT 'ALL TESTS PASSED for ProcessInventoryResetQuantity';
PRINT '========================================';
GO
