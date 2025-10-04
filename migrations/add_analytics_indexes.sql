-- Add indexes for analytics performance optimization
-- Run this in your Supabase SQL Editor

-- Indexes for companies_vc table
CREATE INDEX IF NOT EXISTS idx_companies_vc_industry ON companies_vc(industry);
CREATE INDEX IF NOT EXISTS idx_companies_vc_investment_stage ON companies_vc(investment_stage);
CREATE INDEX IF NOT EXISTS idx_companies_vc_region_of_investment ON companies_vc(region_of_investment);
CREATE INDEX IF NOT EXISTS idx_companies_vc_aum ON companies_vc(aum) WHERE aum IS NOT NULL;

-- Indexes for companies_growth table
CREATE INDEX IF NOT EXISTS idx_companies_growth_industry ON companies_growth(industry);
CREATE INDEX IF NOT EXISTS idx_companies_growth_total_funding ON companies_growth(total_funding) WHERE total_funding IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_growth_employee_growth_percent ON companies_growth(employee_growth_percent) WHERE employee_growth_percent IS NOT NULL;

-- Additional composite indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_vc_industry_stage ON companies_vc(industry, investment_stage);
CREATE INDEX IF NOT EXISTS idx_companies_growth_industry_funding ON companies_growth(industry, total_funding);
