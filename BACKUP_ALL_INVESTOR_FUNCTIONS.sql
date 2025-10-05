-- BACKUP: All Investor Analytics Functions
-- This file contains all working functions for easy reversion
-- Created: $(date)
-- Updated: Latest working versions with Sweet Spot fixes
-- Purpose: Backup all investor analytics functions for future reversion

-- ==============================================
-- 1. INVESTOR TYPES FUNCTION (WORKING VERSION)
-- ==============================================
CREATE OR REPLACE FUNCTION get_investor_types(where_sql TEXT DEFAULT '', params TEXT[] DEFAULT NULL)
RETURNS TABLE(name TEXT, value INTEGER) AS $$
DECLARE
  sql TEXT;
BEGIN
  -- Build the SQL query using profile column
  sql := '
    SELECT 
      profile as name,
      COUNT(*)::INTEGER AS value
    FROM investors
    WHERE profile IS NOT NULL';
  
  -- Add WHERE clause if provided
  IF where_sql IS NOT NULL AND where_sql != '' THEN
    sql := sql || ' ' || where_sql;
  END IF;
  
  -- Add GROUP BY and ORDER BY
  sql := sql || '
    GROUP BY profile
    ORDER BY COUNT(*) DESC
    LIMIT 20';
  
  -- Execute the query
  IF params IS NOT NULL AND array_length(params, 1) > 0 THEN
    RETURN QUERY EXECUTE sql USING params;
  ELSE
    RETURN QUERY EXECUTE sql;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on error
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 2. INVESTOR LOCATIONS FUNCTION (WORKING VERSION)
-- ==============================================
CREATE OR REPLACE FUNCTION get_investor_locations(where_sql TEXT DEFAULT '', params TEXT[] DEFAULT NULL)
RETURNS TABLE(name TEXT, value INTEGER) AS $$
DECLARE
  sql TEXT;
BEGIN
  -- Build the SQL query
  sql := '
    SELECT 
      location as name,
      COUNT(*)::INTEGER AS value
    FROM investors
    WHERE location IS NOT NULL';
  
  -- Add WHERE clause if provided
  IF where_sql IS NOT NULL AND where_sql != '' THEN
    sql := sql || ' ' || where_sql;
  END IF;
  
  -- Add GROUP BY and ORDER BY
  sql := sql || '
    GROUP BY location
    ORDER BY COUNT(*) DESC
    LIMIT 20';
  
  -- Execute the query
  IF params IS NOT NULL AND array_length(params, 1) > 0 THEN
    RETURN QUERY EXECUTE sql USING params;
  ELSE
    RETURN QUERY EXECUTE sql;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on error
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 3. INVESTOR SWEET SPOTS FUNCTION (WORKING VERSION - UPDATED)
-- ==============================================
CREATE OR REPLACE FUNCTION get_investor_sweet_spots(where_sql TEXT DEFAULT '', params TEXT[] DEFAULT NULL)
RETURNS TABLE(name TEXT, value INTEGER) AS $$
DECLARE
  sql TEXT;
BEGIN
  -- Build the SQL query - sweet_spot values are already formatted like "$1.5M", "$25K"
  sql := '
    SELECT 
      sweet_spot::TEXT as name,
      COUNT(*)::INTEGER AS value
    FROM investors
    WHERE sweet_spot IS NOT NULL';
  
  -- Add WHERE clause if provided
  IF where_sql IS NOT NULL AND where_sql != '' THEN
    sql := sql || ' ' || where_sql;
  END IF;
  
  -- Add GROUP BY and ORDER BY
  sql := sql || '
    GROUP BY sweet_spot
    ORDER BY COUNT(*) DESC
    LIMIT 20';
  
  -- Execute the query
  IF params IS NOT NULL AND array_length(params, 1) > 0 THEN
    RETURN QUERY EXECUTE sql USING params;
  ELSE
    RETURN QUERY EXECUTE sql;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on error
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 4. INVESTOR COUNT FUNCTION (WORKING VERSION)
-- ==============================================
CREATE OR REPLACE FUNCTION get_investor_count(where_sql TEXT DEFAULT '', params TEXT[] DEFAULT NULL)
RETURNS TABLE(cnt INTEGER) AS $$
DECLARE
  sql TEXT;
BEGIN
  -- Build the SQL query
  sql := '
    SELECT 
      COUNT(*)::INTEGER AS cnt
    FROM investors
    WHERE 1=1';
  
  -- Add WHERE clause if provided
  IF where_sql IS NOT NULL AND where_sql != '' THEN
    sql := sql || ' ' || where_sql;
  END IF;
  
  -- Execute the query
  IF params IS NOT NULL AND array_length(params, 1) > 0 THEN
    RETURN QUERY EXECUTE sql USING params;
  ELSE
    RETURN QUERY EXECUTE sql;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on error
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 5. INVESTOR INVESTMENT RANGES FUNCTION (UPDATED VERSION)
-- ==============================================
CREATE OR REPLACE FUNCTION get_investor_investment_ranges(where_sql TEXT DEFAULT '', params TEXT[] DEFAULT NULL)
RETURNS TABLE(range TEXT, value INTEGER) AS $$
DECLARE
  sql TEXT;
BEGIN
  -- Build the SQL query with proper investment range calculation
  -- Handles both millions format (e.g., 5 = $5M) and dollars format (e.g., 5000000 = $5M)
  sql := '
    SELECT
      CASE
        WHEN investment_max IS NULL THEN NULL
        WHEN investment_max::NUMERIC <= 0 THEN NULL
        -- CASE 1: Values in MILLIONS format (e.g., 5 = $5M)
        WHEN investment_max::NUMERIC < 1000 THEN
          CASE
            WHEN investment_max::NUMERIC <= 1 THEN ''$0-1M''
            WHEN investment_max::NUMERIC <= 5 THEN ''$1-5M''
            WHEN investment_max::NUMERIC <= 10 THEN ''$5-10M''
            WHEN investment_max::NUMERIC <= 25 THEN ''$10-25M''
            WHEN investment_max::NUMERIC <= 50 THEN ''$25-50M''
            WHEN investment_max::NUMERIC <= 100 THEN ''$50-100M''
            ELSE ''$100M+''
          END
        -- CASE 2: Values in DOLLARS format (e.g., 5000000 = $5M)
        ELSE
          CASE
            WHEN (investment_max::NUMERIC / 1000000) <= 1 THEN ''$0-1M''
            WHEN (investment_max::NUMERIC / 1000000) <= 5 THEN ''$1-5M''
            WHEN (investment_max::NUMERIC / 1000000) <= 10 THEN ''$5-10M''
            WHEN (investment_max::NUMERIC / 1000000) <= 25 THEN ''$10-25M''
            WHEN (investment_max::NUMERIC / 1000000) <= 50 THEN ''$25-50M''
            WHEN (investment_max::NUMERIC / 1000000) <= 100 THEN ''$50-100M''
            ELSE ''$100M+''
          END
      END AS range,
      COUNT(*)::INTEGER AS value
    FROM investors
    WHERE investment_max IS NOT NULL AND investment_max::NUMERIC > 0';
  
  -- Add WHERE clause if provided
  IF where_sql IS NOT NULL AND where_sql != '' THEN
    sql := sql || ' ' || where_sql;
  END IF;
  
  -- Add GROUP BY and ORDER BY
  sql := sql || '
    GROUP BY 1
    ORDER BY value DESC
    LIMIT 10';
  
  -- Execute the query
  IF params IS NOT NULL AND array_length(params, 1) > 0 THEN
    RETURN QUERY EXECUTE sql USING params;
  ELSE
    RETURN QUERY EXECUTE sql;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on error
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 6. GRANT PERMISSIONS
-- ==============================================
GRANT EXECUTE ON FUNCTION get_investor_types(TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_investor_locations(TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_investor_sweet_spots(TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_investor_count(TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_investor_investment_ranges(TEXT, TEXT[]) TO authenticated;

-- ==============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_investors_profile ON investors(profile);
CREATE INDEX IF NOT EXISTS idx_investors_location ON investors(location);
CREATE INDEX IF NOT EXISTS idx_investors_sweet_spot ON investors(sweet_spot);
CREATE INDEX IF NOT EXISTS idx_investors_investment_max ON investors(investment_max);

-- ==============================================
-- 8. TEST ALL FUNCTIONS
-- ==============================================
SELECT 'Testing all investor functions:' as info;

SELECT 'Types:' as test, COUNT(*) as result_count FROM get_investor_types();
SELECT 'Locations:' as test, COUNT(*) as result_count FROM get_investor_locations();
SELECT 'Sweet Spots:' as test, COUNT(*) as result_count FROM get_investor_sweet_spots();
SELECT 'Count:' as test, cnt as result_count FROM get_investor_count();
SELECT 'Investment Ranges:' as test, COUNT(*) as result_count FROM get_investor_investment_ranges();

-- ==============================================
-- 9. REVERSION INSTRUCTIONS
-- ==============================================
/*
TO REVERT TO THIS BACKUP:
1. Run this entire file: \i BACKUP_ALL_INVESTOR_FUNCTIONS.sql
2. Restart your Node.js server
3. Test the API endpoints

TO TEST INDIVIDUAL FUNCTIONS:
- SELECT * FROM get_investor_types();
- SELECT * FROM get_investor_locations();
- SELECT * FROM get_investor_sweet_spots();
- SELECT * FROM get_investor_count();
- SELECT * FROM get_investor_investment_ranges();

EXPECTED RESULTS:
- Types: Multiple investor types (Investor, VC, Angel, CEO, etc.)
- Locations: Multiple locations with counts
- Sweet Spots: Properly formatted values ($1.5M, $25K, $1.0M, etc.)
- Count: Total investor count
- Investment Ranges: Proper format [{range: "$1-5M", value: 13543}, {range: "$0-1M", value: 7766}, ...]

UI FIXES INCLUDED:
- Sweet Spot chart displays proper monetary values (no more "NaNM")
- Y-axis labels show formatted values like "$1.5M", "$25K"
- Tooltips display correct sweet spot values with counts
- All functions use proper column references (profile for types, sweet_spot for sweet spots)
*/
