DROP PROCEDURE IF EXISTS [dbo].[VerifyVolunteerPin];
GO

CREATE PROCEDURE [dbo].[VerifyVolunteerPin]
    @VolunteerId INT,
    @EnteredPin CHAR(4),
    @IsValid BIT OUTPUT,
    @ErrorMessage NVARCHAR(255) OUTPUT
AS
BEGIN
    DECLARE @StoredPin CHAR(4);

    -- Validate entered PIN is not NULL, empty, or contains invalid characters
    IF @EnteredPin IS NULL OR LTRIM(RTRIM(@EnteredPin)) = '' OR LEN(LTRIM(RTRIM(@EnteredPin))) <> 4
    BEGIN
        SET @IsValid = 0;
        SET @ErrorMessage = 'Entered PIN is invalid';
        SELECT @IsValid AS IsValid, @ErrorMessage AS ErrorMessage;
        RETURN;
    END;

    -- Fetch the stored PIN for the given Volunteer ID
    SELECT @StoredPin = PIN
    FROM [dbo].[Users]
    WHERE id = @VolunteerId;

    -- Check if the PIN was found
    IF @StoredPin IS NULL
    BEGIN
        SET @IsValid = 0;
        SET @ErrorMessage = 'Volunteer ID not found';
        SELECT @IsValid AS IsValid, @ErrorMessage AS ErrorMessage;
        RETURN;
    END;

    -- Compare the entered PIN with the stored PIN
    IF (@StoredPin = @EnteredPin)
    BEGIN
        SET @IsValid = 1;
        SET @ErrorMessage = 'PIN is valid';
    END
    ELSE
    BEGIN
        SET @IsValid = 0;
        SET @ErrorMessage = 'Entered PIN does not match stored PIN';
    END;

    -- Return the output parameters as a result set
    SELECT @IsValid AS IsValid, @ErrorMessage AS ErrorMessage;
END;
GO