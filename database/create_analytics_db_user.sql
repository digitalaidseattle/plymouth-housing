-- Read-only login for the Ask the Data card. This is the real security boundary:
-- even if the query validator were bypassed, this login cannot write, and cannot
-- read Users, which stores volunteer PINs in plain text.
--
-- bootstrap_db.ps1 runs this. It needs $env:ASK_DATA_PASSWORD set, and the same
-- password then goes in DATABASE_CONNECTION_STRING_ASK_DATA.

USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'analytics_reader')
    CREATE LOGIN analytics_reader WITH PASSWORD = '$(ASK_DATA_PASSWORD)';
GO

USE inventory;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'analytics_reader')
    CREATE USER analytics_reader FOR LOGIN analytics_reader;
GO

GRANT SELECT ON dbo.Buildings TO analytics_reader;
GRANT SELECT ON dbo.Categories TO analytics_reader;
GRANT SELECT ON dbo.Items TO analytics_reader;
GRANT SELECT ON dbo.Residents TO analytics_reader;
GRANT SELECT ON dbo.Tracking TO analytics_reader;
GRANT SELECT ON dbo.TransactionItems TO analytics_reader;
GRANT SELECT ON dbo.Transactions TO analytics_reader;
GRANT SELECT ON dbo.TransactionTypes TO analytics_reader;
GRANT SELECT ON dbo.Units TO analytics_reader;
GO

-- Needed so the Function can read column names to put in the prompt.
GRANT VIEW DEFINITION ON SCHEMA::dbo TO analytics_reader;
GO
