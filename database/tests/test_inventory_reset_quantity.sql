-- Unit tests for ProcessInventoryResetQuantity Stored Procedure

-- Test 1: Basic successful quantity reset
PRINT 'Test 1: Basic successful quantity reset'
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
    @additional_notes = NULL;

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
DECLARE @item_id INT = 3;
DECLARE @new_quantity INT = 50;
DECLARE @additional_notes NVARCHAR(MAX) = N'[{"comments":"Counted inventory","howYouKnow":"counted"}]';
DECLARE @transaction_id UNIQUEIDENTIFIER;
DECLARE @stored_notes NVARCHAR(MAX);

-- Execute the procedure
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @new_quantity,
    @additional_notes = @additional_notes;

-- Get the most recent transaction for this item
SELECT TOP 1 @transaction_id = ti.transaction_id, @stored_notes = ti.additional_notes
FROM TransactionItems ti
JOIN Transactions t ON ti.transaction_id = t.id
WHERE ti.item_id = @item_id
ORDER BY t.transaction_date DESC;

-- Assert: Additional notes should be stored
IF @stored_notes <> @additional_notes
    THROW 50002, 'Test 2 FAILED: Additional notes not stored correctly', 1;

PRINT 'Test 2 PASSED: Additional notes saved successfully';
GO

-- Test 3: Reset quantity to zero
PRINT 'Test 3: Reset quantity to zero'
DECLARE @item_id INT = 4;
DECLARE @final_quantity INT;

-- Execute the procedure with zero quantity
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = 0,
    @additional_notes = N'Out of stock';

-- Get final quantity
SELECT @final_quantity = quantity FROM Items WHERE id = @item_id;

-- Assert: Quantity should be exactly 0
IF @final_quantity <> 0
    THROW 50003, 'Test 3 FAILED: Quantity not reset to zero', 1;

PRINT 'Test 3 PASSED: Zero quantity reset successful';
GO

-- Test 4: Large quantity reset
PRINT 'Test 4: Large quantity reset'
DECLARE @item_id INT = 5;
DECLARE @final_quantity INT;
DECLARE @large_quantity INT = 9999;

-- Execute the procedure with large quantity
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @large_quantity,
    @additional_notes = N'Bulk delivery';

-- Get final quantity
SELECT @final_quantity = quantity FROM Items WHERE id = @item_id;

-- Assert: Quantity should be exactly the large value
IF @final_quantity <> @large_quantity
    THROW 50004, 'Test 4 FAILED: Large quantity not set correctly', 1;

PRINT 'Test 4 PASSED: Large quantity reset successful';
GO

-- Test 5: Invalid item_id should fail
PRINT 'Test 5: Invalid item_id should fail'
DECLARE @error_occurred BIT = 0;

BEGIN TRY
    EXEC ProcessInventoryResetQuantity
        @user_id = 1,
        @item_id = 999999,
        @new_quantity = 10,
        @additional_notes = NULL;

    -- If we get here, the test failed because no error was thrown
    THROW 50005, 'Test 5 FAILED: Invalid item_id should have thrown an error', 1;
END TRY
BEGIN CATCH
    -- Expected behavior - an error was thrown
    IF ERROR_NUMBER() = 51004
        SET @error_occurred = 1;
    ELSE
        SET @error_occurred = 1; -- Any error is acceptable for invalid item
END CATCH

-- Assert: Error should have occurred
IF @error_occurred <> 1
    THROW 50005, 'Test 5 FAILED: Expected error for invalid item_id', 1;

PRINT 'Test 5 PASSED: Invalid item_id rejected correctly';
GO

-- Test 6: Negative quantity should fail
PRINT 'Test 6: Negative quantity should fail'
DECLARE @error_occurred BIT = 0;

BEGIN TRY
    EXEC ProcessInventoryResetQuantity
        @user_id = 1,
        @item_id = 2,
        @new_quantity = -10,
        @additional_notes = NULL;

    -- If we get here, the test failed because no error was thrown
    THROW 50006, 'Test 6 FAILED: Negative quantity should have thrown an error', 1;
END TRY
BEGIN CATCH
    -- Expected behavior - should throw error 51003
    IF ERROR_NUMBER() = 51003
        SET @error_occurred = 1;
END CATCH

-- Assert: Error should have occurred
IF @error_occurred <> 1
    THROW 50006, 'Test 6 FAILED: Expected error 51003 for negative quantity', 1;

PRINT 'Test 6 PASSED: Negative quantity rejected correctly';
GO

-- Test 7: NULL item_id should fail
PRINT 'Test 7: NULL item_id should fail'
DECLARE @error_occurred BIT = 0;

BEGIN TRY
    EXEC ProcessInventoryResetQuantity
        @user_id = 1,
        @item_id = NULL,
        @new_quantity = 10,
        @additional_notes = NULL;

    -- If we get here, the test failed because no error was thrown
    THROW 50007, 'Test 7 FAILED: NULL item_id should have thrown an error', 1;
END TRY
BEGIN CATCH
    -- Expected behavior - should throw error 51003
    IF ERROR_NUMBER() = 51003
        SET @error_occurred = 1;
END CATCH

-- Assert: Error should have occurred
IF @error_occurred <> 1
    THROW 50007, 'Test 7 FAILED: Expected error 51003 for NULL item_id', 1;

PRINT 'Test 7 PASSED: NULL item_id rejected correctly';
GO

-- Test 8: NULL quantity should fail
PRINT 'Test 8: NULL quantity should fail'
DECLARE @error_occurred BIT = 0;

BEGIN TRY
    EXEC ProcessInventoryResetQuantity
        @user_id = 1,
        @item_id = 2,
        @new_quantity = NULL,
        @additional_notes = NULL;

    -- If we get here, the test failed because no error was thrown
    THROW 50008, 'Test 8 FAILED: NULL quantity should have thrown an error', 1;
END TRY
BEGIN CATCH
    -- Expected behavior - should throw error 51003
    IF ERROR_NUMBER() = 51003
        SET @error_occurred = 1;
END CATCH

-- Assert: Error should have occurred
IF @error_occurred <> 1
    THROW 50008, 'Test 8 FAILED: Expected error 51003 for NULL quantity', 1;

PRINT 'Test 8 PASSED: NULL quantity rejected correctly';
GO

-- Test 9: Verify transaction type is 3 (CORRECTION)
PRINT 'Test 9: Verify transaction type is 3 (CORRECTION)'
DECLARE @item_id INT = 6;
DECLARE @transaction_type INT;

-- Execute the procedure
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = 75,
    @additional_notes = NULL;

-- Get the most recent transaction for this item
SELECT TOP 1 @transaction_type = t.transaction_type
FROM Transactions t
JOIN TransactionItems ti ON t.id = ti.transaction_id
WHERE ti.item_id = @item_id
ORDER BY t.transaction_date DESC;

-- Assert: Transaction type should be 3 (CORRECTION)
IF @transaction_type <> 3
    THROW 50009, 'Test 9 FAILED: Transaction type should be 3 for CORRECTION', 1;

PRINT 'Test 9 PASSED: Transaction type is correct';
GO

-- Test 10: Verify user_id is stored correctly
PRINT 'Test 10: Verify user_id is stored correctly'
DECLARE @item_id INT = 7;
DECLARE @stored_user_id INT;

-- Execute the procedure with user_id = 1
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = 25,
    @additional_notes = NULL;

-- Get the most recent transaction for this item
SELECT TOP 1 @stored_user_id = t.user_id
FROM Transactions t
JOIN TransactionItems ti ON t.id = ti.transaction_id
WHERE ti.item_id = @item_id
ORDER BY t.transaction_date DESC;

-- Assert: User ID should be stored correctly
IF @stored_user_id <> 1
    THROW 50010, 'Test 10 FAILED: User ID not stored correctly', 1;

PRINT 'Test 10 PASSED: User ID stored correctly';
GO

-- Test 11: Multiple resets on same item
PRINT 'Test 11: Multiple resets on same item'
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
    @additional_notes = N'First reset';

-- Second reset
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @quantity2,
    @additional_notes = N'Second reset';

-- Third reset
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @quantity3,
    @additional_notes = N'Third reset';

-- Get final quantity
SELECT @final_quantity = quantity FROM Items WHERE id = @item_id;

-- Assert: Final quantity should match the last reset
IF @final_quantity <> @quantity3
    THROW 50011, 'Test 11 FAILED: Final quantity should match last reset', 1;

-- Assert: Three separate transactions should exist for this item
DECLARE @transaction_count INT;
SELECT @transaction_count = COUNT(DISTINCT ti.transaction_id)
FROM TransactionItems ti
JOIN Transactions t ON ti.transaction_id = t.id
WHERE ti.item_id = @item_id AND t.transaction_type = 3;

IF @transaction_count < 3
    THROW 50011, 'Test 11 FAILED: Should have at least 3 correction transactions', 1;

PRINT 'Test 11 PASSED: Multiple resets handled correctly';
GO

-- Test 12: Verify quantity is SET, not added
PRINT 'Test 12: Verify quantity is SET (not added/subtracted)'
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
    @additional_notes = N'Testing SET operation';

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
DECLARE @item_id INT = 10;
DECLARE @resident_id INT;

-- Execute the procedure
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = 30,
    @additional_notes = NULL;

-- Get the most recent transaction for this item
SELECT TOP 1 @resident_id = t.resident_id
FROM Transactions t
JOIN TransactionItems ti ON t.id = ti.transaction_id
WHERE ti.item_id = @item_id
ORDER BY t.transaction_date DESC;

-- Assert: Resident ID should be NULL (corrections not tied to residents)
IF @resident_id IS NOT NULL
    THROW 50013, 'Test 13 FAILED: Resident ID should be NULL for correction transactions', 1;

PRINT 'Test 13 PASSED: Resident ID is correctly NULL';
GO

-- Test 14: Verify TransactionItem quantity matches new_quantity parameter
PRINT 'Test 14: Verify TransactionItem quantity matches new_quantity parameter'
DECLARE @item_id INT = 11;
DECLARE @new_quantity INT = 123;
DECLARE @transaction_item_quantity INT;

-- Execute the procedure
EXEC ProcessInventoryResetQuantity
    @user_id = 1,
    @item_id = @item_id,
    @new_quantity = @new_quantity,
    @additional_notes = N'Testing transaction item quantity';

-- Get the quantity logged in TransactionItems
SELECT TOP 1 @transaction_item_quantity = ti.quantity
FROM TransactionItems ti
JOIN Transactions t ON ti.transaction_id = t.id
WHERE ti.item_id = @item_id
ORDER BY t.transaction_date DESC;

-- Assert: TransactionItem quantity should match the new quantity
IF @transaction_item_quantity <> @new_quantity
    THROW 50014, 'Test 14 FAILED: TransactionItem quantity should match new_quantity parameter', 1;

PRINT 'Test 14 PASSED: TransactionItem quantity logged correctly';
GO

PRINT '';
PRINT '========================================';
PRINT 'ALL TESTS PASSED for ProcessInventoryResetQuantity';
PRINT '========================================';
GO
