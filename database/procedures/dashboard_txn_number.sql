DROP PROCEDURE IF EXISTS [dbo].[DashBoardTransactionsThisWeek];
GO

CREATE PROCEDURE DashBoardTransactionsThisWeek
    @TransactionCount INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ThisWeekStart DATETIME;

    -- Get this week's Monday (subtract days to get to current week's Monday)
    SET @ThisWeekStart = DATEADD(
        DAY, 
        -(DATEPART(WEEKDAY, GETDATE()) - 2), 
        CAST(GETDATE() AS DATE)
    );

    SELECT 
        @TransactionCount = COUNT(DISTINCT transaction_id)
    FROM 
        Transactions
    WHERE 
        transaction_date >= @ThisWeekStart
        AND transaction_date < GETDATE()
        AND transaction_type = 'CHECKOUT';

    IF @TransactionCount IS NULL
        SET @TransactionCount = 0;

    SELECT @TransactionCount AS TransactionCount
END;
GO

DROP PROCEDURE IF EXISTS [dbo].[DashBoardTransactionsLastWeek];
GO

CREATE PROCEDURE DashBoardTransactionsLastWeek
    @TransactionCount INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @LastWeekStart DATETIME;
    DECLARE @LastWeekEnd DATETIME;
    
    -- Get last week's Monday (subtract days to get to Monday of previous week)
    SET @LastWeekStart = DATEADD(
        DAY, 
        -(DATEPART(WEEKDAY, GETDATE()) + 6), 
        CAST(GETDATE() AS DATE)
    );
    
    -- Get last week's Sunday (add 6 days to Monday to get to Sunday)
    SET @LastWeekEnd = DATEADD(DAY, 6, @LastWeekStart);

    SELECT 
        @TransactionCount = COUNT(DISTINCT transaction_id)
    FROM 
        Transactions
    WHERE 
        transaction_date >= @LastWeekStart
        AND transaction_date < DATEADD(DAY, 1, @LastWeekEnd)
        AND transaction_type = 'CHECKOUT';

    IF @TransactionCount IS NULL
        SET @TransactionCount = 0;

    SELECT @TransactionCount AS TransactionCount
END;
GO