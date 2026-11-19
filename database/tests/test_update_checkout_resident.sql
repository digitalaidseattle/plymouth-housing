-- Test UpdateCheckoutResident stored procedure

-- Create test residents
DECLARE @original_resident_id INT;
DECLARE @corrected_resident_id INT;

INSERT INTO dbo.Residents (name, unit_id)
VALUES ('PIT520 Original Resident', 1);

SET @original_resident_id = SCOPE_IDENTITY();

INSERT INTO dbo.Residents (name, unit_id)
VALUES ('PIT520 Corrected Resident', 2);

SET @corrected_resident_id = SCOPE_IDENTITY();


-- Test 1: Update a standalone checkout with no children
PRINT 'Test 1: Update standalone checkout without children';

DECLARE @standalone_id UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.Transactions (
    id, user_id, resident_id, transaction_type
)
VALUES (
    @standalone_id, 1, @original_resident_id, 1
);

EXEC dbo.UpdateCheckoutResident
    @transaction_id = @standalone_id,
    @resident_id = @corrected_resident_id;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.Transactions
    WHERE id = @standalone_id
      AND resident_id = @corrected_resident_id
)
    THROW 50101, 'Test 1 FAILED: Standalone checkout was not updated.', 1;

PRINT 'Test 1 PASSED';


-- Test 2: Update original checkout and all direct children
PRINT 'Test 2: Update original checkout and its children';

DECLARE @original_id UNIQUEIDENTIFIER = NEWID();
DECLARE @child_1_id UNIQUEIDENTIFIER = NEWID();
DECLARE @child_2_id UNIQUEIDENTIFIER = NEWID();

-- Create original checkout
INSERT INTO dbo.Transactions (
    id, user_id, resident_id, transaction_type
)
VALUES (
    @original_id, 1, @original_resident_id, 1
);

-- Create two correction transactions pointing to the original
INSERT INTO dbo.Transactions (
    id, user_id, resident_id, transaction_type,
    parent_transaction_id
)
VALUES
(
    @child_1_id, 1, @original_resident_id, 4, @original_id
),
(
    @child_2_id, 1, @original_resident_id, 4, @original_id
);

EXEC dbo.UpdateCheckoutResident
    @transaction_id = @original_id,
    @resident_id = @corrected_resident_id;

-- Original and both children should reference the corrected resident
IF (
    SELECT COUNT(*)
    FROM dbo.Transactions
    WHERE id IN (
        @original_id,
        @child_1_id,
        @child_2_id
    )
      AND resident_id = @corrected_resident_id
) <> 3
    THROW 50102, 'Test 2 FAILED: Original and all children were not updated.', 1;

PRINT 'Test 2 PASSED';


-- Test 3: Unrelated transaction must remain unchanged
PRINT 'Test 3: Unrelated transaction must not be updated';

DECLARE @unrelated_id UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.Transactions (
    id, user_id, resident_id, transaction_type
)
VALUES (
    @unrelated_id, 1, @original_resident_id, 1
);

EXEC dbo.UpdateCheckoutResident
    @transaction_id = @original_id,
    @resident_id = @corrected_resident_id;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.Transactions
    WHERE id = @unrelated_id
      AND resident_id = @original_resident_id
)
    THROW 50103, 'Test 3 FAILED: Unrelated transaction was modified.', 1;

PRINT 'Test 3 PASSED';


-- Test 4: A correction transaction cannot be used as the original ID
PRINT 'Test 4: Reject correction transaction as original ID';

DECLARE @error_occurred BIT = 0;

BEGIN TRY
    EXEC dbo.UpdateCheckoutResident
        @transaction_id = @child_1_id,
        @resident_id = @original_resident_id;
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() = 51003
        SET @error_occurred = 1;
    ELSE
        THROW;
END CATCH;

IF @error_occurred = 0
    THROW 50104, 'Test 4 FAILED: Correction transaction was accepted as original.', 1;

PRINT 'Test 4 PASSED';


-- Test 5: A nonexistent transaction must be rejected
PRINT 'Test 5: Reject nonexistent transaction';

DECLARE @nonexistent_transaction_id UNIQUEIDENTIFIER = NEWID();
SET @error_occurred = 0;

BEGIN TRY
    EXEC dbo.UpdateCheckoutResident
        @transaction_id = @nonexistent_transaction_id,
        @resident_id = @corrected_resident_id;
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() = 51003
        SET @error_occurred = 1;
    ELSE
        THROW;
END CATCH;

IF @error_occurred = 0
    THROW 50105, 'Test 5 FAILED: Nonexistent transaction was accepted.', 1;

PRINT 'Test 5 PASSED';


-- Clean up test data
DELETE FROM dbo.Transactions
WHERE id IN (
    @standalone_id,
    @original_id,
    @child_1_id,
    @child_2_id,
    @unrelated_id
);

DELETE FROM dbo.Residents
WHERE id IN (
    @original_resident_id,
    @corrected_resident_id
);

PRINT '';
PRINT 'ALL TESTS PASSED for UpdateCheckoutResident';
GO
