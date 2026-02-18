-- Migration: add original_transaction_id to Transactions
-- Run this once against any existing database that was created before this column was added.
-- The column is nullable so existing rows are unaffected.

IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Transactions')
      AND name = N'original_transaction_id'
)
BEGIN
    ALTER TABLE dbo.Transactions
    ADD original_transaction_id UNIQUEIDENTIFIER NULL;
END
GO
