-- Test 1: Valid PIN - Correct PIN should verify successfully
PRINT 'Test 1: Valid PIN verification'
DECLARE @IsValid BIT;
DECLARE @ErrorMessage NVARCHAR(255);

EXEC [dbo].[VerifyVolunteerPin]
    @VolunteerId = 1,
    @EnteredPin = '1234',
    @IsValid = @IsValid OUTPUT,
    @ErrorMessage = @ErrorMessage OUTPUT;

-- Assert: IsValid should be 1 and ErrorMessage should be 'PIN is valid'
IF @IsValid <> 1
    THROW 50001, 'Test 1 FAILED: Expected IsValid=1 but got 0', 1;
IF @ErrorMessage <> 'PIN is valid'
    THROW 50001, 'Test 1 FAILED: Expected ErrorMessage="PIN is valid"', 1;

PRINT 'Test 1 PASSED: Valid PIN verified successfully';
GO

-- Test 2: Invalid PIN - Wrong PIN should fail verification
PRINT 'Test 2: Invalid PIN - Wrong PIN entered'
DECLARE @IsValid BIT;
DECLARE @ErrorMessage NVARCHAR(255);

EXEC [dbo].[VerifyVolunteerPin]
    @VolunteerId = 1,
    @EnteredPin = '9999',
    @IsValid = @IsValid OUTPUT,
    @ErrorMessage = @ErrorMessage OUTPUT;

-- Assert: IsValid should be 0 and ErrorMessage should indicate mismatch
IF @IsValid <> 0
    THROW 50002, 'Test 2 FAILED: Expected IsValid=0 for wrong PIN', 1;
IF @ErrorMessage <> 'Entered PIN does not match stored PIN'
    THROW 50002, 'Test 2 FAILED: Expected error message about PIN mismatch', 1;

PRINT 'Test 2 PASSED: Invalid PIN correctly rejected';
GO

-- Test 3: Non-existent Volunteer ID - Should return error
PRINT 'Test 3: Non-existent Volunteer ID'
DECLARE @IsValid BIT;
DECLARE @ErrorMessage NVARCHAR(255);

EXEC [dbo].[VerifyVolunteerPin]
    @VolunteerId = 99999,
    @EnteredPin = '1234',
    @IsValid = @IsValid OUTPUT,
    @ErrorMessage = @ErrorMessage OUTPUT;

-- Assert: IsValid should be 0 and ErrorMessage should indicate volunteer not found
IF @IsValid <> 0
    THROW 50003, 'Test 3 FAILED: Expected IsValid=0 for non-existent volunteer', 1;
IF @ErrorMessage <> 'Volunteer ID not found'
    THROW 50003, 'Test 3 FAILED: Expected "Volunteer ID not found" error message', 1;

PRINT 'Test 3 PASSED: Non-existent volunteer ID handled correctly';
GO

-- Test 4: NULL PIN - Edge case with NULL input
PRINT 'Test 4: NULL PIN entered'
DECLARE @IsValid BIT;
DECLARE @ErrorMessage NVARCHAR(255);

EXEC [dbo].[VerifyVolunteerPin]
    @VolunteerId = 1,
    @EnteredPin = NULL,
    @IsValid = @IsValid OUTPUT,
    @ErrorMessage = @ErrorMessage OUTPUT;

-- Assert: IsValid should be 0 and ErrorMessage should indicate invalid PIN
IF @IsValid <> 0
    THROW 50004, 'Test 4 FAILED: Expected IsValid=0 for NULL PIN', 1;
IF @ErrorMessage <> 'Entered PIN is invalid'
    THROW 50004, 'Test 4 FAILED: Expected "Entered PIN is invalid" error message', 1;

PRINT 'Test 4 PASSED: NULL PIN handled correctly';
GO

-- Test 5: Empty/blank PIN - Edge case with empty string
PRINT 'Test 5: Empty PIN entered'
DECLARE @IsValid BIT;
DECLARE @ErrorMessage NVARCHAR(255);

EXEC [dbo].[VerifyVolunteerPin]
    @VolunteerId = 1,
    @EnteredPin = '',
    @IsValid = @IsValid OUTPUT,
    @ErrorMessage = @ErrorMessage OUTPUT;

-- Assert: IsValid should be 0 and ErrorMessage should indicate invalid PIN
IF @IsValid <> 0
    THROW 50005, 'Test 5 FAILED: Expected IsValid=0 for empty PIN', 1;
IF @ErrorMessage <> 'Entered PIN is invalid'
    THROW 50005, 'Test 5 FAILED: Expected "Entered PIN is invalid" error message', 1;

PRINT 'Test 5 PASSED: Empty PIN handled correctly';
GO

-- Test 6: PIN with leading/trailing spaces - Edge case
PRINT 'Test 6: PIN with spaces'
DECLARE @IsValid BIT;
DECLARE @ErrorMessage NVARCHAR(255);

EXEC [dbo].[VerifyVolunteerPin]
    @VolunteerId = 1,
    @EnteredPin = ' 123',
    @IsValid = @IsValid OUTPUT,
    @ErrorMessage = @ErrorMessage OUTPUT;

-- Assert: IsValid should be 0 and ErrorMessage should indicate invalid PIN
IF @IsValid <> 0
    THROW 50006, 'Test 6 FAILED: Expected IsValid=0 for PIN with spaces', 1;
IF @ErrorMessage <> 'Entered PIN is invalid'
    THROW 50006, 'Test 6 FAILED: Expected "Entered PIN is invalid" error message', 1;

PRINT 'Test 6 PASSED: PIN with spaces handled correctly';
PRINT '';
PRINT 'ALL TESTS PASSED for VerifyVolunteerPin';
GO