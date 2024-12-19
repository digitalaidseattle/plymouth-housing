DECLARE @IsValid BIT;
DECLARE @ErrorMessage NVARCHAR(255);

EXEC [dbo].[VerifyVolunteerPin]
    @VolunteerId = 1,
    @EnteredPin = '1234',
    @IsValid = @IsValid OUTPUT,
    @ErrorMessage = @ErrorMessage OUTPUT;

SELECT @IsValid AS IsValid, @ErrorMessage AS ErrorMessage;