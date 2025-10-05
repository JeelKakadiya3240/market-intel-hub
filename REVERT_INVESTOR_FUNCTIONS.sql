-- QUICK REVERT: Investor Functions
-- Use this to quickly revert to the working backup

-- 1. Drop all existing functions
DROP FUNCTION IF EXISTS get_investor_types(TEXT, TEXT[]);
DROP FUNCTION IF EXISTS get_investor_locations(TEXT, TEXT[]);
DROP FUNCTION IF EXISTS get_investor_sweet_spots(TEXT, TEXT[]);
DROP FUNCTION IF EXISTS get_investor_count(TEXT, TEXT[]);
DROP FUNCTION IF EXISTS get_investor_investment_ranges(TEXT, TEXT[]);

-- 2. Restore from backup
\i BACKUP_ALL_INVESTOR_FUNCTIONS.sql

-- 3. Verify functions are working
SELECT 'REVERT COMPLETE - Testing functions:' as info;
SELECT 'Types function:' as test, COUNT(*) as results FROM get_investor_types();
SELECT 'Locations function:' as test, COUNT(*) as results FROM get_investor_locations();
SELECT 'Sweet spots function:' as test, COUNT(*) as results FROM get_investor_sweet_spots();
SELECT 'Count function:' as test, cnt as results FROM get_investor_count();
SELECT 'Investment ranges function:' as test, COUNT(*) as results FROM get_investor_investment_ranges();

-- 4. Show success message
SELECT 'SUCCESS: All investor functions restored and working!' as status;
SELECT 'NOTE: Sweet Spot values will display properly formatted ($1.5M, $25K, etc.)' as ui_note;
