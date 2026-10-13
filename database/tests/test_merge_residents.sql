
-- Test MergeResidents stored procedure

-- Test 1: Merge residents, update target profile, and preserve history
PRINT 'Test 1: Merge resident, update target profile, and preserve transaction history';

DECLARE @source_resident_id INT;
DECLARE @target_resident_id INT;
DECLARE @source_transaction_id_1 UNIQUEIDENTIFIER = NEWID();
DECLARE @source_transaction_id_2 UNIQUEIDENTIFIER = NEWID();
DECLARE @target_transaction_id UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.Residents (name, unit_id)
VALUES ('Merge Source Resident', 1);

SET @source_resident_id = SCOPE_IDENTITY();

INSERT INTO dbo.Residents (name, unit_id)
VALUES ('Merge Target Resident', 2);

SET @target_resident_id = SCOPE_IDENTITY();

-- Source resident's historical transactions
INSERT INTO dbo.Transactions (
    id, user_id, resident_id, transaction_type,
    transaction_date, unit_id, building_id
)
VALUES
(
    @source_transaction_id_1, 1, @source_resident_id, 1,
    '2026-01-01 10:00:00', 1, 1
),
(
    @source_transaction_id_2, 1, @source_resident_id, 1,
    '2026-01-02 10:00:00', 2, 1
);

-- Target resident's existing transaction
INSERT INTO dbo.Transactions (
    id, user_id, resident_id, transaction_type,
    transaction_date, unit_id, building_id
)
VALUES (
    @target_transaction_id, 1, @target_resident_id, 1,
    '2026-01-03 10:00:00', 2, 1
);

EXEC dbo.MergeResidents
    @source_resident_id = @source_resident_id,
    @target_resident_id = @target_resident_id,
    @target_name = 'Merge Target Resident',
    @target_unit_id = 1;

-- Source resident should be deleted
IF EXISTS (
    SELECT 1 FROM dbo.Residents
    WHERE id = @source_resident_id
)
    THROW 50201, 'Test 1 FAILED: Source resident was not deleted', 1;

-- Target resident should remain with the requested profile
IF NOT EXISTS (
    SELECT 1 FROM dbo.Residents
    WHERE id = @target_resident_id
      AND name = 'Merge Target Resident'
      AND unit_id = 1
)
    THROW 50202, 'Test 1 FAILED: Target profile was not updated correctly', 1;

-- Both source transactions should now reference the target
IF (
    SELECT COUNT(*)
    FROM dbo.Transactions
    WHERE id IN (
        @source_transaction_id_1,
        @source_transaction_id_2
    )
      AND resident_id = @target_resident_id
) <> 2
    THROW 50203, 'Test 1 FAILED: Source transactions were not reassigned', 1;

-- First source transaction's historical location must remain unchanged
IF NOT EXISTS (
    SELECT 1 FROM dbo.Transactions
    WHERE id = @source_transaction_id_1
      AND resident_id = @target_resident_id
      AND unit_id = 1
      AND building_id = 1
)
    THROW 50204, 'Test 1 FAILED: First transaction snapshot changed', 1;

-- Second source transaction's historical location must remain unchanged
IF NOT EXISTS (
    SELECT 1 FROM dbo.Transactions
    WHERE id = @source_transaction_id_2
      AND resident_id = @target_resident_id
      AND unit_id = 2
      AND building_id = 1
)
    THROW 50205, 'Test 1 FAILED: Second transaction snapshot changed', 1;

-- Target's existing transaction must retain its original location
IF NOT EXISTS (
    SELECT 1 FROM dbo.Transactions
    WHERE id = @target_transaction_id
      AND resident_id = @target_resident_id
      AND unit_id = 2
      AND building_id = 1
)
    THROW 50206, 'Test 1 FAILED: Target transaction snapshot changed', 1;

PRINT 'Test 1 PASSED';

-- Clean up Test 1
DELETE FROM dbo.Transactions
WHERE id IN (
    @source_transaction_id_1,
    @source_transaction_id_2,
    @target_transaction_id
);

DELETE FROM dbo.Residents
WHERE id = @target_resident_id;
GO


-- Test 2: Merge a source resident with no transactions
PRINT 'Test 2: Merge resident with no transactions';

DECLARE @empty_source_resident_id INT;
DECLARE @target_resident_id_2 INT;

INSERT INTO dbo.Residents (name, unit_id)
VALUES ('Empty Source Resident', 1);

SET @empty_source_resident_id = SCOPE_IDENTITY();

INSERT INTO dbo.Residents (name, unit_id)
VALUES ('Empty Source Target Resident', 2);

SET @target_resident_id_2 = SCOPE_IDENTITY();

EXEC dbo.MergeResidents
    @source_resident_id = @empty_source_resident_id,
    @target_resident_id = @target_resident_id_2,
    @target_name = 'Empty Source Target Resident',
    @target_unit_id = 2;

IF EXISTS (
    SELECT 1 FROM dbo.Residents
    WHERE id = @empty_source_resident_id
)
    THROW 50207, 'Test 2 FAILED: Empty source resident was not deleted', 1;

IF NOT EXISTS (
    SELECT 1 FROM dbo.Residents
    WHERE id = @target_resident_id_2
      AND name = 'Empty Source Target Resident'
      AND unit_id = 2
)
    THROW 50208, 'Test 2 FAILED: Target profile was not updated', 1;

PRINT 'Test 2 PASSED';

-- Clean up Test 2
DELETE FROM dbo.Residents
WHERE id = @target_resident_id_2;
GO


-- Test 3: Invalid target unit must roll back the entire merge
PRINT 'Test 3: Invalid target unit rolls back the merge';

DECLARE @rollback_source_id INT;
DECLARE @rollback_target_id INT;
DECLARE @rollback_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @caught_error_number INT = NULL;

INSERT INTO dbo.Residents (name, unit_id)
VALUES ('Rollback Source Resident', 1);

SET @rollback_source_id = SCOPE_IDENTITY();

INSERT INTO dbo.Residents (name, unit_id)
VALUES ('Rollback Target Resident', 2);

SET @rollback_target_id = SCOPE_IDENTITY();

INSERT INTO dbo.Transactions (
    id, user_id, resident_id, transaction_type,
    transaction_date, unit_id, building_id
)
VALUES (
    @rollback_transaction_id, 1, @rollback_source_id, 1,
    '2026-01-04 10:00:00', 1, 1
);

BEGIN TRY
    EXEC dbo.MergeResidents
        @source_resident_id = @rollback_source_id,
        @target_resident_id = @rollback_target_id,
        @target_name = 'Rollback Target Resident',
        @target_unit_id = 2147483647;
END TRY
BEGIN CATCH
    SET @caught_error_number = ERROR_NUMBER();
END CATCH;

IF @caught_error_number IS NULL
    THROW 50209, 'Test 3 FAILED: Invalid unit should cause an error', 1;

IF @caught_error_number <> 51007
    THROW 50210, 'Test 3 FAILED: Unexpected error was raised', 1;

-- Source must still exist
IF NOT EXISTS (
    SELECT 1 FROM dbo.Residents
    WHERE id = @rollback_source_id
      AND name = 'Rollback Source Resident'
      AND unit_id = 1
)
    THROW 50211, 'Test 3 FAILED: Source resident was changed or deleted', 1;

-- Target profile must remain unchanged
IF NOT EXISTS (
    SELECT 1 FROM dbo.Residents
    WHERE id = @rollback_target_id
      AND name = 'Rollback Target Resident'
      AND unit_id = 2
)
    THROW 50212, 'Test 3 FAILED: Target profile changed despite rollback', 1;

-- Transaction must remain associated with the source
IF NOT EXISTS (
    SELECT 1 FROM dbo.Transactions
    WHERE id = @rollback_transaction_id
      AND resident_id = @rollback_source_id
      AND unit_id = 1
      AND building_id = 1
)
    THROW 50213, 'Test 3 FAILED: Transaction reassignment was not rolled back', 1;

PRINT 'Test 3 PASSED';

-- Clean up Test 3
DELETE FROM dbo.Transactions
WHERE id = @rollback_transaction_id;

DELETE FROM dbo.Residents
WHERE id IN (@rollback_source_id, @rollback_target_id);
GO

-- Test 4: Mismatched target name must roll back the entire merge
PRINT 'Test 4: Mismatched target name rolls back the merge';

DECLARE @name_source_id INT;
DECLARE @name_target_id INT;
DECLARE @name_transaction_id UNIQUEIDENTIFIER = NEWID();
DECLARE @name_error_number INT = NULL;

INSERT INTO dbo.Residents (name, unit_id)
VALUES ('Name Check Source', 1);

SET @name_source_id = SCOPE_IDENTITY();

INSERT INTO dbo.Residents (name, unit_id)
VALUES ('Different Existing Name', 2);

SET @name_target_id = SCOPE_IDENTITY();

INSERT INTO dbo.Transactions (
    id, user_id, resident_id, transaction_type,
    transaction_date, unit_id, building_id
)
VALUES (
    @name_transaction_id, 1, @name_source_id, 1,
    '2026-01-05 10:00:00', 1, 1
);

BEGIN TRY
    EXEC dbo.MergeResidents
        @source_resident_id = @name_source_id,
        @target_resident_id = @name_target_id,
        @target_name = 'Requested Name',
        @target_unit_id = 1;
END TRY
BEGIN CATCH
    SET @name_error_number = ERROR_NUMBER();
END CATCH;

IF @name_error_number IS NULL
    THROW 50214, 'Test 4 FAILED: Mismatched target name should cause an error', 1;

IF @name_error_number <> 51008
    THROW 50215, 'Test 4 FAILED: Unexpected error for mismatched target name', 1;

-- Source must remain unchanged
IF NOT EXISTS (
    SELECT 1 FROM dbo.Residents
    WHERE id = @name_source_id
      AND name = 'Name Check Source'
      AND unit_id = 1
)
    THROW 50216, 'Test 4 FAILED: Source resident changed despite rollback', 1;

-- Target must remain unchanged
IF NOT EXISTS (
    SELECT 1 FROM dbo.Residents
    WHERE id = @name_target_id
      AND name = 'Different Existing Name'
      AND unit_id = 2
)
    THROW 50217, 'Test 4 FAILED: Target resident changed despite rollback', 1;

-- Transaction must remain associated with the source with its snapshots intact
IF NOT EXISTS (
    SELECT 1 FROM dbo.Transactions
    WHERE id = @name_transaction_id
      AND resident_id = @name_source_id
      AND unit_id = 1
      AND building_id = 1
)
    THROW 50218, 'Test 4 FAILED: Transaction changed despite rollback', 1;

PRINT 'Test 4 PASSED';

-- Clean up Test 4
DELETE FROM dbo.Transactions
WHERE id = @name_transaction_id;

DELETE FROM dbo.Residents
WHERE id IN (@name_source_id, @name_target_id);
GO

PRINT '';
PRINT 'ALL TESTS PASSED for MergeResidents';
GO