-- Unit tests for ProcessInventoryChange Stored Procedure

-- Test 1: Add inventory with single item
PRINT 'Test 1: Add inventory with single item'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @initial_quantity INT;
DECLARE @final_quantity INT;
DECLARE @item_id INT = 2;

-- Get initial quantity
SELECT @initial_quantity = quantity
FROM Items
WHERE id = @item_id;

-- Execute the procedure
EXEC ProcessInventoryChange
    @user_id = 1,
    @item = N'[{"id": 2, "quantity": 5}]',
    @new_transaction_id = @new_transaction_id;

-- Get final quantity
SELECT @final_quantity = quantity
FROM Items
WHERE id = @item_id;

-- Assert: Quantity should increase by 5
IF @final_quantity <> @initial_quantity + 5
    THROW 50001, 'Test 1 FAILED: Quantity not increased correctly', 1;

-- Assert: Transaction should be created
IF NOT EXISTS (SELECT 1
FROM Transactions
WHERE id = @new_transaction_id)
    THROW 50001, 'Test 1 FAILED: Transaction not created', 1;

-- Assert: TransactionItem should be created
IF NOT EXISTS (SELECT 1
FROM TransactionItems
WHERE transaction_id = @new_transaction_id AND item_id = @item_id AND quantity = 5)
    THROW 50001, 'Test 1 FAILED: TransactionItem not created correctly', 1;

PRINT 'Test 1 PASSED: Single item added successfully';
GO

-- Test 2: Reduce inventory with single item (negative quantity)
PRINT 'Test 2: Reduce inventory with single item'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @initial_quantity INT;
DECLARE @final_quantity INT;
DECLARE @item_id INT = 3;

-- Get initial quantity
SELECT @initial_quantity = quantity
FROM Items
WHERE id = @item_id;

-- Execute the procedure
EXEC ProcessInventoryChange
    @user_id = 1,
    @item = N'[{"id": 3, "quantity": -2}]',
    @new_transaction_id = @new_transaction_id;

-- Get final quantity
SELECT @final_quantity = quantity
FROM Items
WHERE id = @item_id;

-- Assert: Quantity should decrease by 2
IF @final_quantity <> @initial_quantity - 2
    THROW 50002, 'Test 2 FAILED: Quantity not reduced correctly', 1;

-- Assert: Transaction should be created
IF NOT EXISTS (SELECT 1
FROM Transactions
WHERE id = @new_transaction_id)
    THROW 50002, 'Test 2 FAILED: Transaction not created', 1;

-- Assert: TransactionItem should have negative quantity
IF NOT EXISTS (SELECT 1
FROM TransactionItems
WHERE transaction_id = @new_transaction_id AND item_id = @item_id AND quantity = -2)
    THROW 50002, 'Test 2 FAILED: TransactionItem not created with correct negative quantity', 1;

PRINT 'Test 2 PASSED: Single item reduced successfully';
GO

-- Test 3: Multiple items in one transaction
PRINT 'Test 3: Multiple items in one transaction'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @initial_quantity_item4 INT;
DECLARE @final_quantity_item4 INT;
DECLARE @initial_quantity_item5 INT;
DECLARE @final_quantity_item5 INT;

-- Get initial quantities
SELECT @initial_quantity_item4 = quantity
FROM Items
WHERE id = 4;
SELECT @initial_quantity_item5 = quantity
FROM Items
WHERE id = 5;

-- Execute the procedure with multiple items
EXEC ProcessInventoryChange
    @user_id = 1,
    @item = N'[{"id": 4, "quantity": 10}, {"id": 5, "quantity": 7}]',
    @new_transaction_id = @new_transaction_id;

-- Get final quantities
SELECT @final_quantity_item4 = quantity
FROM Items
WHERE id = 4;
SELECT @final_quantity_item5 = quantity
FROM Items
WHERE id = 5;

-- Assert: Both quantities should be updated correctly
IF @final_quantity_item4 <> @initial_quantity_item4 + 10
    THROW 50003, 'Test 3 FAILED: Item 4 quantity not increased correctly', 1;
IF @final_quantity_item5 <> @initial_quantity_item5 + 7
    THROW 50003, 'Test 3 FAILED: Item 5 quantity not increased correctly', 1;

-- Assert: Transaction should be created
IF NOT EXISTS (SELECT 1
FROM Transactions
WHERE id = @new_transaction_id)
    THROW 50003, 'Test 3 FAILED: Transaction not created', 1;

-- Assert: Both TransactionItems should be created
IF NOT EXISTS (SELECT 1
FROM TransactionItems
WHERE transaction_id = @new_transaction_id AND item_id = 4 AND quantity = 10)
    THROW 50003, 'Test 3 FAILED: TransactionItem for item 4 not created correctly', 1;
IF NOT EXISTS (SELECT 1
FROM TransactionItems
WHERE transaction_id = @new_transaction_id AND item_id = 5 AND quantity = 7)
    THROW 50003, 'Test 3 FAILED: TransactionItem for item 5 not created correctly', 1;

PRINT 'Test 3 PASSED: Multiple items processed successfully';
GO

-- Test 4: Add inventory with additional_notes
PRINT 'Test 4: Add inventory with additional_notes'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @additional_notes NVARCHAR(255);

-- Execute the procedure with additional notes
EXEC ProcessInventoryChange
    @user_id = 1,
    @item = N'[{"id": 6, "quantity": 3, "additional_notes": "Donated by local business"}]',
    @new_transaction_id = @new_transaction_id;

-- Get the additional notes from TransactionItems
SELECT @additional_notes = additional_notes
FROM TransactionItems
WHERE transaction_id = @new_transaction_id AND item_id = 6;

-- Assert: Additional notes should be saved
IF @additional_notes <> 'Donated by local business'
    THROW 50004, 'Test 4 FAILED: Additional notes not saved correctly', 1;

-- Assert: Transaction should be created
IF NOT EXISTS (SELECT 1
FROM Transactions
WHERE id = @new_transaction_id)
    THROW 50004, 'Test 4 FAILED: Transaction not created', 1;

PRINT 'Test 4 PASSED: Additional notes saved successfully';
GO

-- Test 5: Invalid JSON format should fail
PRINT 'Test 5: Invalid JSON format'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @error_occurred BIT = 0;

BEGIN TRY
    EXEC ProcessInventoryChange
        @user_id = 1,
        @item = N'This is not valid JSON',
        @new_transaction_id = @new_transaction_id;

    -- If we get here, the test failed because no error was thrown
    THROW 50005, 'Test 5 FAILED: Invalid JSON should have thrown an error', 1;
END TRY
BEGIN CATCH
    -- Expected behavior - an error was thrown
    SET @error_occurred = 1;
END CATCH

-- Assert: Error should have occurred
IF @error_occurred <> 1
    THROW 50005, 'Test 5 FAILED: Expected error for invalid JSON', 1;

PRINT 'Test 5 PASSED: Invalid JSON rejected correctly';
GO

-- Test 6: Duplicate transaction ID should fail
PRINT 'Test 6: Duplicate transaction ID'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @transaction_count INT;
DECLARE @initial_item7_qty INT;
DECLARE @final_item7_qty INT;

-- Get initial quantity for item 7
SELECT @initial_item7_qty = quantity
FROM Items
WHERE id = 7;

-- First transaction should succeed
EXEC ProcessInventoryChange
    @user_id = 1,
    @item = N'[{"id": 7, "quantity": 1}]',
    @new_transaction_id = @new_transaction_id;

-- Verify first transaction was created
IF NOT EXISTS (SELECT 1
FROM Transactions
WHERE id = @new_transaction_id)
    THROW 50006, 'Test 6 FAILED: First transaction should have been created', 1;

-- Second transaction with same ID should be rolled back
EXEC ProcessInventoryChange
    @user_id = 1,
    @item = N'[{"id": 7, "quantity": 1}]',
    @new_transaction_id = @new_transaction_id;

-- Assert: Should only have ONE transaction with this ID (not two)
SELECT @transaction_count = COUNT(*)
FROM Transactions
WHERE id = @new_transaction_id;

IF @transaction_count <> 1
    THROW 50006, 'Test 6 FAILED: Should only have one transaction with duplicate ID', 1;

-- Assert: Item 7 quantity should only have increased once (by 1), not twice
SELECT @final_item7_qty = quantity
FROM Items
WHERE id = 7;

IF @final_item7_qty <> @initial_item7_qty + 1
    THROW 50006, 'Test 6 FAILED: Quantity should only increase once for duplicate transaction attempt', 1;

PRINT 'Test 6 PASSED: Duplicate transaction ID rejected correctly';
GO

-- Test 7: Empty JSON array
PRINT 'Test 7: Empty JSON array'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @transaction_items_count INT;

-- Execute with empty array
EXEC ProcessInventoryChange
    @user_id = 1,
    @item = N'[]',
    @new_transaction_id = @new_transaction_id;

-- Assert: Transaction should still be created (even with no items)
IF NOT EXISTS (SELECT 1
FROM Transactions
WHERE id = @new_transaction_id)
    THROW 50007, 'Test 7 FAILED: Transaction should be created even with empty items', 1;

-- Check transaction items count
SELECT @transaction_items_count = COUNT(*)
FROM TransactionItems
WHERE transaction_id = @new_transaction_id;

-- Assert: No transaction items should be created
IF @transaction_items_count <> 0
    THROW 50007, 'Test 7 FAILED: No transaction items should be created for empty array', 1;

PRINT 'Test 7 PASSED: Empty JSON array handled correctly';
GO

-- Test 8: Quantity of zero
PRINT 'Test 8: Quantity of zero'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @initial_quantity INT;
DECLARE @final_quantity INT;
DECLARE @item_id INT = 9;

-- Get initial quantity
SELECT @initial_quantity = quantity
FROM Items
WHERE id = @item_id;

-- Execute with zero quantity
EXEC ProcessInventoryChange
    @user_id = 1,
    @item = N'[{"id": 9, "quantity": 0}]',
    @new_transaction_id = @new_transaction_id;

-- Get final quantity
SELECT @final_quantity = quantity
FROM Items
WHERE id = @item_id;

-- Assert: Quantity should remain unchanged
IF @final_quantity <> @initial_quantity
    THROW 50008, 'Test 8 FAILED: Quantity should not change with zero quantity', 1;

-- Assert: TransactionItem should still be logged with quantity 0
IF NOT EXISTS (SELECT 1
FROM TransactionItems
WHERE transaction_id = @new_transaction_id AND item_id = @item_id AND quantity = 0)
    THROW 50008, 'Test 8 FAILED: TransactionItem should be logged even with zero quantity', 1;

PRINT 'Test 8 PASSED: Zero quantity handled correctly';
GO

-- Test 9: Transaction type should be 2 (inventory change)
PRINT 'Test 9: Verify transaction type is correct'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @transaction_type INT;

-- Execute the procedure
EXEC ProcessInventoryChange
    @user_id = 1,
    @item = N'[{"id": 10, "quantity": 1}]',
    @new_transaction_id = @new_transaction_id;

-- Get transaction type
SELECT @transaction_type = transaction_type
FROM Transactions
WHERE id = @new_transaction_id;

-- Assert: Transaction type should be 2 (inventory change)
IF @transaction_type <> 2
    THROW 50009, 'Test 9 FAILED: Transaction type should be 2 for inventory change', 1;

PRINT 'Test 9 PASSED: Transaction type is correct';
GO

-- Test 10: Large quantity values
PRINT 'Test 10: Large quantity values'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @initial_quantity INT;
DECLARE @final_quantity INT;
DECLARE @item_id INT = 11;
DECLARE @large_quantity INT = 1000;

-- Get initial quantity
SELECT @initial_quantity = quantity
FROM Items
WHERE id = @item_id;

-- Execute with large quantity
EXEC ProcessInventoryChange
    @user_id = 1,
    @item = N'[{"id": 11, "quantity": 1000}]',
    @new_transaction_id = @new_transaction_id;

-- Get final quantity
SELECT @final_quantity = quantity
FROM Items
WHERE id = @item_id;

-- Assert: Quantity should increase by large amount
IF @final_quantity <> @initial_quantity + @large_quantity
    THROW 50010, 'Test 10 FAILED: Large quantity not processed correctly', 1;

PRINT 'Test 10 PASSED: Large quantity values handled correctly';
GO

PRINT '';
PRINT '========================================';
PRINT 'ALL TESTS PASSED for ProcessInventoryChange';
PRINT '========================================';
GO
