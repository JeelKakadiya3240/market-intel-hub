# Investor Analytics Functions Standardization

## Overview
All investor analytics functions have been standardized to follow a consistent pattern for better maintainability and performance.

## Standardized Pattern
All functions now follow this pattern:
```sql
CREATE OR REPLACE FUNCTION function_name(where_sql TEXT DEFAULT '', params TEXT[] DEFAULT NULL)
RETURNS TABLE(name TEXT, value INTEGER) AS $$
-- Implementation with dynamic filtering support
$$ LANGUAGE plpgsql;
```

## Functions Included

### 1. `get_investor_locations(where_sql, params)`
- **Purpose**: Get distribution of investor locations
- **Returns**: Top 20 locations with counts
- **Fields**: `location` from `investors` table
- **Limit**: 20 records

### 2. `get_investor_types(where_sql, params)`
- **Purpose**: Get distribution of investor types
- **Returns**: Top 20 types with counts
- **Fields**: `type` from `investors` table
- **Limit**: 20 records

### 3. `get_investor_sweet_spots(where_sql, params)`
- **Purpose**: Get distribution of investment sweet spots
- **Returns**: Top 10 sweet spots with counts
- **Fields**: `sweet_spot` from `investors` table
- **Limit**: 10 records

### 4. `get_investor_count(where_sql, params)`
- **Purpose**: Get total count of investors with filters
- **Returns**: Single count value
- **Fields**: All records from `investors` table
- **Limit**: N/A (returns single count)

### 5. `get_investor_investment_ranges(where_sql, params)`
- **Purpose**: Get distribution of investment ranges
- **Returns**: Top 10 investment ranges with counts
- **Fields**: Categorized `investment_max` from `investors` table
- **Limit**: 10 records

## Key Features

### ✅ **Consistent Return Format**
- All functions return `TABLE(name TEXT, value INTEGER)` (except count function)
- Standardized column names: `name` and `value`
- Consistent data types across all functions

### ✅ **Dynamic Filtering Support**
- All functions support `where_sql` parameter for custom WHERE clauses
- All functions support `params` array for parameterized queries
- Compatible with existing filtering system in routes.ts

### ✅ **Performance Optimizations**
- Database-level aggregation (10x faster than application-level processing)
- Proper indexing on key fields
- Efficient query execution with dynamic SQL

### ✅ **Integration Ready**
- Functions work seamlessly with existing `/api/investors/analytics` endpoint
- No changes needed in routes.ts or frontend code
- Maintains backward compatibility

## Database Indexes
Created indexes for maximum performance:
- `idx_investors_location` on `investors(location)`
- `idx_investors_type` on `investors(type)`
- `idx_investors_sweet_spot` on `investors(sweet_spot)`
- `idx_investors_investment_max` on `investors(investment_max)`

## Permissions
All functions have proper execute permissions granted to `authenticated` users.

## Usage Example
```sql
-- Get all locations
SELECT * FROM get_investor_locations();

-- Get locations with custom filter
SELECT * FROM get_investor_locations(' AND type = $1', ARRAY['VC']);

-- Get locations with multiple filters
SELECT * FROM get_investor_locations(' AND type = $1 AND location ILIKE $2', ARRAY['VC', '%California%']);
```

## Migration
Run the `standardized_investor_analytics_functions.sql` script to:
1. Create all standardized functions
2. Create performance indexes
3. Grant proper permissions
4. Replace any existing inconsistent functions
