CREATE OR REPLACE FUNCTION get_investor_investment_ranges(where_sql TEXT DEFAULT '', params TEXT[] DEFAULT NULL)
RETURNS TABLE(range TEXT, value INTEGER) AS $$
DECLARE
  sql TEXT := '
    SELECT
      CASE
        WHEN investment_max IS NULL THEN NULL
        WHEN (investment_max)::NUMERIC <= 1 THEN ''$0-1M''
        WHEN (investment_max)::NUMERIC <= 5 THEN ''$1-5M''
        WHEN (investment_max)::NUMERIC <= 10 THEN ''$5-10M''
        WHEN (investment_max)::NUMERIC <= 25 THEN ''$10-25M''
        WHEN (investment_max)::NUMERIC <= 50 THEN ''$25-50M''
        WHEN (investment_max)::NUMERIC <= 100 THEN ''$50-100M''
        ELSE ''$100M+''
      END AS range,
      COUNT(*)::INTEGER AS value
    FROM investors
    WHERE investment_max IS NOT NULL ' || coalesce(where_sql, '') || '
    GROUP BY 1
    ORDER BY value DESC
    LIMIT 10';
BEGIN
  IF where_sql ~ E''\$1(?!\d)'' THEN
    RETURN QUERY EXECUTE sql USING params;
  ELSE
    RETURN QUERY EXECUTE sql;
  END IF;
END;
$$ LANGUAGE plpgsql;
