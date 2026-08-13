-- Delete all rows from the Volunteers table
DELETE FROM Buildings;
GO

INSERT INTO Buildings (name, code) VALUES
('Bob and Marcia Almquist Place', 'ALM'),
('Blake House', 'BKH'),
('Bertha Pits Campbell', 'CAM'),
('Colwell', 'COL'),
('Humphrey House', 'HUM'),
('Kristen Benson Place', 'KBP'),
('Plymouth Crossing', 'PCR'),
('Plymouth on First Hill', 'PFH'),
('Plymouth Place', 'PPL'),
('Plymouth on Stewart', 'PST'),
('Scargo Lewiston', 'SGO/LEW'),
('Simons Senior', 'SIM'),
('Sylvia Odom''s Place', 'SYL'),
('Toft Terrace', 'TFT'),
('Pat Williams', 'WIL'),
('Pacific Apartments', 'PAC'),
-- Voucher programs (PIT-506): PH-internal programs whose recipients are not
-- tied to a specific building or unit. Full names TBC by Kirsten; using
-- placeholders so the codes are usable in checkout immediately.
('SPC Voucher Program', 'SPC'),
('SSP Voucher Program', 'SSP');
GO