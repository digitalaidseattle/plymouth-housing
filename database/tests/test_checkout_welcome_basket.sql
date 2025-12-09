-- Unit tests for ProcessWelcomeBasketCheckout Stored Procedure

-- Test 1: Basic welcome basket checkout with Twin sheet set
PRINT 'Test 1: Basic welcome basket checkout with Twin sheet set'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @twin_mattress_id INT;
DECLARE @initial_laundry_basket_qty INT;
DECLARE @final_laundry_basket_qty INT;
DECLARE @initial_twin_sheet_qty INT;
DECLARE @final_twin_sheet_qty INT;
DECLARE @item_id_laundry_basket INT;

-- Get mattress size ID
SELECT @twin_mattress_id = id FROM Items WHERE name = 'Twin-size Sheet Set';

-- Get item IDs
SELECT @item_id_laundry_basket = id FROM Items WHERE name = 'Laundry basket';

-- Get initial quantities
SELECT @initial_laundry_basket_qty = quantity FROM Items WHERE id = @item_id_laundry_basket;
SELECT @initial_twin_sheet_qty = quantity FROM Items WHERE id = @twin_mattress_id;

-- Execute the procedure
EXEC ProcessWelcomeBasketCheckout
    @user_id = 1,
    @mattress_size = @twin_mattress_id,
    @quantity = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id;

-- Get final quantities
SELECT @final_laundry_basket_qty = quantity FROM Items WHERE id = @item_id_laundry_basket;
SELECT @final_twin_sheet_qty = quantity FROM Items WHERE id = @twin_mattress_id;

-- Assert: Transaction should be created
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    THROW 50001, 'Test 1 FAILED: Transaction not created', 1;

-- Assert: Laundry basket should decrease by 1 (items_per_basket = 1 * quantity = 1)
IF @final_laundry_basket_qty <> @initial_laundry_basket_qty - 1
    THROW 50001, 'Test 1 FAILED: Laundry basket quantity not decreased correctly', 1;

-- Assert: Twin sheet set should decrease by 1 (quantity = 1)
IF @final_twin_sheet_qty <> @initial_twin_sheet_qty - 1
    THROW 50001, 'Test 1 FAILED: Twin sheet set quantity not decreased correctly', 1;

-- Assert: TransactionItem for sheet set should exist
IF NOT EXISTS (SELECT 1 FROM TransactionItems WHERE transaction_id = @new_transaction_id AND item_id = @twin_mattress_id AND quantity = 1)
    THROW 50001, 'Test 1 FAILED: TransactionItem for Twin sheet set not created correctly', 1;

PRINT 'Test 1 PASSED: Basic welcome basket checkout successful';
GO

-- Test 2: Welcome basket checkout with Full sheet set
PRINT 'Test 2: Welcome basket checkout with Full sheet set'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @full_mattress_id INT;
DECLARE @initial_full_sheet_qty INT;
DECLARE @final_full_sheet_qty INT;

-- Get mattress size ID
SELECT @full_mattress_id = id FROM Items WHERE name = 'Full-size sheet set';

-- Get initial quantity
SELECT @initial_full_sheet_qty = quantity FROM Items WHERE id = @full_mattress_id;

-- Execute the procedure
EXEC ProcessWelcomeBasketCheckout
    @user_id = 1,
    @mattress_size = @full_mattress_id,
    @quantity = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id;

-- Get final quantity
SELECT @final_full_sheet_qty = quantity FROM Items WHERE id = @full_mattress_id;

-- Assert: Transaction should be created
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    THROW 50002, 'Test 2 FAILED: Transaction not created', 1;

-- Assert: Full sheet set should decrease by 1
IF @final_full_sheet_qty <> @initial_full_sheet_qty - 1
    THROW 50002, 'Test 2 FAILED: Full sheet set quantity not decreased correctly', 1;

-- Assert: TransactionItem for Full sheet set should exist
IF NOT EXISTS (SELECT 1 FROM TransactionItems WHERE transaction_id = @new_transaction_id AND item_id = @full_mattress_id AND quantity = 1)
    THROW 50002, 'Test 2 FAILED: TransactionItem for Full sheet set not created correctly', 1;

PRINT 'Test 2 PASSED: Full-size sheet set checkout successful';
GO

-- Test 3: Multiple quantity welcome basket checkout
PRINT 'Test 3: Multiple quantity welcome basket checkout'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @twin_mattress_id INT;
DECLARE @initial_dinner_plates_qty INT;
DECLARE @final_dinner_plates_qty INT;
DECLARE @initial_twin_sheet_qty INT;
DECLARE @final_twin_sheet_qty INT;
DECLARE @item_id_dinner_plates INT;

-- Get mattress size ID
SELECT @twin_mattress_id = id FROM Items WHERE name = 'Twin-size Sheet Set';

-- Get item ID for dinner plates (items_per_basket = 2)
SELECT @item_id_dinner_plates = id FROM Items WHERE name = 'Dinner plates';

-- Get initial quantities
SELECT @initial_dinner_plates_qty = quantity FROM Items WHERE id = @item_id_dinner_plates;
SELECT @initial_twin_sheet_qty = quantity FROM Items WHERE id = @twin_mattress_id;

-- Execute the procedure with quantity = 2
EXEC ProcessWelcomeBasketCheckout
    @user_id = 1,
    @mattress_size = @twin_mattress_id,
    @quantity = 2,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id;

-- Get final quantities
SELECT @final_dinner_plates_qty = quantity FROM Items WHERE id = @item_id_dinner_plates;
SELECT @final_twin_sheet_qty = quantity FROM Items WHERE id = @twin_mattress_id;

-- Assert: Dinner plates should decrease by 4 (items_per_basket = 2 * quantity = 2)
IF @final_dinner_plates_qty <> @initial_dinner_plates_qty - 4
    THROW 50003, 'Test 3 FAILED: Dinner plates quantity not decreased correctly for multiple baskets', 1;

-- Assert: Twin sheet sets should decrease by 2 (quantity = 2)
IF @final_twin_sheet_qty <> @initial_twin_sheet_qty - 2
    THROW 50003, 'Test 3 FAILED: Twin sheet set quantity not decreased correctly for multiple baskets', 1;

-- Assert: TransactionItem for dinner plates should have quantity = 4
IF NOT EXISTS (SELECT 1 FROM TransactionItems WHERE transaction_id = @new_transaction_id AND item_id = @item_id_dinner_plates AND quantity = 4)
    THROW 50003, 'Test 3 FAILED: TransactionItem for dinner plates not created with correct quantity', 1;

-- Assert: TransactionItem for sheet sets should have quantity = 2
IF NOT EXISTS (SELECT 1 FROM TransactionItems WHERE transaction_id = @new_transaction_id AND item_id = @twin_mattress_id AND quantity = 2)
    THROW 50003, 'Test 3 FAILED: TransactionItem for Twin sheet sets not created with correct quantity', 1;

PRINT 'Test 3 PASSED: Multiple quantity welcome basket checkout successful';
GO

-- Test 4: Verify all welcome basket items are included
PRINT 'Test 4: Verify all welcome basket items with items_per_basket > 0 are included'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @twin_mattress_id INT;
DECLARE @expected_item_count INT;
DECLARE @actual_item_count INT;

-- Get mattress size ID
SELECT @twin_mattress_id = id FROM Items WHERE name = 'Twin-size Sheet Set';

-- Count expected welcome basket items (items_per_basket > 0) + 1 for the sheet set
SELECT @expected_item_count = COUNT(*) + 1
FROM Items
WHERE type = 'Welcome Basket' AND items_per_basket > 0;

-- Execute the procedure
EXEC ProcessWelcomeBasketCheckout
    @user_id = 1,
    @mattress_size = @twin_mattress_id,
    @quantity = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id;

-- Count actual transaction items
SELECT @actual_item_count = COUNT(*)
FROM TransactionItems
WHERE transaction_id = @new_transaction_id;

-- Assert: All welcome basket items should be included
IF @actual_item_count <> @expected_item_count
    THROW 50004, 'Test 4 FAILED: Not all welcome basket items were included in the transaction', 1;

PRINT 'Test 4 PASSED: All welcome basket items included correctly';
GO

-- Test 5: Duplicate transaction ID should fail
PRINT 'Test 5: Duplicate transaction ID'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @transaction_count INT;
DECLARE @twin_mattress_id INT;
DECLARE @initial_laundry_basket_qty INT;
DECLARE @after_first_qty INT;
DECLARE @final_qty INT;
DECLARE @item_id_laundry_basket INT;

-- Get IDs
SELECT @twin_mattress_id = id FROM Items WHERE name = 'Twin-size Sheet Set';
SELECT @item_id_laundry_basket = id FROM Items WHERE name = 'Laundry basket';

-- Get initial quantity
SELECT @initial_laundry_basket_qty = quantity FROM Items WHERE id = @item_id_laundry_basket;

-- First transaction should succeed
EXEC ProcessWelcomeBasketCheckout
    @user_id = 1,
    @mattress_size = @twin_mattress_id,
    @quantity = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id;

-- Verify first transaction was created
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    THROW 50005, 'Test 5 FAILED: First transaction should have been created', 1;

-- Get quantity after first transaction
SELECT @after_first_qty = quantity FROM Items WHERE id = @item_id_laundry_basket;

-- Second transaction with same ID should be rejected
EXEC ProcessWelcomeBasketCheckout
    @user_id = 1,
    @mattress_size = @twin_mattress_id,
    @quantity = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id;

-- Assert: Should only have ONE transaction with this ID (not two)
SELECT @transaction_count = COUNT(*)
FROM Transactions
WHERE id = @new_transaction_id;

IF @transaction_count <> 1
    THROW 50005, 'Test 5 FAILED: Should only have one transaction with duplicate ID', 1;

-- Assert: Laundry basket quantity should only have decreased once
SELECT @final_qty = quantity FROM Items WHERE id = @item_id_laundry_basket;

IF @final_qty <> @after_first_qty
    THROW 50005, 'Test 5 FAILED: Quantity should not change for duplicate transaction attempt', 1;

PRINT 'Test 5 PASSED: Duplicate transaction ID rejected correctly';
GO

-- Test 6: Transaction type should be 1 (checkout)
PRINT 'Test 6: Verify transaction type is correct'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @transaction_type INT;
DECLARE @twin_mattress_id INT;

-- Get mattress size ID
SELECT @twin_mattress_id = id FROM Items WHERE name = 'Twin-size Sheet Set';

-- Execute the procedure
EXEC ProcessWelcomeBasketCheckout
    @user_id = 1,
    @mattress_size = @twin_mattress_id,
    @quantity = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id;

-- Get transaction type
SELECT @transaction_type = transaction_type
FROM Transactions
WHERE id = @new_transaction_id;

-- Assert: Transaction type should be 1 (checkout)
IF @transaction_type <> 1
    THROW 50006, 'Test 6 FAILED: Transaction type should be 1 for checkout', 1;

PRINT 'Test 6 PASSED: Transaction type is correct';
GO

-- Test 7: Verify resident_id is stored correctly
PRINT 'Test 7: Verify resident_id is stored correctly'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @stored_resident_id INT;
DECLARE @twin_mattress_id INT;

-- Get mattress size ID
SELECT @twin_mattress_id = id FROM Items WHERE name = 'Twin-size Sheet Set';

-- Execute the procedure with resident_id = 2
EXEC ProcessWelcomeBasketCheckout
    @user_id = 1,
    @mattress_size = @twin_mattress_id,
    @quantity = 1,
    @resident_id = 2,
    @new_transaction_id = @new_transaction_id;

-- Get stored resident_id
SELECT @stored_resident_id = resident_id
FROM Transactions
WHERE id = @new_transaction_id;

-- Assert: Resident ID should be stored correctly
IF @stored_resident_id <> 2
    THROW 50007, 'Test 7 FAILED: Resident ID not stored correctly', 1;

PRINT 'Test 7 PASSED: Resident ID stored correctly';
GO

-- Test 8: Verify sheet sets with items_per_basket = 0 are not auto-included
PRINT 'Test 8: Verify only specified mattress size sheet set is included'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @twin_mattress_id INT;
DECLARE @full_mattress_id INT;
DECLARE @twin_in_transaction BIT = 0;
DECLARE @full_in_transaction BIT = 0;

-- Get mattress size IDs
SELECT @twin_mattress_id = id FROM Items WHERE name = 'Twin-size Sheet Set';
SELECT @full_mattress_id = id FROM Items WHERE name = 'Full-size sheet set';

-- Execute the procedure with Twin mattress size
EXEC ProcessWelcomeBasketCheckout
    @user_id = 1,
    @mattress_size = @twin_mattress_id,
    @quantity = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id;

-- Check which sheet sets are in the transaction
IF EXISTS (SELECT 1 FROM TransactionItems WHERE transaction_id = @new_transaction_id AND item_id = @twin_mattress_id)
    SET @twin_in_transaction = 1;

IF EXISTS (SELECT 1 FROM TransactionItems WHERE transaction_id = @new_transaction_id AND item_id = @full_mattress_id)
    SET @full_in_transaction = 1;

-- Assert: Twin should be included, Full should NOT be included
IF @twin_in_transaction <> 1
    THROW 50008, 'Test 8 FAILED: Twin sheet set should be included', 1;

IF @full_in_transaction = 1
    THROW 50008, 'Test 8 FAILED: Full sheet set should NOT be included when Twin is selected', 1;

PRINT 'Test 8 PASSED: Only specified mattress size sheet set is included';
GO

-- Test 9: Verify items with items_per_basket = 2 get correct quantities
PRINT 'Test 9: Verify items with items_per_basket = 2 get correct quantities'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @twin_mattress_id INT;
DECLARE @spoons_qty INT;
DECLARE @forks_qty INT;

-- Get mattress size ID
SELECT @twin_mattress_id = id FROM Items WHERE name = 'Twin-size Sheet Set';

-- Execute the procedure with quantity = 3
EXEC ProcessWelcomeBasketCheckout
    @user_id = 1,
    @mattress_size = @twin_mattress_id,
    @quantity = 3,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id;

-- Get quantities for items with items_per_basket = 2
SELECT @spoons_qty = ti.quantity
FROM TransactionItems ti
JOIN Items i ON ti.item_id = i.id
WHERE ti.transaction_id = @new_transaction_id AND i.name = 'Spoons';

SELECT @forks_qty = ti.quantity
FROM TransactionItems ti
JOIN Items i ON ti.item_id = i.id
WHERE ti.transaction_id = @new_transaction_id AND i.name = 'Forks';

-- Assert: Spoons should have quantity = 6 (items_per_basket = 2 * quantity = 3)
IF @spoons_qty <> 6
    THROW 50009, 'Test 9 FAILED: Spoons quantity should be 6 (2 * 3)', 1;

-- Assert: Forks should have quantity = 6 (items_per_basket = 2 * quantity = 3)
IF @forks_qty <> 6
    THROW 50009, 'Test 9 FAILED: Forks quantity should be 6 (2 * 3)', 1;

PRINT 'Test 9 PASSED: Items with items_per_basket = 2 calculated correctly';
GO

-- Test 10: Verify user_id is stored correctly
PRINT 'Test 10: Verify user_id is stored correctly'
DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @stored_user_id INT;
DECLARE @twin_mattress_id INT;

-- Get mattress size ID
SELECT @twin_mattress_id = id FROM Items WHERE name = 'Twin-size Sheet Set';

-- Execute the procedure with user_id = 1
EXEC ProcessWelcomeBasketCheckout
    @user_id = 1,
    @mattress_size = @twin_mattress_id,
    @quantity = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id;

-- Get stored user_id
SELECT @stored_user_id = user_id
FROM Transactions
WHERE id = @new_transaction_id;

-- Assert: User ID should be stored correctly
IF @stored_user_id <> 1
    THROW 50010, 'Test 10 FAILED: User ID not stored correctly', 1;

PRINT 'Test 10 PASSED: User ID stored correctly';
GO

PRINT '';
PRINT '========================================';
PRINT 'ALL TESTS PASSED for ProcessWelcomeBasketCheckout';
PRINT '========================================';
GO
