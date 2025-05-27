ALTER TABLE Transactions
    DROP COLUMN unit_number, resident_name;

ALTER TABLE Transactions
    ADD resident_id INT;