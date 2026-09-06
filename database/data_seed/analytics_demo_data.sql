-- Demo data for the Admin Analytics page. Local dev only.
-- Skipped by a plain bootstrap. Run: ./database/bootstrap_db.ps1 -SeedDemoData
-- Re-runnable: the previous run's rows are removed first.

-- =============================================================================
-- Settings
-- =============================================================================

DECLARE @Anchor       DATETIME = CAST(CAST(GETDATE() AS DATE) AS DATETIME);
DECLARE @Days         INT      = 365;
DECLARE @DenseDays    INT      = 21;   -- recent days that always get checkouts
DECLARE @WelcomeEvery INT      = 36;   -- every Nth checkout is a welcome basket
DECLARE @EditEvery    INT      = 12;   -- every Nth ordinary checkout is edited later

-- Opening hours, in minutes into the day.
DECLARE @PantryOpens INT = 9 * 60, @PantryCloses INT = 17 * 60;
DECLARE @StockOpens  INT = 8 * 60, @StockCloses  INT = 14 * 60;

DECLARE @DateSkew     FLOAT = 1.2;  -- 1 spreads checkouts evenly over @Days, higher bunches them near today
DECLARE @ResidentSkew FLOAT = 2.0;  -- 1 treats residents alike, higher lets a minority make most of the visits
DECLARE @ItemSkew     FLOAT = 0.5;  -- 0 treats items alike, higher favours the front of the item pool

DECLARE @Checkout     INT = (SELECT id FROM TransactionTypes WHERE transaction_type = 'CHECKOUT');
DECLARE @CheckoutEdit INT = (SELECT id FROM TransactionTypes WHERE transaction_type = 'CHECKOUT_EDIT');
DECLARE @Restock      INT = (SELECT id FROM TransactionTypes WHERE transaction_type = 'RESTOCK');
DECLARE @Correction   INT = (SELECT id FROM TransactionTypes WHERE transaction_type = 'CORRECTION');

-- GetCheckoutHistory recognises a welcome basket by one of these two sheet sets.
DECLARE @TwinSheets INT = 171, @FullSheets INT = 172;

-- How many of each kind to write, how far back, how many land today, and what their lines look like.
DECLARE @Kinds TABLE (
    kind       VARCHAR(20) PRIMARY KEY,
    type_id    INT   NOT NULL,
    total      INT   NOT NULL,
    days_back  INT   NOT NULL,
    land_today INT   NOT NULL,
    lines_min  INT   NOT NULL,
    lines_max  INT   NOT NULL,
    qty_min    INT   NOT NULL,
    qty_max    INT   NOT NULL,
    item_skew  FLOAT NOT NULL
);

INSERT INTO @Kinds
    (kind,             type_id,     total, days_back, land_today, lines_min, lines_max, qty_min, qty_max, item_skew)
VALUES
    ('checkout',       @Checkout,   500,   @Days,     0,          1,         6,         1,       3,       @ItemSkew),
    ('restock',        @Restock,    60,    @Days,     0,          3,         10,        10,      59,      0),
    ('correction',     @Correction, 10,    @Days,     0,          1,         1,         1,       30,      0),
    -- Keeps the Top 10 Inventory Items Added chart populated on the short-range views.
    ('recent_restock', @Restock,    18,    14,        3,          3,         7,         12,      71,      @ItemSkew);

-- =============================================================================
-- Reset
-- =============================================================================

DELETE FROM TransactionItems;
DELETE FROM Transactions;

-- =============================================================================
-- Residents
-- =============================================================================
-- Counts per building are uneven on purpose, so the Residents Served by Building chart ranks.

DECLARE @DemoResidents TABLE (name NVARCHAR(255), building_id INT);

INSERT INTO @DemoResidents
    (name, building_id)
VALUES
    ('Alice Nguyen', 1),
    ('Ben Brooks', 1),
    ('Carla Castillo', 1),
    ('Derek Dawson', 1),
    ('Elena Ellery', 1),
    ('Felix Foster', 1),
    ('Grace Grant', 1),
    ('Hank Hensley', 1),
    ('Iris Ibarra', 1),
    ('Jamal Jansen', 1),
    ('Kayla Keller', 2),
    ('Liam Lindqvist', 2),
    ('Mona Marsh', 2),
    ('Noah Novak', 2),
    ('Olivia Osei', 2),
    ('Priya Pemberton', 2),
    ('Quinn Quintana', 2),
    ('Rosa Reyes', 2),
    ('Samuel Sorensen', 3),
    ('Talia Tanaka', 3),
    ('Aaron Whitfield', 3),
    ('Bianca Cole', 3),
    ('Cyrus Delgado', 3),
    ('Dahlia Emerson', 3),
    ('Elias Farrow', 3),
    ('Fiona Garrett', 4),
    ('Gabriel Hollis', 4),
    ('Hana Iverson', 4),
    ('Isaac Jarrett', 4),
    ('Jenna Kowalski', 4),
    ('Kofi Lawson', 4),
    ('Lena Mbeki', 5),
    ('Marcus Nolan', 5),
    ('Nadia Ortega', 5),
    ('Omar Prescott', 5),
    ('Paloma Quill', 5),
    ('Reuben Salas', 6),
    ('Sofia Trent', 6),
    ('Tobias Underwood', 6),
    ('Uma Vance', 6),
    ('Victor Weaver', 7),
    ('Wren Yamada', 7),
    ('Xavier Zamora', 7),
    ('Yara Abbott', 7),
    ('Zach Bellamy', 8),
    ('Amara Chen', 8),
    ('Bruno Duarte', 8),
    ('Celia Egan', 9),
    ('Dorian Fitz', 9),
    ('Esme Gallo', 9),
    ('Frank Haines', 10),
    ('Greta Iqbal', 10),
    ('Hugo Jimenez', 10),
    ('Ingrid Kaur', 11),
    ('Jonas Leclair', 11),
    ('Kira Mendez', 12),
    ('Louis Novotny', 12);

DELETE FROM Residents WHERE name IN (SELECT name FROM @DemoResidents);

-- Units are matched by position within the building, so unit ids are never hardcoded.
INSERT INTO Residents (name, unit_id)
SELECT r.name, u.id
FROM (
    SELECT name, building_id,
           ROW_NUMBER() OVER (PARTITION BY building_id ORDER BY name) AS seq
    FROM @DemoResidents
) r
JOIN (
    SELECT id, building_id,
           ROW_NUMBER() OVER (PARTITION BY building_id ORDER BY id) AS seq
    FROM Units
) u ON u.building_id = r.building_id AND u.seq = r.seq;

-- =============================================================================
-- Pools
-- =============================================================================
-- Numbered, so a random position can be turned into an id.

DECLARE @VolunteerPool TABLE (rn INT IDENTITY(1,1) PRIMARY KEY, id INT NOT NULL);
DECLARE @ResidentPool  TABLE (rn INT IDENTITY(1,1) PRIMARY KEY, id INT NOT NULL);
DECLARE @ItemPool      TABLE (rn INT IDENTITY(1,1) PRIMARY KEY, id INT NOT NULL);
DECLARE @Numbers       TABLE (i  INT PRIMARY KEY);

INSERT INTO @VolunteerPool (id)
SELECT id FROM Users WHERE role = 'volunteer' AND active = 1 ORDER BY id;

INSERT INTO @ResidentPool (id)
SELECT id FROM Residents ORDER BY id;

-- Low-stock items first: picks favour the front, so the items running out are the ones going out.
INSERT INTO @ItemPool (id)
SELECT id FROM Items
WHERE type = 'General'
ORDER BY CASE WHEN quantity <= threshold THEN 0 ELSE 1 END, id;

-- 1 to 1000, more than any total in @Kinds.
INSERT INTO @Numbers (i)
SELECT TOP (1000) ROW_NUMBER() OVER (ORDER BY (SELECT NULL))
FROM sys.all_objects a CROSS JOIN sys.all_objects b;

DECLARE @VolunteerCount INT = (SELECT COUNT(*) FROM @VolunteerPool);
DECLARE @ResidentCount  INT = (SELECT COUNT(*) FROM @ResidentPool);

-- =============================================================================
-- Schedule
-- =============================================================================
-- One row per transaction to write. Every density rule lives here; the inserts below only read it.
-- Random values come from NEWID() so each row gets its own; a bare RAND() is one value per statement.

DECLARE @Schedule TABLE (
    id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    kind         VARCHAR(20)      NOT NULL,
    placed_at    DATETIME         NOT NULL,
    is_welcome   BIT              NOT NULL DEFAULT 0,
    volunteer_rn INT,  -- pool positions, resolved to ids when Transactions is written
    resident_rn  INT,
    line_count   INT
);

-- Checkouts over the year, bunched towards today so the period-over-period deltas are not flat.
INSERT INTO @Schedule (kind, placed_at, is_welcome)
SELECT k.kind,
       DATEADD(MINUTE, @PantryOpens + ABS(CHECKSUM(NEWID())) % (@PantryCloses - @PantryOpens),
               DATEADD(DAY, -CAST(k.days_back * POWER(RAND(CHECKSUM(NEWID())), @DateSkew) AS INT), @Anchor)),
       CASE WHEN n.i % @WelcomeEvery = 0 THEN 1 ELSE 0 END
FROM @Kinds k
JOIN @Numbers n ON n.i <= k.total
WHERE k.kind = 'checkout';

-- The pantry runs on weekdays, so weekends slide back to Friday. Day 0 (1900-01-01) is a Monday.
UPDATE @Schedule
SET placed_at = DATEADD(DAY, -CASE DATEDIFF(DAY, '19000101', placed_at) % 7 WHEN 5 THEN 1 WHEN 6 THEN 2 ELSE 0 END, placed_at);

-- The page opens on today, so the last @DenseDays days (weekends too) get 2 to 4 extra checkouts each.
INSERT INTO @Schedule (kind, placed_at)
SELECT 'checkout',
       DATEADD(MINUTE, @PantryOpens + ABS(CHECKSUM(NEWID())) % (@PantryCloses - @PantryOpens),
               DATEADD(DAY, 1 - day.i, @Anchor))
FROM @Numbers day
JOIN @Numbers line ON line.i <= 4
WHERE day.i <= @DenseDays
  AND (line.i <= 2 OR ABS(CHECKSUM(NEWID())) % 2 = 0);   -- two always, the rest on a coin flip

-- Restocks and corrections have no resident, so only the History page's inventory tab sees them.
INSERT INTO @Schedule (kind, placed_at)
SELECT k.kind,
       DATEADD(MINUTE, @StockOpens + ABS(CHECKSUM(NEWID())) % (@StockCloses - @StockOpens),
               DATEADD(DAY, -CASE WHEN n.i <= k.land_today THEN 0 ELSE ABS(CHECKSUM(NEWID())) % k.days_back END, @Anchor))
FROM @Kinds k
JOIN @Numbers n ON n.i <= k.total
WHERE k.kind <> 'checkout';

-- Who handled it, who it was for, and how many lines it has.
UPDATE s
SET volunteer_rn = 1 + ABS(CHECKSUM(NEWID())) % @VolunteerCount,
    resident_rn  = CASE WHEN s.kind = 'checkout'
                        THEN 1 + CAST(POWER(RAND(CHECKSUM(NEWID())), @ResidentSkew) * @ResidentCount AS INT) END,
    line_count   = k.lines_min + ABS(CHECKSUM(NEWID())) % (k.lines_max - k.lines_min + 1)
FROM @Schedule s
JOIN @Kinds k ON k.kind = s.kind;

-- =============================================================================
-- Transactions
-- =============================================================================

-- building_id stays NULL: the reporting procs resolve it through Residents, Units and Buildings.
INSERT INTO Transactions (id, user_id, resident_id, transaction_type, transaction_date)
SELECT s.id, v.id, r.id, k.type_id, s.placed_at
FROM @Schedule s
JOIN @Kinds k ON k.kind = s.kind
JOIN @VolunteerPool v ON v.rn = s.volunteer_rn
LEFT JOIN @ResidentPool r ON r.rn = s.resident_rn;

-- Weighted pick without replacement: item weight is 1 / rn ^ skew, so a skew of 0 is uniform.
INSERT INTO TransactionItems (transaction_id, item_id, quantity)
SELECT s.id, p.id, k.qty_min + ABS(CHECKSUM(NEWID())) % (k.qty_max - k.qty_min + 1)
FROM @Schedule s
JOIN @Kinds k ON k.kind = s.kind
CROSS APPLY (
    SELECT TOP (s.line_count) i.id
    FROM @ItemPool i
    ORDER BY POWER(RAND(CHECKSUM(NEWID())), POWER(CAST(i.rn AS FLOAT), k.item_skew)) DESC
) p
WHERE s.is_welcome = 0;

-- Welcome baskets mirror ProcessWelcomeBasketCheckout: every basket item plus one sheet set.
INSERT INTO TransactionItems (transaction_id, item_id, quantity)
SELECT s.id, i.id, i.items_per_basket
FROM @Schedule s
JOIN Items i ON i.type = 'Welcome Basket' AND i.items_per_basket > 0
WHERE s.is_welcome = 1
UNION ALL
SELECT id, CASE WHEN ABS(CHECKSUM(NEWID())) % 2 = 0 THEN @TwinSheets ELSE @FullSheets END, 1
FROM @Schedule
WHERE is_welcome = 1;

-- =============================================================================
-- Checkout edits
-- =============================================================================
-- An edit is a child transaction holding the delta; the reporting procs SUM it into the parent.

DECLARE @Edits TABLE (
    id        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    parent_id UNIQUEIDENTIFIER NOT NULL,
    edited_at DATETIME         NOT NULL,
    shape     VARCHAR(10)      NOT NULL,  -- add, reduce or return
    item_id   INT              NOT NULL,  -- the parent's first line
    quantity  INT              NOT NULL
);

-- Every @EditEvery-th ordinary checkout, 1 to 20 days later, cycling through the three shapes.
INSERT INTO @Edits (parent_id, edited_at, shape, item_id, quantity)
SELECT c.id, c.edited_at,
       CASE (c.seq / @EditEvery) % 3 WHEN 0 THEN 'add' WHEN 1 THEN 'reduce' ELSE 'return' END,
       parent_line.item_id, parent_line.quantity
FROM (
    SELECT id,
           DATEADD(DAY, 1 + ABS(CHECKSUM(NEWID())) % 20, placed_at) AS edited_at,
           ROW_NUMBER() OVER (ORDER BY placed_at) AS seq
    FROM @Schedule
    WHERE kind = 'checkout' AND is_welcome = 0
) c
CROSS APPLY (
    SELECT TOP 1 item_id, quantity
    FROM TransactionItems
    WHERE transaction_id = c.id
    ORDER BY item_id
) parent_line
WHERE c.seq % @EditEvery = 0;

DECLARE @ClosingToday DATETIME = DATEADD(MINUTE, @PantryCloses, @Anchor);
UPDATE @Edits SET edited_at = @ClosingToday WHERE edited_at > @ClosingToday;

INSERT INTO Transactions (id, user_id, resident_id, transaction_type, transaction_date, parent_transaction_id)
SELECT e.id, t.user_id, t.resident_id, @CheckoutEdit, e.edited_at, e.parent_id
FROM @Edits e
JOIN Transactions t ON t.id = e.parent_id;

-- 'add' picks an item the parent did not have; the other shapes touch the parent's first line.
INSERT INTO TransactionItems (transaction_id, item_id, quantity, additional_notes)
SELECT e.id,
       COALESCE(added.id, e.item_id),
       CASE e.shape WHEN 'add' THEN 1 + ABS(CHECKSUM(NEWID())) % 2 WHEN 'reduce' THEN -1 ELSE -e.quantity END,
       CASE e.shape WHEN 'add' THEN 'Item added after checkout' WHEN 'reduce' THEN 'Quantity corrected' ELSE 'Returned in full' END
FROM @Edits e
OUTER APPLY (
    SELECT TOP 1 i.id
    FROM @ItemPool i
    WHERE e.shape = 'add'
      AND NOT EXISTS (SELECT 1 FROM TransactionItems ti WHERE ti.transaction_id = e.parent_id AND ti.item_id = i.id)
    ORDER BY NEWID()
) added;

-- =============================================================================
-- Stock levels
-- =============================================================================
-- Two Needs Review examples (quantity < 0). Items.quantity is today's count, not a balance from the history above.

UPDATE Items SET quantity = -3 WHERE name = 'Blender';
UPDATE Items SET quantity = -1 WHERE name = 'Umbrella';
GO
