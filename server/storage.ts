import dotenv from "dotenv";

// Load environment variables from .env file FIRST
dotenv.config();

// Analytics cache for performance optimization
const analyticsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for longer cache

function getCachedAnalytics(key: string): any | null {
  const cached = analyticsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Using cached analytics for ${key}`);
    return cached.data;
  }
  return null;
}

function setCachedAnalytics(key: string, data: any): void {
  analyticsCache.set(key, { data, timestamp: Date.now() });
  console.log(`💾 Cached analytics for ${key}`);
}

// Export cache functions for use in routes
export { getCachedAnalytics, setCachedAnalytics };

import {
  users,
  accelerators,
  incubators,
  companiesFranchises,
  companiesGrowth,
  companiesStartups,
  companiesVc,
  events,
  fundingRoundsExits,
  fundingRoundsMaDeals,
  fundingRoundsMegadeals,
  fundingRoundsUsSfd23,
  fundingRoundsUsSfd24,
  liveFunding,
  unicorns,
  investors,
  investorContacts,
  type User,
  type InsertUser,
  type Accelerator,
  type Incubator,
  type CompanyFranchise,
  type CompanyGrowth,
  type CompanyStartup,
  type CompanyVc,
  type Event,
  type FundingRoundExit,
  type FundingRoundMaDeal,
  type FundingRoundMegadeal,
  type FundingRoundUsSfd23,
  type FundingRoundUsSfd24,
  type LiveFunding,
  type Unicorn,
  type Investor,
  type InvestorContact,
  type Grant,
  type EventEuropeanStartup,
  type RankingTopCity,
  type RankingTopCountry,
  type RankingUniversity,
  type SanctionListExtended,
  type SanctionListIndividual,
} from "@shared/schema";
import { createClient } from "@supabase/supabase-js";

// Enhanced environment variable handling with multiple fallback patterns for Cloud Run deployment
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Server-side Supabase configuration validation
function validateServerSupabaseConfig(): void {
  if (!supabaseUrl) {
    console.error("❌ Server-side Supabase configuration error: Missing URL");
    console.error(
      "📋 Available environment variables:",
      Object.keys(process.env).filter((key) => key.includes("SUPABASE")),
    );
    throw new Error(
      "Supabase URL environment variable is not configured or accessible at runtime - the server requires VITE_SUPABASE_URL or SUPABASE_URL to initialize the Supabase client but it's not accessible at runtime. Please configure this variable in your deployment secrets.",
    );
  }

  if (!supabaseAnonKey) {
    console.error(
      "❌ Server-side Supabase configuration error: Missing Anon Key",
    );
    console.error(
      "📋 Available environment variables:",
      Object.keys(process.env).filter((key) => key.includes("SUPABASE")),
    );
    throw new Error(
      "Supabase Anon Key environment variable is not configured or accessible at runtime - the server requires VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY to initialize the Supabase client but it's not accessible at runtime. Please configure this variable in your deployment secrets.",
    );
  }

  console.log("✅ Server-side Supabase configuration validated successfully");
}

// Helper function to check Supabase availability before database operations
function ensureSupabase(): boolean {
  try {
    validateServerSupabaseConfig();
    return true;
  } catch (error) {
    console.error(
      "⚠️  Supabase client unavailable:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return false;
  }
}

// Initialize Supabase clients with proper error handling
let supabase: any = null;
let supabaseAdmin: any = null;

try {
  validateServerSupabaseConfig();
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  console.log("✅ Supabase clients initialized successfully");
} catch (error) {
  console.error(
    "❌ Failed to initialize Supabase clients:",
    error instanceof Error ? error.message : "Unknown error",
  );
  // Store error without throwing to prevent crash loop
  const supabaseError = error;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Company methods
  getCompaniesStartups(
    limit?: number,
    offset?: number,
    filters?: { search?: string; industry?: string; country?: string },
  ): Promise<CompanyStartup[]>;
  getCompaniesGrowth(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      industry?: string;
      location?: string;
      ranking?: string;
      annualRevenue?: string;
      employees?: string;
      growthRate?: string;
    },
  ): Promise<CompanyGrowth[]>;
  getCompaniesFranchises(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      industry?: string;
      rank?: string;
      initialInvestment?: string;
      founded?: string;
      empAtHq?: string;
      units2024?: string;
    },
  ): Promise<CompanyFranchise[]>;
  getCompaniesStartupsCount(filters?: {
    search?: string;
    industry?: string;
    country?: string;
    state?: string;
    rank?: string;
    srScore2?: string;
    founded?: string;
  }): Promise<number>;
  getCompaniesGrowthCount(filters?: {
    search?: string;
    industry?: string;
    location?: string;
    ranking?: string;
    annualRevenue?: string;
    employees?: string;
    growthRate?: string;
  }): Promise<number>;
  getCompaniesFranchisesCount(filters?: {
    search?: string;
    industry?: string;
    rank?: string;
    initialInvestment?: string;
    founded?: string;
    empAtHq?: string;
    units2024?: string;
  }): Promise<number>;
  getCompanyStartupById(id: number): Promise<CompanyStartup | undefined>;
  getCompanyGrowthById(id: number): Promise<CompanyGrowth | undefined>;
  getCompanyFranchiseById(id: number): Promise<CompanyFranchise | undefined>;
  searchCompanies(query: string): Promise<CompanyStartup[]>;

  // VC Company methods
  getCompaniesVc(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      location?: string;
      industry?: string;
      investmentStage?: string;
      founded?: string;
    },
  ): Promise<CompanyVc[]>;
  getCompaniesVcCount(filters?: {
    search?: string;
    location?: string;
    industry?: string;
    investmentStage?: string;
    founded?: string;
    aum?: string;
  }): Promise<number>;
  getCompanyVcById(id: number): Promise<CompanyVc | undefined>;

  // Accelerator methods
  getAccelerators(
    limit?: number,
    offset?: number,
    filters?: { search?: string; country?: string; industry?: string },
  ): Promise<Accelerator[]>;
  getAcceleratorsCount(): Promise<number>;

  // Incubator methods
  getIncubators(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      country?: string;
      programType?: string;
    },
  ): Promise<Incubator[]>;
  getIncubatorsCount(filters?: {
    search?: string;
    country?: string;
    programType?: string;
  }): Promise<number>;

  // Grant methods
  getGrants(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      status?: string;
      programme?: string;
      fundedUnder?: string;
    },
  ): Promise<Grant[]>;
  getGrantsCount(filters?: {
    search?: string;
    status?: string;
    programme?: string;
    fundedUnder?: string;
  }): Promise<number>;
  getGrantsProgrammes(): Promise<string[]>;
  getGrantsFundedUnder(): Promise<string[]>;
  getGrantsStatuses(): Promise<string[]>;

  // Event methods
  getEvents(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      eventType?: string;
      location?: string;
      month?: string;
    },
  ): Promise<Event[]>;
  getEventsEuropeanStartup(
    limit?: number,
    offset?: number,
    filters?: { search?: string; location?: string; month?: string },
  ): Promise<EventEuropeanStartup[]>;
  getEventsCount(): Promise<number>;
  getEventsEuropeanStartupCount(): Promise<number>;
  getUpcomingEvents(): Promise<Event[]>;
  getUniqueEventTypes(): Promise<string[]>;
  getUniqueEuropeanEventTypes(): Promise<string[]>;
  getUniqueEventLocations(): Promise<string[]>;
  getUniqueEuropeanEventLocations(): Promise<string[]>;

  // Rankings methods
  getRankingsTopCities(
    limit?: number,
    offset?: number,
    filters?: { search?: string; country?: string },
  ): Promise<RankingTopCity[]>;
  getRankingsTopCountries(
    limit?: number,
    offset?: number,
    filters?: { search?: string },
  ): Promise<RankingTopCountry[]>;
  getRankingsUniversities(
    limit?: number,
    offset?: number,
    filters?: { search?: string; country?: string; year?: string },
  ): Promise<RankingUniversity[]>;
  getRankingsTopCitiesCount(): Promise<number>;
  getRankingsTopCountriesCount(): Promise<number>;
  getRankingsUniversitiesCount(): Promise<number>;

  // Sanctions methods
  getSanctionsExtended(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      entityType?: string;
      country?: string;
      programs?: string;
    },
  ): Promise<SanctionListExtended[]>;
  getSanctionsIndividuals(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      entityType?: string;
      country?: string;
      nationality?: string;
      programs?: string;
    },
  ): Promise<SanctionListIndividual[]>;
  getSanctionsExtendedCount(): Promise<number>;
  getSanctionsIndividualsCount(): Promise<number>;

  // Funding methods
  getFundingRoundsExits(
    limit?: number,
    offset?: number,
  ): Promise<FundingRoundExit[]>;
  getFundingRoundsMaDeals(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      acquirer?: string;
      minValue?: string;
      year?: string;
    },
  ): Promise<FundingRoundMaDeal[]>;
  getFundingRoundsMaDealsCount(filters?: {
    search?: string;
    acquirer?: string;
    minValue?: string;
    year?: string;
  }): Promise<number>;
  getFundingRoundsMegadeals(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      acquirer?: string;
      acquirerCountry?: string;
      acquiredEntity?: string;
      acquiredCountry?: string;
      minValue?: string;
      year?: string;
      rank?: string;
      transactionType?: string;
    },
  ): Promise<FundingRoundMegadeal[]>;
  getFundingRoundsMegadealsCount(filters?: {
    search?: string;
    acquirer?: string;
    acquirerCountry?: string;
    acquiredEntity?: string;
    acquiredCountry?: string;
    minValue?: string;
    year?: string;
    rank?: string;
    transactionType?: string;
  }): Promise<number>;
  getFundingRoundsUsSfd23(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      industry?: string;
      minAmount?: string;
      year?: string;
      leadInvestor?: string;
    },
  ): Promise<FundingRoundUsSfd23[]>;
  getFundingRoundsUsSfd23Count(filters?: {
    search?: string;
    industry?: string;
    minAmount?: string;
    year?: string;
    leadInvestor?: string;
  }): Promise<number>;
  getFundingRoundsUsSfd24(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      industry?: string;
      minAmount?: string;
      year?: string;
      leadInvestor?: string;
    },
  ): Promise<FundingRoundUsSfd24[]>;
  getFundingRoundsUsSfd24Count(filters?: {
    search?: string;
    industry?: string;
    minAmount?: string;
    year?: string;
    leadInvestor?: string;
  }): Promise<number>;
  getLiveFunding(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      roundType?: string;
      country?: string;
      mainCategory?: string;
      currency?: string;
      teamSize?: string;
      industry?: string;
      minAmount?: string;
      year?: string;
    },
  ): Promise<LiveFunding[]>;
  getLiveFundingCount(filters?: {
    search?: string;
    roundType?: string;
    country?: string;
    mainCategory?: string;
    currency?: string;
    teamSize?: string;
    industry?: string;
    minAmount?: string;
    year?: string;
  }): Promise<number>;
  getRecentFunding(): Promise<FundingRoundExit[]>;

  // Unicorn methods
  getUnicorns(
    limit?: number,
    offset?: number,
    filters?: {
      search?: string;
      country?: string;
      continent?: string;
      minValuation?: string;
      tier?: string;
      funding?: string;
      leadInvestor?: string;
    },
  ): Promise<Unicorn[]>;
  getUnicornsCount(filters?: {
    search?: string;
    country?: string;
    continent?: string;
    minValuation?: string;
    tier?: string;
    funding?: string;
    leadInvestor?: string;
  }): Promise<number>;

  // Investor methods
  getInvestors(
    limit?: number,
    offset?: number,
    filters?: { search?: string; type?: string; location?: string },
  ): Promise<Investor[]>;
  getInvestorContacts(
    limit?: number,
    offset?: number,
    filters?: { search?: string; type?: string; location?: string },
  ): Promise<InvestorContact[]>;
  getInvestorsCount(filters?: {
    search?: string;
    type?: string;
    location?: string;
  }): Promise<number>;
  getInvestorContactsCount(filters?: {
    search?: string;
    type?: string;
    location?: string;
  }): Promise<number>;
  getInvestorById(id: number): Promise<Investor | undefined>;
  getInvestorContactById(id: string): Promise<InvestorContact | undefined>;
  getInvestorStats(): Promise<{
    totalInvestors: number;
    totalContacts: number;
    vcFunds: number;
    angelInvestors: number;
  }>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalCompanies: number;
    activeRounds: number;
    totalFunding: string;
    newUnicorns: number;
  }>;

  // Enhanced funding analytics for Dashboard
  getFundingAnalytics(): Promise<{
    totalFundingVolume: string;
    avgDealSize: string;
    totalExits: number;
    totalMegadeals: number;
    thisMonthFunding: string;
    topIndustries: Array<{ industry: string; count: number; volume: string }>;
    monthlyTrends: Array<{ month: string; volume: number; deals: number }>;
    recentMajorDeals: Array<{
      id: number;
      company: string;
      amount: string;
      type: string;
      date: string;
      industry?: string;
      leadInvestors?: string;
    }>;
  }>;

  getLatestFundingActivity(): Promise<
    Array<{
      id: number;
      company: string;
      amount: string;
      type: "funding" | "exit" | "ma" | "megadeal";
      date: string;
      industry?: string;
      description: string;
    }>
  >;

  // Analytics methods for complete datasets (no pagination)
  getStartupsAnalytics(): Promise<{
    countryDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
    stateDistribution: Array<{ name: string; value: number }>;
  }>;

  getGrowthCompaniesAnalytics(): Promise<{
    fundingSizeDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
    growthRateDistribution: Array<{ name: string; value: number }>;
  }>;

  getFranchisesAnalytics(): Promise<{
    investmentDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
    foundedTimeline: Array<{ name: string; value: number }>;
  }>;

  getVcCompaniesAnalytics(): Promise<{
    investmentStageDistribution: Array<{ name: string; value: number }>;
    aumDistribution: Array<{ name: string; value: number }>;
    regionalDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
  }>;

  getMADeals(
    limit?: number,
    offset?: number,
    filters?: { search?: string; mainCategory?: string; year?: string },
  ): Promise<any[]>;
  getMADealsCount(filters?: {
    search?: string;
    mainCategory?: string;
    year?: string;
  }): Promise<number>;
}

export class SupabaseStorage implements IStorage {
  constructor() {}

  async getUser(id: number): Promise<User | undefined> {
    try {
      if (!ensureSupabase()) {
        console.error(
          "⚠️  Supabase client unavailable - returning undefined for getUser",
        );
        return undefined;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return undefined;
      return data;
    } catch (error) {
      console.error("Error in getUser:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) return undefined;
    return data;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) return undefined;
    return data;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert({
        username: insertUser.username,
        password: insertUser.password,
        email: insertUser.email || null,
        role: insertUser.role || "investor",
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create user");
    }

    return data;
  }

  async getCompaniesStartups(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      industry?: string;
      country?: string;
      state?: string;
      rank?: string;
      srScore2?: string;
      founded?: string;
    },
  ): Promise<CompanyStartup[]> {
    try {
      if (!ensureSupabase()) {
        console.error(
          "⚠️  Supabase client unavailable - returning empty array for getCompaniesStartups",
        );
        return [];
      }

      let query = supabase.from("companies_startups").select("*");

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,tags.ilike.%${filters.search}%`,
        );
      }

      if (filters?.industry && filters.industry !== "all") {
        query = query.ilike("tags", `%${filters.industry}%`);
      }

      if (filters?.country && filters.country !== "all") {
        // Map country codes to full names that might be in the database
        const countryMapping: { [key: string]: string } = {
          us: "United States",
          uk: "United Kingdom",
          ca: "Canada",
          de: "Germany",
          fr: "France",
          in: "India",
          sg: "Singapore",
          au: "Australia",
        };

        const countryName =
          countryMapping[filters.country.toLowerCase()] || filters.country;
        query = query.eq("country", countryName);
      }

      // State filter
      if (filters?.state && filters.state !== "all") {
        query = query.eq("state", filters.state);
      }

      // Rank filter - Handle comma-formatted ranks like "1,065"
      if (filters?.rank && filters.rank !== "all") {
        const rankRange = filters.rank.split("-");
        if (rankRange.length === 2) {
          const min = parseInt(rankRange[0]);
          const max = parseInt(rankRange[1]);

          // Build array of rank strings including comma-formatted versions
          const rankStrings = [];
          for (let i = min; i <= max; i++) {
            rankStrings.push(i.toString()); // Simple: "65"
            if (i >= 1000) {
              rankStrings.push(i.toLocaleString()); // Comma format: "1,065"
            }
          }

          query = query.not("rank", "is", null).in("rank", rankStrings);
        }
      }

      // Prognosticz Score filter - Simple approach for comma-formatted scores
      if (filters?.srScore2 && filters.srScore2.trim() !== "") {
        const inputScore = parseInt(filters.srScore2);
        if (!isNaN(inputScore)) {
          // For input like 72, we want scores like 72,xxx and higher (72,000+)
          // Use a simple approach: scores that start with the number
          query = query
            .not("sr_score2", "is", null)
            .gte("sr_score2", `${inputScore},000`);
        }
      }

      // Founded Year filter
      if (filters?.founded && filters.founded.trim() !== "") {
        const year = filters.founded.trim();
        // The founded field contains text like "Founded: March 10, 2019"
        // so we need to search for the year within the text
        query = query.not("founded", "is", null).ilike("founded", `%${year}%`);
      }

      const { data, error } = await query
        .range(offset, offset + limit - 1)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching startups:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getCompaniesStartups:", error);
      return [];
    }
  }

  async getCompaniesGrowth(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      industry?: string;
      location?: string;
      ranking?: string;
      annualRevenue?: string;
      employees?: string;
      growthRate?: string;
    },
  ): Promise<CompanyGrowth[]> {
    let query = supabase.from("companies_growth").select("*");

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,industry.ilike.%${filters.search}%,what_is.ilike.%${filters.search}%`,
      );
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    if (filters?.location && filters.location !== "all") {
      // Test single pattern first to verify basic functionality
      if (filters.location === "de") {
        console.log("🧪 Testing Germany filter with single pattern");
        query = query.ilike("location", `%Germany%`);
      } else if (filters.location === "fr") {
        console.log("🧪 Testing France filter with single pattern");
        query = query.ilike("location", `%France%`);
      } else if (filters.location === "ca") {
        console.log("🧪 Testing Canada filter with single pattern");
        query = query.ilike("location", `%Canada%`);
      } else if (filters.location === "us") {
        console.log("🧪 Testing US filter with single pattern");
        query = query.ilike("location", `%USA%`);
      } else if (filters.location === "uk") {
        console.log("🧪 Testing UK filter with single pattern");
        query = query.ilike("location", `%UK%`);
      } else {
        query = query.ilike("location", `%${filters.location}%`);
      }
    }

    if (filters?.ranking && filters.ranking !== "all") {
      console.log(`🔍 Applying ranking filter: ${filters.ranking}`);

      // Since rankings are stored as "# 48" format, we need exact matching for efficiency
      if (filters.ranking === "1-100") {
        // Generate list of exact rankings from 1-100
        const top100Rankings = [];
        for (let i = 1; i <= 100; i++) {
          top100Rankings.push(`# ${i}`);
        }
        query = query.in("growjo_ranking", top100Rankings);
      } else if (filters.ranking === "101-500") {
        // Generate list of exact rankings from 101-500
        const rankings101to500 = [];
        for (let i = 101; i <= 500; i++) {
          rankings101to500.push(`# ${i}`);
        }
        query = query.in("growjo_ranking", rankings101to500);
      } else if (filters.ranking === "501-1000") {
        // Generate list of exact rankings from 501-1000
        const rankings501to1000 = [];
        for (let i = 501; i <= 1000; i++) {
          rankings501to1000.push(`# ${i}`);
        }
        query = query.in("growjo_ranking", rankings501to1000);
      } else if (filters.ranking === "1000+") {
        // For 1000+, use pattern matching for 4+ digit numbers
        query = query
          .not("growjo_ranking", "is", null)
          .or(
            "growjo_ranking.ilike.# 1___,growjo_ranking.ilike.# 2___,growjo_ranking.ilike.# 3___,growjo_ranking.ilike.# 4___,growjo_ranking.ilike.# 5___,growjo_ranking.ilike.# 6___,growjo_ranking.ilike.# 7___,growjo_ranking.ilike.# 8___,growjo_ranking.ilike.# 9___,growjo_ranking.ilike.# 1____,growjo_ranking.ilike.# 2____,growjo_ranking.ilike.# 3____,growjo_ranking.ilike.# 4____,growjo_ranking.ilike.# 5____,growjo_ranking.ilike.# 6____,growjo_ranking.ilike.# 7____,growjo_ranking.ilike.# 8____,growjo_ranking.ilike.# 9____",
          );
      }
    }

    if (filters?.annualRevenue && filters.annualRevenue !== "all") {
      // Filter by annual revenue ranges - handle $104.9M, $29.5M format
      if (filters.annualRevenue === "0-1M") {
        query = query.or(
          "annual_revenue.ilike.%K%,estimated_revenue.ilike.%K%,annual_revenue.ilike.%$0.%M%,estimated_revenue.ilike.%$0.%M%",
        );
      } else if (filters.annualRevenue === "1M-10M") {
        query = query.or(
          "annual_revenue.ilike.%$1.%M%,annual_revenue.ilike.%$2.%M%,annual_revenue.ilike.%$3.%M%,annual_revenue.ilike.%$4.%M%,annual_revenue.ilike.%$5.%M%,annual_revenue.ilike.%$6.%M%,annual_revenue.ilike.%$7.%M%,annual_revenue.ilike.%$8.%M%,annual_revenue.ilike.%$9.%M%,estimated_revenue.ilike.%$1.%M%,estimated_revenue.ilike.%$2.%M%,estimated_revenue.ilike.%$3.%M%,estimated_revenue.ilike.%$4.%M%,estimated_revenue.ilike.%$5.%M%,estimated_revenue.ilike.%$6.%M%,estimated_revenue.ilike.%$7.%M%,estimated_revenue.ilike.%$8.%M%,estimated_revenue.ilike.%$9.%M%",
        );
      } else if (filters.annualRevenue === "10M-100M") {
        // Match 10-99M using efficient patterns
        query = query.or(
          "annual_revenue.ilike.%$10%M%,annual_revenue.ilike.%$11%M%,annual_revenue.ilike.%$12%M%,annual_revenue.ilike.%$13%M%,annual_revenue.ilike.%$14%M%,annual_revenue.ilike.%$15%M%,annual_revenue.ilike.%$16%M%,annual_revenue.ilike.%$17%M%,annual_revenue.ilike.%$18%M%,annual_revenue.ilike.%$19%M%,annual_revenue.ilike.%$2_%M%,annual_revenue.ilike.%$3_%M%,annual_revenue.ilike.%$4_%M%,annual_revenue.ilike.%$5_%M%,annual_revenue.ilike.%$6_%M%,annual_revenue.ilike.%$7_%M%,annual_revenue.ilike.%$8_%M%,annual_revenue.ilike.%$9_%M%,estimated_revenue.ilike.%$10%M%,estimated_revenue.ilike.%$11%M%,estimated_revenue.ilike.%$12%M%,estimated_revenue.ilike.%$13%M%,estimated_revenue.ilike.%$14%M%,estimated_revenue.ilike.%$15%M%,estimated_revenue.ilike.%$16%M%,estimated_revenue.ilike.%$17%M%,estimated_revenue.ilike.%$18%M%,estimated_revenue.ilike.%$19%M%,estimated_revenue.ilike.%$2_%M%,estimated_revenue.ilike.%$3_%M%,estimated_revenue.ilike.%$4_%M%,estimated_revenue.ilike.%$5_%M%,estimated_revenue.ilike.%$6_%M%,estimated_revenue.ilike.%$7_%M%,estimated_revenue.ilike.%$8_%M%,estimated_revenue.ilike.%$9_%M%",
        );
      } else if (filters.annualRevenue === "100M+") {
        // Match 100M+ and billions - simplified approach
        query = query.or(
          "annual_revenue.ilike.%B%,estimated_revenue.ilike.%B%",
        );

        // Also add a separate query for 100+ millions
        const hundredMQuery = supabase.from("companies_growth").select("*");
        if (filters?.search) {
          hundredMQuery.or(
            `name.ilike.%${filters.search}%,industry.ilike.%${filters.search}%,what_is.ilike.%${filters.search}%`,
          );
        }
        if (filters?.industry && filters.industry !== "all") {
          hundredMQuery.ilike("industry", `%${filters.industry}%`);
        }
        if (filters?.location && filters.location !== "all") {
          // Use same location mapping as main query
          const locationMappings: { [key: string]: string[] } = {
            // Short codes from frontend
            ca: ["Canada", "CAN"],
            de: ["Germany", "Deutschland", "DE"],
            fr: ["France", "FR"],
            us: ["USA", "United States", "US"],
            uk: ["UK", "United Kingdom", "England", "London"],
            // Full names (for backward compatibility)
            Canada: ["Canada", "CAN"],
            Germany: ["Germany", "Deutschland", "DE"],
            France: ["France", "FR"],
            "United States": ["USA", "United States", "US"],
            "United Kingdom": ["UK", "United Kingdom", "England", "London"],
          };

          const locationPatterns = locationMappings[filters.location];
          if (locationPatterns) {
            const orConditions = locationPatterns
              .map((pattern) => `location.ilike.%${pattern}%`)
              .join(",");
            hundredMQuery.or(orConditions);
          } else {
            hundredMQuery.ilike("location", `%${filters.location}%`);
          }
        }

        // Add patterns for 100-999M in chunks to avoid URL limits
        hundredMQuery.or(
          "annual_revenue.ilike.%$1__M%,annual_revenue.ilike.%$2__M%,annual_revenue.ilike.%$3__M%,annual_revenue.ilike.%$4__M%,annual_revenue.ilike.%$5__M%,annual_revenue.ilike.%$6__M%,annual_revenue.ilike.%$7__M%,annual_revenue.ilike.%$8__M%,annual_revenue.ilike.%$9__M%,estimated_revenue.ilike.%$1__M%,estimated_revenue.ilike.%$2__M%,estimated_revenue.ilike.%$3__M%,estimated_revenue.ilike.%$4__M%,estimated_revenue.ilike.%$5__M%,estimated_revenue.ilike.%$6__M%,estimated_revenue.ilike.%$7__M%,estimated_revenue.ilike.%$8__M%,estimated_revenue.ilike.%$9__M%",
        );
      }
    }

    if (filters?.employees && filters.employees !== "all") {
      // Filter by employee count ranges using employees field (format: "306", "485", etc.)
      if (filters.employees === "1-10") {
        query = query.or(
          "employees.eq.1,employees.eq.2,employees.eq.3,employees.eq.4,employees.eq.5,employees.eq.6,employees.eq.7,employees.eq.8,employees.eq.9,employees.eq.10",
        );
      } else if (filters.employees === "11-50") {
        // Match employees 11-50 with exact values
        const conditions: string[] = [];
        for (let i = 11; i <= 50; i++) {
          conditions.push(`employees.eq.${i}`);
        }
        query = query.or(conditions.join(","));
      } else if (filters.employees === "51-200") {
        // Match employees 51-200 with exact values
        const conditions: string[] = [];
        for (let i = 51; i <= 200; i++) {
          conditions.push(`employees.eq.${i}`);
        }
        query = query.or(conditions.join(","));
      } else if (filters.employees === "201-1000") {
        // Match employees 201-1000 with exact values
        const conditions: string[] = [];
        for (let i = 201; i <= 1000; i++) {
          conditions.push(`employees.eq.${i}`);
        }
        query = query.or(conditions.join(","));
      } else if (filters.employees === "1000+") {
        // For 1000+ use pattern matching for larger numbers
        query = query.or(
          "employees.ilike.%1___%,employees.ilike.%2___%,employees.ilike.%3___%,employees.ilike.%4___%,employees.ilike.%5___%,employees.ilike.%6___%,employees.ilike.%7___%,employees.ilike.%8___%,employees.ilike.%9___%",
        );
      }
    }

    if (filters?.growthRate && filters.growthRate !== "all") {
      // Filter by growth rate ranges using grew_employee_count field (format: "38%")
      if (filters.growthRate === "0-10") {
        // Match 0% to 9% - be more specific with patterns
        query = query.or(
          "grew_employee_count.eq.0%,grew_employee_count.eq.1%,grew_employee_count.eq.2%,grew_employee_count.eq.3%,grew_employee_count.eq.4%,grew_employee_count.eq.5%,grew_employee_count.eq.6%,grew_employee_count.eq.7%,grew_employee_count.eq.8%,grew_employee_count.eq.9%",
        );
      } else if (filters.growthRate === "10-25") {
        // Match exactly 10% to 25%
        query = query.or(
          "grew_employee_count.eq.10%,grew_employee_count.eq.11%,grew_employee_count.eq.12%,grew_employee_count.eq.13%,grew_employee_count.eq.14%,grew_employee_count.eq.15%,grew_employee_count.eq.16%,grew_employee_count.eq.17%,grew_employee_count.eq.18%,grew_employee_count.eq.19%,grew_employee_count.eq.20%,grew_employee_count.eq.21%,grew_employee_count.eq.22%,grew_employee_count.eq.23%,grew_employee_count.eq.24%,grew_employee_count.eq.25%",
        );
      } else if (filters.growthRate === "25-50") {
        // Match exactly 25% to 50%
        const patterns: string[] = [];
        for (let i = 25; i <= 50; i++) {
          patterns.push(`grew_employee_count.eq.${i}%`);
        }
        query = query.or(patterns.join(","));
      } else if (filters.growthRate === "50-100") {
        // Match exactly 50% to 100%
        const patterns: string[] = [];
        for (let i = 50; i <= 100; i++) {
          patterns.push(`grew_employee_count.eq.${i}%`);
        }
        query = query.or(patterns.join(","));
      } else if (filters.growthRate === "100+") {
        // Match 100%+ - test with simple exact matches first
        query = query.or(
          "grew_employee_count.eq.100%,grew_employee_count.eq.182%,grew_employee_count.eq.177%",
        );
      }
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching growth companies:", error);
      return [];
    }

    return data || [];
  }

  async getCompaniesFranchises(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      industry?: string;
      rank?: string;
      initialInvestment?: string;
      founded?: string;
      empAtHq?: string;
      units2024?: string;
    },
  ): Promise<CompanyFranchise[]> {
    let query = supabase.from("companies_franchises").select("*");

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`,
      );
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    // Rank filter - handle "#123" format
    if (filters?.rank && filters.rank !== "all") {
      const rankRange = filters.rank.split("-");
      if (rankRange.length === 2) {
        const min = parseInt(rankRange[0]);
        const max = parseInt(rankRange[1]);
        // Build pattern for ranks like "#1", "#2", etc.
        const patterns = [];
        for (let i = min; i <= max; i++) {
          patterns.push(`rank.eq.#${i}`);
        }
        query = query
          .not("rank", "is", null)
          .or(patterns.slice(0, 50).join(",")); // Limit to 50 patterns to avoid URL length issues
      }
    }

    // Initial Investment filter - handle "$611K - $4M" format
    if (filters?.initialInvestment && filters.initialInvestment !== "all") {
      switch (filters.initialInvestment) {
        case "0-50k":
          query = query
            .not("initial_investment", "is", null)
            .or(
              "initial_investment.ilike.%$1K%,initial_investment.ilike.%$2K%,initial_investment.ilike.%$3K%,initial_investment.ilike.%$4K%,initial_investment.ilike.%$5K%,initial_investment.ilike.%$10K%,initial_investment.ilike.%$15K%,initial_investment.ilike.%$20K%,initial_investment.ilike.%$25K%,initial_investment.ilike.%$30K%,initial_investment.ilike.%$35K%,initial_investment.ilike.%$40K%,initial_investment.ilike.%$45K%,initial_investment.ilike.%$49K%",
            );
          break;
        case "50k-100k":
          query = query
            .not("initial_investment", "is", null)
            .or(
              "initial_investment.ilike.%$50K%,initial_investment.ilike.%$55K%,initial_investment.ilike.%$60K%,initial_investment.ilike.%$65K%,initial_investment.ilike.%$70K%,initial_investment.ilike.%$75K%,initial_investment.ilike.%$80K%,initial_investment.ilike.%$85K%,initial_investment.ilike.%$90K%,initial_investment.ilike.%$95K%,initial_investment.ilike.%$99K%",
            );
          break;
        case "100k-250k":
          query = query
            .not("initial_investment", "is", null)
            .or(
              "initial_investment.ilike.%$10%,initial_investment.ilike.%$11%,initial_investment.ilike.%$12%,initial_investment.ilike.%$13%,initial_investment.ilike.%$14%,initial_investment.ilike.%$15%,initial_investment.ilike.%$16%,initial_investment.ilike.%$17%,initial_investment.ilike.%$18%,initial_investment.ilike.%$19%,initial_investment.ilike.%$20%,initial_investment.ilike.%$21%,initial_investment.ilike.%$22%,initial_investment.ilike.%$23%,initial_investment.ilike.%$24%",
            );
          break;
        case "250k-500k":
          query = query
            .not("initial_investment", "is", null)
            .or(
              "initial_investment.ilike.%$25%,initial_investment.ilike.%$26%,initial_investment.ilike.%$27%,initial_investment.ilike.%$28%,initial_investment.ilike.%$29%,initial_investment.ilike.%$30%,initial_investment.ilike.%$35%,initial_investment.ilike.%$40%,initial_investment.ilike.%$45%,initial_investment.ilike.%$49%",
            );
          break;
        case "500k+":
          query = query
            .not("initial_investment", "is", null)
            .or(
              "initial_investment.ilike.%$5%,initial_investment.ilike.%$6%,initial_investment.ilike.%$7%,initial_investment.ilike.%$8%,initial_investment.ilike.%$9%,initial_investment.ilike.%$1M%,initial_investment.ilike.%$2M%,initial_investment.ilike.%$3M%,initial_investment.ilike.%$4M%,initial_investment.ilike.%$5M%",
            );
          break;
      }
    }

    // Founded filter
    if (filters?.founded && filters.founded !== "all") {
      switch (filters.founded) {
        case "2020+":
          query = query
            .not("founded", "is", null)
            .filter("founded", "gte", 2020);
          break;
        case "2010-2019":
          query = query
            .not("founded", "is", null)
            .filter("founded", "gte", 2010)
            .filter("founded", "lte", 2019);
          break;
        case "2000-2009":
          query = query
            .not("founded", "is", null)
            .filter("founded", "gte", 2000)
            .filter("founded", "lte", 2009);
          break;
        case "1990-1999":
          query = query
            .not("founded", "is", null)
            .filter("founded", "gte", 1990)
            .filter("founded", "lte", 1999);
          break;
        case "1980-1989":
          query = query
            .not("founded", "is", null)
            .filter("founded", "gte", 1980)
            .filter("founded", "lte", 1989);
          break;
        case "pre-1980":
          query = query
            .not("founded", "is", null)
            .filter("founded", "lt", 1980);
          break;
      }
    }

    // Employees at HQ filter
    if (filters?.empAtHq && filters.empAtHq !== "all") {
      switch (filters.empAtHq) {
        case "1-10":
          query = query
            .not("num_of_employees_at_hq", "is", null)
            .filter("num_of_employees_at_hq", "gte", 1)
            .filter("num_of_employees_at_hq", "lte", 10);
          break;
        case "11-50":
          query = query
            .not("num_of_employees_at_hq", "is", null)
            .filter("num_of_employees_at_hq", "gte", 11)
            .filter("num_of_employees_at_hq", "lte", 50);
          break;
        case "51-100":
          query = query
            .not("num_of_employees_at_hq", "is", null)
            .filter("num_of_employees_at_hq", "gte", 51)
            .filter("num_of_employees_at_hq", "lte", 100);
          break;
        case "101-500":
          query = query
            .not("num_of_employees_at_hq", "is", null)
            .filter("num_of_employees_at_hq", "gte", 101)
            .filter("num_of_employees_at_hq", "lte", 500);
          break;
        case "500+":
          query = query
            .not("num_of_employees_at_hq", "is", null)
            .filter("num_of_employees_at_hq", "gte", 500);
          break;
      }
    }

    // Units 2024 filter - handle "8,565 Increase 13.2% over 3 years" format
    if (filters?.units2024 && filters.units2024 !== "all") {
      switch (filters.units2024) {
        case "1-50":
          query = query
            .not("units_as_of_2024", "is", null)
            .or(
              "units_as_of_2024.ilike.1 %,units_as_of_2024.ilike.2 %,units_as_of_2024.ilike.3 %,units_as_of_2024.ilike.4 %,units_as_of_2024.ilike.5 %,units_as_of_2024.ilike.10 %,units_as_of_2024.ilike.15 %,units_as_of_2024.ilike.20 %,units_as_of_2024.ilike.25 %,units_as_of_2024.ilike.30 %,units_as_of_2024.ilike.35 %,units_as_of_2024.ilike.40 %,units_as_of_2024.ilike.45 %,units_as_of_2024.ilike.50 %",
            );
          break;
        case "51-100":
          query = query
            .not("units_as_of_2024", "is", null)
            .or(
              "units_as_of_2024.ilike.51 %,units_as_of_2024.ilike.55 %,units_as_of_2024.ilike.60 %,units_as_of_2024.ilike.65 %,units_as_of_2024.ilike.70 %,units_as_of_2024.ilike.75 %,units_as_of_2024.ilike.80 %,units_as_of_2024.ilike.85 %,units_as_of_2024.ilike.90 %,units_as_of_2024.ilike.95 %,units_as_of_2024.ilike.100 %",
            );
          break;
        case "101-500":
          query = query
            .not("units_as_of_2024", "is", null)
            .or(
              "units_as_of_2024.ilike.10% %,units_as_of_2024.ilike.15% %,units_as_of_2024.ilike.20% %,units_as_of_2024.ilike.25% %,units_as_of_2024.ilike.30% %,units_as_of_2024.ilike.35% %,units_as_of_2024.ilike.40% %,units_as_of_2024.ilike.45% %,units_as_of_2024.ilike.49% %",
            );
          break;
        case "501-1000":
          query = query
            .not("units_as_of_2024", "is", null)
            .or(
              "units_as_of_2024.ilike.50% %,units_as_of_2024.ilike.60% %,units_as_of_2024.ilike.70% %,units_as_of_2024.ilike.80% %,units_as_of_2024.ilike.90% %,units_as_of_2024.ilike.999 %",
            );
          break;
        case "1000+":
          query = query
            .not("units_as_of_2024", "is", null)
            .ilike("units_as_of_2024", "%,% %");
          break;
      }
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching franchises:", error);
      return [];
    }

    return data || [];
  }

  async getCompaniesStartupsCount(filters?: {
    search?: string;
    industry?: string;
    country?: string;
    state?: string;
    rank?: string;
    srScore2?: string;
    founded?: string;
  }): Promise<number> {
    let query = supabase
      .from("companies_startups")
      .select("*", { count: "exact", head: true });

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,tags.ilike.%${filters.search}%`,
      );
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("tags", `%${filters.industry}%`);
    }

    if (filters?.country && filters.country !== "all") {
      // Map country codes to full names that might be in the database
      const countryMapping: { [key: string]: string } = {
        us: "United States",
        uk: "United Kingdom",
        ca: "Canada",
        de: "Germany",
        fr: "France",
        in: "India",
        sg: "Singapore",
        au: "Australia",
      };

      const countryName =
        countryMapping[filters.country.toLowerCase()] || filters.country;
      query = query.eq("country", countryName);
    }

    // State filter
    if (filters?.state && filters.state !== "all") {
      query = query.eq("state", filters.state);
    }

    // Rank filter - Handle comma-formatted ranks like "1,065"
    if (filters?.rank && filters.rank !== "all") {
      console.log("🔍 COUNT: Filtering by rank:", filters.rank);
      const rankRange = filters.rank.split("-");
      if (rankRange.length === 2) {
        const min = parseInt(rankRange[0]);
        const max = parseInt(rankRange[1]);
        console.log("📊 COUNT: Rank range:", min, "to", max);

        // Build array of rank strings including comma-formatted versions
        const rankStrings = [];
        for (let i = min; i <= max; i++) {
          rankStrings.push(i.toString()); // Simple: "65"
          if (i >= 1000) {
            rankStrings.push(i.toLocaleString()); // Comma format: "1,065"
          }
        }
        console.log(
          "🎯 COUNT: Rank strings to match:",
          rankStrings.slice(0, 10),
          "...",
        );

        query = query.not("rank", "is", null).in("rank", rankStrings);
      }
    }

    // Prognosticz Score filter - Simple approach for comma-formatted scores
    if (filters?.srScore2 && filters.srScore2.trim() !== "") {
      const inputScore = parseInt(filters.srScore2);
      if (!isNaN(inputScore)) {
        // For input like 72, we want scores like 72,xxx and higher (72,000+)
        // Use a simple approach: scores that start with the number
        query = query
          .not("sr_score2", "is", null)
          .gte("sr_score2", `${inputScore},000`);
      }
    }

    // Founded Year filter
    if (filters?.founded && filters.founded.trim() !== "") {
      const year = filters.founded.trim();
      // The founded field contains text like "Founded: March 10, 2019"
      // so we need to search for the year within the text
      query = query.not("founded", "is", null).ilike("founded", `%${year}%`);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting startups:", error);
      return 0;
    }

    return count || 0;
  }

  async getCompaniesGrowthCount(filters?: {
    search?: string;
    industry?: string;
    location?: string;
    ranking?: string;
    annualRevenue?: string;
    employees?: string;
    growthRate?: string;
  }): Promise<number> {
    let query = supabase
      .from("companies_growth")
      .select("*", { count: "exact", head: true });

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,industry.ilike.%${filters.search}%,what_is.ilike.%${filters.search}%`,
      );
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    if (filters?.location && filters.location !== "all") {
      // Test single pattern first to verify basic functionality (same as getCompaniesGrowth)
      if (filters.location === "de") {
        console.log("🧪 COUNT Testing Germany filter with single pattern");
        query = query.ilike("location", `%Germany%`);
      } else if (filters.location === "fr") {
        console.log("🧪 COUNT Testing France filter with single pattern");
        query = query.ilike("location", `%France%`);
      } else if (filters.location === "ca") {
        console.log("🧪 COUNT Testing Canada filter with single pattern");
        query = query.ilike("location", `%Canada%`);
      } else if (filters.location === "us") {
        console.log("🧪 COUNT Testing US filter with single pattern");
        query = query.ilike("location", `%USA%`);
      } else if (filters.location === "uk") {
        console.log("🧪 COUNT Testing UK filter with single pattern");
        query = query.ilike("location", `%UK%`);
      } else {
        query = query.ilike("location", `%${filters.location}%`);
      }
    }

    if (filters?.ranking && filters.ranking !== "all") {
      console.log(`🔍 COUNT: Applying ranking filter: ${filters.ranking}`);

      // Use same logic as getCompaniesGrowth - rankings are stored as "# 48" format
      if (filters.ranking === "1-100") {
        // Generate list of exact rankings from 1-100
        const top100Rankings = [];
        for (let i = 1; i <= 100; i++) {
          top100Rankings.push(`# ${i}`);
        }
        query = query.in("growjo_ranking", top100Rankings);
      } else if (filters.ranking === "101-500") {
        // Generate list of exact rankings from 101-500
        const rankings101to500 = [];
        for (let i = 101; i <= 500; i++) {
          rankings101to500.push(`# ${i}`);
        }
        query = query.in("growjo_ranking", rankings101to500);
      } else if (filters.ranking === "501-1000") {
        // Generate list of exact rankings from 501-1000
        const rankings501to1000 = [];
        for (let i = 501; i <= 1000; i++) {
          rankings501to1000.push(`# ${i}`);
        }
        query = query.in("growjo_ranking", rankings501to1000);
      } else if (filters.ranking === "1000+") {
        // For 1000+, use pattern matching for 4+ digit numbers
        query = query
          .not("growjo_ranking", "is", null)
          .or(
            "growjo_ranking.ilike.# 1___,growjo_ranking.ilike.# 2___,growjo_ranking.ilike.# 3___,growjo_ranking.ilike.# 4___,growjo_ranking.ilike.# 5___,growjo_ranking.ilike.# 6___,growjo_ranking.ilike.# 7___,growjo_ranking.ilike.# 8___,growjo_ranking.ilike.# 9___,growjo_ranking.ilike.# 1____,growjo_ranking.ilike.# 2____,growjo_ranking.ilike.# 3____,growjo_ranking.ilike.# 4____,growjo_ranking.ilike.# 5____,growjo_ranking.ilike.# 6____,growjo_ranking.ilike.# 7____,growjo_ranking.ilike.# 8____,growjo_ranking.ilike.# 9____",
          );
      }
    }

    if (filters?.annualRevenue && filters.annualRevenue !== "all") {
      if (filters.annualRevenue === "0-1M") {
        query = query.or(
          "annual_revenue.ilike.%K%,estimated_revenue.ilike.%K%",
        );
      } else if (filters.annualRevenue === "1M-10M") {
        query = query.or(
          "annual_revenue.ilike.%[1-9]M%,estimated_revenue.ilike.%[1-9]M%",
        );
      } else if (filters.annualRevenue === "10M-100M") {
        query = query.or(
          "annual_revenue.ilike.%[1-9][0-9]M%,estimated_revenue.ilike.%[1-9][0-9]M%",
        );
      } else if (filters.annualRevenue === "100M+") {
        query = query.or(
          "annual_revenue.ilike.%B%,estimated_revenue.ilike.%B%,annual_revenue.ilike.%[1-9][0-9][0-9]M%,estimated_revenue.ilike.%[1-9][0-9][0-9]M%",
        );
      }
    }

    if (filters?.employees && filters.employees !== "all") {
      const employeeRange = filters.employees.split("-");
      if (employeeRange.length === 2) {
        const min = parseInt(employeeRange[0]);
        const max = parseInt(employeeRange[1]);
        query = query
          .not("number_of_employees", "is", null)
          .filter("number_of_employees", "gte", min.toString())
          .filter("number_of_employees", "lte", max.toString());
      } else if (filters.employees === "1000+") {
        query = query
          .not("number_of_employees", "is", null)
          .filter("number_of_employees", "gte", "1000");
      }
    }

    if (filters?.growthRate && filters.growthRate !== "all") {
      const growthRange = filters.growthRate.split("-");
      if (growthRange.length === 2) {
        const min = parseInt(growthRange[0]);
        const max = parseInt(growthRange[1]);
        query = query
          .not("employee_growth_percent", "is", null)
          .filter("employee_growth_percent", "gte", min.toString())
          .filter("employee_growth_percent", "lte", max.toString());
      } else if (filters.growthRate === "100+") {
        query = query
          .not("employee_growth_percent", "is", null)
          .filter("employee_growth_percent", "gte", "100");
      }
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting growth companies:", error);
      return 0;
    }

    return count || 0;
  }

  async getCompaniesFranchisesCount(filters?: {
    search?: string;
    industry?: string;
    rank?: string;
    initialInvestment?: string;
    founded?: string;
    empAtHq?: string;
    units2024?: string;
  }): Promise<number> {
    let query = supabase
      .from("companies_franchises")
      .select("*", { count: "exact", head: true });

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`,
      );
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    // Apply same filters as in getCompaniesFranchises
    if (filters?.rank && filters.rank !== "all") {
      const rankRange = filters.rank.split("-");
      if (rankRange.length === 2) {
        const min = parseInt(rankRange[0]);
        const max = parseInt(rankRange[1]);
        // Build pattern for ranks like "#1", "#2", etc.
        const patterns = [];
        for (let i = min; i <= max; i++) {
          patterns.push(`rank.eq.#${i}`);
        }
        query = query
          .not("rank", "is", null)
          .or(patterns.slice(0, 50).join(",")); // Limit to 50 patterns to avoid URL length issues
      }
    }

    if (filters?.initialInvestment && filters.initialInvestment !== "all") {
      switch (filters.initialInvestment) {
        case "0-50k":
          query = query
            .not("initial_investment", "is", null)
            .or(
              "initial_investment.ilike.%$1K%,initial_investment.ilike.%$2K%,initial_investment.ilike.%$3K%,initial_investment.ilike.%$4K%,initial_investment.ilike.%$5K%,initial_investment.ilike.%$10K%,initial_investment.ilike.%$15K%,initial_investment.ilike.%$20K%,initial_investment.ilike.%$25K%,initial_investment.ilike.%$30K%,initial_investment.ilike.%$35K%,initial_investment.ilike.%$40K%,initial_investment.ilike.%$45K%,initial_investment.ilike.%$49K%",
            );
          break;
        case "50k-100k":
          query = query
            .not("initial_investment", "is", null)
            .or(
              "initial_investment.ilike.%$50K%,initial_investment.ilike.%$55K%,initial_investment.ilike.%$60K%,initial_investment.ilike.%$65K%,initial_investment.ilike.%$70K%,initial_investment.ilike.%$75K%,initial_investment.ilike.%$80K%,initial_investment.ilike.%$85K%,initial_investment.ilike.%$90K%,initial_investment.ilike.%$95K%,initial_investment.ilike.%$99K%",
            );
          break;
        case "100k-250k":
          query = query
            .not("initial_investment", "is", null)
            .or(
              "initial_investment.ilike.%$10%,initial_investment.ilike.%$11%,initial_investment.ilike.%$12%,initial_investment.ilike.%$13%,initial_investment.ilike.%$14%,initial_investment.ilike.%$15%,initial_investment.ilike.%$16%,initial_investment.ilike.%$17%,initial_investment.ilike.%$18%,initial_investment.ilike.%$19%,initial_investment.ilike.%$20%,initial_investment.ilike.%$21%,initial_investment.ilike.%$22%,initial_investment.ilike.%$23%,initial_investment.ilike.%$24%",
            );
          break;
        case "250k-500k":
          query = query
            .not("initial_investment", "is", null)
            .or(
              "initial_investment.ilike.%$25%,initial_investment.ilike.%$26%,initial_investment.ilike.%$27%,initial_investment.ilike.%$28%,initial_investment.ilike.%$29%,initial_investment.ilike.%$30%,initial_investment.ilike.%$35%,initial_investment.ilike.%$40%,initial_investment.ilike.%$45%,initial_investment.ilike.%$49%",
            );
          break;
        case "500k+":
          query = query
            .not("initial_investment", "is", null)
            .or(
              "initial_investment.ilike.%$5%,initial_investment.ilike.%$6%,initial_investment.ilike.%$7%,initial_investment.ilike.%$8%,initial_investment.ilike.%$9%,initial_investment.ilike.%$1M%,initial_investment.ilike.%$2M%,initial_investment.ilike.%$3M%,initial_investment.ilike.%$4M%,initial_investment.ilike.%$5M%",
            );
          break;
      }
    }

    if (filters?.founded && filters.founded !== "all") {
      switch (filters.founded) {
        case "2020+":
          query = query
            .not("founded", "is", null)
            .filter("founded", "gte", 2020);
          break;
        case "2010-2019":
          query = query
            .not("founded", "is", null)
            .filter("founded", "gte", 2010)
            .filter("founded", "lte", 2019);
          break;
        case "2000-2009":
          query = query
            .not("founded", "is", null)
            .filter("founded", "gte", 2000)
            .filter("founded", "lte", 2009);
          break;
        case "1990-1999":
          query = query
            .not("founded", "is", null)
            .filter("founded", "gte", 1990)
            .filter("founded", "lte", 1999);
          break;
        case "1980-1989":
          query = query
            .not("founded", "is", null)
            .filter("founded", "gte", 1980)
            .filter("founded", "lte", 1989);
          break;
        case "pre-1980":
          query = query
            .not("founded", "is", null)
            .filter("founded", "lt", 1980);
          break;
      }
    }

    if (filters?.empAtHq && filters.empAtHq !== "all") {
      switch (filters.empAtHq) {
        case "1-10":
          query = query
            .not("num_of_employees_at_hq", "is", null)
            .filter("num_of_employees_at_hq", "gte", 1)
            .filter("num_of_employees_at_hq", "lte", 10);
          break;
        case "11-50":
          query = query
            .not("num_of_employees_at_hq", "is", null)
            .filter("num_of_employees_at_hq", "gte", 11)
            .filter("num_of_employees_at_hq", "lte", 50);
          break;
        case "51-100":
          query = query
            .not("num_of_employees_at_hq", "is", null)
            .filter("num_of_employees_at_hq", "gte", 51)
            .filter("num_of_employees_at_hq", "lte", 100);
          break;
        case "101-500":
          query = query
            .not("num_of_employees_at_hq", "is", null)
            .filter("num_of_employees_at_hq", "gte", 101)
            .filter("num_of_employees_at_hq", "lte", 500);
          break;
        case "500+":
          query = query
            .not("num_of_employees_at_hq", "is", null)
            .filter("num_of_employees_at_hq", "gte", 500);
          break;
      }
    }

    if (filters?.units2024 && filters.units2024 !== "all") {
      switch (filters.units2024) {
        case "1-50":
          query = query
            .not("units_as_of_2024", "is", null)
            .or(
              "units_as_of_2024.ilike.1 %,units_as_of_2024.ilike.2 %,units_as_of_2024.ilike.3 %,units_as_of_2024.ilike.4 %,units_as_of_2024.ilike.5 %,units_as_of_2024.ilike.10 %,units_as_of_2024.ilike.15 %,units_as_of_2024.ilike.20 %,units_as_of_2024.ilike.25 %,units_as_of_2024.ilike.30 %,units_as_of_2024.ilike.35 %,units_as_of_2024.ilike.40 %,units_as_of_2024.ilike.45 %,units_as_of_2024.ilike.50 %",
            );
          break;
        case "51-100":
          query = query
            .not("units_as_of_2024", "is", null)
            .or(
              "units_as_of_2024.ilike.51 %,units_as_of_2024.ilike.55 %,units_as_of_2024.ilike.60 %,units_as_of_2024.ilike.65 %,units_as_of_2024.ilike.70 %,units_as_of_2024.ilike.75 %,units_as_of_2024.ilike.80 %,units_as_of_2024.ilike.85 %,units_as_of_2024.ilike.90 %,units_as_of_2024.ilike.95 %,units_as_of_2024.ilike.100 %",
            );
          break;
        case "101-500":
          query = query
            .not("units_as_of_2024", "is", null)
            .or(
              "units_as_of_2024.ilike.10% %,units_as_of_2024.ilike.15% %,units_as_of_2024.ilike.20% %,units_as_of_2024.ilike.25% %,units_as_of_2024.ilike.30% %,units_as_of_2024.ilike.35% %,units_as_of_2024.ilike.40% %,units_as_of_2024.ilike.45% %,units_as_of_2024.ilike.49% %",
            );
          break;
        case "501-1000":
          query = query
            .not("units_as_of_2024", "is", null)
            .or(
              "units_as_of_2024.ilike.50% %,units_as_of_2024.ilike.60% %,units_as_of_2024.ilike.70% %,units_as_of_2024.ilike.80% %,units_as_of_2024.ilike.90% %,units_as_of_2024.ilike.999 %",
            );
          break;
        case "1000+":
          query = query
            .not("units_as_of_2024", "is", null)
            .ilike("units_as_of_2024", "%,% %");
          break;
      }
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting franchises:", error);
      return 0;
    }

    return count || 0;
  }

  async getCompanyStartupById(id: number): Promise<CompanyStartup | undefined> {
    const { data, error } = await supabase
      .from("companies_startups")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching startup company:", error);
      return undefined;
    }

    return data || undefined;
  }

  async getCompanyGrowthById(id: number): Promise<CompanyGrowth | undefined> {
    const { data, error } = await supabase
      .from("companies_growth")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching growth company:", error);
      return undefined;
    }

    return data || undefined;
  }

  async getCompanyFranchiseById(
    id: number,
  ): Promise<CompanyFranchise | undefined> {
    const { data, error } = await supabase
      .from("companies_franchises")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching franchise company:", error);
      return undefined;
    }

    return data || undefined;
  }

  async searchCompanies(query: string): Promise<CompanyStartup[]> {
    const { data, error } = await supabase
      .from("companies_startups")
      .select("*")
      .or(
        `name.ilike.%${query}%,short_description.ilike.%${query}%,tags.ilike.%${query}%`,
      )
      .limit(50);

    if (error) {
      console.error("Error searching companies:", error);
      return [];
    }

    return data || [];
  }

  async getAccelerators(
    limit = 50,
    offset = 0,
    filters?: { search?: string; country?: string; industry?: string },
  ): Promise<Accelerator[]> {
    let query = supabase.from("accelerators").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,industries.ilike.%${filters.search}%,founders.ilike.%${filters.search}%`,
      );
    }

    if (filters?.country) {
      query = query.eq("country", filters.country);
    }

    if (filters?.industry) {
      query = query.ilike("industries", `%${filters.industry}%`);
    }

    const { data, error } = await query
      .order("number_of_investments", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching accelerators:", error);
      return [];
    }

    // Map database fields to TypeScript interface
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      website: item.website,
      country: item.country,
      city: item.city,
      industries: item.industries,
      founders: item.founders,
      foundedDate: item.founded_date,
      numberOfInvestments: item.number_of_investments,
      numberOfExits: item.number_of_exits,
    }));
  }

  // VC Company methods implementation
  async getCompaniesVc(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      location?: string;
      industry?: string;
      investmentStage?: string;
      founded?: string;
      aum?: string;
      regionOfInvestment?: string;
      investmentTicket?: string;
    },
  ): Promise<CompanyVc[]> {
    let query = supabase.from("companies_vc").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,profile.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`,
      );
    }

    if (filters?.location && filters.location !== "all") {
      // Map location filter values to actual data patterns
      const locationMappings: { [key: string]: string } = {
        us: "United States",
        uk: "United Kingdom",
        ca: "Canada",
        de: "Germany",
        fr: "France",
        sg: "Singapore",
        jp: "Japan",
        cn: "China",
      };
      const locationValue =
        locationMappings[filters.location] || filters.location;
      query = query.ilike("location", `%${locationValue}%`);
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    if (filters?.investmentStage && filters.investmentStage !== "all") {
      // Map investment stage values to match database patterns
      const stageMappings: { [key: string]: string } = {
        "pre-seed": "Pre-Seed",
        seed: "Seed",
        "series-a": "Series A",
        "series-b": "Series B",
        "series-c": "Series C",
        growth: "Growth",
        "late-stage": "Late Stage",
        buyout: "Buyout",
      };
      const stageValue =
        stageMappings[filters.investmentStage] || filters.investmentStage;
      query = query.ilike("investment_stage", `%${stageValue}%`);
    }

    if (filters?.founded && filters.founded !== "all") {
      query = query.ilike("founded", `%${filters.founded}%`);
    }

    if (filters?.regionOfInvestment && filters.regionOfInvestment !== "all") {
      // Map region values to match database patterns
      const regionMappings: { [key: string]: string } = {
        "north-america": "North America",
        europe: "Europe",
        asia: "Asia",
        global: "Global",
        "latin-america": "Latin America",
        "middle-east": "Middle East",
        africa: "Africa",
      };
      const regionValue =
        regionMappings[filters.regionOfInvestment] ||
        filters.regionOfInvestment;
      query = query.ilike("region_of_investment", `%${regionValue}%`);
    }

    // Handle investment ticket size filtering based on exact database values
    if (filters?.investmentTicket && filters.investmentTicket !== "all") {
      // Direct match with database values like "$0-1 m", "$1-5 m", etc.
      query = query.ilike("investment_ticket", `%${filters.investmentTicket}%`);
    }

    // Handle AUM filtering with comprehensive range coverage
    if (filters?.aum && filters.aum !== "all") {
      // First exclude null, empty, and dash values
      query = query
        .not("aum", "is", null)
        .not("aum", "eq", "-")
        .not("aum", "eq", "");

      switch (filters.aum) {
        case "under-50m":
          // Under $50M: Match 1-49M
          query = query.or(
            "aum.ilike.%$1 M%,aum.ilike.%$2 M%,aum.ilike.%$5 M%,aum.ilike.%$10 M%,aum.ilike.%$12 M%,aum.ilike.%$15 M%,aum.ilike.%$20 M%,aum.ilike.%$25 M%,aum.ilike.%$30 M%,aum.ilike.%$35 M%,aum.ilike.%$40 M%,aum.ilike.%$42 M%,aum.ilike.%$45 M%,aum.ilike.%$48 M%,aum.ilike.%$49 M%",
          );
          break;
        case "50m-100m":
          // $50M-$100M: Match 50-100M
          query = query.or(
            "aum.ilike.%$50 M%,aum.ilike.%$52 M%,aum.ilike.%$55 M%,aum.ilike.%$60 M%,aum.ilike.%$65 M%,aum.ilike.%$70 M%,aum.ilike.%$75 M%,aum.ilike.%$80 M%,aum.ilike.%$85 M%,aum.ilike.%$90 M%,aum.ilike.%$95 M%,aum.ilike.%$100 M%",
          );
          break;
        case "100m-500m":
          // $100M-$500M: Match 100-499M (including new values found)
          query = query.or(
            "aum.ilike.%$100 M%,aum.ilike.%$125 M%,aum.ilike.%$155 M%,aum.ilike.%$200 M%,aum.ilike.%$275 M%,aum.ilike.%$300 M%,aum.ilike.%$343 M%,aum.ilike.%$390 M%,aum.ilike.%$454 M%,aum.ilike.%$499 M%",
          );
          break;
        case "500m-1b":
          // $500M-$1B: Match 500M-1000M (including new values found)
          query = query.or(
            "aum.ilike.%$500 M%,aum.ilike.%$600 M%,aum.ilike.%$700 M%,aum.ilike.%$800 M%,aum.ilike.%$900 M%,aum.ilike.%$935 M%,aum.ilike.%$1 000 M%",
          );
          break;
        case "over-1b":
          // Over $1B: Match values over 1000M (including all big values found)
          query = query.or(
            "aum.ilike.%$1 200 M%,aum.ilike.%$1 400 M%,aum.ilike.%$1 500 M%,aum.ilike.%$2 700 M%,aum.ilike.%$5 000 M%,aum.ilike.%$12 000 M%,aum.ilike.%$42 000 M%",
          );
          break;
      }
    }

    const { data, error } = await query
      .order("title", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching VC companies:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      founded: item.founded,
      aum: item.aum,
      location: item.location,
      investmentTicket: item.investment_ticket,
      investmentHorizon: item.investment_horizon,
      investmentStage: item.investment_stage,
      exitStrategy: item.exit_strategy,
      image: item.image,
      profile: item.profile,
      industry: item.industry,
      regionOfInvestment: item.region_of_investment,
      funds: item.funds,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getCompaniesVcCount(filters?: {
    search?: string;
    location?: string;
    industry?: string;
    investmentStage?: string;
    founded?: string;
    aum?: string;
    regionOfInvestment?: string;
    investmentTicket?: string;
  }): Promise<number> {
    let query = supabase
      .from("companies_vc")
      .select("*", { count: "exact", head: true });

    // Apply same filters as getCompaniesVc
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,profile.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`,
      );
    }

    if (filters?.location && filters.location !== "all") {
      // Map location filter values to actual data patterns
      const locationMappings: { [key: string]: string } = {
        us: "United States",
        uk: "United Kingdom",
        ca: "Canada",
        de: "Germany",
        fr: "France",
        sg: "Singapore",
        jp: "Japan",
        cn: "China",
      };
      const locationValue =
        locationMappings[filters.location] || filters.location;
      query = query.ilike("location", `%${locationValue}%`);
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    if (filters?.investmentStage && filters.investmentStage !== "all") {
      // Map investment stage values to match database patterns
      const stageMappings: { [key: string]: string } = {
        "pre-seed": "Pre-Seed",
        seed: "Seed",
        "series-a": "Series A",
        "series-b": "Series B",
        "series-c": "Series C",
        growth: "Growth",
        "late-stage": "Late Stage",
        buyout: "Buyout",
      };
      const stageValue =
        stageMappings[filters.investmentStage] || filters.investmentStage;
      query = query.ilike("investment_stage", `%${stageValue}%`);
    }

    if (filters?.founded && filters.founded !== "all") {
      query = query.ilike("founded", `%${filters.founded}%`);
    }

    if (filters?.regionOfInvestment && filters.regionOfInvestment !== "all") {
      // Map region values to match database patterns
      const regionMappings: { [key: string]: string } = {
        "north-america": "North America",
        europe: "Europe",
        asia: "Asia",
        global: "Global",
        "latin-america": "Latin America",
        "middle-east": "Middle East",
        africa: "Africa",
      };
      const regionValue =
        regionMappings[filters.regionOfInvestment] ||
        filters.regionOfInvestment;
      query = query.ilike("region_of_investment", `%${regionValue}%`);
    }

    // Handle investment ticket size filtering based on exact database values
    if (filters?.investmentTicket && filters.investmentTicket !== "all") {
      // Direct match with database values like "$0-1 m", "$1-5 m", etc.
      query = query.ilike("investment_ticket", `%${filters.investmentTicket}%`);
    }

    // Handle AUM filtering with comprehensive range coverage
    if (filters?.aum && filters.aum !== "all") {
      // First exclude null, empty, and dash values
      query = query
        .not("aum", "is", null)
        .not("aum", "eq", "-")
        .not("aum", "eq", "");

      switch (filters.aum) {
        case "under-50m":
          // Under $50M: Match 1-49M
          query = query.or(
            "aum.ilike.%$1 M%,aum.ilike.%$2 M%,aum.ilike.%$5 M%,aum.ilike.%$10 M%,aum.ilike.%$12 M%,aum.ilike.%$15 M%,aum.ilike.%$20 M%,aum.ilike.%$25 M%,aum.ilike.%$30 M%,aum.ilike.%$35 M%,aum.ilike.%$40 M%,aum.ilike.%$42 M%,aum.ilike.%$45 M%,aum.ilike.%$48 M%,aum.ilike.%$49 M%",
          );
          break;
        case "50m-100m":
          // $50M-$100M: Match 50-100M
          query = query.or(
            "aum.ilike.%$50 M%,aum.ilike.%$52 M%,aum.ilike.%$55 M%,aum.ilike.%$60 M%,aum.ilike.%$65 M%,aum.ilike.%$70 M%,aum.ilike.%$75 M%,aum.ilike.%$80 M%,aum.ilike.%$85 M%,aum.ilike.%$90 M%,aum.ilike.%$95 M%,aum.ilike.%$100 M%",
          );
          break;
        case "100m-500m":
          // $100M-$500M: Match 100-499M (including new values found)
          query = query.or(
            "aum.ilike.%$100 M%,aum.ilike.%$125 M%,aum.ilike.%$155 M%,aum.ilike.%$200 M%,aum.ilike.%$275 M%,aum.ilike.%$300 M%,aum.ilike.%$343 M%,aum.ilike.%$390 M%,aum.ilike.%$454 M%,aum.ilike.%$499 M%",
          );
          break;
        case "500m-1b":
          // $500M-$1B: Match 500M-1000M (including new values found)
          query = query.or(
            "aum.ilike.%$500 M%,aum.ilike.%$600 M%,aum.ilike.%$700 M%,aum.ilike.%$800 M%,aum.ilike.%$900 M%,aum.ilike.%$935 M%,aum.ilike.%$1 000 M%",
          );
          break;
        case "over-1b":
          // Over $1B: Match values over 1000M (including all big values found)
          query = query.or(
            "aum.ilike.%$1 200 M%,aum.ilike.%$1 400 M%,aum.ilike.%$1 500 M%,aum.ilike.%$2 700 M%,aum.ilike.%$5 000 M%,aum.ilike.%$12 000 M%,aum.ilike.%$42 000 M%",
          );
          break;
      }
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error fetching VC companies count:", error);
      return 0;
    }

    return count || 0;
  }

  async getCompanyVcById(id: number): Promise<CompanyVc | undefined> {
    const { data, error } = await supabase
      .from("companies_vc")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching VC company:", error);
      return undefined;
    }

    if (!data) return undefined;

    return {
      id: data.id,
      url: data.url,
      title: data.title,
      founded: data.founded,
      aum: data.aum,
      location: data.location,
      investmentTicket: data.investment_ticket,
      investmentHorizon: data.investment_horizon,
      investmentStage: data.investment_stage,
      exitStrategy: data.exit_strategy,
      image: data.image,
      profile: data.profile,
      industry: data.industry,
      regionOfInvestment: data.region_of_investment,
      funds: data.funds,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getAcceleratorsCount(): Promise<number> {
    const { count, error } = await supabase
      .from("accelerators")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching accelerators count:", error);
      return 0;
    }

    return count || 0;
  }

  async getGrants(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      status?: string;
      programme?: string;
      fundedUnder?: string;
    },
  ): Promise<Grant[]> {
    // Ensure reasonable limits to prevent timeouts
    const safeLimit = Math.min(limit, 100);
    const safeOffset = Math.max(offset, 0);

    let query = supabase
      .from("grants")
      .select(
        "id, title, acronym, project_id, status, start_date, end_date, overall_budget, eu_contribution, coordinated_by, funded_under, objective, programme, topic, type_of_action",
      );

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,acronym.ilike.%${filters.search}%,coordinated_by.ilike.%${filters.search}%`,
      );
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.programme && filters.programme !== "all") {
      query = query.ilike("programme", `%${filters.programme}%`);
    }

    if (filters?.fundedUnder && filters.fundedUnder !== "all") {
      query = query.ilike("funded_under", `%${filters.fundedUnder}%`);
    }

    const { data, error } = await query
      .order("overall_budget", { ascending: false, nullsLast: true })
      .range(safeOffset, safeOffset + safeLimit - 1);

    if (error) {
      console.error("Error fetching grants:", error);
      console.error("Query details:", { safeLimit, safeOffset, filters });
      throw new Error(`Database query failed: ${error.message}`);
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      acronym: item.acronym,
      projectId: item.project_id,
      status: item.status,
      startDate: item.start_date,
      endDate: item.end_date,
      overallBudget: item.overall_budget,
      euContribution: item.eu_contribution,
      coordinatedBy: item.coordinated_by,
      fundedUnder: item.funded_under,
      objective: item.objective,
      programme: item.programme,
      topic: item.topic,
      typeOfAction: item.type_of_action,
    }));
  }

  async getGrantsCount(filters?: {
    search?: string;
    status?: string;
    programme?: string;
    fundedUnder?: string;
  }): Promise<number> {
    let query = supabase
      .from("grants")
      .select("*", { count: "exact", head: true });

    // Apply same filters as getGrants
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,acronym.ilike.%${filters.search}%,coordinated_by.ilike.%${filters.search}%`,
      );
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.programme && filters.programme !== "all") {
      query = query.ilike("programme", `%${filters.programme}%`);
    }

    if (filters?.fundedUnder && filters.fundedUnder !== "all") {
      query = query.ilike("funded_under", `%${filters.fundedUnder}%`);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error fetching grants count:", error);
      return 0;
    }

    return count || 0;
  }

  async getGrantsProgrammes(): Promise<string[]> {
    const { data, error } = await supabase
      .from("grants")
      .select("programme")
      .not("programme", "is", null)
      .not("programme", "eq", "");

    if (error) {
      console.error("Error fetching grant programmes:", error);
      return [];
    }

    // Get distinct programmes and sort them
    const programmes = Array.from(new Set(data.map((item: any) => item.programme)))
      .filter(Boolean)
      .sort();

    return programmes as string[];
  }

  async getGrantsFundedUnder(): Promise<string[]> {
    const { data, error } = await supabase
      .from("grants")
      .select("funded_under")
      .not("funded_under", "is", null)
      .not("funded_under", "eq", "");

    if (error) {
      console.error("Error fetching grant funded under:", error);
      return [];
    }

    // Get distinct funded_under values and sort them
    const fundedUnder = Array.from(new Set(data.map((item: any) => item.funded_under)))
      .filter(Boolean)
      .sort();

    return fundedUnder as string[];
  }

  async getGrantsStatuses(): Promise<string[]> {
    const { data, error } = await supabase
      .from("grants")
      .select("status")
      .not("status", "is", null)
      .not("status", "eq", "");

    if (error) {
      console.error("Error fetching grant statuses:", error);
      return [];
    }

    // Get distinct status values and sort them
    const statuses = Array.from(new Set(data.map((item: any) => item.status)))
      .filter(Boolean)
      .sort();

    return statuses as string[];
  }

  async getEvents(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      eventType?: string;
      location?: string;
      month?: string;
    },
  ): Promise<Event[]> {
    let query = supabase.from("events").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `event_name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`,
      );
    }

    if (filters?.eventType) {
      query = query.eq("event_type", filters.eventType);
    }

    if (filters?.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters?.month) {
      // Filter by month using date extraction
      query = query
        .gte("start_date", `2024-${filters.month}-01`)
        .lt(
          "start_date",
          `2024-${String(parseInt(filters.month) + 1).padStart(2, "0")}-01`,
        );
    }

    const { data, error } = await query
      .order("start_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    // Map database fields to expected frontend format
    return (data || []).map((event: any) => ({
      id: event.id,
      eventName: event.event_name,
      location: event.location,
      startDate: event.start_date,
      endDate: event.end_date,
      eventType: event.event_type,
      link: event.link,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }));
  }

  async getEventsEuropeanStartup(
    limit = 50,
    offset = 0,
    filters?: { search?: string; location?: string; month?: string },
  ): Promise<EventEuropeanStartup[]> {
    let query = supabase.from("events_european_startup").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `event_name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`,
      );
    }

    if (filters?.location && filters.location !== "all") {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters?.month && filters.month !== "all") {
      query = query.eq("month", filters.month);
    }

    const { data, error } = await query
      .order("date_text", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching European startup events:", error);
      return [];
    }

    // Map database fields to expected frontend format
    return (data || []).map((event: any) => ({
      id: event.id,
      dateText: event.date_text,
      eventName: event.event_name,
      month: event.month,
      location: event.location,
      websiteUrl: event.website_url,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }));
  }

  async getEventsCount(): Promise<number> {
    const { count, error } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching events count:", error);
      return 0;
    }

    return count || 0;
  }

  async getEventsEuropeanStartupCount(): Promise<number> {
    const { count, error } = await supabase
      .from("events_european_startup")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching European startup events count:", error);
      return 0;
    }

    return count || 0;
  }

  async getUniqueEventTypes(): Promise<string[]> {
    const { data, error } = await supabase
      .from("events")
      .select("event_type")
      .not("event_type", "is", null)
      .not("event_type", "eq", "");

    if (error) {
      console.error("Error fetching unique event types:", error);
      return [];
    }

    // Get distinct event_type values and sort them
    const types = Array.from(new Set(data.map((item: any) => item.event_type)))
      .filter(Boolean)
      .sort();

    return types as string[];
  }

  async getUniqueEuropeanEventTypes(): Promise<string[]> {
    // For European events, we can provide common event types since they don't have a specific type field
    // Or we could extract types from event names if there's a pattern
    return [
      "Startup Event",
      "Pitch Competition",
      "Networking Event",
      "Demo Day",
      "Accelerator Program",
      "Conference",
      "Workshop",
      "Meetup",
    ];
  }

  async getUniqueEventLocations(): Promise<string[]> {
    const { data, error } = await supabase
      .from("events")
      .select("location")
      .not("location", "is", null)
      .not("location", "eq", "");

    if (error) {
      console.error("Error fetching unique event locations:", error);
      return [];
    }

    // Get distinct location values and sort them
    const locations = Array.from(new Set(data.map((item: any) => item.location)))
      .filter(Boolean)
      .sort();

    return locations as string[];
  }

  async getUniqueEuropeanEventLocations(): Promise<string[]> {
    const { data, error } = await supabase
      .from("events_european_startup")
      .select("location")
      .not("location", "is", null)
      .not("location", "eq", "");

    if (error) {
      console.error("Error fetching unique European event locations:", error);
      return [];
    }

    // Get distinct location values and sort them
    const locations = Array.from(new Set(data.map((item: any) => item.location)))
      .filter(Boolean)
      .sort();

    return locations as string[];
  }

  async getRankingsTopCities(
    limit = 50,
    offset = 0,
    filters?: { search?: string; country?: string },
  ): Promise<RankingTopCity[]> {
    let query = supabase.from("rankings_top_cities").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `city.ilike.%${filters.search}%,country.ilike.%${filters.search}%`,
      );
    }

    if (filters?.country) {
      query = query.eq("country", filters.country);
    }

    const { data, error } = await query
      .order("rank", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching top cities rankings:", error);
      return [];
    }

    // Map database fields to expected frontend format
    return (data || []).map((city: any) => ({
      id: city.id,
      rank: city.rank,
      city: city.city,
      country: city.country,
      rankChange: city.rank_change,
      totalScore: city.total_score,
      createdAt: city.created_at,
      updatedAt: city.updated_at,
    }));
  }

  async getRankingsTopCountries(
    limit = 50,
    offset = 0,
    filters?: { search?: string },
  ): Promise<RankingTopCountry[]> {
    let query = supabase.from("rankings_top_countries").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.ilike("country", `%${filters.search}%`);
    }

    const { data, error } = await query
      .order("rank", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching top countries rankings:", error);
      return [];
    }

    // Map database fields to expected frontend format
    return (data || []).map((country: any) => ({
      id: country.id,
      rank: country.rank,
      country: country.country,
      rankChange: country.rank_change,
      totalScore: country.total_score,
      createdAt: country.created_at,
      updatedAt: country.updated_at,
    }));
  }

  async getRankingsUniversities(
    limit = 50,
    offset = 0,
    filters?: { search?: string; country?: string; year?: string },
  ): Promise<RankingUniversity[]> {
    let query = supabase.from("rankings_universities").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,country.ilike.%${filters.search}%`,
      );
    }

    if (filters?.country) {
      query = query.eq("country", filters.country);
    }

    if (filters?.year) {
      query = query.eq("year", parseInt(filters.year));
    }

    const { data, error } = await query
      .order("rank", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching universities rankings:", error);
      return [];
    }

    // Map database fields to expected frontend format
    return (data || []).map((university: any) => ({
      id: university.id,
      rank: university.rank,
      name: university.name,
      country: university.country,
      studentPopulation: university.student_population,
      studentsToStaffRatio: university.students_to_staff_ratio,
      internationalStudents: university.international_students,
      femaleToMaleRatio: university.female_to_male_ratio,
      overallScore: university.overall_score,
      teachingScore: university.teaching_score,
      researchEnvironmentScore: university.research_environment_score,
      researchQualityScore: university.research_quality_score,
      industryImpactScore: university.industry_impact_score,
      internationalOutlookScore: university.international_outlook_score,
      year: university.year,
      createdAt: university.created_at,
      updatedAt: university.updated_at,
    }));
  }

  async getRankingsTopCitiesCount(): Promise<number> {
    const { count, error } = await supabase
      .from("rankings_top_cities")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching top cities count:", error);
      return 0;
    }

    return count || 0;
  }

  async getRankingsTopCountriesCount(): Promise<number> {
    const { count, error } = await supabase
      .from("rankings_top_countries")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching top countries count:", error);
      return 0;
    }

    return count || 0;
  }

  async getRankingsUniversitiesCount(): Promise<number> {
    const { count, error } = await supabase
      .from("rankings_universities")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching universities count:", error);
      return 0;
    }

    return count || 0;
  }

  async getSanctionsExtended(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      entityType?: string;
      country?: string;
      programs?: string;
    },
  ): Promise<SanctionListExtended[]> {
    let query = supabase.from("sanction_list_extended").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,region_or_address.ilike.%${filters.search}%`,
      );
    }

    if (filters?.entityType) {
      query = query.eq("entity_type", filters.entityType);
    }

    if (filters?.country) {
      query = query.eq("country", filters.country);
    }

    if (filters?.programs) {
      query = query.ilike("programs", `%${filters.programs}%`);
    }

    const { data, error } = await query
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching extended sanctions:", error);
      return [];
    }

    // Map database fields to expected frontend format
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      regionOrAddress: item.region_or_address,
      entityType: item.entity_type,
      programs: item.programs,
      listType: item.list_type,
      country: item.country,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getSanctionsIndividuals(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      entityType?: string;
      country?: string;
      nationality?: string;
      programs?: string;
    },
  ): Promise<SanctionListIndividual[]> {
    let query = supabase.from("sanction_list_individual").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,individual_alias.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%`,
      );
    }

    // For individuals endpoint, entityType filter works differently
    if (filters?.entityType && filters.entityType !== "all") {
      // Map frontend filter values to database patterns
      if (filters.entityType === "Individual") {
        // Since this is the individuals endpoint, all records are individuals
        // We can skip filtering or use a pattern that matches individual-related designations
        // No additional filtering needed as all records in this table are individuals
      } else if (filters.entityType === "Entity") {
        // Look for entity-related keywords in designation
        query = query.or(
          "designation.ilike.%company%,designation.ilike.%corporation%,designation.ilike.%organization%,designation.ilike.%entity%,designation.ilike.%firm%,designation.ilike.%enterprise%",
        );
      } else if (filters.entityType === "Vessel") {
        query = query.ilike("designation", "%vessel%");
      } else if (filters.entityType === "Aircraft") {
        query = query.ilike("designation", "%aircraft%");
      } else {
        // For any other filter value, use exact match
        query = query.ilike("designation", `%${filters.entityType}%`);
      }
    }

    if (filters?.country && filters.country !== "all") {
      query = query.or(
        `individual_address.ilike.%${filters.country}%,nationality.ilike.%${filters.country}%`,
      );
    }

    if (filters?.nationality && filters.nationality !== "all") {
      query = query.ilike("nationality", `%${filters.nationality}%`);
    }

    if (filters?.programs && filters.programs !== "all") {
      // Handle special case for Ukraine Related
      const programFilter =
        filters.programs === "Ukraine Related" ? "UKRAINE" : filters.programs;
      query = query.ilike("comments", `%${programFilter}%`);
    }

    const { data, error } = await query
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching individual sanctions:", error);
      return [];
    }

    // Map database fields to expected frontend format
    return (data || []).map((item: any) => ({
      id: item.id,
      individualId: item.individual_id,
      referenceNumber: item.reference_number,
      fullName: item.full_name,
      listedOn: item.listed_on,
      comments: item.comments,
      title: item.title,
      designation: item.designation,
      individualDateOfBirth: item.individual_date_of_birth,
      individualPlaceOfBirth: item.individual_place_of_birth,
      individualAlias: item.individual_alias,
      nationality: item.nationality,
      individualDocument: item.individual_document,
      individualAddress: item.individual_address,
      applicationStatus: item.application_status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getSanctionsExtendedCount(): Promise<number> {
    const { count, error } = await supabase
      .from("sanction_list_extended")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching extended sanctions count:", error);
      return 0;
    }

    return count || 0;
  }

  async getSanctionsIndividualsCount(): Promise<number> {
    const { count, error } = await supabase
      .from("sanction_list_individual")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching individual sanctions count:", error);
      return 0;
    }

    return count || 0;
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error fetching upcoming events:", error);
      return [];
    }

    // Map database fields to expected frontend format
    return (data || []).map((event: any) => ({
      id: event.id,
      eventName: event.event_name,
      location: event.location,
      startDate: event.start_date,
      endDate: event.end_date,
      eventType: event.event_type,
      link: event.link,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }));
  }

  async getFundingRoundsExits(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      industry?: string;
      exitType?: string;
      minValue?: string;
      exitValue?: string;
      year?: string;
    },
  ): Promise<FundingRoundExit[]> {
    let query = supabase.from("funding_rounds_exits").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.ilike("company", `%${filters.search}%`);
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    if (filters?.exitType && filters.exitType !== "all") {
      query = query.eq("exit_type", filters.exitType);
    }

    if (filters?.minValue && filters.minValue !== "all") {
      const minVal = parseFloat(filters.minValue);
      if (!isNaN(minVal)) {
        // minValue is for total funding (in millions)
        query = query.gte("total_funding_millions", minVal);
      }
    }

    if (filters?.exitValue && filters.exitValue !== "all") {
      const exitVal = parseFloat(filters.exitValue);
      if (!isNaN(exitVal)) {
        // exitValue is for exit value (in billions)
        query = query.gte("exit_value_billions", exitVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query
          .gte("deal_closed_date", `${year}-01-01`)
          .lt("deal_closed_date", `${year + 1}-01-01`);
      }
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order("deal_closed_date", { ascending: false });

    if (error) {
      console.error("Error fetching funding rounds exits:", error);
      return [];
    }

    // Map database fields to expected frontend format
    return (data || []).map((item: any) => ({
      id: item.id,
      company: item.company,
      exitValueBillions: item.exit_value_billions,
      exitType: item.exit_type,
      totalFundingMillions: item.total_funding_millions,
      industry: item.industry,
      dealClosedDate: item.deal_closed_date,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getFundingRoundsExitsCount(filters?: {
    search?: string;
    industry?: string;
    exitType?: string;
    minValue?: string;
    exitValue?: string;
    year?: string;
  }): Promise<number> {
    let query = supabase
      .from("funding_rounds_exits")
      .select("*", { count: "exact", head: true });

    // Apply same filters as main query
    if (filters?.search) {
      query = query.ilike("company", `%${filters.search}%`);
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    if (filters?.exitType && filters.exitType !== "all") {
      query = query.eq("exit_type", filters.exitType);
    }

    if (filters?.minValue && filters.minValue !== "all") {
      const minVal = parseFloat(filters.minValue);
      if (!isNaN(minVal)) {
        // minValue is for total funding (in millions)
        query = query.gte("total_funding_millions", minVal);
      }
    }

    if (filters?.exitValue && filters.exitValue !== "all") {
      const exitVal = parseFloat(filters.exitValue);
      if (!isNaN(exitVal)) {
        // exitValue is for exit value (in billions)
        query = query.gte("exit_value_billions", exitVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query
          .gte("deal_closed_date", `${year}-01-01`)
          .lt("deal_closed_date", `${year + 1}-01-01`);
      }
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting funding rounds exits:", error);
      return 0;
    }

    return count || 0;
  }

  async getRecentFunding(): Promise<FundingRoundExit[]> {
    const { data, error } = await supabase
      .from("funding_rounds_exits")
      .select("*")
      .order("deal_closed_date", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching recent funding:", error);
      return [];
    }

    // Map database fields to expected frontend format
    return (data || []).map((item: any) => ({
      id: item.id,
      company: item.company,
      exitValueBillions: item.exit_value_billions,
      exitType: item.exit_type,
      totalFundingMillions: item.total_funding_millions,
      industry: item.industry,
      dealClosedDate: item.deal_closed_date,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getFundingRoundsMaDeals(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      acquirer?: string;
      minValue?: string;
      year?: string;
    },
  ): Promise<FundingRoundMaDeal[]> {
    let query = supabase.from("funding_rounds_ma_deals").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `acquiring_company.ilike.%${filters.search}%,acquired_company.ilike.%${filters.search}%`,
      );
    }

    if (filters?.acquirer && filters.acquirer !== "all") {
      query = query.ilike("acquiring_company", `%${filters.acquirer}%`);
    }

    if (filters?.minValue && filters.minValue !== "all") {
      const minVal = parseFloat(filters.minValue);
      if (!isNaN(minVal)) {
        query = query.gte("deal_size_billions", minVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query
          .gte("announced_date", `${year}-01-01`)
          .lt("announced_date", `${year + 1}-01-01`);
      }
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order("announced_date", { ascending: false });

    if (error) {
      console.error("Error fetching M&A deals:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      announcedDate: item.announced_date,
      acquiringCompany: item.acquiring_company,
      acquiredCompany: item.acquired_company,
      dealSizeBillions: item.deal_size_billions,
      dealSizeOriginal: item.deal_size_original,
      acquiringCompanyLogo: item.acquiring_company_logo || null,
      acquiredCompanyLogo: item.acquired_company_logo || null,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getFundingRoundsMaDealsCount(filters?: {
    search?: string;
    acquirer?: string;
    minValue?: string;
    year?: string;
  }): Promise<number> {
    let query = supabase
      .from("funding_rounds_ma_deals")
      .select("*", { count: "exact", head: true });

    // Apply same filters as main query
    if (filters?.search) {
      query = query.or(
        `acquiring_company.ilike.%${filters.search}%,acquired_company.ilike.%${filters.search}%`,
      );
    }

    if (filters?.acquirer && filters.acquirer !== "all") {
      query = query.ilike("acquiring_company", `%${filters.acquirer}%`);
    }

    if (filters?.minValue && filters.minValue !== "all") {
      const minVal = parseFloat(filters.minValue);
      if (!isNaN(minVal)) {
        query = query.gte("deal_size_billions", minVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query
          .gte("announced_date", `${year}-01-01`)
          .lt("announced_date", `${year + 1}-01-01`);
      }
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting M&A deals:", error);
      return 0;
    }

    return count || 0;
  }

  async getFundingRoundsMegadeals(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      acquirer?: string;
      acquirerCountry?: string;
      acquiredEntity?: string;
      acquiredCountry?: string;
      minValue?: string;
      year?: string;
      rank?: string;
      transactionType?: string;
    },
  ): Promise<FundingRoundMegadeal[]> {
    let query = supabase.from("funding_rounds_megadeals").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `acquirer_entity.ilike.%${filters.search}%,acquired_entity.ilike.%${filters.search}%`,
      );
    }

    if (filters?.acquirer && filters.acquirer !== "all") {
      query = query.ilike("acquirer_entity", `%${filters.acquirer}%`);
    }

    // New acquirer country filter
    if (filters?.acquirerCountry && filters.acquirerCountry !== "all") {
      query = query.ilike("acquirer_country", `%${filters.acquirerCountry}%`);
    }

    // New acquired entity filter
    if (filters?.acquiredEntity && filters.acquiredEntity !== "all") {
      query = query.ilike("acquired_entity", `%${filters.acquiredEntity}%`);
    }

    // New acquired country filter
    if (filters?.acquiredCountry && filters.acquiredCountry !== "all") {
      query = query.ilike("acquired_country", `%${filters.acquiredCountry}%`);
    }

    if (filters?.minValue && filters.minValue !== "all") {
      const minVal = parseFloat(filters.minValue) * 1000; // Convert billions to millions (database unit)
      if (!isNaN(minVal)) {
        query = query.gte("value_usd", minVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query.eq("year", year);
      }
    }

    // New rank filter
    if (filters?.rank && filters.rank !== "all") {
      if (filters.rank === "1-10") {
        query = query.gte("rank", 1).lte("rank", 10);
      } else if (filters.rank === "11-25") {
        query = query.gte("rank", 11).lte("rank", 25);
      } else if (filters.rank === "26-50") {
        query = query.gte("rank", 26).lte("rank", 50);
      } else if (filters.rank === "51-100") {
        query = query.gte("rank", 51).lte("rank", 100);
      }
    }

    if (filters?.transactionType && filters.transactionType !== "all") {
      // Use ilike for partial matching since transaction types contain complex descriptions
      query = query.ilike("transaction_type", `%${filters.transactionType}%`);
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order("value_usd", { ascending: false });

    if (error) {
      console.error("Error fetching megadeals:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      rank: item.rank,
      valueUsd: item.value_usd,
      acquiredCountry: item.acquired_country,
      acquiredEntity: item.acquired_entity,
      acquirerCountry: item.acquirer_country,
      acquirerEntity: item.acquirer_entity,
      year: item.year,
      transactionType: item.transaction_type,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getFundingRoundsMegadealsCount(filters?: {
    search?: string;
    acquirer?: string;
    acquirerCountry?: string;
    acquiredEntity?: string;
    acquiredCountry?: string;
    minValue?: string;
    year?: string;
    rank?: string;
    transactionType?: string;
  }): Promise<number> {
    let query = supabase
      .from("funding_rounds_megadeals")
      .select("*", { count: "exact", head: true });

    // Apply same filters as main query
    if (filters?.search) {
      query = query.or(
        `acquirer_entity.ilike.%${filters.search}%,acquired_entity.ilike.%${filters.search}%`,
      );
    }

    if (filters?.acquirer && filters.acquirer !== "all") {
      query = query.ilike("acquirer_entity", `%${filters.acquirer}%`);
    }

    // New acquirer country filter
    if (filters?.acquirerCountry && filters.acquirerCountry !== "all") {
      query = query.ilike("acquirer_country", `%${filters.acquirerCountry}%`);
    }

    // New acquired entity filter
    if (filters?.acquiredEntity && filters.acquiredEntity !== "all") {
      query = query.ilike("acquired_entity", `%${filters.acquiredEntity}%`);
    }

    // New acquired country filter
    if (filters?.acquiredCountry && filters.acquiredCountry !== "all") {
      query = query.ilike("acquired_country", `%${filters.acquiredCountry}%`);
    }

    if (filters?.minValue && filters.minValue !== "all") {
      const minVal = parseFloat(filters.minValue) * 1000; // Convert billions to millions (database unit)
      if (!isNaN(minVal)) {
        query = query.gte("value_usd", minVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query.eq("year", year);
      }
    }

    // New rank filter
    if (filters?.rank && filters.rank !== "all") {
      if (filters.rank === "1-10") {
        query = query.gte("rank", 1).lte("rank", 10);
      } else if (filters.rank === "11-25") {
        query = query.gte("rank", 11).lte("rank", 25);
      } else if (filters.rank === "26-50") {
        query = query.gte("rank", 26).lte("rank", 50);
      } else if (filters.rank === "51-100") {
        query = query.gte("rank", 51).lte("rank", 100);
      }
    }

    if (filters?.transactionType && filters.transactionType !== "all") {
      // Use ilike for partial matching since transaction types contain complex descriptions
      query = query.ilike("transaction_type", `%${filters.transactionType}%`);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting megadeals:", error);
      return 0;
    }

    return count || 0;
  }

  async getFundingRoundsUsSfd23(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      industry?: string;
      minAmount?: string;
      valuation?: string;
      year?: string;
      leadInvestor?: string;
    },
  ): Promise<FundingRoundUsSfd23[]> {
    let query = supabase.from("funding_rounds_us_sfd_23").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `company.ilike.%${filters.search}%,lead_investors.ilike.%${filters.search}%`,
      );
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    if (filters?.minAmount && filters.minAmount !== "all") {
      const minVal = parseFloat(filters.minAmount) * 1000000; // Convert millions to actual value
      if (!isNaN(minVal)) {
        query = query.gte("amount", minVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query.gte("date_reported", `${year}-01-01`);
        query = query.lt("date_reported", `${year + 1}-01-01`);
      }
    }

    if (filters?.valuation && filters.valuation !== "all") {
      const minVal = parseFloat(filters.valuation) * 1000000; // Convert millions to actual value
      if (!isNaN(minVal)) {
        query = query.gte("valuation", minVal);
      }
    }

    if (filters?.leadInvestor && filters.leadInvestor !== "all") {
      query = query.ilike("lead_investors", `%${filters.leadInvestor}%`);
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order("amount", { ascending: false });

    if (error) {
      console.error("Error fetching US funding rounds 2023:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      company: item.company,
      amount: item.amount,
      leadInvestors: item.lead_investors,
      valuation: item.valuation,
      industry: item.industry,
      dateReported: item.date_reported,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getFundingRoundsUsSfd23Count(filters?: {
    search?: string;
    industry?: string;
    minAmount?: string;
    valuation?: string;
    year?: string;
    leadInvestor?: string;
  }): Promise<number> {
    let query = supabase
      .from("funding_rounds_us_sfd_23")
      .select("*", { count: "exact", head: true });

    // Apply same filters as main query
    if (filters?.search) {
      query = query.or(
        `company.ilike.%${filters.search}%,lead_investors.ilike.%${filters.search}%`,
      );
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    if (filters?.minAmount && filters.minAmount !== "all") {
      const minVal = parseFloat(filters.minAmount) * 1000000;
      if (!isNaN(minVal)) {
        query = query.gte("amount", minVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query.gte("date_reported", `${year}-01-01`);
        query = query.lt("date_reported", `${year + 1}-01-01`);
      }
    }

    if (filters?.valuation && filters.valuation !== "all") {
      const minVal = parseFloat(filters.valuation) * 1000000;
      if (!isNaN(minVal)) {
        query = query.gte("valuation", minVal);
      }
    }

    if (filters?.leadInvestor && filters.leadInvestor !== "all") {
      query = query.ilike("lead_investors", `%${filters.leadInvestor}%`);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting US funding rounds 2023:", error);
      return 0;
    }

    return count || 0;
  }

  async getFundingRoundsUsSfd24(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      industry?: string;
      minAmount?: string;
      year?: string;
      leadInvestor?: string;
    },
  ): Promise<FundingRoundUsSfd24[]> {
    let query = supabase.from("funding_rounds_us_sfd_24").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `company.ilike.%${filters.search}%,lead_investors.ilike.%${filters.search}%`,
      );
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    if (filters?.minAmount && filters.minAmount !== "all") {
      const minVal = parseFloat(filters.minAmount) * 1000000; // Convert millions to actual value
      if (!isNaN(minVal)) {
        query = query.gte("amount", minVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query.gte("date_reported", `${year}-01-01`);
        query = query.lt("date_reported", `${year + 1}-01-01`);
      }
    }

    if (filters?.leadInvestor && filters.leadInvestor !== "all") {
      query = query.ilike("lead_investors", `%${filters.leadInvestor}%`);
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order("amount", { ascending: false });

    if (error) {
      console.error("Error fetching US funding rounds 2024:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      company: item.company,
      amount: item.amount,
      leadInvestors: item.lead_investors,
      valuation: item.valuation,
      industry: item.industry,
      dateReported: item.date_reported,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getFundingRoundsUsSfd24Count(filters?: {
    search?: string;
    industry?: string;
    minAmount?: string;
    year?: string;
    leadInvestor?: string;
  }): Promise<number> {
    let query = supabase
      .from("funding_rounds_us_sfd_24")
      .select("*", { count: "exact", head: true });

    // Apply same filters as main query
    if (filters?.search) {
      query = query.or(
        `company.ilike.%${filters.search}%,lead_investors.ilike.%${filters.search}%`,
      );
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("industry", `%${filters.industry}%`);
    }

    if (filters?.minAmount && filters.minAmount !== "all") {
      const minVal = parseFloat(filters.minAmount) * 1000000;
      if (!isNaN(minVal)) {
        query = query.gte("amount", minVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query.gte("date_reported", `${year}-01-01`);
        query = query.lt("date_reported", `${year + 1}-01-01`);
      }
    }

    if (filters?.leadInvestor && filters.leadInvestor !== "all") {
      query = query.ilike("lead_investors", `%${filters.leadInvestor}%`);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting US funding rounds 2024:", error);
      return 0;
    }

    return count || 0;
  }

  async getLiveFunding(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      roundType?: string;
      country?: string;
      mainCategory?: string;
      currency?: string;
      teamSize?: string;
      industry?: string;
      minAmount?: string;
      year?: string;
      getAllForAnalytics?: boolean;
    },
  ): Promise<LiveFunding[]> {
    let query = supabase.from("live_funding").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `company_name.ilike.%${filters.search}%,round_type.ilike.%${filters.search}%`,
      );
    }

    if (filters?.roundType && filters.roundType !== "all") {
      query = query.eq("round_type", filters.roundType);
    }

    if (filters?.country && filters.country !== "all") {
      // Country info is stored in companyInfo.hq_country JSON field
      query = query.contains("company_info", { hq_country: filters.country });
    }

    if (filters?.mainCategory && filters.mainCategory !== "all") {
      query = query.eq("main_category", filters.mainCategory);
    }

    if (filters?.currency && filters.currency !== "all") {
      query = query.eq("currency", filters.currency);
    }

    if (filters?.teamSize && filters.teamSize !== "all") {
      // Team size info is stored in companyInfo.size JSON field
      query = query.contains("company_info", { size: filters.teamSize });
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("main_category", `%${filters.industry}%`);
    }

    if (filters?.minAmount && filters.minAmount !== "all") {
      const minVal = parseFloat(filters.minAmount);
      if (!isNaN(minVal)) {
        // Convert to proper format based on funding_amount field
        query = query.gte("funding_amount", minVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query
          .gte("date_seen", `${year}-01-01`)
          .lte("date_seen", `${year}-12-31`);
      }
    }

    // If getting all data for analytics, use a very large limit to get all records
    const { data, error } = filters?.getAllForAnalytics
      ? await query.order("date_seen", { ascending: false }).limit(100000)
      : await query
          .order("date_seen", { ascending: false })
          .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching live funding:", error);
      return [];
    }

    // Map database fields to expected frontend format
    return (data || []).map((item: any) => ({
      id: item.id,
      createdAt: item.created_at,
      companyName: item.company_name,
      roundType: item.round_type,
      fundingAmount: item.funding_amount,
      currency: item.currency,
      ceo: item.ceo,
      companyInfo: item.company_info,
      mainCategory: item.main_category,
      dateSeen: item.date_seen,
      country: item.company_info?.hq_country || item.country,
      size: item.company_info?.size || item.size,
    }));
  }

  async getLiveFundingAnalytics(filters?: {
    search?: string;
    roundType?: string;
    country?: string;
    mainCategory?: string;
    currency?: string;
    teamSize?: string;
    industry?: string;
    minAmount?: string;
    year?: string;
  }): Promise<{
    roundTypes: { name: string; value: number }[];
    industries: { name: string; value: number }[];
    companySizes: { name: string; value: number }[];
    countries: { name: string; value: number }[];
  }> {
    let query = supabase.from("live_funding").select("*");

    // Apply same filters as regular query
    if (filters?.search) {
      query = query.or(
        `company_name.ilike.%${filters.search}%,round_type.ilike.%${filters.search}%`,
      );
    }

    if (filters?.roundType && filters.roundType !== "all") {
      query = query.eq("round_type", filters.roundType);
    }

    if (filters?.country && filters.country !== "all") {
      query = query.contains("company_info", { hq_country: filters.country });
    }

    if (filters?.mainCategory && filters.mainCategory !== "all") {
      query = query.eq("main_category", filters.mainCategory);
    }

    if (filters?.currency && filters.currency !== "all") {
      query = query.eq("currency", filters.currency);
    }

    if (filters?.teamSize && filters.teamSize !== "all") {
      query = query.contains("company_info", { size: filters.teamSize });
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("main_category", `%${filters.industry}%`);
    }

    if (filters?.minAmount && filters.minAmount !== "all") {
      const minVal = parseFloat(filters.minAmount);
      if (!isNaN(minVal)) {
        query = query.gte("funding_amount", minVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query.gte("date_seen", `${year}-01-01`);
        query = query.lt("date_seen", `${year + 1}-01-01`);
      }
    }

    // Get ALL records for analytics (no limit)
    const { data, error } = await query.order("date_seen", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching live funding analytics:", error);
      return {
        roundTypes: [],
        industries: [],
        companySizes: [],
        countries: [],
      };
    }

    const allData = data || [];

    // Aggregate round types
    const roundTypeMap = new Map<string, number>();
    allData.forEach((item: any) => {
      const key = item.round_type || "Other";
      roundTypeMap.set(key, (roundTypeMap.get(key) || 0) + 1);
    });
    const roundTypes = Array.from(roundTypeMap, ([name, value]) => ({
      name,
      value,
    }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 8);

    // Aggregate industries
    const industryMap = new Map<string, number>();
    allData.forEach((item: any) => {
      const key = item.main_category || "Other";
      industryMap.set(key, (industryMap.get(key) || 0) + 1);
    });
    const industries = Array.from(industryMap, ([name, value]) => ({
      name,
      value,
    }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 50); // Increased from 8 to 50 to show all major industries and sub-industries

    // Aggregate company sizes
    const sizeMap = new Map<string, number>();
    allData.forEach((item: any) => {
      const key = item.company_info?.size || "Other";
      sizeMap.set(key, (sizeMap.get(key) || 0) + 1);
    });
    const companySizes = Array.from(sizeMap, ([name, value]) => ({
      name,
      value,
    }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10);

    // Aggregate countries
    const countryMap = new Map<string, number>();
    allData.forEach((item: any) => {
      const key = item.company_info?.hq_country || item.country || "Other";
      countryMap.set(key, (countryMap.get(key) || 0) + 1);
    });
    const countries = Array.from(countryMap, ([name, value]) => ({
      name,
      value,
    }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 100); // Increased from 10 to 100 to show all available countries

    return {
      roundTypes,
      industries,
      companySizes,
      countries,
    };
  }

  async getLiveFundingCount(filters?: {
    search?: string;
    roundType?: string;
    country?: string;
    mainCategory?: string;
    currency?: string;
    teamSize?: string;
    industry?: string;
    minAmount?: string;
    year?: string;
  }): Promise<number> {
    let query = supabase
      .from("live_funding")
      .select("*", { count: "exact", head: true });

    // Apply filters - identical to getLiveFunding
    if (filters?.search) {
      query = query.or(
        `company_name.ilike.%${filters.search}%,round_type.ilike.%${filters.search}%`,
      );
    }

    if (filters?.roundType && filters.roundType !== "all") {
      query = query.eq("round_type", filters.roundType);
    }

    if (filters?.country && filters.country !== "all") {
      // Country info is stored in companyInfo.hq_country JSON field
      query = query.contains("company_info", { hq_country: filters.country });
    }

    if (filters?.mainCategory && filters.mainCategory !== "all") {
      query = query.eq("main_category", filters.mainCategory);
    }

    if (filters?.currency && filters.currency !== "all") {
      query = query.eq("currency", filters.currency);
    }

    if (filters?.teamSize && filters.teamSize !== "all") {
      // Team size info is stored in companyInfo.size JSON field
      query = query.contains("company_info", { size: filters.teamSize });
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("main_category", `%${filters.industry}%`);
    }

    if (filters?.minAmount && filters.minAmount !== "all") {
      const minVal = parseFloat(filters.minAmount);
      if (!isNaN(minVal)) {
        query = query.gte("funding_amount", minVal);
      }
    }

    if (filters?.year && filters.year !== "all") {
      const year = parseInt(filters.year);
      if (!isNaN(year)) {
        query = query
          .gte("date_seen", `${year}-01-01`)
          .lte("date_seen", `${year}-12-31`);
      }
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting live funding:", error);
      return 0;
    }

    return count || 0;
  }

  async getUnicorns(
    limit = 20,
    offset = 0,
    filters?: {
      search?: string;
      country?: string;
      continent?: string;
      minValuation?: string;
      tier?: string;
      funding?: string;
      leadInvestor?: string;
    },
  ): Promise<Unicorn[]> {
    let query = supabase.from("unicorns").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.ilike("company", `%${filters.search}%`);
    }

    if (filters?.country && filters.country !== "all") {
      query = query.eq("country", filters.country);
    }

    if (filters?.continent && filters.continent !== "all") {
      query = query.eq("continent", filters.continent);
    }

    // For valuation/tier/funding filters, use in-memory filtering
    let needsInMemoryFiltering =
      (filters?.minValuation && filters.minValuation !== "all") ||
      (filters?.tier && filters.tier !== "all") ||
      (filters?.funding && filters.funding !== "all");

    let allData = null;
    if (needsInMemoryFiltering) {
      const { data } = await supabase.from("unicorns").select("*").limit(50000); // Fetch all records
      allData = data || [];

      // Apply valuation filter
      if (filters?.minValuation && filters.minValuation !== "all") {
        const minVal = parseFloat(filters.minValuation);
        if (!isNaN(minVal)) {
          allData = allData.filter((unicorn: any) => {
            if (!unicorn.post_money_value) return false;
            const numVal = parseFloat(
              unicorn.post_money_value.replace(/[^0-9.-]/g, ""),
            );
            return !isNaN(numVal) && numVal >= minVal;
          });
        }
      }

      // Apply tier filter
      if (filters?.tier && filters.tier !== "all") {
        allData = allData.filter((unicorn: any) => {
          if (!unicorn.post_money_value) return false;
          const numVal = parseFloat(
            unicorn.post_money_value.replace(/[^0-9.-]/g, ""),
          );
          if (isNaN(numVal)) return false;

          if (filters.tier === "Unicorn") {
            return numVal >= 1 && numVal < 10;
          } else if (filters.tier === "Decacorn") {
            return numVal >= 10 && numVal < 100;
          } else if (filters.tier === "Hectocorn") {
            return numVal >= 100;
          }
          return false;
        });
      }

      // Apply funding filter
      if (filters?.funding && filters.funding !== "all") {
        const minFunding = parseFloat(filters.funding);
        if (!isNaN(minFunding)) {
          allData = allData.filter((unicorn: any) => {
            if (!unicorn.total_equity_funding) return false;

            const fundingStr = unicorn.total_equity_funding;
            const numMatch = fundingStr.match(/([0-9.]+)/);
            if (!numMatch) return false;

            const fundingNum = parseFloat(numMatch[1]);
            if (isNaN(fundingNum)) return false;

            let fundingInMillions;
            if (fundingStr.includes("B")) {
              fundingInMillions = fundingNum * 1000;
            } else if (fundingStr.includes("M")) {
              fundingInMillions = fundingNum;
            } else {
              fundingInMillions = fundingNum;
            }

            return fundingInMillions >= minFunding;
          });
        }
      }
    }

    // If we have allData from valuation/tier filtering, apply remaining filters in memory
    let finalData;
    if (allData) {
      finalData = allData;

      // Apply remaining filters to allData
      if (filters?.search) {
        finalData = finalData.filter((unicorn: any) =>
          unicorn.company
            ?.toLowerCase()
            .includes(filters.search!.toLowerCase()),
        );
      }

      if (filters?.country && filters.country !== "all") {
        finalData = finalData.filter(
          (unicorn: any) => unicorn.country === filters.country,
        );
      }

      if (filters?.continent && filters.continent !== "all") {
        finalData = finalData.filter(
          (unicorn: any) => unicorn.continent === filters.continent,
        );
      }

      // Funding filter already applied above in consolidated section

      if (filters?.leadInvestor && filters.leadInvestor !== "all") {
        finalData = finalData.filter((unicorn: any) =>
          unicorn.lead_investors
            ?.toLowerCase()
            .includes(filters.leadInvestor!.toLowerCase()),
        );
      }

      // Sort by valuation (descending)
      finalData.sort((a: any, b: any) => {
        const aVal = parseFloat(
          (a.post_money_value || "0").replace(/[^0-9.-]/g, ""),
        );
        const bVal = parseFloat(
          (b.post_money_value || "0").replace(/[^0-9.-]/g, ""),
        );
        return bVal - aVal;
      });

      // Apply pagination
      finalData = finalData.slice(offset, offset + limit);
    } else {
      // Use database query for non-valuation/funding filters
      if (filters?.leadInvestor && filters.leadInvestor !== "all") {
        query = query.ilike("lead_investors", `%${filters.leadInvestor}%`);
      }

      // For large limits (chart data), fetch all data in chunks to bypass 1000-row limit
      let data, error;
      if (limit >= 1000) {
        // Fetch all data in chunks to get complete dataset
        const allData = [];
        let currentOffset = 0;
        const chunkSize = 1000;

        while (true) {
          const { data: chunk, error: chunkError } = await query
            .range(currentOffset, currentOffset + chunkSize - 1)
            .order("post_money_value", { ascending: false });

          if (chunkError) {
            error = chunkError;
            break;
          }

          if (!chunk || chunk.length === 0) {
            break; // No more data
          }

          allData.push(...chunk);

          if (chunk.length < chunkSize) {
            break; // Last chunk
          }

          currentOffset += chunkSize;
        }

        console.log(
          "Fetched all data for charts in chunks, total records:",
          allData.length,
        );
        data = allData;

        // Apply offset and limit manually
        if (data && offset > 0) {
          data = data.slice(offset);
        }
        if (data && limit < data.length) {
          data = data.slice(0, limit);
        }
      } else {
        ({ data, error } = await query
          .range(offset, offset + limit - 1)
          .order("post_money_value", { ascending: false }));
      }

      if (error) {
        console.error("Error fetching unicorns:", error);
        return [];
      }

      finalData = data || [];
    }

    // Map database fields to expected frontend format
    return finalData.map((unicorn: any) => ({
      id: unicorn.id,
      company: unicorn.company,
      postMoneyValue: unicorn.post_money_value,
      totalEquityFunding: unicorn.total_equity_funding,
      leadInvestors: unicorn.lead_investors,
      country: unicorn.country,
      continent: unicorn.continent,
      type: unicorn.type,
      createdAt: unicorn.created_at,
      updatedAt: unicorn.updated_at,
    }));
  }

  async getUnicornsCount(filters?: {
    search?: string;
    country?: string;
    continent?: string;
    minValuation?: string;
    tier?: string;
    funding?: string;
    leadInvestor?: string;
  }): Promise<number> {
    let query = supabase
      .from("unicorns")
      .select("*", { count: "exact", head: true });

    // Apply filters
    if (filters?.search) {
      query = query.ilike("company", `%${filters.search}%`);
    }

    if (filters?.country && filters.country !== "all") {
      query = query.eq("country", filters.country);
    }

    if (filters?.continent && filters.continent !== "all") {
      query = query.eq("continent", filters.continent);
    }

    // For valuation/tier/funding filters, use in-memory filtering
    let needsInMemoryFiltering =
      (filters?.minValuation && filters.minValuation !== "all") ||
      (filters?.tier && filters.tier !== "all") ||
      (filters?.funding && filters.funding !== "all");

    if (needsInMemoryFiltering) {
      const { data } = await supabase.from("unicorns").select("*").limit(50000); // Fetch all records
      let allData = data || [];

      // Apply valuation filter
      if (filters?.minValuation && filters.minValuation !== "all") {
        const minVal = parseFloat(filters.minValuation);
        if (!isNaN(minVal)) {
          allData = allData.filter((unicorn: any) => {
            if (!unicorn.post_money_value) return false;
            const numVal = parseFloat(
              unicorn.post_money_value.replace(/[^0-9.-]/g, ""),
            );
            return !isNaN(numVal) && numVal >= minVal;
          });
        }
      }

      // Apply tier filter
      if (filters?.tier && filters.tier !== "all") {
        allData = allData.filter((unicorn: any) => {
          if (!unicorn.post_money_value) return false;
          const numVal = parseFloat(
            unicorn.post_money_value.replace(/[^0-9.-]/g, ""),
          );
          if (isNaN(numVal)) return false;

          if (filters.tier === "Unicorn") {
            return numVal >= 1 && numVal < 10;
          } else if (filters.tier === "Decacorn") {
            return numVal >= 10 && numVal < 100;
          } else if (filters.tier === "Hectocorn") {
            return numVal >= 100;
          }
          return false;
        });
      }

      // Apply remaining filters in memory
      if (filters?.search) {
        allData = allData.filter((unicorn: any) =>
          unicorn.company
            ?.toLowerCase()
            .includes(filters.search!.toLowerCase()),
        );
      }

      if (filters?.country && filters.country !== "all") {
        allData = allData.filter(
          (unicorn: any) => unicorn.country === filters.country,
        );
      }

      if (filters?.continent && filters.continent !== "all") {
        allData = allData.filter(
          (unicorn: any) => unicorn.continent === filters.continent,
        );
      }

      // Funding filter already applied above in consolidated section

      if (filters?.leadInvestor && filters.leadInvestor !== "all") {
        allData = allData.filter((unicorn: any) =>
          unicorn.lead_investors
            ?.toLowerCase()
            .includes(filters.leadInvestor!.toLowerCase()),
        );
      }

      return allData.length;
    } else {
      // Use database query for non-valuation/funding filters
      if (filters?.leadInvestor && filters.leadInvestor !== "all") {
        query = query.ilike("lead_investors", `%${filters.leadInvestor}%`);
      }

      const { count, error } = await query;

      if (error) {
        console.error("Error counting unicorns:", error);
        return 0;
      }

      return count || 0;
    }
  }

  async getInvestors(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      type?: string;
      location?: string;
      investmentRange?: string;
      sweetSpot?: string;
    },
  ): Promise<Investor[]> {
    let query = supabase.from("investors").select("*");

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,profile.ilike.%${filters.search}%,current_position.ilike.%${filters.search}%`,
      );
    }

    if (filters?.type && filters.type !== "all") {
      query = query.eq("profile", filters.type);
    }

    if (filters?.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters?.investmentRange && filters.investmentRange !== "all") {
      const [minRange, maxRange] = filters.investmentRange
        .split("-")
        .map(Number);

      if (maxRange) {
        // For range filters: investment_min must match the range START exactly, investment_max must be within range
        // For "$1-5M" filter: investment_min = 1 AND investment_max <= 5
        // For "$5-10M" filter: investment_min = 5 AND investment_max <= 10
        query = query
          .eq("investment_min", minRange)
          .gte("investment_max", minRange)
          .lte("investment_max", maxRange);

        // Only keep investors with reasonable values (in millions format, not dollars)
        query = query.lte("investment_min", 100);
      } else {
        // For single values like "100M+": investment_min >= minRange (investors who START at $100M+)
        // Only include values in millions format (< 1000) to exclude dollar values
        query = query
          .gte("investment_min", minRange)
          .lt("investment_min", 1000);
      }
    }

    if (filters?.sweetSpot && filters.sweetSpot !== "all") {
      const [minSpot, maxSpot] = filters.sweetSpot.split("-").map(Number);
      if (maxSpot) {
        query = query
          .gte("sweet_spot", minSpot * 1000000)
          .lte("sweet_spot", maxSpot * 1000000);
      } else {
        query = query.gte("sweet_spot", minSpot * 1000000);
      }
    }

    const { data, error } = await query
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching investors:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      url: item.url,
      name: item.name,
      type: item.type,
      profile: item.profile,
      location: item.location,
      phoneNumber: item.phone_number,
      connections: item.connections,
      imagePath: item.image_path,
      currentPosition: item.current_position,
      investmentMin: item.investment_min,
      investmentMax: item.investment_max,
      sweetSpot: item.sweet_spot,
      currentFundSize: item.current_fund_size,
      ranking: item.ranking,
      experiences: item.experiences,
      education: item.education,
      investments: item.investments,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getInvestorsCount(filters?: {
    search?: string;
    type?: string;
    location?: string;
    investmentRange?: string;
    sweetSpot?: string;
  }): Promise<number> {
    let query = supabase
      .from("investors")
      .select("*", { count: "exact", head: true });

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,profile.ilike.%${filters.search}%,current_position.ilike.%${filters.search}%`,
      );
    }

    if (filters?.type && filters.type !== "all") {
      query = query.eq("profile", filters.type);
    }

    if (filters?.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters?.investmentRange && filters.investmentRange !== "all") {
      const [minRange, maxRange] = filters.investmentRange
        .split("-")
        .map(Number);

      if (maxRange) {
        // For range filters: investment_min must match the range START exactly, investment_max must be within range
        // For "$1-5M" filter: investment_min = 1 AND investment_max <= 5
        // For "$5-10M" filter: investment_min = 5 AND investment_max <= 10
        query = query
          .eq("investment_min", minRange)
          .gte("investment_max", minRange)
          .lte("investment_max", maxRange);

        // Only keep investors with reasonable values (in millions format, not dollars)
        query = query.lte("investment_min", 100);
      } else {
        // For single values like "100M+": investment_min >= minRange (investors who START at $100M+)
        // Only include values in millions format (< 1000) to exclude dollar values
        query = query
          .gte("investment_min", minRange)
          .lt("investment_min", 1000);
      }
    }

    if (filters?.sweetSpot && filters.sweetSpot !== "all") {
      const [minSpot, maxSpot] = filters.sweetSpot.split("-").map(Number);
      if (maxSpot) {
        query = query
          .gte("sweet_spot", minSpot * 1000000)
          .lte("sweet_spot", maxSpot * 1000000);
      } else {
        query = query.gte("sweet_spot", minSpot * 1000000);
      }
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting investors:", error);
      return 0;
    }

    return count || 0;
  }

  async getInvestorContacts(
    limit = 50,
    offset = 0,
    filters?: { search?: string; type?: string; location?: string },
  ): Promise<InvestorContact[]> {
    console.log("Fetching investor contacts with service role key:", {
      filters,
      limit,
      offset,
    });

    let query = supabaseAdmin.from("investor_contacts").select("*");

    // Filter out corrupted Russian entries by default
    if (!filters?.search) {
      query = query
        .not("company_name", "like", "%?%")
        .not("company_name", "is", null)
        .neq("company_name", "???")
        .neq("company_name", "?? ????");
    }

    if (filters?.search) {
      query = query.or(
        `company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,key_people.ilike.%${filters.search}%`,
      );
    }

    if (filters?.type) {
      query = query.eq("investor_type", filters.type);
    }

    if (filters?.location) {
      // Fix location filtering by using individual ilike condition on location field only
      // Avoid .or() method which has comma parsing issues in PostgREST
      query = query.ilike("location", `%${filters.location}%`);
    }

    query = query
      .order("company_name", { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    console.log("Investor contacts query result:", {
      dataLength: data?.length,
      error,
      sampleData: data?.slice(0, 2),
    });

    if (error) {
      console.error("Error fetching investor contacts:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      companyName: item.company_name,
      employeesPeopleDatabase: item.employees_people_database,
      numberOfInvestments: item.number_of_investments,
      numberOfExits: item.number_of_exits,
      location: item.location,
      investorType: item.investor_type,
      description: item.description,
      companyUrl: item.company_url,
      domain: item.domain,
      facebook: item.facebook,
      instagram: item.instagram,
      linkedin: item.linkedin,
      twitter: item.twitter,
      contactEmail: item.contact_email,
      contactEmailVerified: item["contact_email_verified?"],
      secondEmailVerified: item["2nd_email_100%_verified"],
      phoneNumber: item.phone_number,
      industries: item.industries,
      program: item.program,
      keyPeople: item.key_people,
      country: item.country,
      // Additional fields to match investors table
      connections: item.connections,
      imagePath: item.image_path,
      currentPosition: item.current_position,
      investmentMin: item.investment_min,
      investmentMax: item.investment_max,
      sweetSpot: item.sweet_spot,
      currentFundSize: item.current_fund_size,
      ranking: item.ranking,
      experiences: item.experiences,
      education: item.education,
      investments: item.investments,
      _1: item._1,
      _2: item._2,
      _3: item._3,
      _4: item._4,
      _5: item._5,
      _6: item._6,
      _7: item._7,
    }));
  }

  async getInvestorContactsCount(filters?: {
    search?: string;
    type?: string;
    location?: string;
  }): Promise<number> {
    let query = supabaseAdmin
      .from("investor_contacts")
      .select("*", { count: "exact", head: true });

    // Filter out corrupted Russian entries by default
    if (!filters?.search) {
      query = query
        .not("company_name", "like", "%?%")
        .not("company_name", "is", null)
        .neq("company_name", "???")
        .neq("company_name", "?? ????");
    }

    if (filters?.search) {
      query = query.or(
        `company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,key_people.ilike.%${filters.search}%`,
      );
    }

    if (filters?.type) {
      query = query.eq("investor_type", filters.type);
    }

    if (filters?.location) {
      // Fix location filtering by using individual ilike condition on location field only
      // Avoid .or() method which has comma parsing issues in PostgREST
      query = query.ilike("location", `%${filters.location}%`);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting investor contacts:", error);
      return 0;
    }

    return count || 0;
  }

  async getInvestorById(id: number): Promise<Investor | undefined> {
    const { data, error } = await supabase
      .from("investors")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      url: data.url,
      name: data.name,
      type: data.type,
      profile: data.profile,
      location: data.location,
      phoneNumber: data.phone_number,
      connections: data.connections,
      imagePath: data.image_path,
      currentPosition: data.current_position,
      investmentMin: data.investment_min,
      investmentMax: data.investment_max,
      sweetSpot: data.sweet_spot,
      currentFundSize: data.current_fund_size,
      ranking: data.ranking,
      experiences: data.experiences,
      education: data.education,
      investments: data.investments,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getInvestorContactById(
    id: string,
  ): Promise<InvestorContact | undefined> {
    const { data, error } = await supabaseAdmin
      .from("investor_contacts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      companyName: data.company_name,
      employeesPeopleDatabase: data.employees_people_database,
      numberOfInvestments: data.number_of_investments,
      numberOfExits: data.number_of_exits,
      location: data.location,
      investorType: data.investor_type,
      description: data.description,
      companyUrl: data.company_url,
      domain: data.domain,
      facebook: data.facebook,
      instagram: data.instagram,
      linkedin: data.linkedin,
      twitter: data.twitter,
      contactEmail: data.contact_email,
      contactEmailVerified: data["contact_email_verified?"],
      secondEmailVerified: data["2nd_email_100%_verified"],
      phoneNumber: data.phone_number,
      industries: data.industries,
      program: data.program,
      keyPeople: data.key_people,
      country: data.country,
      // Additional fields to match investors table
      connections: data.connections,
      imagePath: data.image_path,
      currentPosition: data.current_position,
      investmentMin: data.investment_min,
      investmentMax: data.investment_max,
      sweetSpot: data.sweet_spot,
      currentFundSize: data.current_fund_size,
      ranking: data.ranking,
      experiences: data.experiences,
      education: data.education,
      investments: data.investments,
      _1: data._1,
      _2: data._2,
      _3: data._3,
      _4: data._4,
      _5: data._5,
      _6: data._6,
      _7: data._7,
    };
  }

  async getInvestorStats(): Promise<{
    totalInvestors: number;
    totalContacts: number;
    vcFunds: number;
    angelInvestors: number;
  }> {
    try {
      console.log("Fetching investor stats with service role...");

      // Get all counts from investor_contacts table
      const [contactsResult, vcResult, angelResult] = await Promise.all([
        supabaseAdmin
          .from("investor_contacts")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("investor_contacts")
          .select("id", { count: "exact", head: true })
          .ilike("investor_type", "%Venture Capital%"),
        supabaseAdmin
          .from("investor_contacts")
          .select("id", { count: "exact", head: true })
          .ilike("investor_type", "%Angel%"),
      ]);

      console.log("Investor stats results:", {
        contacts: { count: contactsResult.count, error: contactsResult.error },
        vc: { count: vcResult.count, error: vcResult.error },
        angel: { count: angelResult.count, error: angelResult.error },
      });

      return {
        totalInvestors: contactsResult.count || 0,
        totalContacts: contactsResult.count || 0,
        vcFunds: vcResult.count || 0,
        angelInvestors: angelResult.count || 0,
      };
    } catch (error) {
      console.error("Error fetching investor stats:", error);
      return {
        totalInvestors: 0,
        totalContacts: 0,
        vcFunds: 0,
        angelInvestors: 0,
      };
    }
  }

  async getDashboardMetrics(): Promise<{
    totalCompanies: number;
    activeRounds: number;
    totalFunding: string;
    newUnicorns: number;
  }> {
    try {
      // Get company counts
      const [startupsResult, growthResult, fundingResult] = await Promise.all([
        supabase
          .from("companies_startups")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("companies_growth")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("funding_rounds_exits")
          .select("total_funding_millions", { count: "exact" }),
      ]);

      const totalCompanies =
        (startupsResult.count || 0) + (growthResult.count || 0);
      const activeRounds = fundingResult.count || 0;

      // Calculate total funding
      const fundingData = fundingResult.data || [];
      const totalFundingAmount = fundingData.reduce((sum: number, item: any) => {
        return sum + (Number(item.total_funding_millions) || 0);
      }, 0);
      const totalFunding = `$${(totalFundingAmount / 1000).toFixed(1)}B`;

      // Count unicorns from growth companies
      const { data: growthCompanies } = await supabase
        .from("companies_growth")
        .select("current_valuation, valuation");

      const newUnicorns = (growthCompanies || []).filter((company: any) => {
        const valuation = company.current_valuation || company.valuation;
        if (!valuation) return false;
        const match = valuation.match(/\$?(\d+(?:\.\d+)?)\s*([BMK])?/i);
        if (!match) return false;
        const value = parseFloat(match[1]);
        const unit = match[2]?.toUpperCase();
        return unit === "B" && value >= 1;
      }).length;

      return {
        totalCompanies,
        activeRounds,
        totalFunding,
        newUnicorns,
      };
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      return {
        totalCompanies: 0,
        activeRounds: 0,
        totalFunding: "$0B",
        newUnicorns: 0,
      };
    }
  }

  async getFundingAnalytics(): Promise<{
    totalFundingVolume: string;
    avgDealSize: string;
    totalExits: number;
    totalMegadeals: number;
    thisMonthFunding: string;
    topIndustries: Array<{ industry: string; count: number; volume: string }>;
    monthlyTrends: Array<{ month: string; volume: number; deals: number }>;
    recentMajorDeals: Array<{
      id: number;
      company: string;
      amount: string;
      type: string;
      date: string;
      industry?: string;
      leadInvestors?: string;
    }>;
  }> {
    try {
      // Get comprehensive funding data from all tables
      const [exitsData, sfd23Data, sfd24Data, megadealsData] =
        await Promise.all([
          supabase.from("funding_rounds_exits").select("*"),
          supabase.from("funding_rounds_us_sfd_23").select("*"),
          supabase.from("funding_rounds_us_sfd_24").select("*"),
          supabase.from("funding_rounds_megadeals").select("*"),
        ]);

      // Calculate total funding volume
      let totalVolume = 0;
      let totalDeals = 0;

      // From exits (in millions)
      if (exitsData.data) {
        exitsData.data.forEach((exit: any) => {
          if (exit.total_funding_millions) {
            totalVolume += Number(exit.total_funding_millions);
            totalDeals++;
          }
        });
      }

      // From 2023 funding rounds
      if (sfd23Data.data) {
        sfd23Data.data.forEach((round: any) => {
          if (round.amount) {
            totalVolume += Number(round.amount) / 1000000; // Convert to millions
            totalDeals++;
          }
        });
      }

      // From 2024 funding rounds
      if (sfd24Data.data) {
        sfd24Data.data.forEach((round: any) => {
          if (round.amount) {
            totalVolume += Number(round.amount) / 1000000; // Convert to millions
            totalDeals++;
          }
        });
      }

      const avgDealSize = totalDeals > 0 ? totalVolume / totalDeals : 0;

      // Calculate this month's funding using recent 2024 data
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const thisMonthVolume = sfd24Data.data
        ? sfd24Data.data
            .filter((round: any) => {
              if (!round.date_reported) return false;
              const reportDate = new Date(round.date_reported);
              return reportDate.getMonth() + 1 === currentMonth;
            })
            .reduce(
              (sum: number, round: any) => sum + (Number(round.amount) / 1000000 || 0),
              0,
            )
        : 0;

      // Get top industries from 2024 funding rounds
      const industryMap = new Map<string, { count: number; volume: number }>();
      if (sfd24Data.data) {
        sfd24Data.data.forEach((round: any) => {
          if (round.industry) {
            const existing = industryMap.get(round.industry) || {
              count: 0,
              volume: 0,
            };
            industryMap.set(round.industry, {
              count: existing.count + 1,
              volume: existing.volume + (Number(round.amount) / 1000000 || 0),
            });
          }
        });
      }

      const topIndustries = Array.from(industryMap.entries())
        .map(([industry, data]: [string, any]) => ({
          industry,
          count: data.count,
          volume:
            data.volume >= 1000
              ? `$${(data.volume / 1000).toFixed(1)}B`
              : `$${data.volume.toFixed(0)}M`,
        }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

      // Get recent major deals
      const recentMajorDeals: Array<{
        id: number;
        company: string;
        amount: string;
        type: string;
        date: string;
        industry?: string;
        leadInvestors?: string;
      }> = [];

      // Add major exits
      if (exitsData.data) {
        exitsData.data
          .filter((exit: any) => Number(exit.exit_value_billions || 0) >= 1)
          .sort(
            (a: any, b: any) =>
              new Date(b.deal_closed_date || "").getTime() -
              new Date(a.deal_closed_date || "").getTime(),
          )
          .slice(0, 3)
          .forEach((exit: any) => {
            recentMajorDeals.push({
              id: exit.id,
              company: exit.company || "Unknown",
              amount: `$${exit.exit_value_billions}B`,
              type: exit.exit_type || "Exit",
              date: exit.deal_closed_date || "",
              industry: exit.industry,
            });
          });
      }

      // Add major funding rounds from 2024
      if (sfd24Data.data) {
        sfd24Data.data
          .filter((round: any) => Number(round.amount || 0) >= 100000000) // $100M+
          .sort(
            (a: any, b: any) =>
              new Date(b.date_reported || "").getTime() -
              new Date(a.date_reported || "").getTime(),
          )
          .slice(0, 4)
          .forEach((round: any) => {
            recentMajorDeals.push({
              id: round.id,
              company: round.company || "Unknown",
              amount: `$${(Number(round.amount) / 1000000).toFixed(0)}M`,
              type: "Funding Round",
              date: round.date_reported || "",
              industry: round.industry,
              leadInvestors: round.lead_investors,
            });
          });
      }

      // Generate monthly trends using real data
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString("en-US", { month: "short" });
        const month = date.getMonth() + 1;

        const monthData =
          sfd24Data.data?.filter((round: any) => {
            if (!round.date_reported) return false;
            const reportDate = new Date(round.date_reported);
            return reportDate.getMonth() + 1 === month;
          }) || [];

        const monthVolume = monthData.reduce(
          (sum: number, round: any) => sum + (Number(round.amount) / 1000000 || 0),
          0,
        );

        monthlyTrends.push({
          month: monthName,
          volume: monthVolume / 1000, // Convert to billions for chart
          deals: monthData.length,
        });
      }

      return {
        totalFundingVolume: `$${(totalVolume / 1000).toFixed(1)}B`,
        avgDealSize: `$${avgDealSize.toFixed(1)}M`,
        totalExits: exitsData.data?.length || 0,
        totalMegadeals: megadealsData.data?.length || 0,
        thisMonthFunding:
          thisMonthVolume >= 1000
            ? `$${(thisMonthVolume / 1000).toFixed(1)}B`
            : `$${thisMonthVolume.toFixed(0)}M`,
        topIndustries,
        monthlyTrends,
        recentMajorDeals: recentMajorDeals.slice(0, 6),
      };
    } catch (error) {
      console.error("Error fetching funding analytics:", error);
      return {
        totalFundingVolume: "$0",
        avgDealSize: "$0",
        totalExits: 0,
        totalMegadeals: 0,
        thisMonthFunding: "$0",
        topIndustries: [],
        monthlyTrends: [],
        recentMajorDeals: [],
      };
    }
  }

  // Analytics methods for complete datasets (no pagination)
  async getStartupsAnalytics(): Promise<{
    countryDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
    stateDistribution: Array<{ name: string; value: number }>;
  }> {
    try {
      console.log("⚡ Using optimized database functions for maximum speed...");

      // Use database RPC functions for ultra-fast aggregation
      const [countryResult, stateResult, industryResult] = await Promise.all([
        // Country distribution using database function
        supabase.rpc('get_startup_countries'),
        
        // State distribution using database function  
        supabase.rpc('get_startup_states'),
        
        // Industry distribution using database function
        supabase.rpc('get_startup_industries')
      ]);

      if (countryResult.error || stateResult.error || industryResult.error) {
        console.error("Database function errors:", { 
          countryError: countryResult.error, 
          stateError: stateResult.error, 
          industryError: industryResult.error 
        });
        // Fallback to simple aggregation
        return this.getStartupsAnalyticsSimple();
      }

      console.log(`✅ Database functions complete - Countries: ${countryResult.data?.length || 0}, States: ${stateResult.data?.length || 0}, Industries: ${industryResult.data?.length || 0}`);

      return {
        countryDistribution: (countryResult.data || []).map((item: any) => ({
          name: item.name || item.country || "Unknown",
          value: item.value || item.count || 0
        })),
        stateDistribution: (stateResult.data || []).map((item: any) => ({
          name: item.name || item.state || "Unknown",
          value: item.value || item.count || 0
        })),
        industryDistribution: (industryResult.data || []).map((item: any) => ({
          name: item.name || item.industry || "Unknown",
          value: item.value || item.count || 0
        })),
      };
    } catch (error) {
      console.error("Error fetching startup analytics:", error);
      return this.getStartupsAnalyticsSimple();
    }
  }

  // Simple aggregation fallback (faster than batch processing)
  private async getStartupsAnalyticsSimple(): Promise<{
    countryDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
    stateDistribution: Array<{ name: string; value: number }>;
  }> {
    try {
      console.log("🔄 Using simple database aggregation...");
      
      // Use simple database aggregation (much faster than batch processing)
      const [countryResult, stateResult] = await Promise.all([
        supabase
          .from("companies_startups")
          .select("country, count(*)")
          .not("country", "is", null)
          .group("country")
          .order("count", { ascending: false }),
        
        supabase
          .from("companies_startups")
          .select("state, count(*)")
          .not("state", "is", null)
          .group("state")
          .order("count", { ascending: false })
      ]);

      return {
        countryDistribution: (countryResult.data || []).map((item: any) => ({
          name: item.country || "Unknown",
          value: item.count || 0
        })),
        stateDistribution: (stateResult.data || []).map((item: any) => ({
          name: item.state || "Unknown",
          value: item.count || 0
        })),
        industryDistribution: [] // Skip industry for speed
      };
    } catch (error) {
      console.error("Simple analytics failed:", error);
      return {
        countryDistribution: [],
        industryDistribution: [],
        stateDistribution: [],
      };
    }
  }

  // Fallback method for when database aggregation fails
  private async getStartupsAnalyticsFallback(): Promise<{
    countryDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
    stateDistribution: Array<{ name: string; value: number }>;
  }> {
    try {
      console.log("🔄 Using fallback analytics method for ALL records...");
      
      // Process ALL records in batches to get complete data
      const batchSize = 1000;
      let offset = 0;
      const countryMap = new Map<string, number>();
      const stateMap = new Map<string, number>();
      const industryMap = new Map<string, number>();
      
      let hasMoreData = true;
      
      while (hasMoreData) {
        const { data: batchData, error } = await supabase
          .from("companies_startups")
          .select("country, state, tags")
          .range(offset, offset + batchSize - 1);
          
        if (error) {
          console.error("Error fetching batch:", error);
          break;
        }
        
        if (!batchData || batchData.length === 0) {
          hasMoreData = false;
          break;
        }
        
        // Process this batch
        batchData.forEach((item: any) => {
          // Country processing
          if (item.country) {
            const country = item.country;
            countryMap.set(country, (countryMap.get(country) || 0) + 1);
          }
          
          // State processing
          if (item.state) {
            const state = item.state;
            stateMap.set(state, (stateMap.get(state) || 0) + 1);
          }
          
          // Industry processing from tags
          if (item.tags) {
            const tags = item.tags.split(",");
            tags.forEach((tag: string) => {
              const industry = tag.trim();
              if (industry && industry.length > 1) {
                industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
              }
            });
          }
        });
        
        offset += batchSize;
        console.log(`Processed ${offset} records...`);
        
        // Safety check to prevent infinite loops
        if (offset > 50000) {
          console.log("Reached safety limit of 50,000 records");
          break;
        }
      }

      // Sort all distributions by count
      const sortedCountries = Array.from(countryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
        
      const sortedStates = Array.from(stateMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
        
      const sortedIndustries = Array.from(industryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      console.log(`✅ Fallback complete - Countries: ${sortedCountries.length}, States: ${sortedStates.length}, Industries: ${sortedIndustries.length}`);

      return {
        countryDistribution: sortedCountries,
        stateDistribution: sortedStates,
        industryDistribution: sortedIndustries,
      };
    } catch (error) {
      console.error("Fallback analytics failed:", error);
      return {
        countryDistribution: [],
        industryDistribution: [],
        stateDistribution: [],
      };
    }
  }

  async getGrowthCompaniesAnalytics(): Promise<{
    fundingSizeDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
    growthRateDistribution: Array<{ name: string; value: number }>;
  }> {
    try {
      // Check cache first (temporarily disabled to test full dataset)
      // const cached = getCachedAnalytics('growth_analytics');
      // if (cached) {
      //   return cached;
      // }

      console.log("⚡ Fetching growth analytics using database-level aggregation...");

      // Use database-level aggregation for maximum performance
      // This is 100x faster than fetching all 9,901 records
      
      // Use admin client to get ALL records using pagination
      console.log("🔍 Fetching ALL records from companies_growth table using pagination...");
      
      // Use parallel queries to get ALL data (much faster than pagination)
      console.log("⚡ Using parallel queries to fetch ALL 9,953 records...");
      
      // Create multiple parallel queries to bypass the 1000 limit
      const queries = [];
      const batchSize = 1000;
      const totalRecords = 9953;
      
      // Create 10 parallel queries to get all data
      for (let i = 0; i < 10; i++) {
        const from = i * batchSize;
        const to = Math.min(from + batchSize - 1, totalRecords - 1);
        
        queries.push(
          supabaseAdmin
        .from("companies_growth")
            .select("industry, total_funding, employee_growth_percent")
            .range(from, to)
        );
      }
      
      // Execute all queries in parallel
      const results = await Promise.all(queries);
      
      // Combine all results
      let industryData: any[] = [];
      let sampleData: any[] = [];
      let hasError = false;
      
      results.forEach((result, index) => {
        if (result.error) {
          console.error(`Query ${index} error:`, result.error);
          hasError = true;
        } else {
          const data = result.data || [];
          industryData = industryData.concat(data.map((item: any) => ({ industry: item.industry })));
          sampleData = sampleData.concat(data.map((item: any) => ({ 
            total_funding: item.total_funding, 
            employee_growth_percent: item.employee_growth_percent 
          })));
        }
      });
      
      if (hasError) {
        console.error("Some parallel queries failed");
        return this.getGrowthCompaniesAnalyticsFallback();
      }

      console.log(`✅ Database aggregation complete - Industries: ${industryData?.length || 0}, Total records: ${sampleData?.length || 0}`);
      console.log(`📊 Processing ${sampleData?.length || 0} records (should be ~9,953)`);
      
      // Debug: Log some sample funding data
      console.log("🔍 Sample funding data:", sampleData?.slice(0, 5).map(item => item.total_funding));

      // Process funding size distribution from sample data
      const fundingRanges = new Map<string, number>([
        ["Under $1M", 0],
        ["$1M-$10M", 0],
        ["$10M-$50M", 0],
        ["$50M-$100M", 0],
        ["$100M+", 0],
        ["$1B+", 0],
      ]);

      const growthRanges = new Map<string, number>([
        ["0-25%", 0],
        ["25-50%", 0],
        ["50-100%", 0],
        ["100-200%", 0],
        ["200%+", 0],
      ]);

      // Process funding and growth rate from sample data
      sampleData?.forEach((company: any) => {
        // Funding size distribution
        const funding = company.total_funding || "";
        let range = "Under $1M";

        if (funding && funding !== "-" && funding !== "N/A" && funding.trim() !== "") {
          const cleanFunding = funding.replace(/[\$,\s]/g, "").toLowerCase();
          let numericValue = parseFloat(cleanFunding.replace(/[^0-9.]/g, ""));

          if (!isNaN(numericValue) && numericValue > 0) {
            // Convert to millions for consistent comparison
            if (cleanFunding.includes("b")) {
              numericValue *= 1000; // Convert billions to millions
            } else if (cleanFunding.includes("k")) {
              numericValue /= 1000; // Convert thousands to millions
            }
            // Values like "5M" are already in millions

            if (numericValue >= 1000) range = "$1B+";
            else if (numericValue >= 100) range = "$100M+";
            else if (numericValue >= 50) range = "$50M-$100M";
            else if (numericValue >= 10) range = "$10M-$50M";
            else if (numericValue >= 1) range = "$1M-$10M";
            else range = "Under $1M";
          }
        }

        fundingRanges.set(range, (fundingRanges.get(range) || 0) + 1);

        // Growth rate distribution
        const growthRate = company.employee_growth_percent || "";
        if (growthRate && growthRate !== "-") {
          const numericValue = parseFloat(growthRate.replace(/[^0-9.-]/g, ""));
          let growthRange = "0-25%";
          if (!isNaN(numericValue)) {
            if (numericValue >= 200) growthRange = "200%+";
            else if (numericValue >= 100) growthRange = "100-200%";
            else if (numericValue >= 50) growthRange = "50-100%";
            else if (numericValue >= 25) growthRange = "25-50%";
          }
          growthRanges.set(growthRange, (growthRanges.get(growthRange) || 0) + 1);
        } else {
          growthRanges.set("0-25%", (growthRanges.get("0-25%") || 0) + 1);
        }
      });

      // Process industry distribution
      const industryMap = new Map<string, number>();
      (industryData || []).forEach((item: any) => {
        const industry = item.industry || "Unknown";
        industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
      });

      const result = {
        fundingSizeDistribution: Array.from(fundingRanges.entries()).map(
          ([name, value]) => ({ name, value }),
        ),
        industryDistribution: Array.from(industryMap.entries()).map(
          ([name, value]) => ({ name, value }),
        ).sort((a, b) => b.value - a.value),
        growthRateDistribution: Array.from(growthRanges.entries()).map(
          ([name, value]) => ({ name, value }),
        ),
      };

      // Cache the result
      setCachedAnalytics('growth_analytics', result);
      return result;
    } catch (error) {
      console.error("Error fetching growth analytics:", error);
      return this.getGrowthCompaniesAnalyticsFallback();
    }
  }

  // Fallback method for when database aggregation fails
  private async getGrowthCompaniesAnalyticsFallback(): Promise<{
    fundingSizeDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
    growthRateDistribution: Array<{ name: string; value: number }>;
  }> {
    try {
      console.log("🔄 Using fallback growth analytics method...");
      
      // Simple aggregation with limited data
      const { data: industryData } = await supabase
        .from("companies_growth")
        .select("industry")
        .not("industry", "is", null)
        .limit(3000);

      const industryMap = new Map<string, number>();
      industryData?.forEach((item: any) => {
        const industry = item.industry || "Unknown";
        industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
      });

      return {
        fundingSizeDistribution: [
          { name: "Under $1M", value: 0 },
          { name: "$1M-$10M", value: 0 },
          { name: "$10M-$50M", value: 0 },
          { name: "$50M-$100M", value: 0 },
          { name: "$100M+", value: 0 },
          { name: "$1B+", value: 0 },
        ],
        industryDistribution: Array.from(industryMap.entries()).map(
          ([name, value]) => ({ name, value }),
        ).sort((a, b) => b.value - a.value),
        growthRateDistribution: [
          { name: "0-25%", value: 0 },
          { name: "25-50%", value: 0 },
          { name: "50-100%", value: 0 },
          { name: "100-200%", value: 0 },
          { name: "200%+", value: 0 },
        ],
      };
    } catch (error) {
      console.error("Fallback growth analytics failed:", error);
      return {
        fundingSizeDistribution: [],
        industryDistribution: [],
        growthRateDistribution: [],
      };
    }
  }

  async getFranchisesAnalytics(): Promise<{
    investmentDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
    foundedTimeline: Array<{ name: string; value: number }>;
  }> {
    try {
      const { data, error } = await supabase
        .from("companies_franchises")
        .select("initial_investment, industry, founded");

      if (error) throw error;

      const investmentRanges = new Map<string, number>();
      const industryMap = new Map<string, number>();
      const foundedPeriods = new Map<string, number>();

      data?.forEach((franchise: any) => {
        // Investment distribution
        const investment = franchise.initial_investment || "";
        let range = "Under $50K";

        if (investment.includes("$")) {
          const numericValue =
            parseFloat(investment.replace(/[$,K]/g, "")) * 1000;
          if (numericValue >= 500000) range = "$500K+";
          else if (numericValue >= 250000) range = "$250K-$500K";
          else if (numericValue >= 100000) range = "$100K-$250K";
          else if (numericValue >= 50000) range = "$50K-$100K";
        }

        investmentRanges.set(range, (investmentRanges.get(range) || 0) + 1);

        // Industry distribution
        const industry = franchise.industry || "Unknown";
        industryMap.set(industry, (industryMap.get(industry) || 0) + 1);

        // Founded timeline
        const founded = franchise.founded;
        if (founded) {
          let period = "Before 1990";
          const year = parseInt(founded);
          if (!isNaN(year)) {
            if (year >= 2010) period = "2010-2024";
            else if (year >= 2000) period = "2000-2009";
            else if (year >= 1990) period = "1990-1999";
          }
          foundedPeriods.set(period, (foundedPeriods.get(period) || 0) + 1);
        }
      });

      return {
        investmentDistribution: Array.from(investmentRanges.entries()).map(
          ([name, value]) => ({ name, value }),
        ),
        industryDistribution: Array.from(industryMap.entries())
          .sort(([, a], [, b]) => b - a)
          .map(([name, value]: [string, number]) => ({ name, value })),
        foundedTimeline: Array.from(foundedPeriods.entries()).map(
          ([name, value]) => ({ name, value }),
        ),
      };
    } catch (error) {
      console.error("Error fetching franchise analytics:", error);
      return {
        investmentDistribution: [],
        industryDistribution: [],
        foundedTimeline: [],
      };
    }
  }

  async getVcCompaniesAnalytics(): Promise<{
    investmentStageDistribution: Array<{ name: string; value: number }>;
    aumDistribution: Array<{ name: string; value: number }>;
    regionalDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
  }> {
    try {
      // Check cache first
      const cached = getCachedAnalytics('vc_analytics');
      if (cached) {
        return cached;
      }

      console.log("⚡ Fetching VC analytics with parallel queries for ALL records...");

      // Use parallel queries to get ALL VC data (same approach as growth companies)
      const queries = [];
      const batchSize = 1000;
      const totalRecords = 6255; // Approximate VC records count
      
      // Create 7 parallel queries to get all VC data
      for (let i = 0; i < 7; i++) {
        const from = i * batchSize;
        const to = Math.min(from + batchSize - 1, totalRecords - 1);
        
        queries.push(
          supabaseAdmin
            .from("companies_vc")
            .select("industry, investment_stage, region_of_investment, location, aum")
            .range(from, to)
        );
      }
      
      console.log(`Created ${queries.length} parallel queries to fetch ${totalRecords} records`);
      
      // Execute all queries in parallel
      const results = await Promise.all(queries);
      
      // Combine all results
      let allVcData: any[] = [];
      let hasError = false;
      
      results.forEach((result, index) => {
        if (result.error) {
          console.error(`VC Query ${index} error:`, result.error);
          hasError = true;
        } else {
          allVcData = allVcData.concat(result.data || []);
        }
      });
      
      if (hasError) {
        console.error("Some VC parallel queries failed");
        return this.getVcCompaniesAnalyticsFallback();
      }

      console.log(`✅ VC parallel queries complete - Total records: ${allVcData?.length || 0}`);

      if (!allVcData || allVcData.length === 0) {
        console.error("No VC data returned from query");
        return this.getVcCompaniesAnalyticsFallback();
      }

      // Debug: Check if we're getting all records
      if (allVcData.length < 6000) {
        console.warn(`⚠️ Only got ${allVcData.length} records, expected ~6255. Some data might be missing.`);
      }

      // Process all VC data in JavaScript
      const industryMap = new Map<string, number>();
      const stageMap = new Map<string, number>();
      const regionMap = new Map<string, number>();
      const aumRanges = new Map<string, number>([
        ["Under $100M", 0],
        ["$100M-$500M", 0],
        ["$500M-$1B", 0],
        ["$1B+", 0],
      ]);

      console.log(`Processing ${allVcData.length} VC records...`);
      
      allVcData?.forEach((vc: any, index: number) => {
        // Debug first few records
        if (index < 3) {
          console.log(`Sample VC record ${index}:`, {
            industry: vc.industry,
            location: vc.location,
            region_of_investment: vc.region_of_investment,
            investment_stage: vc.investment_stage
          });
        }
        
        // Industry distribution
        const industry = vc.industry || "Unknown";
        industryMap.set(industry, (industryMap.get(industry) || 0) + 1);

        // Investment stage distribution
        const stage = vc.investment_stage || "Unknown";
        stageMap.set(stage, (stageMap.get(stage) || 0) + 1);

        // Regional distribution - use location field directly for countries
        let region = vc.location || "Unknown";
        
        // Clean up the region name
        if (region && region !== "Unknown") {
          region = region.trim();
          
          // If location contains city, state, country format, extract just the country
          const parts = region.split(',').map((part: string) => part.trim());
          if (parts.length > 1) {
            // Take the last part as country
            region = parts[parts.length - 1];
          }
          
          // Standardize common country name variations
          if (region === "United States of America" || region === "USA" || region === "US") {
            region = "United States";
          } else if (region === "United Kingdom of Great Britain and Northern Ireland" || region === "UK" || region === "Great Britain") {
            region = "United Kingdom";
          } else if (region === "Deutschland" || region === "Federal Republic of Germany") {
            region = "Germany";
          } else if (region === "People's Republic of China" || region === "PRC") {
            region = "China";
          } else if (region === "Russian Federation") {
            region = "Russia";
          } else if (region === "Republic of Korea" || region === "ROK") {
            region = "South Korea";
          } else if (region === "United Arab Emirates" || region === "UAE") {
            region = "United Arab Emirates";
          }
        }
        
        regionMap.set(region, (regionMap.get(region) || 0) + 1);

        // AUM distribution (simplified parsing)
        const aum = vc.aum || "";
        if (aum && aum !== "-" && aum !== "N/A" && aum.trim() !== "") {
          const cleanAum = aum.replace(/[\$,\s]/g, "").toLowerCase();
          let numericValue = parseFloat(cleanAum.replace(/[^0-9.]/g, ""));
          
          if (!isNaN(numericValue) && numericValue > 0) {
            // Convert to millions for consistent comparison
            if (cleanAum.includes("b")) {
              numericValue *= 1000; // Convert billions to millions
            }
            
            let aumRange = "Under $100M";
            if (numericValue >= 1000) aumRange = "$1B+";
            else if (numericValue >= 500) aumRange = "$500M-$1B";
            else if (numericValue >= 100) aumRange = "$100M-$500M";
            else aumRange = "Under $100M";
            
            aumRanges.set(aumRange, (aumRanges.get(aumRange) || 0) + 1);
          }
        }
      });

      // Convert maps to arrays
      const industryDistribution = Array.from(industryMap.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }));

      const investmentStageDistribution = Array.from(stageMap.entries())
        .map(([name, value]) => ({ name, value }));

      const regionalDistribution = Array.from(regionMap.entries())
        .map(([name, value]) => ({ name, value }));

      const aumDistribution = Array.from(aumRanges.entries())
        .map(([name, value]) => ({ name, value }));

      // Debug: Log the number of unique regions found
      console.log(`🌍 Found ${regionalDistribution.length} unique regions/countries`);
      console.log(`📊 Top 5 regions:`, regionalDistribution
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(r => `${r.name}: ${r.value}`)
        .join(', '));

      const result = {
        investmentStageDistribution,
        aumDistribution,
        regionalDistribution,
        industryDistribution,
      };

      // Cache the result
      setCachedAnalytics('vc_analytics', result);
      return result;
    } catch (error) {
      console.error("Error fetching VC analytics:", error);
      return this.getVcCompaniesAnalyticsFallback();
    }
  }

  // Fallback method for when database aggregation fails
  private async getVcCompaniesAnalyticsFallback(): Promise<{
    investmentStageDistribution: Array<{ name: string; value: number }>;
    aumDistribution: Array<{ name: string; value: number }>;
    regionalDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
  }> {
    try {
      console.log("🔄 Using fallback VC analytics method...");
      
      // Simple aggregation with limited data
      const { data: industryData } = await supabase
        .from("companies_vc")
        .select("industry")
        .not("industry", "is", null)
        .limit(3000);

      const industryMap = new Map<string, number>();
      industryData?.forEach((item: any) => {
        const industry = item.industry || "Unknown";
        industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
      });

      return {
        investmentStageDistribution: [
          { name: "Early Stage", value: 0 },
          { name: "Growth Stage", value: 0 },
          { name: "Late Stage", value: 0 },
          { name: "Unknown", value: 0 },
        ],
        aumDistribution: [
          { name: "Under $100M", value: 0 },
          { name: "$100M-$500M", value: 0 },
          { name: "$500M-$1B", value: 0 },
          { name: "$1B+", value: 0 },
        ],
        regionalDistribution: [
          { name: "North America", value: 0 },
          { name: "Europe", value: 0 },
          { name: "Asia", value: 0 },
          { name: "Other", value: 0 },
        ],
        industryDistribution: Array.from(industryMap.entries()).map(
          ([name, value]) => ({ name, value }),
        ).sort((a, b) => b.value - a.value),
      };
    } catch (error) {
      console.error("Fallback VC analytics failed:", error);
      return {
        investmentStageDistribution: [],
        aumDistribution: [],
        regionalDistribution: [],
        industryDistribution: [],
      };
    }
  }

  async getLatestFundingActivity(): Promise<
    Array<{
      id: number;
      company: string;
      amount: string;
      type: "funding" | "exit" | "ma" | "megadeal";
      date: string;
      industry?: string;
      description: string;
    }>
  > {
    try {
      const activity: Array<{
        id: number;
        company: string;
        amount: string;
        type: "funding" | "exit" | "ma" | "megadeal";
        date: string;
        industry?: string;
        description: string;
      }> = [];

      // Get recent exits
      const exitsData = await supabase
        .from("funding_rounds_exits")
        .select("*")
        .order("deal_closed_date", { ascending: false })
        .limit(5);

      if (exitsData.data) {
        exitsData.data.forEach((exit: any) => {
          if (exit.deal_closed_date) {
            activity.push({
              id: exit.id,
              company: exit.company || "Unknown",
              amount: exit.exit_value_billions
                ? `$${exit.exit_value_billions}B`
                : "Undisclosed",
              type: "exit",
              date: exit.deal_closed_date,
              industry: exit.industry,
              description: `${exit.exit_type || "Exit"} valued at ${exit.exit_value_billions ? `$${exit.exit_value_billions}B` : "undisclosed amount"}`,
            });
          }
        });
      }

      // Get recent 2024 funding rounds
      const sfd24Data = await supabase
        .from("funding_rounds_us_sfd_24")
        .select("*")
        .order("date_reported", { ascending: false })
        .limit(5);

      if (sfd24Data.data) {
        sfd24Data.data.forEach((round: any) => {
          if (round.date_reported) {
            activity.push({
              id: round.id,
              company: round.company || "Unknown",
              amount: round.amount
                ? `$${(Number(round.amount) / 1000000).toFixed(0)}M`
                : "Undisclosed",
              type: "funding",
              date: round.date_reported,
              industry: round.industry,
              description: `Raised ${round.amount ? `$${(Number(round.amount) / 1000000).toFixed(0)}M` : "funding"}${round.lead_investors ? ` led by ${round.lead_investors}` : ""}`,
            });
          }
        });
      }

      // Get recent M&A deals
      const maData = await supabase
        .from("funding_rounds_ma_deals")
        .select("*")
        .order("announced_date", { ascending: false })
        .limit(4);

      if (maData.data) {
        maData.data.forEach((deal: any) => {
          if (deal.announced_date) {
            activity.push({
              id: deal.id,
              company: deal.acquired_company || "Unknown",
              amount: deal.deal_size_billions
                ? `$${deal.deal_size_billions}B`
                : "Undisclosed",
              type: "ma",
              date: deal.announced_date,
              description: `Acquired by ${deal.acquiring_company || "Unknown"} for ${deal.deal_size_billions ? `$${deal.deal_size_billions}B` : "undisclosed amount"}`,
            });
          }
        });
      }

      // Sort by date and return latest
      return activity
        .filter((item: any) => item.date)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 12);
    } catch (error) {
      console.error("Error fetching latest funding activity:", error);
      return [];
    }
  }

  // Incubator methods implementation
  async getIncubators(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      country?: string;
      programType?: string;
    },
  ): Promise<Incubator[]> {
    let query = supabase.from("incubators").select("*");

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,categories.ilike.%${filters.search}%`,
      );
    }

    if (filters?.country && filters.country !== "all") {
      // Simple and precise filtering - country must contain the exact country name as a word
      const country = filters.country;
      query = query.ilike("country", `%${country}%`);

      // Add additional post-processing filter to ensure precision
      console.log(`Filtering for country: ${country}`);
    }

    if (filters?.programType && filters.programType !== "all") {
      query = query.ilike("program_type", `%${filters.programType}%`);
    }

    const { data, error } = await query
      .order("crunchbase_rank", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching incubators:", error);
      return [];
    }

    // Apply additional client-side filtering for country precision
    let filteredData = data || [];
    if (filters?.country && filters.country !== "all") {
      filteredData = (data || []).filter((item: any) => {
        const itemCountry = item.country?.toLowerCase() || "";
        const filterCountry = filters.country?.toLowerCase() || "";

        // Check if country matches exactly or as complete words
        return (
          itemCountry === filterCountry ||
          itemCountry.startsWith(`${filterCountry} `) ||
          itemCountry.includes(` ${filterCountry} `) ||
          itemCountry.endsWith(` ${filterCountry}`)
        );
      });
      console.log(
        `Country filter applied: ${filters.country}, Results: ${filteredData.length}`,
      );
    }

    // Map database fields to TypeScript interface
    return filteredData.map((item: any) => ({
      id: item.id,
      url: item.url,
      name: item.name,
      found: item.found,
      shortDescription: item.short_description,
      website: item.website,
      description: item.description,
      programType: item.program_type,
      categories: item.categories,
      duration: item.duration,
      country: item.country,
      fundingType: item.funding_type,
      otherBenefits: item.other_benefits,
      applicationStatus: item.application_status,
      cohortsPerYear: item.cohorts_per_year,
      startupsInvested: item.startups_invested,
      crunchbaseRank: item.crunchbase_rank,
      image: item.image,
      cityState: item.city_state,
      offer: item.offer,
      startDate: item.start_date,
      exits: item.exits,
      totalFundingRaisedByStartups: item.total_funding_raised_by_startups,
      offerDetails: item.offer_details,
      visaAndRelocationSupport: item.visa_and_relocation_support,
      applicationDeadline: item.application_deadline,
      programFee: item.program_fee,
      alumniStartups: item.alumni_startups,
      startupsPerCohort: item.startups_per_cohort,
      investmentsPerYear: item.investments_per_year,
    }));
  }

  async getIncubatorsCount(filters?: {
    search?: string;
    country?: string;
    programType?: string;
  }): Promise<number> {
    let query = supabase
      .from("incubators")
      .select("*", { count: "exact", head: true });

    // Apply same filters as main query
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,categories.ilike.%${filters.search}%`,
      );
    }

    if (filters?.country && filters.country !== "all") {
      // Simple and precise filtering - country must contain the exact country name as a word
      const country = filters.country;
      query = query.ilike("country", `%${country}%`);

      // Add additional post-processing filter to ensure precision
      console.log(`Filtering for country: ${country}`);
    }

    if (filters?.programType && filters.programType !== "all") {
      query = query.ilike("program_type", `%${filters.programType}%`);
    }

    // For country filtering, we need to fetch data and filter client-side for accuracy
    if (filters?.country && filters.country !== "all") {
      const { data, error } = await supabase
        .from("incubators")
        .select("country")
        .ilike("country", `%${filters.country}%`);

      if (error) {
        console.error("Error fetching incubators for count:", error);
        return 0;
      }

      // Apply same client-side filtering as main query
      const filteredData = (data || []).filter((item: any) => {
        const itemCountry = item.country?.toLowerCase() || "";
        const filterCountry = filters.country?.toLowerCase() || "";

        return (
          itemCountry === filterCountry ||
          itemCountry.startsWith(`${filterCountry} `) ||
          itemCountry.includes(` ${filterCountry} `) ||
          itemCountry.endsWith(` ${filterCountry}`)
        );
      });

      return filteredData.length;
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error fetching incubators count:", error);
      return 0;
    }

    return count || 0;
  }

  async getMADeals(
    limit = 50,
    offset = 0,
    filters?: {
      search?: string;
      mainCategory?: string;
      year?: string;
      acquirer?: string;
      industry?: string;
      minValue?: string;
    },
  ): Promise<any[]> {
    let query = supabaseAdmin
      .from("m_a")
      .select("*")
      .order("date_seen", { ascending: false })
      // .order("id", { ascending: true })
      .range(offset, offset + limit - 1);
    if (filters?.search) {
      query = query.ilike("company_name", `%${filters.search}%`);
    }
    if (filters?.mainCategory) {
      query = query.eq("main_category", filters.mainCategory);
    }
    if (filters?.year && filters.year !== "all") {
      console.log(filters.year, "filters.year");
      // For 2025, since we're in August 2025, use current date as end date
      if (filters.year === "2025") {
        query = query
          .gte("date_seen", "2025-01-01")
          .lte("date_seen", "2025-12-31");
      } else {
        query = query
          .gte("date_seen", `${filters.year}-01-01`)
          .lte("date_seen", `${filters.year}-12-31`);
      }
    }
    if (filters?.acquirer && filters.acquirer !== "all") {
      query = query.ilike("acquired_by", `%${filters.acquirer}%`);
    }
    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("main_category", `%${filters.industry}%`);
    }
    if (
      filters?.minValue &&
      filters.minValue !== "any" &&
      filters.minValue !== "all"
    ) {
      // Convert minValue from billions to millions for database comparison
      // Frontend sends: "50" for $50B+, "0.1" for $100M+, "0.5" for $500M+, etc.
      const minValueNum = parseFloat(filters.minValue);
      if (!isNaN(minValueNum)) {
        // Convert billions to millions: 50B = 50,000M, 0.1B = 100M
        const minValueInMillions = minValueNum * 1000;
        console.log(
          `MinValue filter: ${filters.minValue}B = ${minValueInMillions}M`,
        );
        query = query.gte("acquisition_amount", minValueInMillions);
      }
    }
    const { data, error } = await query;
    if (error) throw error;

    // Sort the data by date_seen in descending order (most recent first)
    // Use id as secondary sort to ensure consistent ordering
    // const sortedData = (data || []).sort((a, b) => {
    //   const dateA = a.date_seen ? new Date(a.date_seen).getTime() : 0;
    //   const dateB = b.date_seen ? new Date(b.date_seen).getTime() : 0;
    //   if (dateB !== dateA) {
    //     return dateB - dateA; // Descending order (newest first)
    //   }
    //   // If dates are the same, sort by id to ensure consistent ordering
    //   return (b.id || 0) - (a.id || 0);
    // });
    // console.log(sortedData[0]?.acquired_by_company_info?.name);
    return data.map((item: any) => ({
      id: item.id,
      companyName: item.company_name,
      acquiredBy: item.acquired_by,
      namePath: item.name_path,
      mainCategory: item.main_category,
      dateSeen: item.date_seen,
      createdAt: item.created_at,
      acquiredByLinkedinUrl: item.acquired_by_linkedin_url,
      companyInfo: item.company_info,
      acquiredByCompanyInfo: item?.acquired_by_company_info || {},
      acquiredCompanyName: item?.acquired_by_company_info?.name,
      growthInfo: item.growth_info || null,
      // Use acquisition_amount (assumed to be in millions) and convert to billions
      dealSizeBillions: item.acquisition_amount
        ? item.acquisition_amount / 1000
        : null,
    }));
  }

  async getMADealsCount(filters?: {
    search?: string;
    mainCategory?: string;
    year?: string;
    acquirer?: string;
    industry?: string;
    minValue?: string;
  }): Promise<number> {
    let query = supabaseAdmin
      .from("m_a")
      .select("*", { count: "exact", head: true });
    if (filters?.search) {
      query = query.ilike("company_name", `%${filters.search}%`);
    }
    if (filters?.mainCategory) {
      query = query.eq("main_category", filters.mainCategory);
    }
    if (filters?.year && filters.year !== "all") {
      console.log("COUNT:", filters.year, "filters.year");
      // For 2025, since we're in August 2025, use current date as end date
      if (filters.year === "2025") {
        query = query
          .gte("date_seen", "2025-01-01")
          .lte("date_seen", "2025-12-31");
      } else {
        query = query
          .gte("date_seen", `${filters.year}-01-01`)
          .lte("date_seen", `${filters.year}-12-31`);
      }
    }
    if (filters?.acquirer && filters.acquirer !== "all") {
      query = query.ilike("acquired_by", `%${filters.acquirer}%`);
    }
    if (filters?.industry && filters.industry !== "all") {
      query = query.ilike("main_category", `%${filters.industry}%`);
    }
    if (
      filters?.minValue &&
      filters.minValue !== "any" &&
      filters.minValue !== "all"
    ) {
      // Convert minValue from billions to millions for database comparison
      // Frontend sends: "50" for $50B+, "0.1" for $100M+, "0.5" for $500M+, etc.
      const minValueNum = parseFloat(filters.minValue);
      if (!isNaN(minValueNum)) {
        // Convert billions to millions: 50B = 50,000M, 0.1B = 100M
        const minValueInMillions = minValueNum * 1000;
        console.log(
          `MinValue filter COUNT: ${filters.minValue}B = ${minValueInMillions}M`,
        );
        query = query.gte("acquisition_amount", minValueInMillions);
      }
    }
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }
}

export const storage = new SupabaseStorage();
