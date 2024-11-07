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

    -- Fetch the stored PIN for the given Volunteer ID
    SELECT @StoredPin = PIN
    FROM [dbo].[Volunteers]
    WHERE id = @VolunteerId;

    -- Check if the PIN was found
    IF @StoredPin IS NULL
    BEGIN
        SET @IsValid = 0;
        SET @ErrorMessage = 'Volunteer ID not found';
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