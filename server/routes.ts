import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, getCachedAnalytics, setCachedAnalytics } from "./storage";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Initialize supabaseAdmin for direct database access
const supabaseUrl =
  process.env.SUPABASE_URL || "https://kluqlibhlkcsuighyczd.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsdXFsaWJobGtjc3VpZ2h5Y3pkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjA4MjM0NiwiZXhwIjoyMDUxNjU4MzQ2fQ.H56SNbqYC1lO1qBwz6KCHYZ7u9YHn0Ms9nJNzvirr70";
let supabaseAdmin: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}
// normalize helper — paste near top of routes file
function getFirstQueryValue(req: any, ...keys: string[]) {
  for (const k of keys) {
    const v = req.query?.[k];
    if (v !== undefined && v !== null) {
      const s = String(v).trim();
      if (s !== "") return s;
    }
  }
  return undefined;
}


export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Cloud Run readiness probes
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "market-intelligence-platform",
      version: "1.0.0",
    });
  });

  // Note: Root "/" path is handled by Vite middleware for serving the React app

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd use proper session management or JWT
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        return res
          .status(400)
          .json({ message: "Username, email, and password required" });
      }

      const existingUser =
        (await storage.getUserByUsername(username)) ||
        (await storage.getUserByEmail(email));

      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await storage.createUser({
        username,
        email,
        password,
        role,
      });
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", async (_req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/dashboard/recent-funding", async (_req, res) => {
    try {
      const recentFunding = await storage.getRecentFunding();
      res.json(recentFunding);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent funding" });
    }
  });

  app.get("/api/dashboard/upcoming-events", async (_req, res) => {
    try {
      const upcomingEvents = await storage.getUpcomingEvents();
      res.json(upcomingEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming events" });
    }
  });

  app.get("/api/dashboard/funding-analytics", async (_req, res) => {
    try {
      const analytics = await storage.getFundingAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error in /api/dashboard/funding-analytics:", error);
      res.status(500).json({ message: "Failed to fetch funding analytics" });
    }
  });

  app.get("/api/dashboard/latest-funding-activity", async (_req, res) => {
    try {
      const activity = await storage.getLatestFundingActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error in /api/dashboard/latest-funding-activity:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch latest funding activity" });
    }
  });

  // Companies routes
  // Count endpoints must come before ID endpoints to avoid route conflicts
  // Analytics endpoints for complete dataset (no pagination)
  app.get("/api/companies/startups/analytics", async (req, res) => {
    try {
      const analytics = await storage.getStartupsAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch startup analytics" });
    }
  });

  app.get("/api/companies/growth/analytics", async (req, res) => {
    try {
      const analytics = await storage.getGrowthCompaniesAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch growth analytics" });
    }
  });


  app.get("/api/companies/franchises/analytics", async (req, res) => {
    try {
      const analytics = await storage.getFranchisesAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchise analytics" });
    }
  });

  app.get("/api/companies/vc/analytics", async (req, res) => {
    try {
      const analytics = await storage.getVcCompaniesAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch VC analytics" });
    }
  });

  app.get("/api/companies/startups/count", async (req, res) => {
    try {
      const search = req.query.search as string;
      const industry = req.query.industry as string;
      const country = req.query.country as string;
      const state = req.query.state as string;
      const rank = req.query.rank as string;
      const srScore2 = req.query.srScore2 as string;
      const founded = req.query.founded as string;
      const count = await storage.getCompaniesStartupsCount({
        search,
        industry,
        country,
        state,
        rank,
        srScore2,
        founded,
      });
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch startup count" });
    }
  });

  app.get("/api/companies/growth/count", async (req, res) => {
    try {
      const search = req.query.search as string;
      const industry = req.query.industry as string;
      const location = req.query.location as string;
      const ranking = req.query.ranking as string;
      const annualRevenue = req.query.annualRevenue as string;
      const employees = req.query.employees as string;
      const growthRate = req.query.growthRate as string;
      const count = await storage.getCompaniesGrowthCount({
        search,
        industry,
        location,
        ranking,
        annualRevenue,
        employees,
        growthRate,
      });
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch growth count" });
    }
  });

  app.get("/api/companies/franchises/count", async (req, res) => {
    try {
      const search = req.query.search as string;
      const industry = req.query.industry as string;
      const rank = req.query.rank as string;
      const initialInvestment = req.query.initialInvestment as string;
      const founded = req.query.founded as string;
      const empAtHq = req.query.empAtHq as string;
      const units2024 = req.query.units2024 as string;
      const count = await storage.getCompaniesFranchisesCount({
        search,
        industry,
        rank,
        initialInvestment,
        founded,
        empAtHq,
        units2024,
      });
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchise count" });
    }
  });

  app.get("/api/companies/startups", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const industry = req.query.industry as string;
      const country = req.query.country as string;
      const state = req.query.state as string;
      const rank = req.query.rank as string;
      const srScore2 = req.query.srScore2 as string;
      const founded = req.query.founded as string;
      const companies = await storage.getCompaniesStartups(limit, offset, {
        search,
        industry,
        country,
        state,
        rank,
        srScore2,
        founded,
      });
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch startup companies" });
    }
  });

  app.get("/api/companies/growth", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5000; // Increased from 50 to 5000 for better analytics
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const industry = req.query.industry as string;
      const location = req.query.location as string;
      const ranking = req.query.ranking as string;
      const annualRevenue = req.query.annualRevenue as string;
      const employees = req.query.employees as string;
      const growthRate = req.query.growthRate as string;
      const companies = await storage.getCompaniesGrowth(limit, offset, {
        search,
        industry,
        location,
        ranking,
        annualRevenue,
        employees,
        growthRate,
      });
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch growth companies" });
    }
  });

  app.get("/api/companies/franchises", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const industry = req.query.industry as string;
      const rank = req.query.rank as string;
      const initialInvestment = req.query.initialInvestment as string;
      const founded = req.query.founded as string;
      const empAtHq = req.query.empAtHq as string;
      const units2024 = req.query.units2024 as string;

      console.log("Franchises API called with filters:", {
        search,
        industry,
        rank,
        initialInvestment,
        founded,
        empAtHq,
        units2024,
      });

      const companies = await storage.getCompaniesFranchises(limit, offset, {
        search,
        industry,
        rank,
        initialInvestment,
        founded,
        empAtHq,
        units2024,
      });

      res.json(companies);
    } catch (error) {
      console.error("Error in franchises API:", error);
      res.status(500).json({ message: "Failed to fetch franchise companies" });
    }
  });

  app.get("/api/companies/startups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompanyStartupById(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company details" });
    }
  });

  app.get("/api/companies/growth/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompanyGrowthById(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company details" });
    }
  });

  app.get("/api/companies/franchises/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompanyFranchiseById(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company details" });
    }
  });

  app.get("/api/companies/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      const companies = await storage.searchCompanies(query);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to search companies" });
    }
  });

  app.get("/api/companies/vc", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const location = req.query.location as string;
      const industry = req.query.industry as string;
      const investmentStage = req.query.investmentStage as string;
      const founded = req.query.founded as string;
      const aum = req.query.aum as string;
      const regionOfInvestment = req.query.regionOfInvestment as string;
      const investmentTicket = req.query.investmentTicket as string;
      const companies = await storage.getCompaniesVc(limit, offset, {
        search,
        location,
        industry,
        investmentStage,
        founded,
        aum,
        regionOfInvestment,
        investmentTicket,
      });
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch VC companies" });
    }
  });

  app.get("/api/companies/vc/count", async (req, res) => {
    try {
      const search = req.query.search as string;
      const location = req.query.location as string;
      const industry = req.query.industry as string;
      const investmentStage = req.query.investmentStage as string;
      const founded = req.query.founded as string;
      const aum = req.query.aum as string;
      const regionOfInvestment = req.query.regionOfInvestment as string;
      const investmentTicket = req.query.investmentTicket as string;
      const count = await storage.getCompaniesVcCount({
        search,
        location,
        industry,
        investmentStage,
        founded,
        aum,
        regionOfInvestment,
        investmentTicket,
      });
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch VC companies count" });
    }
  });

  app.get("/api/companies/vc/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompanyVcById(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company details" });
    }
  });

  // Accelerators routes - specific routes first
  app.get("/api/accelerators/count", async (req, res) => {
    try {
      const count = await storage.getAcceleratorsCount();
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/accelerators/count:", error);
      res.status(500).json({ message: "Failed to fetch accelerators count" });
    }
  });

  app.get("/api/accelerators", async (req, res) => {
    try {
      const { search, country, industry, limit = "25", page = "1" } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        country: country as string,
        industry: industry as string,
      };

      const accelerators = await storage.getAccelerators(
        limitNum,
        offset,
        filters,
      );
      res.json(accelerators);
    } catch (error) {
      console.error("Error in /api/accelerators:", error);
      res.status(500).json({ message: "Failed to fetch accelerators" });
    }
  });

  // Incubators routes - specific routes first
  app.get("/api/incubators/count", async (req, res) => {
    try {
      const search = req.query.search as string;
      const country = req.query.country as string;
      const programType = req.query.programType as string;

      const filters = {
        search,
        country,
        programType,
      };

      const count = await storage.getIncubatorsCount(filters);
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/incubators/count:", error);
      res.status(500).json({ message: "Failed to fetch incubators count" });
    }
  });

  app.get("/api/incubators", async (req, res) => {
    try {
      const {
        search,
        country,
        programType,
        limit = "25",
        page = "1",
      } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        country: country as string,
        programType: programType as string,
      };

      const incubators = await storage.getIncubators(limitNum, offset, filters);
      res.json(incubators);
    } catch (error) {
      console.error("Error in /api/incubators:", error);
      res.status(500).json({ message: "Failed to fetch incubators" });
    }
  });

  // Grants routes - specific routes first
  app.get("/api/grants/programmes", async (req, res) => {
    try {
      const programmes = await storage.getGrantsProgrammes();
      res.json(programmes);
    } catch (error) {
      console.error("Error in /api/grants/programmes:", error);
      res.status(500).json({ message: "Failed to fetch grant programmes" });
    }
  });

  app.get("/api/grants/funded-under", async (req, res) => {
    try {
      const fundedUnder = await storage.getGrantsFundedUnder();
      res.json(fundedUnder);
    } catch (error) {
      console.error("Error in /api/grants/funded-under:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch grant funded under options" });
    }
  });

  app.get("/api/grants/statuses", async (req, res) => {
    try {
      const statuses = await storage.getGrantsStatuses();
      res.json(statuses);
    } catch (error) {
      console.error("Error in /api/grants/statuses:", error);
      res.status(500).json({ message: "Failed to fetch grant status options" });
    }
  });

  app.get("/api/grants/count", async (req, res) => {
    try {
      const { search, status, programme, fundedUnder } = req.query;

      const filters = {
        search: search as string,
        status: status as string,
        programme: programme as string,
        fundedUnder: fundedUnder as string,
      };

      const count = await storage.getGrantsCount(filters);
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/grants/count:", error);
      res.status(500).json({ message: "Failed to fetch grants count" });
    }
  });

  app.get("/api/grants", async (req, res) => {
    try {
      const {
        search,
        status,
        programme,
        fundedUnder,
        limit = "20",
        offset = "0",
      } = req.query;
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);

      const filters = {
        search: search as string,
        status: status as string,
        programme: programme as string,
        fundedUnder: fundedUnder as string,
      };

      // Create cache key for first page with no filters
      const hasFilters = search || (status && status !== 'all') || (programme && programme !== 'all') || (fundedUnder && fundedUnder !== 'all');
      const isFirstPage = offsetNum === 0;
      const cacheKey = `grants-page-0-limit-${limitNum}`;

      // Try to get cached data for first page with no filters
      if (!hasFilters && isFirstPage) {
        const cached = getCachedAnalytics(cacheKey);
        if (cached) {
          return res.json(cached);
        }
      }

      const grants = await storage.getGrants(limitNum, offsetNum, filters);

      // Cache first page with no filters
      if (!hasFilters && isFirstPage) {
        setCachedAnalytics(cacheKey, grants);
      }

      res.json(grants);
    } catch (error) {
      console.error("Error in /api/grants:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch grants";
      res.status(500).json({
        message: errorMessage,
        details: error instanceof Error ? error.stack : String(error),
      });
    }
  });

  // Events routes - specific routes first
  app.get("/api/events/count", async (req, res) => {
    try {
      const count = await storage.getEventsCount();
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/events/count:", error);
      res.status(500).json({ message: "Failed to fetch events count" });
    }
  });

  app.get("/api/events/european-startup/count", async (req, res) => {
    try {
      const count = await storage.getEventsEuropeanStartupCount();
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/events/european-startup/count:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch European startup events count" });
    }
  });

  app.get("/api/events/unique-types", async (req, res) => {
    try {
      const uniqueTypes = await storage.getUniqueEventTypes();
      res.json({ types: uniqueTypes });
    } catch (error) {
      console.error("Error in /api/events/unique-types:", error);
      res.status(500).json({ message: "Failed to fetch unique event types" });
    }
  });

  app.get("/api/events/european-startup/unique-types", async (req, res) => {
    try {
      const uniqueTypes = await storage.getUniqueEuropeanEventTypes();
      res.json({ types: uniqueTypes });
    } catch (error) {
      console.error(
        "Error in /api/events/european-startup/unique-types:",
        error,
      );
      res
        .status(500)
        .json({ message: "Failed to fetch unique European event types" });
    }
  });

  app.get("/api/events/locations", async (req, res) => {
    try {
      const locations = await storage.getUniqueEventLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error in /api/events/locations:", error);
      res.status(500).json({ message: "Failed to fetch event locations" });
    }
  });

  app.get("/api/events/european-startup/locations", async (req, res) => {
    try {
      const locations = await storage.getUniqueEuropeanEventLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error in /api/events/european-startup/locations:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch European event locations" });
    }
  });

  // News sources endpoint - returns sources matching API data
  app.get("/api/news/sources", async (req, res) => {
    try {
      const articles: any[] = [];

      // Fetch actual sources from NewsAPI
      try {
        const newsApiUrl = new URL("https://newsapi.org/v2/everything");
        newsApiUrl.searchParams.set(
          "q",
          "startup OR venture capital OR funding OR IPO OR acquisition OR fintech OR SaaS OR tech company",
        );
        newsApiUrl.searchParams.set("language", "en");
        newsApiUrl.searchParams.set("sortBy", "publishedAt");
        newsApiUrl.searchParams.set("pageSize", "100");

        // Get news from last 7 days
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7);
        newsApiUrl.searchParams.set(
          "from",
          fromDate.toISOString().split("T")[0],
        );

        const newsApiResponse = await fetch(newsApiUrl.toString(), {
          headers: {
            "X-API-Key": process.env.NEWSAPI_API_KEY || "",
          },
        });

        if (newsApiResponse.ok) {
          const newsApiData = await newsApiResponse.json();
          const newsApiArticles =
            newsApiData.articles
              ?.filter(
                (article: any) =>
                  article.title &&
                  article.description &&
                  !article.title.includes("[Removed]") &&
                  !article.description.includes("[Removed]"),
              )
              .map((article: any) => ({
                source: article.source?.name || "NewsAPI",
              })) || [];

          articles.push(...newsApiArticles);
        }
      } catch (error) {
        console.error("NewsAPI sources error:", error);
      }

      // Get unique sources and sort them
      const uniqueSources = Array.from(
        new Set(
          articles
            .map((article) => article.source)
            .filter((source) => source && source !== "NewsAPI"),
        ),
      ).sort();

      res.json(uniqueSources);
    } catch (error) {
      console.error("Error fetching news sources:", error);
      res.status(500).json({ error: "Failed to fetch news sources" });
    }
  });


  app.get("/api/events/european-startup", async (req, res) => {
    try {
      const {
        search,
        eventType,
        location,
        month,
        limit = "25",
        page = "1",
      } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        eventType: eventType as string,
        location: location as string,
        month: month as string,
      };

      const events = await storage.getEventsEuropeanStartup(
        limitNum,
        offset,
        filters,
      );
      res.json(events);
    } catch (error) {
      console.error("Error in /api/events/european-startup:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch European startup events" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const {
        search,
        eventType,
        location,
        month,
        limit = "25",
        page = "1",
      } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        eventType: eventType as string,
        location: location as string,
        month: month as string,
      };

      const events = await storage.getEvents(limitNum, offset, filters);
      res.json(events);
    } catch (error) {
      console.error("Error in /api/events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Rankings routes - specific routes first
  app.get("/api/rankings/cities/count", async (req, res) => {
    try {
      const count = await storage.getRankingsTopCitiesCount();
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/rankings/cities/count:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch cities rankings count" });
    }
  });

  app.get("/api/rankings/countries/count", async (req, res) => {
    try {
      const count = await storage.getRankingsTopCountriesCount();
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/rankings/countries/count:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch countries rankings count" });
    }
  });

  app.get("/api/rankings/universities/count", async (req, res) => {
    try {
      const count = await storage.getRankingsUniversitiesCount();
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/rankings/universities/count:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch universities rankings count" });
    }
  });

  app.get("/api/rankings/cities", async (req, res) => {
    try {
      const { search, country, limit = "25", page = "1" } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        country: country as string,
      };

      const rankings = await storage.getRankingsTopCities(
        limitNum,
        offset,
        filters,
      );
      res.json(rankings);
    } catch (error) {
      console.error("Error in /api/rankings/cities:", error);
      res.status(500).json({ message: "Failed to fetch cities rankings" });
    }
  });

  app.get("/api/rankings/countries", async (req, res) => {
    try {
      const { search, limit = "25", page = "1" } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
      };

      const rankings = await storage.getRankingsTopCountries(
        limitNum,
        offset,
        filters,
      );
      res.json(rankings);
    } catch (error) {
      console.error("Error in /api/rankings/countries:", error);
      res.status(500).json({ message: "Failed to fetch countries rankings" });
    }
  });

  app.get("/api/rankings/universities", async (req, res) => {
    try {
      const { search, country, year, limit = "25", page = "1" } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        country: country as string,
        year: year as string,
      };

      const rankings = await storage.getRankingsUniversities(
        limitNum,
        offset,
        filters,
      );
      res.json(rankings);
    } catch (error) {
      console.error("Error in /api/rankings/universities:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch universities rankings" });
    }
  });

  // Sanctions routes - specific routes first
  app.get("/api/sanctions/extended/count", async (req, res) => {
    try {
      const count = await storage.getSanctionsExtendedCount();
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/sanctions/extended/count:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch extended sanctions count" });
    }
  });

  app.get("/api/sanctions/individuals/count", async (req, res) => {
    try {
      const count = await storage.getSanctionsIndividualsCount();
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/sanctions/individuals/count:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch individual sanctions count" });
    }
  });

  app.get("/api/sanctions/extended", async (req, res) => {
    try {
      const {
        search,
        entityType,
        country,
        programs,
        limit = "25",
        page = "1",
      } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        entityType: entityType as string,
        country: country as string,
        programs: programs as string,
      };

      const sanctions = await storage.getSanctionsExtended(
        limitNum,
        offset,
        filters,
      );
      res.json(sanctions);
    } catch (error) {
      console.error("Error in /api/sanctions/extended:", error);
      res.status(500).json({ message: "Failed to fetch extended sanctions" });
    }
  });

  app.get("/api/sanctions/individuals", async (req, res) => {
    try {
      const {
        search,
        entityType,
        country,
        nationality,
        programs,
        limit = "25",
        page = "1",
      } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        entityType: entityType as string,
        country: country as string,
        nationality: nationality as string,
        programs: programs as string,
      };

      const sanctions = await storage.getSanctionsIndividuals(
        limitNum,
        offset,
        filters,
      );
      res.json(sanctions);
    } catch (error) {
      console.error("Error in /api/sanctions/individuals:", error);
      res.status(500).json({ message: "Failed to fetch individual sanctions" });
    }
  });

  // Unicorns routes
  app.get("/api/unicorns", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const filters = {
        search: req.query.search as string,
        country: req.query.country as string,
        continent: req.query.continent as string,
        minValuation: req.query.minValuation as string,
        tier: req.query.tier as string,
        funding: req.query.funding as string,
        leadInvestor: req.query.leadInvestor as string,
      };
      const unicorns = await storage.getUnicorns(limit, offset, filters);
      res.json(unicorns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unicorns" });
    }
  });

  app.get("/api/unicorns/count", async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        country: req.query.country as string,
        continent: req.query.continent as string,
        minValuation: req.query.minValuation as string,
        tier: req.query.tier as string,
        funding: req.query.funding as string,
        leadInvestor: req.query.leadInvestor as string,
      };
      const count = await storage.getUnicornsCount(filters);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unicorns count" });
    }
  });

  // Funding rounds routes
  app.get("/api/funding-rounds", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const { search, industry, exitType, minValue, exitValue, year } =
        req.query;

      const filters = {
        search: search as string,
        industry: industry as string,
        exitType: exitType as string,
        minValue: minValue as string,
        exitValue: exitValue as string,
        year: year as string,
      };

      const fundingRounds = await storage.getFundingRoundsExits(
        limit,
        offset,
        filters,
      );
      res.json(fundingRounds);
    } catch (error) {
      console.error("Error in /api/funding-rounds:", error);
      res.status(500).json({ message: "Failed to fetch funding rounds" });
    }
  });

  app.get("/api/funding-rounds/count", async (req, res) => {
    try {
      const { search, industry, exitType, minValue, exitValue, year } =
        req.query;

      const filters = {
        search: search as string,
        industry: industry as string,
        exitType: exitType as string,
        minValue: minValue as string,
        exitValue: exitValue as string,
        year: year as string,
      };

      const count = await storage.getFundingRoundsExitsCount(filters);
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/funding-rounds/count:", error);
      res.status(500).json({ message: "Failed to fetch funding rounds count" });
    }
  });

  // Exits & IPO's analytics endpoint - fetch all data for charts
  app.get("/api/funding-rounds/exits/analytics", async (req, res) => {
    try {
      const { search, industry, exitType, minValue, exitValue, year } =
        req.query;
      const filters = {
        search: search as string,
        industry: industry as string,
        exitType: exitType as string,
        minValue: minValue as string,
        exitValue: exitValue as string,
        year: year as string,
      };

      // Get ALL exits data for analytics using pagination to bypass Supabase limits
      let allData: any[] = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const batch = await storage.getFundingRoundsExits(
          batchSize,
          offset,
          filters,
        );
        if (batch.length === 0) {
          hasMore = false;
        } else {
          allData = allData.concat(batch);
          offset += batchSize;

          // Safety check to prevent infinite loops
          if (offset > 100000) {
            hasMore = false;
          }
        }
      }


      // Process data for charts
      const industryMap = new Map<string, number>();
      const exitTypeMap = new Map<string, number>();
      const fundingRangeMap = new Map<string, number>();
      const exitValueRangeMap = new Map<string, number>();
      const yearMap = new Map<string, number>();
      const companyExitValues: Array<{ company: string; value: number }> = [];

      allData.forEach((item) => {
        // Industries
        const industry = item.industry || "Other";
        industryMap.set(industry, (industryMap.get(industry) || 0) + 1);

        // Exit types
        const exitType = item.exitType || "Other";
        exitTypeMap.set(exitType, (exitTypeMap.get(exitType) || 0) + 1);

        // Funding ranges (in millions)
        if (item.totalFundingMillions) {
          const funding = parseFloat(item.totalFundingMillions);
          let range = "Unknown";
          if (funding >= 10000) range = "$10B+";
          else if (funding >= 5000) range = "$5B - $10B";
          else if (funding >= 1000) range = "$1B - $5B";
          else if (funding >= 500) range = "$500M - $1B";
          else if (funding >= 100) range = "$100M - $500M";
          else if (funding >= 10) range = "$10M - $100M";
          else range = "Under $10M";
          fundingRangeMap.set(range, (fundingRangeMap.get(range) || 0) + 1);
        }

        // Exit value ranges (in billions)
        if (item.exitValueBillions) {
          const exitValue = parseFloat(item.exitValueBillions);
          let range = "Unknown";
          if (exitValue >= 50) range = "$50B+";
          else if (exitValue >= 25) range = "$25B - $50B";
          else if (exitValue >= 10) range = "$10B - $25B";
          else if (exitValue >= 5) range = "$5B - $10B";
          else if (exitValue >= 1) range = "$1B - $5B";
          else if (exitValue >= 0.5) range = "$500M - $1B";
          else range = "Under $500M";
          exitValueRangeMap.set(range, (exitValueRangeMap.get(range) || 0) + 1);

          // Company exit values for top companies chart
          companyExitValues.push({
            company: item.company || "Unknown",
            value: exitValue,
          });
        }

        // Years
        if (item.dealClosedDate) {
          const year = new Date(item.dealClosedDate).getFullYear().toString();
          yearMap.set(year, (yearMap.get(year) || 0) + 1);
        }
      });

      // Convert maps to sorted arrays
      const industries = Array.from(industryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const exitTypes = Array.from(exitTypeMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const fundingRanges = Array.from(fundingRangeMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const exitValueRanges = Array.from(exitValueRangeMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const years = Array.from(yearMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Top companies by exit value
      const topCompaniesByExitValue = companyExitValues
        .sort((a, b) => b.value - a.value)
        .slice(0, 20)
        .map((item) => ({
          name: item.company,
          value: item.value,
        }));

      console.log(
        "Exits analytics processed - Industries:",
        industries.length,
        "Exit Types:",
        exitTypes.length,
      );

      res.json({
        industries,
        exitTypes,
        fundingRanges,
        exitValueRanges,
        years,
        topCompaniesByExitValue,
        totalRecords: allData.length,
      });
    } catch (error) {
      console.error("Error in /api/funding-rounds/exits/analytics:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : error,
      );
      res.status(500).json({
        message: "Failed to fetch exits analytics",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get("/api/funding-rounds/ma-deals", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5000; // Increased from 50 to 5000 for better analytics
      const offset = parseInt(req.query.offset as string) || 0;
      const { search, acquirer, minValue, year } = req.query;

      const filters = {
        search: search as string,
        acquirer: acquirer as string,
        minValue: minValue as string,
        year: year as string,
      };

      const maDeals = await storage.getFundingRoundsMaDeals(
        limit,
        offset,
        filters,
      );
      res.json(maDeals);
    } catch (error) {
      console.error("Error in /api/funding-rounds/ma-deals:", error);
      res.status(500).json({ message: "Failed to fetch M&A deals" });
    }
  });

  app.get("/api/funding-rounds/ma-deals/count", async (req, res) => {
    try {
      const { search, acquirer, minValue, year } = req.query;

      const filters = {
        search: search as string,
        acquirer: acquirer as string,
        minValue: minValue as string,
        year: year as string,
      };

      const count = await storage.getFundingRoundsMaDealsCount(filters);
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/funding-rounds/ma-deals/count:", error);
      res.status(500).json({ message: "Failed to fetch M&A deals count" });
    }
  });

  app.get("/api/funding-rounds/ma-deals/analytics", async (req, res) => {
    try {
      const { search, acquirer, minValue, year, industry } = req.query;

      const filters = {
        search: search as string,
        acquirer: acquirer as string,
        minValue: minValue as string,
        year: year as string,
        industry: industry as string,
      };

      // Fetch all M&A deals data for analytics (bypass pagination)

      let allData;
      try {
        allData = await storage.getMADeals(50000, 0, filters); // Use high limit for analytics

      } catch (error) {
        console.error("Error fetching M&A deals for analytics:", error);
        allData = [];
      }

      // Aggregate data for analytics
      const industryMap = new Map<string, number>();
      const acquirerMap = new Map<string, number>();
      const yearMap = new Map<string, number>();
      const minValueMap = new Map<string, number>();

      allData.forEach((deal: any) => {
        // Count by industry (check both companyInfo.industry and mainCategory)
        if (deal.companyInfo?.industry) {
          const industry = deal.companyInfo.industry.trim();
          if (industry) {
            industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
          }
        } else if (deal.mainCategory) {
          const industry = deal.mainCategory.trim();
          if (industry) {
            industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
          }
        }

        // Count by acquirer
        if (deal.acquiredBy) {
          const acquirer = deal.acquiredBy.trim();
          if (acquirer) {
            acquirerMap.set(acquirer, (acquirerMap.get(acquirer) || 0) + 1);
          }
        }

        // Count by year
        if (deal.dateSeen) {
          const year = new Date(deal.dateSeen).getFullYear().toString();
          if (year && year !== "NaN") {
            yearMap.set(year, (yearMap.get(year) || 0) + 1);
          }
        }

        // Count by deal size ranges (for min value filter)
        const dealValue = parseFloat(deal.dealValue) || 0;
        let valueRange = "Unknown";
        if (dealValue >= 50000) valueRange = "$50B+";
        else if (dealValue >= 10000) valueRange = "$10B+";
        else if (dealValue >= 5000) valueRange = "$5B+";
        else if (dealValue >= 1000) valueRange = "1B+";
        else if (dealValue >= 500) valueRange = "500M+";
        else if (dealValue >= 100) valueRange = "100M+";
        minValueMap.set(valueRange, (minValueMap.get(valueRange) || 0) + 1);
      });

      // Convert maps to sorted arrays
      const industries = Array.from(industryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const acquirers = Array.from(acquirerMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const years = Array.from(yearMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name));

      const dealSizeRanges = Array.from(minValueMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      console.log(
        "M&A deals analytics processed - Industries:",
        industries.length,
        "Acquirers:",
        acquirers.length,
      );

      res.json({
        industries,
        acquirers,
        years,
        dealSizeRanges,
        totalRecords: allData.length,
      });
    } catch (error) {
      console.error("Error in /api/funding-rounds/ma-deals/analytics:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : error,
      );
      res.status(500).json({
        message: "Failed to fetch M&A deals analytics",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get("/api/funding-rounds/megadeals", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const {
        search,
        acquirer,
        acquirerCountry,
        acquiredEntity,
        acquiredCountry,
        minValue,
        year,
        rank,
        transactionType,
      } = req.query;

      const filters = {
        search: search as string,
        acquirer: acquirer as string,
        acquirerCountry: acquirerCountry as string,
        acquiredEntity: acquiredEntity as string,
        acquiredCountry: acquiredCountry as string,
        minValue: minValue as string,
        year: year as string,
        rank: rank as string,
        transactionType: transactionType as string,
      };

      const megadeals = await storage.getFundingRoundsMegadeals(
        limit,
        offset,
        filters,
      );
      res.json(megadeals);
    } catch (error) {
      console.error("Error in /api/funding-rounds/megadeals:", error);
      res.status(500).json({ message: "Failed to fetch megadeals" });
    }
  });

  app.get("/api/funding-rounds/megadeals/count", async (req, res) => {
    try {
      const {
        search,
        acquirer,
        acquirerCountry,
        acquiredEntity,
        acquiredCountry,
        minValue,
        year,
        rank,
        transactionType,
      } = req.query;

      const filters = {
        search: search as string,
        acquirer: acquirer as string,
        acquirerCountry: acquirerCountry as string,
        acquiredEntity: acquiredEntity as string,
        acquiredCountry: acquiredCountry as string,
        minValue: minValue as string,
        year: year as string,
        rank: rank as string,
        transactionType: transactionType as string,
      };

      const count = await storage.getFundingRoundsMegadealsCount(filters);
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/funding-rounds/megadeals/count:", error);
      res.status(500).json({ message: "Failed to fetch megadeals count" });
    }
  });

  app.get("/api/funding-rounds/us-sfd-23/count", async (req, res) => {
    try {
      const { search, industry, minAmount, valuation, year, leadInvestor } =
        req.query;

      const filters = {
        search: search as string,
        industry: industry as string,
        minAmount: minAmount as string,
        valuation: valuation as string,
        year: year as string,
        leadInvestor: leadInvestor as string,
      };

      const count = await storage.getFundingRoundsUsSfd23Count(filters);
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/funding-rounds/us-sfd-23/count:", error);
      res.status(500).json({ message: "Failed to fetch US SFD 2023 count" });
    }
  });

  // US SFD 2023 analytics endpoint - fetch all data for charts
  app.get("/api/funding-rounds/us-sfd-23/analytics", async (req, res) => {
    try {
      const { search, industry, minAmount, valuation, leadInvestor } =
        req.query;
      const filters = {
        search: search as string,
        industry: industry as string,
        minAmount: minAmount as string,
        valuation: valuation as string,
        leadInvestor: leadInvestor as string,
      };

      // Get ALL US SFD 2023 data for analytics using pagination to bypass Supabase limits
      let allData: any[] = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const batch = await storage.getFundingRoundsUsSfd23(
          batchSize,
          offset,
          filters,
        );
        if (batch.length === 0) {
          hasMore = false;
        } else {
          allData = allData.concat(batch);
          offset += batchSize;

          // Safety check to prevent infinite loops
          if (offset > 10000) {
            hasMore = false;
          }
        }
      }


      // Process data for charts
      const industryMap = new Map<string, number>();
      const leadInvestorMap = new Map<string, number>();
      const amountRangeMap = new Map<string, number>();
      const valuationRangeMap = new Map<string, number>();
      const topCompanies: Array<{
        company: string;
        amount: number;
        valuation?: number;
      }> = [];

      allData.forEach((item) => {
        // Industries
        const industry = item.industry || "Other";
        industryMap.set(industry, (industryMap.get(industry) || 0) + 1);

        // Lead investors - extract first investor for chart
        if (item.leadInvestors) {
          const firstInvestor = item.leadInvestors.split(",")[0].trim();
          leadInvestorMap.set(
            firstInvestor,
            (leadInvestorMap.get(firstInvestor) || 0) + 1,
          );
        }

        // Amount ranges (in millions)
        if (item.amount) {
          const amount = parseFloat(item.amount) / 1000000; // Convert to millions
          let range = "Unknown";
          if (amount >= 1000) range = "$1B+";
          else if (amount >= 500) range = "$500M - $1B";
          else if (amount >= 100) range = "$100M - $500M";
          else if (amount >= 50) range = "$50M - $100M";
          else if (amount >= 10) range = "$10M - $50M";
          else if (amount >= 1) range = "$1M - $10M";
          else range = "< $1M";

          amountRangeMap.set(range, (amountRangeMap.get(range) || 0) + 1);
        }

        // Valuation ranges (in millions)
        if (item.valuation) {
          const valuation = parseFloat(item.valuation) / 1000000; // Convert to millions
          let range = "Unknown";
          if (valuation >= 10000) range = "$10B+";
          else if (valuation >= 5000) range = "$5B - $10B";
          else if (valuation >= 1000) range = "$1B - $5B";
          else if (valuation >= 500) range = "$500M - $1B";
          else if (valuation >= 100) range = "$100M - $500M";
          else if (valuation >= 50) range = "$50M - $100M";
          else if (valuation >= 10) range = "$10M - $50M";
          else range = "< $10M";

          valuationRangeMap.set(range, (valuationRangeMap.get(range) || 0) + 1);
        }

        // Collect top companies by amount
        if (item.amount) {
          topCompanies.push({
            company: item.company,
            amount: parseFloat(item.amount),
            valuation: item.valuation ? parseFloat(item.valuation) : undefined,
          });
        }
      });

      // Sort and format data for charts
      const industries = Array.from(industryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const leadInvestors = Array.from(leadInvestorMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15); // Top 15 investors

      const amountRanges = Array.from(amountRangeMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const valuationRanges = Array.from(valuationRangeMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Top 20 companies by funding amount
      const topCompaniesByAmount = topCompanies
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 20)
        .map((item) => ({
          company: item.company,
          amount: Math.round(item.amount / 1000000), // Convert to millions for display
          valuation: item.valuation
            ? Math.round(item.valuation / 1000000)
            : undefined,
        }));

      console.log(
        "US SFD 2023 analytics processed - Industries:",
        industries.length,
        "Lead Investors:",
        leadInvestors.length,
      );

      const analyticsData = {
        industries,
        leadInvestors,
        amountRanges,
        valuationRanges,
        topCompanies: topCompaniesByAmount,
        totalRecords: allData.length,
      };

      res.json(analyticsData);
    } catch (error) {
      console.error("Error in /api/funding-rounds/us-sfd-23/analytics:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : error,
      );
      res.status(500).json({
        message: "Failed to fetch US SFD 2023 analytics",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get("/api/funding-rounds/us-sfd-23", async (req, res) => {
    try {
      const {
        search,
        industry,
        minAmount,
        valuation,
        year,
        leadInvestor,
        limit = "25",
        page = "1",
      } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        industry: industry as string,
        minAmount: minAmount as string,
        valuation: valuation as string,
        year: year as string,
        leadInvestor: leadInvestor as string,
      };

      const fundingRounds = await storage.getFundingRoundsUsSfd23(
        limitNum,
        offset,
        filters,
      );
      res.json(fundingRounds);
    } catch (error) {
      console.error("Error in /api/funding-rounds/us-sfd-23:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch US funding rounds 2023" });
    }
  });

  app.get("/api/funding-rounds/us-sfd-24", async (req, res) => {
    try {
      const {
        search,
        industry,
        minAmount,
        year,
        leadInvestor,
        limit = "25",
        page = "1",
      } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        industry: industry as string,
        minAmount: minAmount as string,
        year: year as string,
        leadInvestor: leadInvestor as string,
      };

      const fundingRounds = await storage.getFundingRoundsUsSfd24(
        limitNum,
        offset,
        filters,
      );
      res.json(fundingRounds);
    } catch (error) {
      console.error("Error in /api/funding-rounds/us-sfd-24:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch US funding rounds 2024" });
    }
  });

  app.get("/api/funding-rounds/us-sfd-24/count", async (req, res) => {
    try {
      const { search, industry, minAmount, year, leadInvestor } = req.query;

      const filters = {
        search: search as string,
        industry: industry as string,
        minAmount: minAmount as string,
        year: year as string,
        leadInvestor: leadInvestor as string,
      };

      const count = await storage.getFundingRoundsUsSfd24Count(filters);
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/funding-rounds/us-sfd-24/count:", error);
      res.status(500).json({ message: "Failed to fetch US SFD 2024 count" });
    }
  });

  // US SFD 2024 analytics endpoint - fetch all data for charts
  app.get("/api/funding-rounds/us-sfd-24/analytics", async (req, res) => {
    try {
      const { search, industry, minAmount, year, leadInvestor } = req.query;
      const filters = {
        search: search as string,
        industry: industry as string,
        minAmount: minAmount as string,
        year: year as string,
        leadInvestor: leadInvestor as string,
      };

      console.log("US SFD 2024 analytics request with filters:", filters);

      // Get ALL US SFD 2024 data for analytics using pagination to bypass Supabase limits
      console.log(
        "Fetching all US SFD 2024 data for analytics using pagination...",
      );
      let allData: any[] = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const batch = await storage.getFundingRoundsUsSfd24(
          batchSize,
          offset,
          filters,
        );
        if (batch.length === 0) {
          hasMore = false;
        } else {
          allData = allData.concat(batch);
          offset += batchSize;
          console.log(
            `Fetched US SFD 2024 batch ${Math.floor(offset / batchSize)}: ${batch.length} records, total: ${allData.length}`,
          );

          // Safety check to prevent infinite loops
          if (offset > 10000) {
            console.warn(
              "US SFD 2024 analytics: Reached safety limit of 10000 records",
            );
            break;
          }
        }
      }

      console.log(
        "US SFD 2024 analytics data fetched - total records:",
        allData.length,
      );

      // Process data for charts
      const industryMap = new Map();
      const leadInvestorMap = new Map();
      const amountRangeMap = new Map();
      const topCompanies: any[] = [];

      // Process each record
      allData.forEach((item: any) => {
        // Count industries
        if (item.industry) {
          industryMap.set(
            item.industry,
            (industryMap.get(item.industry) || 0) + 1,
          );
        }

        // Count lead investors
        if (item.leadInvestors) {
          const investors = item.leadInvestors.split(",");
          investors.forEach((investor: string) => {
            const cleanInvestor = investor.trim();
            if (cleanInvestor) {
              leadInvestorMap.set(
                cleanInvestor,
                (leadInvestorMap.get(cleanInvestor) || 0) + 1,
              );
            }
          });
        }

        // Categorize by amount range
        if (item.amount) {
          const amountNum = parseFloat(item.amount);
          let range = "Unknown";

          if (amountNum < 1) range = "< $1M";
          else if (amountNum < 10) range = "$1M - $10M";
          else if (amountNum < 50) range = "$10M - $50M";
          else if (amountNum < 100) range = "$50M - $100M";
          else if (amountNum < 500) range = "$100M - $500M";
          else range = "$500M+";

          amountRangeMap.set(range, (amountRangeMap.get(range) || 0) + 1);
        }

        // Collect top companies by amount
        if (item.amount) {
          topCompanies.push({
            company: item.company,
            amount: parseFloat(item.amount),
          });
        }
      });

      // Sort and format data for charts
      const industries = Array.from(industryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const leadInvestors = Array.from(leadInvestorMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15); // Top 15 investors

      const amountRanges = Array.from(amountRangeMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Top 20 companies by funding amount
      const topCompaniesByAmount = topCompanies
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 20)
        .map((item) => ({
          company: item.company,
          amount: Math.round(item.amount / 1000000), // Convert to millions for display
        }));

      console.log(
        "US SFD 2024 analytics processed - Industries:",
        industries.length,
        "Lead Investors:",
        leadInvestors.length,
      );

      const analyticsData = {
        industries,
        leadInvestors,
        amountRanges,
        topCompanies: topCompaniesByAmount,
        totalRecords: allData.length,
      };

      res.json(analyticsData);
    } catch (error) {
      console.error("Error in /api/funding-rounds/us-sfd-24/analytics:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : error,
      );
      res.status(500).json({
        message: "Failed to fetch US SFD 2024 analytics",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Live funding routes
  app.get("/api/funding-rounds/live", async (req, res) => {
    try {
      const {
        search,
        roundType,
        country,
        mainCategory,
        currency,
        teamSize,
        industry,
        minAmount,
        year,
        limit = "50",
        page = "1",
      } = req.query;
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        roundType: roundType as string,
        country: country as string,
        mainCategory: mainCategory as string,
        currency: currency as string,
        teamSize: teamSize as string,
        industry: industry as string,
        minAmount: minAmount as string,
        year: year as string,
      };

      const liveFunding = await storage.getLiveFunding(
        limitNum,
        offset,
        filters,
      );
      res.json(liveFunding);
    } catch (error) {
      console.error("Error in /api/funding-rounds/live:", error);
      res.status(500).json({ message: "Failed to fetch live funding" });
    }
  });

  app.get("/api/funding-rounds/live/analytics", async (req, res) => {
    try {
      const {
        search,
        roundType,
        country,
        mainCategory,
        currency,
        teamSize,
        industry,
        minAmount,
        year,
      } = req.query;

      const { data, error } = await supabaseAdmin.rpc(
        "get_live_funding_analytics",
        {
          search: search !== "all" ? search : null,
          roundtype: roundType !== "all" ? roundType : null,
          country: country !== "all" ? country : null,
          maincategory: mainCategory !== "all" ? mainCategory : null,
          currency: currency !== "all" ? currency : null,
          teamsize: teamSize !== "all" ? teamSize : null,
          industry: industry !== "all" ? industry : null,
          minamount: minAmount !== "all" ? Number(minAmount) : null,
          year: year !== "all" ? Number(year) : null,
        },
      );

      if (error) throw error;
      res.json(data || {});
    } catch (error) {
      console.error("Error in /api/funding-rounds/live/analytics:", error);
      res.status(500).json({
        message: "Failed to fetch live funding analytics",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get("/api/funding-rounds/live/count", async (req, res) => {
    try {
      const {
        search,
        roundType,
        country,
        mainCategory,
        currency,
        teamSize,
        industry,
        minAmount,
        year,
      } = req.query;
      const filters = {
        search: search as string,
        roundType: roundType as string,
        country: country as string,
        mainCategory: mainCategory as string,
        currency: currency as string,
        teamSize: teamSize as string,
        industry: industry as string,
        minAmount: minAmount as string,
        year: year as string,
      };

      const count = await storage.getLiveFundingCount(filters);
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/funding-rounds/live/count:", error);
      res.status(500).json({ message: "Failed to fetch live funding count" });
    }
  });

  // Investor routes - removed duplicate, using page-based pagination below

  app.get("/api/investors/contacts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const { search, type, location } = req.query;

      const filters = {
        search: search as string,
        type: type as string,
        location: location as string,
      };

      const contacts = await storage.getInvestorContacts(
        limit,
        offset,
        filters,
      );
      res.json(contacts);
    } catch (error) {
      console.error("Error in /api/investors/contacts:", error);
      res.status(500).json({ message: "Failed to fetch investor contacts" });
    }
  });

  app.get("/api/investors/count", async (req, res) => {
    try {
      const { search, type, location, investmentRange, sweetSpot } = req.query;

      const filters = {
        search: search as string,
        type: type as string,
        location: location as string,
        investmentRange: investmentRange as string,
        sweetSpot: sweetSpot as string,
      };

      const count = await storage.getInvestorsCount(filters);
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/investors/count:", error);
      res.status(500).json({ message: "Failed to fetch investors count" });
    }
  });

  app.get("/api/investors/contacts/count", async (req, res) => {
    try {
      const { search, type, location } = req.query;

      const filters = {
        search: search as string,
        type: type as string,
        location: location as string,
      };

      const count = await storage.getInvestorContactsCount(filters);
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/investors/contacts/count:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch investor contacts count" });
    }
  });

  // Charts endpoint for investor contacts - returns all data for analytics
  app.get("/api/investors/contacts/charts", async (req, res) => {
    try {
      const { search, type, location } = req.query;

      const filters = {
        search: search as string,
        type: type as string,
        location: location as string,
      };

      // Fetch all contacts without limit for charts (up to 50,000)
      const contacts = await storage.getInvestorContacts(50000, 0, filters);
      res.json(contacts);
    } catch (error) {
      console.error("Error in /api/investors/contacts/charts:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch investor contacts for charts" });
    }
  });

  // Dedicated analytics endpoint for Investors - fetches filtered data for chart synchronization
  app.get("/api/investors/analytics", async (req, res) => {
    try {
      console.log("req.query", req.query);
      const { search, type, location, investmentRange, sweetSpot } = req.query;

      console.log("filters 222", search, type, location, investmentRange, sweetSpot);
      const filters = {
        search: search as string,
        type: type as string,
        location: location as string,
        investmentRange: investmentRange as string,
        sweetSpot: sweetSpot as string,
      };

      // Create cache key based on filters
      const cacheKey = `investors_analytics_${JSON.stringify(filters)}`;
      
      // Check cache first
      const cached = getCachedAnalytics(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Use the comprehensive get_investor_analytics_working function
      const analyticsResult = await supabaseAdmin.rpc('get_investor_analytics_working', {
        search_term: filters.search || '',
        investor_type: filters.type || '',
        location_filter: filters.location || '',
        investment_range: filters.investmentRange || '',
        sweet_spot_filter: filters.sweetSpot || ''
      });

      console.log("analyticsResult", analyticsResult);

      if (analyticsResult.error) {
        console.error("Database function error:", analyticsResult.error);
        return res.status(500).json({ message: "Failed to fetch investor analytics" });
      }

      // Process the results to match the expected format
      const data = analyticsResult.data || [];
      
      // Group results by category
      const locations = data.filter((item: any) => item.category === 'location');
      const types = data.filter((item: any) => item.category === 'type');
      const sweetSpots = data.filter((item: any) => item.category === 'sweet_spot');
      const investmentRanges = data.filter((item: any) => item.category === 'investment_range');

      const result = {
        locations: locations.map((item: any) => ({ name: item.name, value: item.value })),
        types: types.map((item: any) => ({ name: item.name, value: item.value })),
        sweetSpots: sweetSpots.map((item: any) => ({ name: item.name, value: item.value })),
        investmentRanges: investmentRanges.map((item: any) => ({ name: item.name, value: item.value })),
        totalRecords: data.length
      };

      // Cache the result
      setCachedAnalytics(cacheKey, result);
      return res.json(result);
    } catch (error) {
      console.error("Error in /api/investors/analytics:", error);
      res.status(500).json({ message: "Failed to fetch investor analytics" });
    }
  });

  app.get("/api/investors", async (req, res) => {
    try {
      const {
        search,
        type,
        location,
        investmentRange,
        limit = "25",
        page = "1",
      } = req.query;
  
      const limitNum = parseInt(limit as string, 10) || 25;
      const pageNum = parseInt(page as string, 10) || 1;
      const offset = (pageNum - 1) * limitNum;
  
      // accept camelCase, snake_case, and plain
      const sweetSpotRaw = getFirstQueryValue(req, "sweetspot", "sweet_spot", "sweetSpot");
  
      // normalize numeric formats: remove commas, trim, handle percent-encoded dot etc.
      let sweetSpotNum: number | undefined = undefined;
      if (sweetSpotRaw !== undefined) {
        // remove commas and any non-numeric trailing characters except dot
        const cleaned = String(sweetSpotRaw).replace(/,/g, "");
        // attempt numeric parse
        const maybeNum = Number(cleaned);
        if (!Number.isNaN(maybeNum)) {
          sweetSpotNum = maybeNum;
        } else {
          // keep undefined and pass raw string if DB expects string comparisons
          console.warn("Could not parse sweetSpot as number, will pass raw:", sweetSpotRaw);
        }
      }
  
      // Build filters to pass to storage layer. Use string OR number depending on parse success.
      const filters: {
        search?: string;
        type?: string;
        location?: string;
        investmentRange?: string;
        sweetSpot?: string;
      } = {
        search: (search as string) || undefined,
        type: (type as string) || undefined,
        location: (location as string) || undefined,
        investmentRange: (investmentRange as string) || undefined,
        // always pass a string (so types match storage layer)
        sweetSpot:
          sweetSpotNum !== undefined && !Number.isNaN(sweetSpotNum)
            ? String(sweetSpotNum)
            : (sweetSpotRaw as string | undefined),
      };
      
  
      console.log("DEBUG /api/investors incoming request:", {
        url: req.originalUrl,
        client: req.headers["user-agent"],
        filters,
        limitNum,
        offset,
      });
  
      // TEMP debugging: uncomment to return parsed filters without hitting DB
      // return res.json({ debugFilters: filters, limitNum, offset, url: req.originalUrl });
  
      const investors = await storage.getInvestors(limitNum, offset, filters);
      res.json(investors);
    } catch (error) {
      console.error("Error in /api/investors:", error);
      res.status(500).json({ message: "Failed to fetch investors" });
    }
  });
  
  
  
  

  // Quick endpoint to get actual profile types
  app.get("/api/investors/profile-types", async (req, res) => {
    try {
      const investors = await storage.getInvestors(1000, 0, {});
      const profileCounts = new Map();
      investors.forEach((inv) => {
        if (inv.profile) {
          profileCounts.set(
            inv.profile,
            (profileCounts.get(inv.profile) || 0) + 1,
          );
        }
      });

      const profiles = Array.from(profileCounts.entries())
        .map(([profile, count]) => ({ profile, count }))
        .sort((a, b) => b.count - a.count);

      res.json({ profiles, totalChecked: investors.length });
    } catch (error) {
      console.error("Error in /api/investors/profile-types:", error);
      res.status(500).json({ message: "Failed to get profile types" });
    }
  });

  app.get("/api/investors/stats", async (req, res) => {
    try {
      const stats = await storage.getInvestorStats();
      res.json(stats);
    } catch (error) {
      console.error("Error in /api/investors/stats:", error);
      res.status(500).json({ message: "Failed to fetch investor stats" });
    }
  });

  // Debug endpoint to test stats calculation
  app.get("/api/investors/debug-stats", async (req, res) => {
    try {
      const [totalResult, vcResult, angelResult] = await Promise.all([
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

      res.json({
        total: totalResult.count || 0,
        vcFunds: vcResult.count || 0,
        angelInvestors: angelResult.count || 0,
        vcError: vcResult.error,
        angelError: angelResult.error,
      });
    } catch (error) {
      console.error("Error in /api/investors/debug-stats:", error);
      res.status(500).json({ message: "Failed to fetch debug stats" });
    }
  });

  // Debug endpoint to get all unique investor types
  app.get("/api/investors/types", async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("investor_contacts")
        .select("investor_type")
        .not("investor_type", "is", null);

      if (error) {
        console.error("Error fetching investor types:", error);
        return res
          .status(500)
          .json({ message: "Failed to fetch investor types" });
      }

      // Get unique types and their counts
      const typeCounts: { [key: string]: number } = {};
      data?.forEach((item: any) => {
        const type = item.investor_type;
        if (type) {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
      });

      const uniqueTypes = Object.keys(typeCounts).sort();

      res.json({
        types: uniqueTypes,
        typeCounts,
        totalTypes: uniqueTypes.length,
        totalRecords: data?.length || 0,
      });
    } catch (error) {
      console.error("Error in /api/investors/types:", error);
      res.status(500).json({ message: "Failed to fetch investor types" });
    }
  });

  // Debug endpoint to test database directly
  app.get("/api/debug/investors", async (req, res) => {
    try {
      console.log("Debug endpoint called");

      // Test direct database access
      const { data: investors, error: investorsError } = await supabaseAdmin
        .from("investors")
        .select("id, name, type")
        .limit(5);

      const { data: contacts, error: contactsError } = await supabaseAdmin
        .from("investor_contacts")
        .select("id, company_name, investor_type")
        .limit(5);

      const { count: investorsCount, error: countError } = await supabaseAdmin
        .from("investors")
        .select("*", { count: "exact", head: true });

      const { count: contactsCount, error: contactsCountError } =
        await supabaseAdmin
          .from("investor_contacts")
          .select("*", { count: "exact", head: true });

      res.json({
        investors: {
          data: investors,
          error: investorsError,
          count: investorsCount,
        },
        contacts: {
          data: contacts,
          error: contactsError,
          count: contactsCount,
        },
        errors: { countError, contactsCountError },
      });
    } catch (error) {
      console.error("Error in debug endpoint:", error);
      res
        .status(500)
        .json({ message: "Debug endpoint failed", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Debug endpoint to get unique investor types
  app.get("/api/investors/types", async (req, res) => {
    try {
      // Get a sample of contacts to see what types exist
      const contacts = await storage.getInvestorContacts(1000, 0);
      const uniqueTypes = Array.from(
        new Set(
          contacts.map((contact) => contact.investorType).filter(Boolean),
        ),
      );

      // Also get some sample data to see the actual values
      const sampleData = contacts.slice(0, 10).map((contact) => ({
        id: contact.id,
        companyName: contact.companyName,
        investorType: contact.investorType,
      }));

      res.json({
        types: uniqueTypes,
        sampleData: sampleData,
        totalContacts: contacts.length,
      });
    } catch (error) {
      console.error("Error in /api/investors/types:", error);
      res.status(500).json({ message: "Failed to fetch investor types" });
    }
  });

  // Debug endpoint to test "All Types" filter
  app.get("/api/investors/debug-all-types", async (req, res) => {
    try {
      // Test with no type filter (should be equivalent to "All Types")
      const allContacts = await storage.getInvestorContacts(50, 0);

      // Test with "Venture Capital" filter
      const vcContacts = await storage.getInvestorContacts(50, 0, {
        type: "Venture Capital",
      });

      // Test with "Angel" filter
      const angelContacts = await storage.getInvestorContacts(50, 0, {
        type: "Angel",
      });

      res.json({
        allTypesCount: allContacts.length,
        vcCount: vcContacts.length,
        angelCount: angelContacts.length,
        allTypesSample: allContacts.slice(0, 5).map((c) => ({
          id: c.id,
          companyName: c.companyName,
          investorType: c.investorType,
        })),
        vcSample: vcContacts.slice(0, 5).map((c) => ({
          id: c.id,
          companyName: c.companyName,
          investorType: c.investorType,
        })),
        angelSample: angelContacts.slice(0, 5).map((c) => ({
          id: c.id,
          companyName: c.companyName,
          investorType: c.investorType,
        })),
      });
    } catch (error) {
      console.error("Error in /api/investors/debug-all-types:", error);
      res.status(500).json({ message: "Failed to debug all types" });
    }
  });

  app.get("/api/investors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const investor = await storage.getInvestorById(id);
      if (!investor) {
        return res.status(404).json({ message: "Investor not found" });
      }
      res.json(investor);
    } catch (error) {
      console.error("Error in /api/investors/:id:", error);
      res.status(500).json({ message: "Failed to fetch investor" });
    }
  });

  app.get("/api/investor-contacts/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const contact = await storage.getInvestorContactById(id);
      if (!contact) {
        return res.status(404).json({ message: "Investor contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error in /api/investor-contacts/:id:", error);
      res.status(500).json({ message: "Failed to fetch investor contact" });
    }
  });

  // News API routes - integrating NewsAPI.org and MarketAux
  app.get("/api/news", async (req, res) => {
    try {
      const {
        search = "",
        category = "all",
        source = "all",
        limit = "12",
        offset = "0",
      } = req.query;

      const searchTerm = typeof search === "string" ? search : "";
      const categoryFilter = typeof category === "string" ? category : "all";
      const sourceFilter = typeof source === "string" ? source : "all";
      const limitNum = parseInt(typeof limit === "string" ? limit : "12");
      const offsetNum = parseInt(typeof offset === "string" ? offset : "0");

      // Prepare search terms for startup-related content
      const startupKeywords =
        searchTerm ||
        "startup OR venture capital OR funding OR IPO OR acquisition OR fintech OR SaaS OR tech company";

      const articles: any[] = [];

      // Fetch from NewsAPI.org
      try {
        const newsApiUrl = new URL("https://newsapi.org/v2/everything");
        newsApiUrl.searchParams.set("q", startupKeywords);
        newsApiUrl.searchParams.set("language", "en");
        newsApiUrl.searchParams.set("sortBy", "publishedAt");
        newsApiUrl.searchParams.set("pageSize", "100");
        newsApiUrl.searchParams.set("page", "1");

        // Try to get news from last 7 days to get as recent as possible
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7);
        newsApiUrl.searchParams.set(
          "from",
          fromDate.toISOString().split("T")[0],
        );

        // Filter by category if specified
        if (categoryFilter !== "all") {
          if (categoryFilter === "Funding") {
            newsApiUrl.searchParams.set(
              "q",
              `${startupKeywords} AND (funding OR investment OR round OR capital)`,
            );
          } else if (categoryFilter === "M&A") {
            newsApiUrl.searchParams.set(
              "q",
              `${startupKeywords} AND (acquisition OR merger OR M&A OR buyout)`,
            );
          } else if (categoryFilter === "Market Analysis") {
            newsApiUrl.searchParams.set(
              "q",
              `${startupKeywords} AND (market OR analysis OR trends OR report)`,
            );
          }
        }

        const newsApiResponse = await fetch(newsApiUrl.toString(), {
          headers: {
            "X-API-Key": process.env.NEWSAPI_API_KEY || "",
          },
        });

        if (newsApiResponse.ok) {
          const newsApiData = await newsApiResponse.json();
          const newsApiArticles =
            newsApiData.articles
              ?.filter(
                (article: any) =>
                  article.title &&
                  article.description &&
                  !article.title.includes("[Removed]") &&
                  !article.description.includes("[Removed]"),
              )
              .map((article: any, index: number) => ({
                id: `newsapi_${Date.now()}_${index}`,
                title: article.title,
                summary: article.description || "",
                category: categorizeArticle(
                  article.title,
                  article.description || "",
                ),
                publishedAt: article.publishedAt,
                source: article.source?.name || "NewsAPI",
                url: article.url,
                tags: extractTags(article.title, article.description || ""),
                readTime: Math.max(
                  1,
                  Math.ceil((article.description?.length || 500) / 200),
                ),
                imageUrl:
                  article.urlToImage && article.urlToImage.startsWith("http")
                    ? article.urlToImage
                    : null,
              })) || [];

          articles.push(...newsApiArticles);
        }
      } catch (error) {
        console.error("NewsAPI fetch error:", error);
      }

      // Fetch from MarketAux
      try {
        const marketAuxUrl = new URL("https://api.marketaux.com/v1/news/all");
        marketAuxUrl.searchParams.set(
          "api_token",
          process.env.MARKETAUX_API_KEY || "",
        );
        marketAuxUrl.searchParams.set("limit", "50");
        marketAuxUrl.searchParams.set("page", "1");
        marketAuxUrl.searchParams.set("filter_entities", "true");
        marketAuxUrl.searchParams.set("language", "en");

        // Add search terms
        marketAuxUrl.searchParams.set(
          "search",
          searchTerm || "startup OR venture capital OR funding OR fintech",
        );

        const marketAuxResponse = await fetch(marketAuxUrl.toString());

        if (marketAuxResponse.ok) {
          const marketAuxData = await marketAuxResponse.json();
          const marketAuxArticles =
            marketAuxData.data
              ?.filter((article: any) => article.title && article.description)
              .map((article: any, index: number) => ({
                id: `marketaux_${Date.now()}_${index}`,
                title: article.title,
                summary: article.description || article.snippet || "",
                category: categorizeArticle(
                  article.title,
                  article.description || "",
                ),
                publishedAt: article.published_at,
                source: article.source || "MarketAux",
                url: article.url,
                tags: article.keywords
                  ? article.keywords.split(",").slice(0, 5)
                  : extractTags(article.title, article.description || ""),
                readTime: Math.max(
                  1,
                  Math.ceil((article.description?.length || 500) / 200),
                ),
                imageUrl:
                  article.image_url && article.image_url.startsWith("http")
                    ? article.image_url
                    : null,
              })) || [];

          articles.push(...marketAuxArticles);
        }
      } catch (error) {
        console.error("MarketAux fetch error:", error);
      }

      // Sort by publish date and apply filters
      let filteredArticles = articles
        .filter((article) => article.title && article.summary)
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime(),
        );

      // Apply source filter with improved matching logic
      if (sourceFilter !== "all") {
        filteredArticles = filteredArticles.filter((article) => {
          const articleSource = article.source.toLowerCase();
          const filterSource = sourceFilter.toLowerCase();

          // Exact match or partial match in both directions
          return (
            articleSource === filterSource ||
            articleSource.includes(filterSource) ||
            filterSource.includes(articleSource)
          );
        });
      }

      // Apply category filter
      if (categoryFilter !== "all") {
        filteredArticles = filteredArticles.filter(
          (article) =>
            article.category.toLowerCase() === categoryFilter.toLowerCase(),
        );
      }

      // Apply pagination
      const paginatedArticles = filteredArticles.slice(
        offsetNum,
        offsetNum + limitNum,
      );

      res.json({
        articles: paginatedArticles,
        total: filteredArticles.length,
        page: Math.floor(offsetNum / limitNum) + 1,
        limit: limitNum,
      });
    } catch (error) {
      console.error("Error in /api/news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get("/api/news/stats", async (req, res) => {
    try {
      // Fetch recent articles for stats
      const stats = {
        totalArticles: 0,
        fundingNews: 0,
        maDeals: 0,
        sources: 0,
      };

      // Get stats from NewsAPI
      try {
        const newsApiUrl = new URL("https://newsapi.org/v2/everything");
        newsApiUrl.searchParams.set(
          "q",
          "startup OR venture capital OR funding OR IPO OR acquisition OR fintech OR SaaS OR tech company",
        );
        newsApiUrl.searchParams.set("language", "en");
        newsApiUrl.searchParams.set("pageSize", "100");
        newsApiUrl.searchParams.set("sortBy", "publishedAt");

        // Try to get news from last 7 days to get as recent as possible
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7);
        newsApiUrl.searchParams.set(
          "from",
          fromDate.toISOString().split("T")[0],
        );

        const newsApiResponse = await fetch(newsApiUrl.toString(), {
          headers: {
            "X-API-Key": process.env.NEWSAPI_API_KEY || "",
          },
        });

        if (newsApiResponse.ok) {
          const newsApiData = await newsApiResponse.json();
          const articles = newsApiData.articles || [];

          // Count actual available filtered articles
          const filteredArticles = articles.filter(
            (article: any) =>
              article.title &&
              article.description &&
              !article.title.includes("[Removed]") &&
              !article.description.includes("[Removed]"),
          );
          stats.totalArticles += filteredArticles.length;

          // Count funding and M&A articles from filtered set
          stats.fundingNews += filteredArticles.filter(
            (article: any) =>
              (article.title + " " + article.description)
                .toLowerCase()
                .includes("funding") ||
              (article.title + " " + article.description)
                .toLowerCase()
                .includes("investment") ||
              (article.title + " " + article.description)
                .toLowerCase()
                .includes("round"),
          ).length;

          stats.maDeals += filteredArticles.filter(
            (article: any) =>
              (article.title + " " + article.description)
                .toLowerCase()
                .includes("acquisition") ||
              (article.title + " " + article.description)
                .toLowerCase()
                .includes("merger") ||
              (article.title + " " + article.description)
                .toLowerCase()
                .includes("buyout"),
          ).length;

          // Count unique sources
          const sources = new Set(
            articles
              .map((article: any) => article.source?.name)
              .filter(Boolean),
          );
          stats.sources += sources.size;
        }
      } catch (error) {
        console.error("NewsAPI stats error:", error);
      }

      // Get stats from MarketAux
      try {
        const marketAuxUrl = new URL("https://api.marketaux.com/v1/news/all");
        marketAuxUrl.searchParams.set(
          "api_token",
          process.env.MARKETAUX_API_KEY || "",
        );
        marketAuxUrl.searchParams.set("limit", "50");
        marketAuxUrl.searchParams.set("search", "startup OR venture capital");
        marketAuxUrl.searchParams.set("filter_entities", "true");

        const marketAuxResponse = await fetch(marketAuxUrl.toString());

        if (marketAuxResponse.ok) {
          const marketAuxData = await marketAuxResponse.json();
          const articles = marketAuxData.data || [];

          // Count actual filtered articles
          const filteredArticles = articles.filter(
            (article: any) => article.title && article.description,
          );
          stats.totalArticles += filteredArticles.length;

          stats.fundingNews += filteredArticles.filter(
            (article: any) =>
              (article.title + " " + article.description)
                .toLowerCase()
                .includes("funding") ||
              (article.title + " " + article.description)
                .toLowerCase()
                .includes("investment"),
          ).length;

          stats.maDeals += filteredArticles.filter(
            (article: any) =>
              (article.title + " " + article.description)
                .toLowerCase()
                .includes("acquisition") ||
              (article.title + " " + article.description)
                .toLowerCase()
                .includes("merger"),
          ).length;

          // Count additional sources
          const sources = new Set(
            filteredArticles
              .map((article: any) => article.source)
              .filter(Boolean),
          );
          stats.sources += sources.size;
        }
      } catch (error) {
        console.error("MarketAux stats error:", error);
      }

      res.json(stats);
    } catch (error) {
      console.error("Error in /api/news/stats:", error);
      res.status(500).json({
        totalArticles: 0,
        fundingNews: 0,
        maDeals: 0,
        sources: 0,
      });
    }
  });

  // M&A deals from m_a table
  app.get("/api/ma-deals", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5000; // Increased from 50 to 5000 for better analytics
      const offset = parseInt(req.query.offset as string) || 0;
      const filters = {
        search: req.query.search as string,
        mainCategory: req.query.mainCategory as string,
        year: req.query.year as string,
        acquirer: req.query.acquirer as string,
        industry: req.query.industry as string,
        minValue: req.query.minValue as string,
      };
      const deals = await storage.getMADeals(limit, offset, filters);
      res.json(deals);
    } catch (error) {
      console.error("Error in /api/ma-deals:", error);
      res.status(500).json({ message: "Failed to fetch M&A deals" });
    }
  });

  app.get("/api/ma-deals/count", async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        mainCategory: req.query.mainCategory as string,
        year: req.query.year as string,
        acquirer: req.query.acquirer as string,
        industry: req.query.industry as string,
        minValue: req.query.minValue as string,
      };
      const count = await storage.getMADealsCount(filters);
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/ma-deals/count:", error);
      res.status(500).json({ message: "Failed to fetch M&A deals count" });
    }
  });

  app.get("/api/debug/test-counts", async (req, res) => {
    try {
      // Test simple count queries
      const [totalCount, vcCount, angelCount] = await Promise.all([
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

      res.json({
        totalCount: totalCount.count,
        vcCount: vcCount.count,
        angelCount: angelCount.count,
        totalError: totalCount.error,
        vcError: vcCount.error,
        angelError: angelCount.error,
      });
    } catch (error) {
      console.error("Error in test counts:", error);
      res.status(500).json({ error: "Failed to test counts" });
    }
  });

  // Debug endpoint to test Companies API directly
  app.get("/api/companies/external/debug", async (req, res) => {
    try {
      const { prompt = "apple" } = req.query;
      const COMPANIES_API_TOKEN = process.env.COMPANIES_API_TOKEN;

      if (!COMPANIES_API_TOKEN) {
        return res.status(503).json({
          message: "Companies API token not configured",
          success: false,
        });
      }

      const searchUrl = new URL(
        "https://api.thecompaniesapi.com/v2/companies/by-prompt",
      );
      searchUrl.searchParams.set("token", COMPANIES_API_TOKEN);
      searchUrl.searchParams.set("prompt", prompt.toString());
      searchUrl.searchParams.set("page", "1");
      searchUrl.searchParams.set("page_size", "2");

      const response = await fetch(searchUrl.toString());
      const rawData = await response.text();

      return res.json({
        url: searchUrl.toString().replace(COMPANIES_API_TOKEN, "***TOKEN***"),
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        rawResponse: rawData,
        parsedData: (() => {
          try {
            return JSON.parse(rawData);
          } catch {
            return "Failed to parse JSON";
          }
        })(),
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Advanced Companies API integration with conditions support
  app.get("/api/companies/external/conditions", async (req, res) => {
    try {
      const {
        conditions,
        page = 1,
        pageSize = 20,
        sortKey,
        sortOrder,
      } = req.query;

      let parsedConditions = [];
      if (conditions && typeof conditions === "string") {
        try {
          parsedConditions = JSON.parse(conditions);
        } catch (error) {
          return res.status(400).json({
            message: "Invalid conditions format",
            success: false,
          });
        }
      }

      if (!parsedConditions || parsedConditions.length === 0) {
        return res.status(400).json({
          message: "At least one search condition is required",
          success: false,
        });
      }

      const COMPANIES_API_TOKEN = process.env.COMPANIES_API_TOKEN;
      if (!COMPANIES_API_TOKEN) {
        return res.status(503).json({
          message: "Companies API token not configured",
          success: false,
        });
      }

      // Use the standard API with query parameter for conditions-based search
      const searchUrl = new URL("https://api.thecompaniesapi.com/v2/companies");
      searchUrl.searchParams.set("token", COMPANIES_API_TOKEN);
      searchUrl.searchParams.set("query", JSON.stringify(parsedConditions));
      searchUrl.searchParams.set("page", page.toString());
      searchUrl.searchParams.set("size", pageSize.toString());

      // Add sorting parameters if available
      if (sortKey) {
        searchUrl.searchParams.set("sortKey", sortKey as string);
      }
      if (sortOrder) {
        searchUrl.searchParams.set("sortOrder", sortOrder as string);
      }


      const response = await fetch(searchUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "MarketIntelligencePlatform/1.0",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Companies API error:", response.status, errorText);
        return res.status(response.status).json({
          message: `Companies API error: ${response.status}`,
          success: false,
        });
      }

      const data = await response.json();

      // If API returns empty or malformed data, provide meaningful error
      if (
        !data.companies ||
        !Array.isArray(data.companies) ||
        data.companies.length === 0
      ) {
        return res.status(404).json({
          message:
            "No companies found matching your conditions. Try adjusting your filters.",
          success: false,
          conditions: parsedConditions,
        });
      }

      // Transform the API response to match our interface using correct field structure
      const transformedData = {
        companies: data.companies.map((company: any, index: number) => {
          // Extract data from the nested structure based on actual API response
          const about = company.about || {};
          const analytics = company.analytics || {};
          const locations = company.locations?.headquarters || {};
          const assets = company.assets || {};
          const descriptions = company.descriptions || {};
          const socials = company.socials || {};
          const domain = company.domain || {};
          const meta = company.meta || {};
          const technologies = company.technologies || [];

          return {
            id:
              meta.mysqlId?.toString() ||
              domain.domain ||
              `api-company-${Date.now()}-${index}`,
            name: about.name || domain.domainName || domain.domain || null,
            industries: Array.isArray(about.industries)
              ? about.industries
              : about.industry
                ? [about.industry]
                : [],
            totalEmployees: about.totalEmployees || null,
            revenue:
              company.finances?.revenue ||
              company.finances?.estimatedRevenue ||
              company.finances?.annualRevenue ||
              null,
            businessType: about.businessType || about.industry || null,
            monthlyVisitors: analytics.monthlyVisitors || null,
            country: locations.country?.name || null,
            city: locations.city?.name || null,
            yearFounded: about.yearFounded || null,
            socialNetwork: {
              linkedin: socials.linkedinUrl || null,
              twitter: socials.twitterUrl || null,
              facebook: socials.facebookUrl || null,
              website: domain.domain ? `https://${domain.domain}` : null,
            },
            technologies: Array.isArray(technologies)
              ? technologies
                  .map((tech: any) =>
                    typeof tech === "string"
                      ? tech
                      : tech.name || tech.technology || "Unknown",
                  )
                  .slice(0, 10)
              : [],
            application:
              descriptions.primary ||
              descriptions.short ||
              descriptions.long ||
              descriptions.tagline ||
              null,
            dataScore: meta.score || 0,
            lastSync: meta.syncedAt || new Date().toISOString(),
            logo: assets.logoSquare?.src || assets.cover?.src || null,
            description:
              descriptions.primary ||
              descriptions.short ||
              descriptions.long ||
              null,
            website: domain.domain ? `https://${domain.domain}` : null,
            status: domain.status === 200 ? "active" : "inactive",
            verified: true,
          };
        }),
        pagination: {
          page: parseInt(page.toString()),
          pageSize: parseInt(pageSize.toString()),
          total: data.total || data.companies.length,
          hasMore: data.hasMore !== undefined ? data.hasMore : false,
        },
        success: true,
        message: `Found ${data.companies.length} companies matching your conditions`,
      };

      res.json(transformedData);
    } catch (error) {
      console.error("Companies conditions API error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Companies API integration with enhanced sorting and conditions support
  app.get("/api/companies/external/search", async (req, res) => {
    try {
      const {
        prompt,
        page = 1,
        pageSize = 20,
        sortKey,
        sortOrder,
        conditions,
      } = req.query;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({
          message: "Prompt is required for company search",
          success: false,
        });
      }

      const COMPANIES_API_TOKEN = process.env.COMPANIES_API_TOKEN;
      if (!COMPANIES_API_TOKEN) {
        return res.status(503).json({
          message: "Companies API token not configured",
          success: false,
        });
      }

      // Determine smart sorting based on prompt keywords
      const promptLower = prompt.toLowerCase();
      let smartSortKey = sortKey as string;
      let smartSortOrder = (sortOrder as string) || "desc";

      // Auto-detect sorting preferences based on search intent
      if (!sortKey) {
        if (
          promptLower.includes("top") ||
          promptLower.includes("best") ||
          promptLower.includes("largest") ||
          promptLower.includes("biggest")
        ) {
          if (
            promptLower.includes("saas") ||
            promptLower.includes("software") ||
            promptLower.includes("tech") ||
            promptLower.includes("startup")
          ) {
            smartSortKey = "meta.score"; // High quality tech companies
          } else if (
            promptLower.includes("revenue") ||
            promptLower.includes("profitable") ||
            promptLower.includes("earning")
          ) {
            smartSortKey = "finances.revenue";
          } else if (
            promptLower.includes("employees") ||
            promptLower.includes("workforce") ||
            promptLower.includes("staff")
          ) {
            smartSortKey = "about.totalEmployees";
          } else if (
            promptLower.includes("visitors") ||
            promptLower.includes("traffic") ||
            promptLower.includes("popular")
          ) {
            smartSortKey = "analytics.monthlyVisitors";
          } else {
            smartSortKey = "meta.score"; // Default to data score for "top" queries
          }
        } else if (
          promptLower.includes("new") ||
          promptLower.includes("recent") ||
          promptLower.includes("startup") ||
          promptLower.includes("young")
        ) {
          smartSortKey = "about.yearFounded";
          smartSortOrder = "desc"; // Newest first
        } else if (
          promptLower.includes("old") ||
          promptLower.includes("established") ||
          promptLower.includes("historic")
        ) {
          smartSortKey = "about.yearFounded";
          smartSortOrder = "asc"; // Oldest first
        } else if (
          promptLower.includes("high score") ||
          promptLower.includes("quality") ||
          promptLower.includes("reliable")
        ) {
          smartSortKey = "meta.score";
          smartSortOrder = "desc";
        }
      }

      // Use regular prompt-based search (conditions are handled client-side via conditions endpoint)
      const searchUrl = new URL(
        "https://api.thecompaniesapi.com/v2/companies/by-prompt",
      );
      searchUrl.searchParams.set("token", COMPANIES_API_TOKEN);
      searchUrl.searchParams.set("prompt", prompt.toString());
      searchUrl.searchParams.set("page", page.toString());
      searchUrl.searchParams.set("page_size", pageSize.toString());

      // Add sorting parameters if available
      if (smartSortKey) {
        searchUrl.searchParams.set("sortKey", smartSortKey);
      }
      if (smartSortOrder) {
        searchUrl.searchParams.set("sortOrder", smartSortOrder);
      }


      const response = await fetch(searchUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "MarketIntelligencePlatform/1.0",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Companies API error:", response.status, errorText);
        return res.status(response.status).json({
          message: `Companies API error: ${response.status}`,
          success: false,
        });
      }

      const data = await response.json();

      // If API returns empty or malformed data, provide meaningful error
      if (
        !data.companies ||
        !Array.isArray(data.companies) ||
        data.companies.length === 0
      ) {
        return res.status(404).json({
          message:
            "No companies found for your search query. Try different keywords.",
          success: false,
          searchQuery: prompt,
        });
      }

      // Transform the API response to match our interface using correct field structure
      const transformedData = {
        companies: data.companies.map((company: any, index: number) => {
          // Extract data from the nested structure based on actual API response
          const about = company.about || {};
          const analytics = company.analytics || {};
          const locations = company.locations?.headquarters || {};
          const assets = company.assets || {};
          const descriptions = company.descriptions || {};
          const socials = company.socials || {};
          const domain = company.domain || {};
          const meta = company.meta || {};
          const technologies = company.technologies || [];

          return {
            id:
              meta.mysqlId?.toString() ||
              domain.domain ||
              `api-company-${Date.now()}-${index}`,
            name: about.name || domain.domainName || domain.domain || null,
            industries: Array.isArray(about.industries)
              ? about.industries
              : about.industry
                ? [about.industry]
                : [],
            totalEmployees: about.totalEmployees || null,
            revenue:
              company.finances?.revenue ||
              company.finances?.estimatedRevenue ||
              company.finances?.annualRevenue ||
              null,
            businessType: about.industry || null,
            monthlyVisitors: analytics.monthlyVisitors || null,
            country: locations.country?.name || null,
            city: locations.city?.name || null,
            yearFounded: about.yearFounded || null,
            socialNetwork: {
              linkedin: socials.linkedin?.url || null,
              twitter: socials.twitter?.url || null,
              facebook: socials.facebook?.url || null,
              website: domain.domain ? `https://${domain.domain}` : null,
            },
            technologies: Array.isArray(technologies)
              ? technologies
                  .map((tech: any) => tech.slug || tech.name || tech)
                  .filter(Boolean)
              : [],
            application: descriptions.primary || descriptions.tagline || null,
            dataScore: meta.score || null,
            lastSync: meta.syncedAt || new Date().toISOString(),
            logo: assets.logoSquare?.src || assets.cover?.src || null,
            description: descriptions.primary || null,
            website: domain.domain ? `https://${domain.domain}` : null,
            status: domain.status === 200 ? "active" : "inactive",
            verified: true,
          };
        }),
        pagination: {
          page: parseInt(page.toString()) || 1,
          pageSize: parseInt(pageSize.toString()) || 20,
          total: data.total || data.companies?.length || 0,
          hasMore: data.has_more || false,
        },
        message: data.message || "Search completed successfully",
        success: true,
      };

      res.json(transformedData);
    } catch (error) {
      console.error("Error in /api/companies/external/search:", error);
      res.status(500).json({
        message: "Failed to search companies",
        success: false,
      });
    }
  });

  // XBRL Filings API integration for Financial Statements
  app.get("/api/filings/xbrl", async (req, res) => {
    try {
      const {
        search = "",
        country = "",
        programme = "",
        page = 1,
        pageSize = 20,
        sort = "-processed",
      } = req.query;


      const searchUrl = new URL("https://filings.xbrl.org/api/filings");

      // Add pagination
      searchUrl.searchParams.set("page[number]", page.toString());
      searchUrl.searchParams.set("page[size]", pageSize.toString());

      // Add sorting (most recent first by default)
      searchUrl.searchParams.set("sort", sort.toString());

      // Include entity information
      searchUrl.searchParams.set("include", "entity");

      // Add filters
      if (country && country !== "") {
        searchUrl.searchParams.set("filter[country]", country.toString());
      }

      // Programme filtering implemented client-side by examining fxo_id field
      // ESEF filings have "ESEF" in fxo_id, UAIFRS filings have "UAIFRS" in fxo_id

      // Entity name search requires fetching more data and filtering client-side
      // since XBRL API doesn't support entity_name filter on filings endpoint
      if (search && search.toString().trim() !== "") {
        // Increase page size when searching to get more data for filtering
        searchUrl.searchParams.set("page[size]", "100");
      }

      const response = await fetch(searchUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "application/vnd.api+json",
          "User-Agent": "MarketIntelligencePlatform/1.0",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("XBRL API error:", response.status, errorText);
        return res.status(response.status).json({
          message: `XBRL API error: ${response.status}`,
          success: false,
        });
      }

      const data = await response.json();

      // Apply client-side programme filtering based on fxo_id
      let filteredData = data.data || [];
      if (programme && programme !== "") {
        // When filtering by programme, fetch a larger page size to ensure we have enough filtered results
        // For ESEF (rare), fetch from multiple countries; for UAIFRS fetch larger dataset
        const largeFetchUrl = new URL(searchUrl.toString());

        if ((programme as string).toUpperCase() === "ESEF") {
          // ESEF has 415 filings in first 500 records, so fetch 500 for good coverage
          largeFetchUrl.searchParams.delete("filter[country]"); // Remove country filter to get more ESEF
          largeFetchUrl.searchParams.set("page[size]", "500"); // Fetch 500 records for ESEF
        } else {
          largeFetchUrl.searchParams.set("page[size]", "100"); // Fetch 100 records for UAIFRS
        }
        largeFetchUrl.searchParams.set("page[number]", "1"); // Always start from page 1 for filtering

        try {
          const largeResponse = await fetch(largeFetchUrl.toString(), {
            method: "GET",
            headers: {
              Accept: "application/vnd.api+json",
              "User-Agent": "MarketIntelligencePlatform/1.0",
            },
          });

          if (largeResponse.ok) {
            const largeData = await largeResponse.json();

            // Filter the larger dataset
          const allFilteredData = (largeData.data || []).filter(
            (filing: any) => {
              const fxoId = filing.attributes?.fxo_id || "";
              return fxoId.includes((programme as string).toUpperCase());
            },
          );

            // Apply pagination to filtered results
            const startIndex = (parseInt(page.toString()) - 1) * parseInt(pageSize.toString());
            const endIndex = startIndex + parseInt(pageSize.toString());
            filteredData = allFilteredData.slice(startIndex, endIndex);

            // Update included entities to match filtered data
            if (largeData.included) {
              data.included = largeData.included;
            }
          }
        } catch (error) {
          // Fallback to original data filtering
          filteredData = filteredData.filter((filing: any) => {
            const fxoId = filing.attributes?.fxo_id || "";
            return fxoId.includes((programme as string).toUpperCase());
          });
        }
      }

      // Apply client-side entity name filtering if search term provided
      if (search && search.toString().trim() !== "") {
        const searchTerm = search.toString().toLowerCase();
        filteredData = filteredData.filter((filing: any) => {
          // Find the entity in included data
          if (filing.relationships?.entity?.data?.id && data.included) {
            const entity = data.included.find(
              (entity: any) =>
                entity.id === filing.relationships.entity.data.id,
            );
            if (entity && entity.attributes.name) {
              return entity.attributes.name.toLowerCase().includes(searchTerm);
            }
          }
          return false;
        });

        // If we have search results, apply pagination to filtered results
        const totalFiltered = filteredData.length;
        const startIndex =
          (parseInt(page.toString()) - 1) * parseInt(pageSize.toString());
        const endIndex = startIndex + parseInt(pageSize.toString());
        filteredData = filteredData.slice(startIndex, endIndex);

      }

      // Transform the API response with filtered data
      const transformedData = {
        ...data,
        data: filteredData,
        success: true,
        message: `Found ${filteredData.length} filings`,
      };

      res.json(transformedData);
    } catch (error) {
      console.error("Error in /api/filings/xbrl:", error);
      res.status(500).json({
        message: "Failed to fetch XBRL filings",
        success: false,
      });
    }
  });

  // Get available countries and programmes for filters
  app.get("/api/filings/xbrl/filters", async (req, res) => {
    try {
      // Return available filter options for XBRL API
      const filters = {
        countries: [
          { code: "GB", name: "United Kingdom" },
          { code: "FR", name: "France" },
          { code: "DK", name: "Denmark" },
          { code: "SI", name: "Slovenia" },
          { code: "BE", name: "Belgium" },
          { code: "NL", name: "Netherlands" },
          { code: "IE", name: "Ireland" },
          { code: "LU", name: "Luxembourg" },
          { code: "IT", name: "Italy" },
          { code: "ES", name: "Spain" },
          { code: "UA", name: "Ukraine" },
        ],
        programmes: [
          { code: "ESEF", name: "ESEF (European Single Electronic Format)" },
          { code: "UAIFRS", name: "UAIFRS (Ukraine)" },
        ],
        success: true,
      };

      res.json(filters);
    } catch (error) {
      console.error("Error in /api/filings/xbrl/filters:", error);
      res.status(500).json({
        message: "Failed to fetch filter options",
        success: false,
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for news processing
function categorizeArticle(title: string, description: string): string {
  const content = (title + " " + description).toLowerCase();

  if (
    content.includes("funding") ||
    content.includes("investment") ||
    content.includes("round") ||
    content.includes("capital")
  ) {
    return "Funding";
  } else if (
    content.includes("acquisition") ||
    content.includes("merger") ||
    content.includes("buyout") ||
    content.includes("m&a")
  ) {
    return "M&A";
  } else if (
    content.includes("accelerator") ||
    content.includes("incubator") ||
    content.includes("demo day")
  ) {
    return "Accelerators";
  } else if (
    content.includes("climate") ||
    content.includes("green") ||
    content.includes("sustainability") ||
    content.includes("carbon")
  ) {
    return "Climate Tech";
  } else if (
    content.includes("market") ||
    content.includes("analysis") ||
    content.includes("report") ||
    content.includes("trends")
  ) {
    return "Market Analysis";
  } else {
    return "Business";
  }
}

function extractTags(title: string, description: string): string[] {
  const content = (title + " " + description).toLowerCase();
  const allTags = [];

  // Technology tags
  if (content.includes("ai") || content.includes("artificial intelligence"))
    allTags.push("AI");
  if (content.includes("blockchain") || content.includes("crypto"))
    allTags.push("Blockchain");
  if (content.includes("fintech") || content.includes("financial technology"))
    allTags.push("Fintech");
  if (content.includes("saas") || content.includes("software"))
    allTags.push("SaaS");
  if (content.includes("biotech") || content.includes("healthcare"))
    allTags.push("Biotech");
  if (content.includes("edtech") || content.includes("education"))
    allTags.push("EdTech");

  // Business tags
  if (content.includes("startup")) allTags.push("Startup");
  if (content.includes("venture capital") || content.includes("vc"))
    allTags.push("VC");
  if (content.includes("ipo") || content.includes("public offering"))
    allTags.push("IPO");
  if (content.includes("unicorn")) allTags.push("Unicorn");
  if (
    content.includes("series a") ||
    content.includes("series b") ||
    content.includes("series c")
  )
    allTags.push("Series Funding");

  return allTags.slice(0, 5); // Limit to 5 tags
}
