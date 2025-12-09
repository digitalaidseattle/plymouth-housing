-- Unit tests for ProcessCheckout Stored Procedure

-- Test 1: Basic successful checkout with single item
PRINT 'Test 1: Basic successful checkout with single item'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @initial_quantity INT;
DECLARE @final_quantity INT;
DECLARE @item_id INT = 2;

-- Get initial quantity
SELECT @initial_quantity = quantity FROM Items WHERE id = @item_id;

-- Execute the procedure
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = N'[{"id": 2, "quantity": 1}]';

-- Get final quantity
SELECT @final_quantity = quantity FROM Items WHERE id = @item_id;

-- Assert: Quantity should decrease by 1
IF @final_quantity <> @initial_quantity - 1
    THROW 50001, 'Test 1 FAILED: Quantity not decreased correctly', 1;

-- Assert: Transaction should be created
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    THROW 50001, 'Test 1 FAILED: Transaction not created', 1;

-- Assert: TransactionItem should be created
IF NOT EXISTS (SELECT 1 FROM TransactionItems WHERE transaction_id = @new_transaction_id AND item_id = @item_id AND quantity = 1)
    THROW 50001, 'Test 1 FAILED: TransactionItem not created correctly', 1;

PRINT 'Test 1 PASSED: Basic checkout successful';
GO

-- Test 2: Multiple items checkout
PRINT 'Test 2: Multiple items checkout'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @initial_quantity_item2 INT;
DECLARE @final_quantity_item2 INT;
DECLARE @initial_quantity_item3 INT;
DECLARE @final_quantity_item3 INT;

-- Get initial quantities
SELECT @initial_quantity_item2 = quantity FROM Items WHERE id = 2;
SELECT @initial_quantity_item3 = quantity FROM Items WHERE id = 3;

-- Execute the procedure with multiple items
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = N'[{"id": 2, "quantity": 2}, {"id": 3, "quantity": 3}]';

-- Get final quantities
SELECT @final_quantity_item2 = quantity FROM Items WHERE id = 2;
SELECT @final_quantity_item3 = quantity FROM Items WHERE id = 3;

-- Assert: Both quantities should be updated correctly
IF @final_quantity_item2 <> @initial_quantity_item2 - 2
    THROW 50002, 'Test 2 FAILED: Item 2 quantity not decreased correctly', 1;
IF @final_quantity_item3 <> @initial_quantity_item3 - 3
    THROW 50002, 'Test 2 FAILED: Item 3 quantity not decreased correctly', 1;

-- Assert: Transaction should be created
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    THROW 50002, 'Test 2 FAILED: Transaction not created', 1;

PRINT 'Test 2 PASSED: Multiple items checkout successful';
GO

-- Test 3: Checkout with additional notes
PRINT 'Test 3: Checkout with additional notes'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @additional_notes NVARCHAR(255);

-- Execute the procedure with additional notes
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = N'[{"id": 2, "quantity": 1, "additional_notes": "Special request"}]';

-- Get the additional notes from TransactionItems
SELECT @additional_notes = additional_notes
FROM TransactionItems
WHERE transaction_id = @new_transaction_id AND item_id = 2;

-- Assert: Additional notes should be saved
IF @additional_notes <> 'Special request'
    THROW 50003, 'Test 3 FAILED: Additional notes not saved correctly', 1;

PRINT 'Test 3 PASSED: Additional notes saved successfully';
GO

-- Test 4: Invalid JSON format should fail
PRINT 'Test 4: Invalid JSON format'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @error_occurred BIT = 0;

BEGIN TRY
    EXEC ProcessCheckout
        @user_id = 1,
        @resident_id = 1,
        @new_transaction_id = @new_transaction_id,
        @items = N'This is not valid JSON';

    -- If we get here, the test failed because no error was thrown
    THROW 50004, 'Test 4 FAILED: Invalid JSON should have thrown an error', 1;
END TRY
BEGIN CATCH
    -- Expected behavior - an error was thrown
    SET @error_occurred = 1;
END CATCH

-- Assert: Error should have occurred
IF @error_occurred <> 1
    THROW 50004, 'Test 4 FAILED: Expected error for invalid JSON', 1;

PRINT 'Test 4 PASSED: Invalid JSON rejected correctly';
GO

-- Test 5: Duplicate transaction ID should fail
PRINT 'Test 5: Duplicate transaction ID'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @transaction_count INT;
DECLARE @initial_item2_qty INT;
DECLARE @after_first_qty INT;
DECLARE @final_qty INT;

-- Get initial quantity
SELECT @initial_item2_qty = quantity FROM Items WHERE id = 2;

-- First transaction should succeed
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = N'[{"id": 2, "quantity": 1}]';

-- Verify first transaction was created
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    THROW 50005, 'Test 5 FAILED: First transaction should have been created', 1;

-- Get quantity after first transaction
SELECT @after_first_qty = quantity FROM Items WHERE id = 2;

-- Second transaction with same ID should be rejected
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = N'[{"id": 2, "quantity": 1}]';

-- Assert: Should only have ONE transaction with this ID (not two)
SELECT @transaction_count = COUNT(*)
FROM Transactions
WHERE id = @new_transaction_id;

IF @transaction_count <> 1
    THROW 50005, 'Test 5 FAILED: Should only have one transaction with duplicate ID', 1;

-- Assert: Item 2 quantity should only have decreased once
SELECT @final_qty = quantity FROM Items WHERE id = 2;

IF @final_qty <> @after_first_qty
    THROW 50005, 'Test 5 FAILED: Quantity should not change for duplicate transaction attempt', 1;

PRINT 'Test 5 PASSED: Duplicate transaction ID rejected correctly';
GO

-- Test 6: Cart with more than 10 items (limit no longer enforced)
PRINT 'Test 6: Cart with more than 10 items (limit no longer enforced)'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @initial_quantity INT;
DECLARE @final_quantity INT;

-- Get initial quantity
SELECT @initial_quantity = quantity FROM Items WHERE id = 2;

-- Create temp table to capture result
CREATE TABLE #CartLimitResult (
    Status NVARCHAR(50),
    message NVARCHAR(MAX)
);

INSERT INTO #CartLimitResult
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = N'[{"id": 2, "quantity": 11}]';

-- Assert: Should succeed (cart limit is no longer enforced)
IF NOT EXISTS (SELECT 1 FROM #CartLimitResult WHERE Status = 'Success')
    THROW 50006, 'Test 6 FAILED: Checkout should succeed (cart limit no longer enforced)', 1;

-- Assert: Quantity should have decreased by 11
SELECT @final_quantity = quantity FROM Items WHERE id = 2;
IF @final_quantity <> (@initial_quantity - 11)
    THROW 50006, 'Test 6 FAILED: Quantity should decrease by 11', 1;

DROP TABLE #CartLimitResult;
PRINT 'Test 6 PASSED: Cart with 11 items checked out successfully (limit not enforced)';
GO

-- Test 7: Category checkout limit (limit no longer enforced)
PRINT 'Test 7: Category checkout limit (limit no longer enforced)'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @appliance_item_id INT;
DECLARE @items_json NVARCHAR(MAX);
DECLARE @initial_quantity INT;
DECLARE @final_quantity INT;

-- Find an item in Appliance category (checkout_limit = 1)
SELECT TOP 1 @appliance_item_id = id
FROM Items
WHERE category_id = 2; -- Appliance category

-- Get initial quantity
SELECT @initial_quantity = quantity FROM Items WHERE id = @appliance_item_id;

-- Build JSON string
SET @items_json = N'[{"id": ' + CAST(@appliance_item_id AS NVARCHAR) + ', "quantity": 2}]';

-- Create temp table to capture result
CREATE TABLE #CategoryLimitResult (
    Status NVARCHAR(50),
    message NVARCHAR(MAX)
);

INSERT INTO #CategoryLimitResult
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = @items_json;

-- Assert: Should succeed (category limit is no longer enforced)
IF NOT EXISTS (SELECT 1 FROM #CategoryLimitResult WHERE Status = 'Success')
    THROW 50007, 'Test 7 FAILED: Checkout should succeed (category limit no longer enforced)', 1;

-- Assert: Quantity should have decreased by 2
SELECT @final_quantity = quantity FROM Items WHERE id = @appliance_item_id;
IF @final_quantity <> (@initial_quantity - 2)
    THROW 50007, 'Test 7 FAILED: Quantity should decrease by 2', 1;

DROP TABLE #CategoryLimitResult;
PRINT 'Test 7 PASSED: Category limit not enforced, checkout succeeded';
GO

-- Test 8: Transaction type should be 1 (checkout)
PRINT 'Test 8: Verify transaction type is correct'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @transaction_type INT;

-- Execute the procedure
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = N'[{"id": 2, "quantity": 1}]';

-- Get transaction type
SELECT @transaction_type = transaction_type
FROM Transactions
WHERE id = @new_transaction_id;

-- Assert: Transaction type should be 1 (checkout)
IF @transaction_type <> 1
    THROW 50008, 'Test 8 FAILED: Transaction type should be 1 for checkout', 1;

PRINT 'Test 8 PASSED: Transaction type is correct';
GO

-- Test 9: Verify resident_id is stored correctly
PRINT 'Test 9: Verify resident_id is stored correctly'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @stored_resident_id INT;

-- Execute the procedure with resident_id = 2
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 2,
    @new_transaction_id = @new_transaction_id,
    @items = N'[{"id": 2, "quantity": 1}]';

-- Get stored resident_id
SELECT @stored_resident_id = resident_id
FROM Transactions
WHERE id = @new_transaction_id;

-- Assert: Resident ID should be stored correctly
IF @stored_resident_id <> 2
    THROW 50009, 'Test 9 FAILED: Resident ID not stored correctly', 1;

PRINT 'Test 9 PASSED: Resident ID stored correctly';
GO

-- Test 10: Verify user_id is stored correctly
PRINT 'Test 10: Verify user_id is stored correctly'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @stored_user_id INT;

-- Execute the procedure with user_id = 1
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = N'[{"id": 2, "quantity": 1}]';

-- Get stored user_id
SELECT @stored_user_id = user_id
FROM Transactions
WHERE id = @new_transaction_id;

-- Assert: User ID should be stored correctly
IF @stored_user_id <> 1
    THROW 50010, 'Test 10 FAILED: User ID not stored correctly', 1;

PRINT 'Test 10 PASSED: User ID stored correctly';
GO

-- Test 11: Maximum allowed items (10) should succeed
PRINT 'Test 11: Maximum allowed items (10) should succeed'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @personal_care_item INT;
DECLARE @kitchen_item INT;
DECLARE @home_goods_item INT;
DECLARE @initial_pc_qty INT;
DECLARE @final_pc_qty INT;
DECLARE @initial_kitchen_qty INT;
DECLARE @final_kitchen_qty INT;
DECLARE @initial_hg_qty INT;
DECLARE @final_hg_qty INT;
DECLARE @items_json NVARCHAR(MAX);

-- Find items from different categories with sufficient limits
-- Personal Care has limit 5, Kitchen has limit 4, Home Goods has limit 2
SELECT TOP 1 @personal_care_item = id FROM Items WHERE category_id = 10; -- Personal Care
SELECT TOP 1 @kitchen_item = id FROM Items WHERE category_id = 3; -- Kitchen
SELECT TOP 1 @home_goods_item = id FROM Items WHERE category_id = 1; -- Home Goods

-- Get initial quantities
SELECT @initial_pc_qty = quantity FROM Items WHERE id = @personal_care_item;
SELECT @initial_kitchen_qty = quantity FROM Items WHERE id = @kitchen_item;
SELECT @initial_hg_qty = quantity FROM Items WHERE id = @home_goods_item;

-- Build JSON string - totaling exactly 10 (5 + 4 + 1 = 10, respecting category limits)
SET @items_json = N'[{"id": ' + CAST(@personal_care_item AS NVARCHAR) + ', "quantity": 5}, {"id": ' + CAST(@kitchen_item AS NVARCHAR) + ', "quantity": 4}, {"id": ' + CAST(@home_goods_item AS NVARCHAR) + ', "quantity": 1}]';

-- Execute with items totaling exactly 10
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = @items_json;

-- Get final quantities
SELECT @final_pc_qty = quantity FROM Items WHERE id = @personal_care_item;
SELECT @final_kitchen_qty = quantity FROM Items WHERE id = @kitchen_item;
SELECT @final_hg_qty = quantity FROM Items WHERE id = @home_goods_item;

-- Assert: Transaction should succeed
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    THROW 50011, 'Test 11 FAILED: Transaction with 10 items should succeed', 1;

-- Assert: Quantities should decrease correctly
IF @final_pc_qty <> @initial_pc_qty - 5
    THROW 50011, 'Test 11 FAILED: Personal care item quantity not decreased correctly', 1;

IF @final_kitchen_qty <> @initial_kitchen_qty - 4
    THROW 50011, 'Test 11 FAILED: Kitchen item quantity not decreased correctly', 1;

IF @final_hg_qty <> @initial_hg_qty - 1
    THROW 50011, 'Test 11 FAILED: Home goods item quantity not decreased correctly', 1;

PRINT 'Test 11 PASSED: Maximum allowed items (10) processed successfully';
GO

-- Test 12: Multiple items totaling exactly 10 should succeed (different approach)
PRINT 'Test 12: Multiple items totaling exactly 10 should succeed'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @home_goods_item INT;
DECLARE @bathroom_item INT;
DECLARE @items_json NVARCHAR(MAX);

-- Find items from different categories
-- Home Goods has limit 2, Bathroom has limit 4, Kitchen has limit 4
SELECT TOP 1 @home_goods_item = id FROM Items WHERE category_id = 1; -- Home Goods
SELECT TOP 1 @bathroom_item = id FROM Items WHERE category_id = 5; -- Bathroom

-- Build JSON - totaling 10 with items from multiple categories (2 + 4 + 4 = 10)
SET @items_json = N'[{"id": ' + CAST(@home_goods_item AS NVARCHAR) + ', "quantity": 2}, {"id": ' + CAST(@bathroom_item AS NVARCHAR) + ', "quantity": 4}, {"id": 2, "quantity": 4}]';

-- Execute with multiple items totaling 10
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = @items_json;

-- Assert: Transaction should succeed
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    THROW 50012, 'Test 12 FAILED: Transaction with multiple items totaling 10 should succeed', 1;

PRINT 'Test 12 PASSED: Multiple items totaling 10 processed successfully';
GO

-- Test 13: Multiple items exceeding 10 total should fail
PRINT 'Test 13: Multiple items exceeding 10 total should fail'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @error_occurred BIT = 0;

BEGIN TRY
    -- Try to checkout multiple items totaling 11 (6 + 5 = 11)
    EXEC ProcessCheckout
        @user_id = 1,
        @resident_id = 1,
        @new_transaction_id = @new_transaction_id,
        @items = N'[{"id": 2, "quantity": 6}, {"id": 3, "quantity": 5}]';

    -- If we get here, test failed
    THROW 50013, 'Test 13 FAILED: Multiple items exceeding 10 should throw an error', 1;
END TRY
BEGIN CATCH
    -- Expected behavior - an error was thrown
    SET @error_occurred = 1;
END CATCH

-- Assert: Error should have occurred
IF @error_occurred <> 1
    THROW 50013, 'Test 13 FAILED: Expected error for cart limit exceeded', 1;

PRINT 'Test 13 PASSED: Multiple items exceeding 10 total rejected correctly';
GO

-- Test 14: Multiple items from same category at limit should succeed
PRINT 'Test 14: Multiple items from same category at limit should succeed'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @personal_care_item1 INT;
DECLARE @personal_care_item2 INT;
DECLARE @items_json NVARCHAR(MAX);

-- Find two different items in Personal Care category (checkout_limit = 5)
SELECT @personal_care_item1 = MIN(id)
FROM Items
WHERE category_id = 10;

SELECT @personal_care_item2 = MIN(id)
FROM Items
WHERE category_id = 10 AND id > @personal_care_item1;

-- Build JSON string
SET @items_json = N'[{"id": ' + CAST(@personal_care_item1 AS NVARCHAR) + ', "quantity": 3}, {"id": ' + CAST(@personal_care_item2 AS NVARCHAR) + ', "quantity": 2}]';

-- Execute with items totaling exactly the category limit (3 + 2 = 5)
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = @items_json;

-- Assert: Transaction should succeed
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    THROW 50014, 'Test 14 FAILED: Transaction at category limit should succeed', 1;

PRINT 'Test 14 PASSED: Multiple items at category limit processed successfully';
GO

-- Test 15: Empty JSON array
PRINT 'Test 15: Empty JSON array'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @transaction_items_count INT;

-- Execute with empty array
EXEC ProcessCheckout
    @user_id = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id,
    @items = N'[]';

-- Assert: Transaction should still be created
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    THROW 50015, 'Test 15 FAILED: Transaction should be created even with empty items', 1;

-- Check transaction items count
SELECT @transaction_items_count = COUNT(*)
FROM TransactionItems
WHERE transaction_id = @new_transaction_id;

-- Assert: No transaction items should be created
IF @transaction_items_count <> 0
    THROW 50015, 'Test 15 FAILED: No transaction items should be created for empty array', 1;

PRINT 'Test 15 PASSED: Empty JSON array handled correctly';
GO

PRINT '';
PRINT '========================================';
PRINT 'ALL TESTS PASSED for ProcessCheckout';
PRINT '========================================';
GO
