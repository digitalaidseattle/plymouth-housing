-- Verify item IDs match values hardcoded in application constants (constants.ts, get_checkout_history.sql)
-- If any test fails, update the ID in the seed file or the referencing code to match.

-- Test 1: Twin-size Sheet Set (WELCOME_BASKET_ITEMS.TWIN = 171)
PRINT 'Test 1: Twin-size Sheet Set has ID 171'
IF NOT EXISTS (SELECT 1 FROM Items WHERE id = 171 AND name = 'Twin-size Sheet Set')
    THROW 50001, 'Test 1 FAILED: Twin-size Sheet Set should have ID 171 (check WELCOME_BASKET_ITEMS.TWIN in constants.ts and GetCheckoutHistory)', 1;
PRINT 'Test 1 PASSED';
GO

-- Test 2: Full-size sheet set (WELCOME_BASKET_ITEMS.FULL = 172)
PRINT 'Test 2: Full-size sheet set has ID 172'
IF NOT EXISTS (SELECT 1 FROM Items WHERE id = 172 AND name = 'Full-size sheet set')
    THROW 50002, 'Test 2 FAILED: Full-size sheet set should have ID 172 (check WELCOME_BASKET_ITEMS.FULL in constants.ts and GetCheckoutHistory)', 1;
PRINT 'Test 2 PASSED';
GO

-- Test 3: Appliance Miscellaneous (SPECIAL_ITEMS.APPLIANCE_MISC = 166)
PRINT 'Test 3: Appliance Miscellaneous has ID 166'
IF NOT EXISTS (SELECT 1 FROM Items WHERE id = 166 AND name = 'Appliance Miscellaneous')
    THROW 50003, 'Test 3 FAILED: Appliance Miscellaneous should have ID 166 (check SPECIAL_ITEMS.APPLIANCE_MISC in constants.ts and tracking_data.sql)', 1;
PRINT 'Test 3 PASSED';
GO

PRINT '';
PRINT '========================================';
PRINT 'ALL TESTS PASSED for item ID constants';
PRINT '========================================';
GO
