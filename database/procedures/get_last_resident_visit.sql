DROP PROCEDURE IF EXISTS [dbo].[GetLastResidentVisit];
GO

CREATE PROCEDURE GetLastResidentVisit
    @resident_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        transaction_date
    FROM Transactions
    WHERE resident_id = @resident_id
    ORDER BY transaction_date DESC;
END;
GO
