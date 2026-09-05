-- Demo data for the Admin Analytics page. Local dev only.
-- Skipped by a plain bootstrap. Run: ./database/bootstrap_db.ps1 -SeedDemoData
-- Re-runnable: the reset below clears the previous run first.

-- =============================================================================
-- Reset
-- =============================================================================

DELETE FROM TransactionItems;
GO

DELETE FROM Transactions;
GO

-- '[[]' is the LIKE escape for a literal '[', so this matches names ending '[demo]'.
DELETE FROM Residents WHERE name LIKE '%[[]demo]';
GO

-- =============================================================================
-- Residents
-- =============================================================================
-- Counts per building are uneven on purpose so the Residents Served by Building
-- chart ranks instead of showing twelve equal bars.

DECLARE @DemoResidents TABLE (name NVARCHAR(255), building_id INT);

INSERT INTO @DemoResidents
    (name, building_id)
VALUES
    ('Alice Nguyen [demo]', 1),
    ('Ben Brooks [demo]', 1),
    ('Carla Castillo [demo]', 1),
    ('Derek Dawson [demo]', 1),
    ('Elena Ellery [demo]', 1),
    ('Felix Foster [demo]', 1),
    ('Grace Grant [demo]', 1),
    ('Hank Hensley [demo]', 1),
    ('Iris Ibarra [demo]', 1),
    ('Jamal Jansen [demo]', 1),
    ('Kayla Keller [demo]', 2),
    ('Liam Lindqvist [demo]', 2),
    ('Mona Marsh [demo]', 2),
    ('Noah Novak [demo]', 2),
    ('Olivia Osei [demo]', 2),
    ('Priya Pemberton [demo]', 2),
    ('Quinn Quintana [demo]', 2),
    ('Rosa Reyes [demo]', 2),
    ('Samuel Sorensen [demo]', 3),
    ('Talia Tanaka [demo]', 3),
    ('Aaron Whitfield [demo]', 3),
    ('Bianca Cole [demo]', 3),
    ('Cyrus Delgado [demo]', 3),
    ('Dahlia Emerson [demo]', 3),
    ('Elias Farrow [demo]', 3),
    ('Fiona Garrett [demo]', 4),
    ('Gabriel Hollis [demo]', 4),
    ('Hana Iverson [demo]', 4),
    ('Isaac Jarrett [demo]', 4),
    ('Jenna Kowalski [demo]', 4),
    ('Kofi Lawson [demo]', 4),
    ('Lena Mbeki [demo]', 5),
    ('Marcus Nolan [demo]', 5),
    ('Nadia Ortega [demo]', 5),
    ('Omar Prescott [demo]', 5),
    ('Paloma Quill [demo]', 5),
    ('Reuben Salas [demo]', 6),
    ('Sofia Trent [demo]', 6),
    ('Tobias Underwood [demo]', 6),
    ('Uma Vance [demo]', 6),
    ('Victor Weaver [demo]', 7),
    ('Wren Yamada [demo]', 7),
    ('Xavier Zamora [demo]', 7),
    ('Yara Abbott [demo]', 7),
    ('Zach Bellamy [demo]', 8),
    ('Amara Chen [demo]', 8),
    ('Bruno Duarte [demo]', 8),
    ('Celia Egan [demo]', 9),
    ('Dorian Fitz [demo]', 9),
    ('Esme Gallo [demo]', 9),
    ('Frank Haines [demo]', 10),
    ('Greta Iqbal [demo]', 10),
    ('Hugo Jimenez [demo]', 10),
    ('Ingrid Kaur [demo]', 11),
    ('Jonas Leclair [demo]', 11),
    ('Kira Mendez [demo]', 12),
    ('Louis Novotny [demo]', 12);

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
GO

-- =============================================================================
-- Pools
-- =============================================================================
-- Numbered lookups the loops below draw from.

DROP TABLE IF EXISTS #Volunteers;
DROP TABLE IF EXISTS #ResidentPool;
DROP TABLE IF EXISTS #ItemPool;

CREATE TABLE #Volunteers (rn INT IDENTITY(1,1), id INT);
INSERT INTO #Volunteers (id)
SELECT id FROM Users WHERE role = 'volunteer' AND active = 1 ORDER BY id;

CREATE TABLE #ResidentPool (rn INT IDENTITY(1,1), id INT);
INSERT INTO #ResidentPool (id)
SELECT id FROM Residents ORDER BY id;

-- Items already at or below their threshold come first. The loops favour the
-- start of this list, so the items running out are also the ones going out and
-- the Low Stock table's Checked Out column has numbers in it.
CREATE TABLE #ItemPool (rn INT IDENTITY(1,1), id INT);
INSERT INTO #ItemPool (id)
SELECT id FROM Items
WHERE type = 'General'
ORDER BY CASE WHEN quantity <= threshold THEN 0 ELSE 1 END, id;
GO

-- =============================================================================
-- Checkout schedule
-- =============================================================================
-- Dates are chosen first so the density rules live in one place and the
-- checkout loop below stays simple.

DROP TABLE IF EXISTS #Schedule;
CREATE TABLE #Schedule (rn INT IDENTITY(1,1), placed_at DATETIME, is_welcome BIT);

DECLARE @CheckoutCount INT = 500;
DECLARE @Days          INT = 365;
DECLARE @DenseDays     INT = 21;
DECLARE @Anchor       DATE = CAST(GETDATE() AS DATE);
DECLARE @i             INT = 1;
DECLARE @offset        INT;
DECLARE @day          DATE;

DECLARE @seed FLOAT = RAND(20260101);

WHILE @i <= @CheckoutCount
BEGIN
    -- Squaring pushes dates towards the present, so recent months are busier
    -- than old ones and the period-over-period deltas are not flat.
    SET @offset = CAST(@Days * POWER(RAND(), 1.2) AS INT);
    SET @day = DATEADD(DAY, -@offset, @Anchor);

    -- The pantry runs on weekdays.
    IF DATEDIFF(DAY, '19000101', @day) % 7 = 5 SET @day = DATEADD(DAY, -1, @day);
    IF DATEDIFF(DAY, '19000101', @day) % 7 = 6 SET @day = DATEADD(DAY, -2, @day);

    INSERT INTO #Schedule (placed_at, is_welcome)
    VALUES (DATEADD(MINUTE, 540 + CAST(RAND() * 480 AS INT), CAST(@day AS DATETIME)),
            CASE WHEN @i % 36 = 0 THEN 1 ELSE 0 END);

    SET @i = @i + 1;
END

-- The page opens on "today", and the delta chip needs yesterday to be non-empty
-- too. Give the recent days a floor so that first screen is never empty.
DECLARE @d INT = 0;
DECLARE @shortfall INT;

WHILE @d < @DenseDays
BEGIN
    SET @day = DATEADD(DAY, -@d, @Anchor);
    SET @shortfall = 2 + CAST(RAND() * 3 AS INT)
                   - (SELECT COUNT(*) FROM #Schedule WHERE CAST(placed_at AS DATE) = @day);

    WHILE @shortfall > 0
    BEGIN
        INSERT INTO #Schedule (placed_at, is_welcome)
        VALUES (DATEADD(MINUTE, 540 + CAST(RAND() * 480 AS INT), CAST(@day AS DATETIME)), 0);

        SET @shortfall = @shortfall - 1;
    END

    SET @d = @d + 1;
END
GO

-- =============================================================================
-- Checkouts
-- =============================================================================

DECLARE @rn         INT = 1;
DECLARE @last       INT = (SELECT MAX(rn) FROM #Schedule);
DECLARE @residents  INT = (SELECT COUNT(*) FROM #ResidentPool);
DECLARE @items      INT = (SELECT COUNT(*) FROM #ItemPool);
DECLARE @volunteers INT = (SELECT COUNT(*) FROM #Volunteers);

DECLARE @txn UNIQUEIDENTIFIER;
DECLARE @placed_at DATETIME;
DECLARE @welcome BIT;
DECLARE @resident INT;
DECLARE @volunteer INT;
DECLARE @lines INT;
DECLARE @line INT;
DECLARE @item INT;

WHILE @rn <= @last
BEGIN
    SELECT @placed_at = placed_at, @welcome = is_welcome FROM #Schedule WHERE rn = @rn;

    -- Squaring makes a minority of residents account for most visits, which is
    -- what gives the Repeats only toggle something to filter.
    SELECT @resident = id FROM #ResidentPool
    WHERE rn = 1 + CAST(POWER(RAND(), 2.0) * @residents AS INT);

    SELECT @volunteer = id FROM #Volunteers
    WHERE rn = 1 + CAST(RAND() * @volunteers AS INT);

    SET @txn = NEWID();

    -- building_id stays NULL: no stored procedure writes it, and the reporting
    -- procs resolve the building through Residents, Units and Buildings.
    INSERT INTO Transactions (id, user_id, resident_id, transaction_type, transaction_date)
    VALUES (@txn, @volunteer, @resident, 1, @placed_at);

    IF @welcome = 1
    BEGIN
        -- Mirrors ProcessWelcomeBasketCheckout: every basket item, plus a sheet
        -- set. Ids 171 and 172 are what GetCheckoutHistory looks for, and both
        -- have items_per_basket = 0 so they are not in the bulk insert.
        INSERT INTO TransactionItems (transaction_id, item_id, quantity)
        SELECT @txn, id, items_per_basket
        FROM Items
        WHERE type = 'Welcome Basket' AND items_per_basket > 0;

        INSERT INTO TransactionItems (transaction_id, item_id, quantity)
        VALUES (@txn, CASE WHEN @rn % 2 = 0 THEN 171 ELSE 172 END, 1);
    END
    ELSE
    BEGIN
        SET @lines = 1 + CAST(RAND() * 6 AS INT);
        SET @line = 1;

        WHILE @line <= @lines
        BEGIN
            SELECT @item = id FROM #ItemPool
            WHERE rn = 1 + CAST(POWER(RAND(), 2.2) * @items AS INT);

            IF NOT EXISTS (SELECT 1 FROM TransactionItems
                           WHERE transaction_id = @txn AND item_id = @item)
                INSERT INTO TransactionItems (transaction_id, item_id, quantity)
                VALUES (@txn, @item, 1 + CAST(RAND() * 3 AS INT));

            SET @line = @line + 1;
        END
    END

    SET @rn = @rn + 1;
END
GO

-- =============================================================================
-- Checkout edits
-- =============================================================================
-- An edit is a child transaction holding the DELTA, not the new total. Both
-- reporting procs fold children into the parent with SUM(...) HAVING > 0, so a
-- negative delta equal to the original quantity drops the item from the totals.
-- Edits land a few days after their parent, which puts some of them in the
-- following month.

DROP TABLE IF EXISTS #Editable;
CREATE TABLE #Editable (rn INT IDENTITY(1,1), id UNIQUEIDENTIFIER, user_id INT,
                        resident_id INT, transaction_date DATETIME);

-- Every twelfth checkout gets edited. Welcome baskets are left alone.
INSERT INTO #Editable (id, user_id, resident_id, transaction_date)
SELECT id, user_id, resident_id, transaction_date
FROM (
    SELECT t.id, t.user_id, t.resident_id, t.transaction_date,
           ROW_NUMBER() OVER (ORDER BY t.transaction_date) AS seq
    FROM Transactions t
    WHERE t.transaction_type = 1
      AND NOT EXISTS (SELECT 1 FROM TransactionItems ti
                      WHERE ti.transaction_id = t.id AND ti.item_id IN (171, 172))
) c
WHERE seq % 12 = 0;

DECLARE @Anchor DATE = CAST(GETDATE() AS DATE);
DECLARE @rn INT = 1;
DECLARE @last INT = (SELECT ISNULL(MAX(rn), 0) FROM #Editable);
DECLARE @items INT = (SELECT COUNT(*) FROM #ItemPool);

DECLARE @edit UNIQUEIDENTIFIER;
DECLARE @parent UNIQUEIDENTIFIER;
DECLARE @user_id INT;
DECLARE @resident_id INT;
DECLARE @edited_at DATETIME;
DECLARE @item INT;
DECLARE @quantity INT;
DECLARE @shape INT;

WHILE @rn <= @last
BEGIN
    SELECT @parent = id, @user_id = user_id, @resident_id = resident_id,
           @edited_at = DATEADD(DAY, 1 + CAST(RAND() * 20 AS INT), transaction_date)
    FROM #Editable WHERE rn = @rn;

    IF @edited_at > DATEADD(HOUR, 17, CAST(@Anchor AS DATETIME))
        SET @edited_at = DATEADD(HOUR, 17, CAST(@Anchor AS DATETIME));

    SELECT TOP 1 @item = item_id, @quantity = quantity
    FROM TransactionItems WHERE transaction_id = @parent ORDER BY item_id;

    SET @edit = NEWID();
    SET @shape = @rn % 3;

    INSERT INTO Transactions (id, user_id, resident_id, transaction_type,
                              transaction_date, parent_transaction_id)
    VALUES (@edit, @user_id, @resident_id, 4, @edited_at, @parent);

    IF @shape = 0
    BEGIN
        -- An item that was missed at the counter.
        SELECT @item = id FROM #ItemPool WHERE rn = 1 + CAST(RAND() * @items AS INT);

        INSERT INTO TransactionItems (transaction_id, item_id, quantity, additional_notes)
        VALUES (@edit, @item, 1 + CAST(RAND() * 2 AS INT), 'Item added after checkout');
    END
    ELSE IF @shape = 1 AND @quantity > 1
    BEGIN
        INSERT INTO TransactionItems (transaction_id, item_id, quantity, additional_notes)
        VALUES (@edit, @item, -1, 'Quantity corrected');
    END
    ELSE
    BEGIN
        -- Nets to zero, so this item drops out of GetCheckoutItemTotals.
        INSERT INTO TransactionItems (transaction_id, item_id, quantity, additional_notes)
        VALUES (@edit, @item, -@quantity, 'Returned in full');
    END

    SET @rn = @rn + 1;
END
GO

-- =============================================================================
-- Restocks and corrections
-- =============================================================================
-- Both carry resident_id NULL. The reporting procs inner join Residents, so
-- these never reach the analytics page. They feed the History page's inventory
-- tab through GetInventoryHistory.

DECLARE @RestockCount    INT = 60;
DECLARE @CorrectionCount INT = 10;
DECLARE @Days            INT = 365;
DECLARE @Anchor         DATE = CAST(GETDATE() AS DATE);

DECLARE @items      INT = (SELECT COUNT(*) FROM #ItemPool);
DECLARE @volunteers INT = (SELECT COUNT(*) FROM #Volunteers);

DECLARE @i INT = 1;
DECLARE @txn UNIQUEIDENTIFIER;
DECLARE @volunteer INT;
DECLARE @placed_at DATETIME;
DECLARE @type INT;
DECLARE @lines INT;
DECLARE @line INT;
DECLARE @item INT;

WHILE @i <= @RestockCount + @CorrectionCount
BEGIN
    SET @type = CASE WHEN @i <= @RestockCount THEN 2 ELSE 3 END;
    SET @placed_at = DATEADD(DAY, -CAST(RAND() * @Days AS INT),
                             DATEADD(HOUR, 8, CAST(@Anchor AS DATETIME)));

    SELECT @volunteer = id FROM #Volunteers WHERE rn = 1 + CAST(RAND() * @volunteers AS INT);

    SET @txn = NEWID();

    INSERT INTO Transactions (id, user_id, resident_id, transaction_type, transaction_date)
    VALUES (@txn, @volunteer, NULL, @type, @placed_at);

    SET @lines = CASE WHEN @type = 2 THEN 3 + CAST(RAND() * 8 AS INT) ELSE 1 END;
    SET @line = 1;

    WHILE @line <= @lines
    BEGIN
        SELECT @item = id FROM #ItemPool WHERE rn = 1 + CAST(RAND() * @items AS INT);

        IF NOT EXISTS (SELECT 1 FROM TransactionItems
                       WHERE transaction_id = @txn AND item_id = @item)
            INSERT INTO TransactionItems (transaction_id, item_id, quantity)
            VALUES (@txn, @item, CASE WHEN @type = 2 THEN 10 + CAST(RAND() * 50 AS INT)
                                      ELSE 1 + CAST(RAND() * 30 AS INT) END);

        SET @line = @line + 1;
    END

    SET @i = @i + 1;
END
GO

-- =============================================================================
-- Recent restocks
-- =============================================================================
-- The main restock loop spreads 60 restocks over a year, so on the default
-- "today" / short-range views the Top 10 Inventory Items Added chart is empty.
-- This mirrors the dense-recent-days floor used for checkouts: a burst of
-- restocks in the last two weeks, a few of them today, all drawn from the front
-- of the item pool so the same names lead both the checked-out and added charts.

DECLARE @RecentRestocks INT = 18;
DECLARE @RecentDays     INT = 14;
DECLARE @Anchor        DATE = CAST(GETDATE() AS DATE);

DECLARE @items      INT = (SELECT COUNT(*) FROM #ItemPool);
DECLARE @volunteers INT = (SELECT COUNT(*) FROM #Volunteers);

DECLARE @i INT = 1;
DECLARE @txn UNIQUEIDENTIFIER;
DECLARE @volunteer INT;
DECLARE @placed_at DATETIME;
DECLARE @lines INT;
DECLARE @line INT;
DECLARE @item INT;

WHILE @i <= @RecentRestocks
BEGIN
    -- The first few land today; the rest fall within the last @RecentDays.
    SET @placed_at = DATEADD(DAY,
        CASE WHEN @i <= 3 THEN 0 ELSE -CAST(RAND() * @RecentDays AS INT) END,
        DATEADD(HOUR, 8 + CAST(RAND() * 6 AS INT), CAST(@Anchor AS DATETIME)));

    SELECT @volunteer = id FROM #Volunteers WHERE rn = 1 + CAST(RAND() * @volunteers AS INT);

    SET @txn = NEWID();

    INSERT INTO Transactions (id, user_id, resident_id, transaction_type, transaction_date)
    VALUES (@txn, @volunteer, NULL, 2, @placed_at);

    SET @lines = 3 + CAST(RAND() * 5 AS INT);
    SET @line = 1;

    WHILE @line <= @lines
    BEGIN
        -- Squaring favours the front of the pool (the items also going out).
        SELECT @item = id FROM #ItemPool
        WHERE rn = 1 + CAST(POWER(RAND(), 2.0) * @items AS INT);

        IF NOT EXISTS (SELECT 1 FROM TransactionItems
                       WHERE transaction_id = @txn AND item_id = @item)
            INSERT INTO TransactionItems (transaction_id, item_id, quantity)
            VALUES (@txn, @item, 12 + CAST(RAND() * 60 AS INT));

        SET @line = @line + 1;
    END

    SET @i = @i + 1;
END
GO

-- =============================================================================
-- Stock levels
-- =============================================================================
-- The seeded inventory already covers Out of Stock, Low Stock and Normal Stock.
-- These two give the Needs Review status (quantity < 0) an example. Stock is
-- not decremented to pay for the history above: Items.quantity is the count on
-- hand today, not a balance carried forward from a year of checkouts.

UPDATE Items SET quantity = -3 WHERE name = 'Blender';
GO

UPDATE Items SET quantity = -1 WHERE name = 'Umbrella';
GO

DROP TABLE IF EXISTS #Volunteers;
DROP TABLE IF EXISTS #ResidentPool;
DROP TABLE IF EXISTS #ItemPool;
DROP TABLE IF EXISTS #Schedule;
DROP TABLE IF EXISTS #Editable;
GO
