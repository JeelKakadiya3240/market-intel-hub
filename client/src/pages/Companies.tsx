import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Building2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Globe,
  Briefcase,
  Target,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  MoreVertical,
  Grid3x3,
  List,
  ExternalLink,
  Star,
  Award,
  Facebook,
  Twitter,
  Linkedin,
  Hash,
  BarChart3,
  PieChart,
  X,
  Newspaper,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  CompanyStartup,
  CompanyGrowth,
  CompanyFranchise,
  CompanyVc,
} from "@/types/database";
import { StartupDetailDialog } from "@/components/company-details/StartupDetailDialog";
import { GrowthDetailDialog } from "@/components/company-details/GrowthDetailDialog";
import { FranchiseDetailDialog } from "@/components/company-details/FranchiseDetailDialog";
import { VcDetailDialog } from "@/components/company-details/VcDetailDialog";
import { FloatingSearch } from "@/components/FloatingSearch";
import { CompaniesTable } from "@/components/CompaniesTable";
import { SearchConditionsModal } from "@/components/SearchConditionsModal";
import { CompaniesApiResponse } from "@shared/types/companiesApi";
import { useRef, useLayoutEffect } from "react";

// Search condition interface for API
interface SearchCondition {
  attribute: string;
  operator: "or" | "and";
  sign: "equals" | "exactEquals" | "greater" | "lower" | "notEquals";
  values: string[];
}
interface CompanyFilters {
  search: string;
  industry: string;
  location: string;
  ranking?: string;
  annualRevenue?: string;
  employees?: string;
  growthRate?: string;
  // Franchise-specific filters
  rank?: string;
  initialInvestment?: string;
  founded?: string;
  empAtHq?: string;
  units2024?: string;
  // VC-specific filters
  investmentStage?: string;
  aum?: string;
  regionOfInvestment?: string;
  investmentTicket?: string;
  // Startup-specific filters
  country?: string;
  state?: string;
  srScore2?: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export default function Companies() {
  const [activeTab, setActiveTab] = useState("external");
  const [externalSearchQuery, setExternalSearchQuery] = useState<string>("");
  const [isExternalSearching, setIsExternalSearching] = useState(false);
  const [searchConditions, setSearchConditions] = useState<SearchCondition[]>(
    [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsCount, setResultsCount] = useState<number>(0);
  const [hasActiveSearch, setHasActiveSearch] = useState<boolean>(false);
  const [filters, setFilters] = useState<CompanyFilters>({
    search: "",
    industry: "all",
    location: "all",
    ranking: "all",
    annualRevenue: "all",
    employees: "all",
    growthRate: "all",
    // Franchise filters
    rank: "all",
    initialInvestment: "all",
    founded: "all",
    empAtHq: "all",
    units2024: "all",
    // VC filters
    investmentStage: "all",
    aum: "all",
    regionOfInvestment: "all",
    investmentTicket: "all",
    // Startup filters
    country: "all",
    state: "all",
    srScore2: "",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 100,
    total: 0,
  });
  const [selectedStartup, setSelectedStartup] = useState<CompanyStartup | null>(
    null,
  );
  const [selectedGrowthCompany, setSelectedGrowthCompany] =
    useState<CompanyGrowth | null>(null);
  const [selectedFranchise, setSelectedFranchise] =
    useState<CompanyFranchise | null>(null);
  const [selectedVcCompany, setSelectedVcCompany] = useState<CompanyVc | null>(
    null,
  );
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // Dialog states
  const [isStartupDialogOpen, setIsStartupDialogOpen] = useState(false);
  const [isGrowthDialogOpen, setIsGrowthDialogOpen] = useState(false);
  const [isFranchiseDialogOpen, setIsFranchiseDialogOpen] = useState(false);
  const [isVcDialogOpen, setIsVcDialogOpen] = useState(false);

  // Handlers for opening detail dialogs
  const handleStartupClick = (startup: CompanyStartup) => {
    setSelectedStartup(startup);
    setIsStartupDialogOpen(true);
  };

  const handleGrowthCompanyClick = (company: CompanyGrowth) => {
    setSelectedGrowthCompany({
      ...company,
      whatIs: company.whatIs || (company as any).what_is,
    });
    setIsGrowthDialogOpen(true);
  };

  const handleFranchiseClick = (franchise: CompanyFranchise) => {
    setSelectedFranchise(franchise);
    setIsFranchiseDialogOpen(true);
  };

  const handleVcClick = (vc: CompanyVc) => {
    setSelectedVcCompany(vc);
    setIsVcDialogOpen(true);
  };

  // Extended colors for pie charts - covers all regions and many industries
  const CHART_COLORS = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#84CC16", // Lime
    "#EC4899", // Pink
    "#6366F1", // Indigo
    // Additional colors for full coverage
    "#14B8A6", // Teal
    "#F43F5E", // Rose
    "#A3A3A3", // Gray
    "#22C55E", // Emerald
    "#EAB308", // Amber
    "#D946EF", // Fuchsia
    "#06B6D4", // Sky
    "#65A30D", // Green-600
    "#DC2626", // Red-600
    "#7C3AED", // Violet
    "#059669", // Emerald-600
    "#CA8A04", // Yellow-600
    "#C2410C", // Orange-600
    "#BE185D", // Pink-600
    "#4338CA", // Indigo-600
    "#0D9488", // Teal-600
    "#9333EA", // Purple-600
    "#0891B2", // Cyan-600
    "#15803D", // Green-700
    "#B91C1C", // Red-700
    // Generate additional colors programmatically for thousands of categories
  ];

  // Function to generate colors dynamically for any number of data points
  const getChartColor = (index: number) => {
    if (index < CHART_COLORS.length) {
      return CHART_COLORS[index];
    }
    
    // Generate vibrant colors for thousands of industry categories
    const hue = (index * 137.508) % 360; // Golden angle for optimal distribution
    const saturation = 70 + (index % 4) * 10; // Higher saturation (70%, 80%, 90%, 100%)
    const lightness = 40 + (index % 5) * 12; // More lightness variety (40%, 52%, 64%, 76%, 88%)
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Process country distribution data
  const getCountryDistribution = (companies: CompanyStartup[]) => {
    const countryCount = companies.reduce(
      (acc, company) => {
        const country = company.country || "Unknown";
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(countryCount).map(([country, count]) => ({
      name: country,
      value: count,
    }));
  };

  // Process state distribution data
  const getStateDistribution = (companies: CompanyStartup[]) => {
    const stateCount = companies.reduce(
      (acc, company) => {
        const state = company.state || "Unknown";
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(stateCount).map(([state, count]) => ({
      name: state,
      value: count,
    }));
  };

  // Query for startups analytics (complete dataset for charts)
  const { data: startupsAnalytics, isLoading: startupsAnalyticsLoading } =
    useQuery<{
      countryDistribution: Array<{ name: string; value: number }>;
      industryDistribution: Array<{ name: string; value: number }>;
      stateDistribution: Array<{ name: string; value: number }>;
    }>({
      queryKey: ["/api/companies/startups/analytics"],
      enabled: activeTab === "startups",
    });

  // Query for startups (paginated for table)
  const { data: startups, isLoading: startupsLoading } = useQuery<
    CompanyStartup[]
  >({
    queryKey: [
      "/api/companies/startups",
      {
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        ...filters,
      },
    ],
    enabled: activeTab === "startups",
  });

  // Query for startups count
  const { data: startupsCount } = useQuery<{ count: number }>({
    queryKey: ["/api/companies/startups/count", filters],
    enabled: activeTab === "startups",
  });

  // Query for growth companies analytics (complete dataset for charts)
  const { data: growthAnalytics, isLoading: growthAnalyticsLoading } =
    useQuery<{
      fundingSizeDistribution: Array<{ name: string; value: number }>;
      industryDistribution: Array<{ name: string; value: number }>;
      growthRateDistribution: Array<{ name: string; value: number }>;
    }>({
      queryKey: ["/api/companies/growth/analytics"],
      enabled: activeTab === "growth",
      refetchOnMount: true, // Refetch when component mounts
      refetchOnWindowFocus: false, // Don't refetch on window focus
    });

  // Query for growth companies (paginated for table)
  const { data: growthCompanies, isLoading: growthLoading } = useQuery<
    CompanyGrowth[]
  >({
    queryKey: [
      "/api/companies/growth",
      {
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        ...filters,
      },
    ],
    enabled: activeTab === "growth",
  });

  // Query for growth companies count
  const { data: growthCount } = useQuery<{ count: number }>({
    queryKey: ["/api/companies/growth/count", filters],
    enabled: activeTab === "growth",
  });

  // Query for franchises analytics (complete dataset for charts)
  const { data: franchisesAnalytics, isLoading: franchisesAnalyticsLoading } =
    useQuery<{
      investmentDistribution: Array<{ name: string; value: number }>;
      industryDistribution: Array<{ name: string; value: number }>;
      foundedTimeline: Array<{ name: string; value: number }>;
    }>({
      queryKey: ["/api/companies/franchises/analytics"],
      enabled: activeTab === "franchises",
    });

  // Query for franchises (paginated for table)
  const { data: franchises, isLoading: franchisesLoading } = useQuery<
    CompanyFranchise[]
  >({
    queryKey: [
      "/api/companies/franchises",
      {
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        ...filters,
      },
    ],
    enabled: activeTab === "franchises",
  });

  // Query for franchises count
  const { data: franchisesCount } = useQuery<{ count: number }>({
    queryKey: ["/api/companies/franchises/count", filters],
    enabled: activeTab === "franchises",
  });

  // Query for VC companies analytics (complete dataset for charts)
  const { data: vcAnalytics, isLoading: vcAnalyticsLoading } = useQuery<{
    investmentStageDistribution: Array<{ name: string; value: number }>;
    aumDistribution: Array<{ name: string; value: number }>;
    regionalDistribution: Array<{ name: string; value: number }>;
    industryDistribution: Array<{ name: string; value: number }>;
  }>({
    queryKey: ["/api/companies/vc/analytics"],
    enabled: activeTab === "vc",
  });


  // Query for VC companies (paginated for table)
  const { data: vcCompanies, isLoading: vcLoading } = useQuery<CompanyVc[]>({
    queryKey: [
      "/api/companies/vc",
      {
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        ...filters,
      },
    ],
    enabled: activeTab === "vc",
  });

  // Query for VC companies count
  const { data: vcCount } = useQuery<{ count: number }>({
    queryKey: ["/api/companies/vc/count", filters],
    enabled: activeTab === "vc",
  });

  const scrollY = useRef(0);
  const scrollRestorePending = useRef(false);

  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  useLayoutEffect(() => {
    if (scrollRestorePending.current) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY.current, behavior: "auto" });
        scrollRestorePending.current = false;
      });
    }
  }, [pagination]);

  // Helper function to get growth rate color coding
  const getGrowthRateColor = (growthRate: string | null) => {
    if (!growthRate) return null;

    // Extract numeric value from growth rate string
    const numericValue = parseFloat(growthRate.replace(/[^0-9.-]/g, ""));

    if (isNaN(numericValue)) return null;

    if (numericValue < 25) {
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Low Growth",
      };
    } else if (numericValue >= 25 && numericValue <= 49) {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Moderate Growth",
      };
    } else if (numericValue >= 50 && numericValue <= 99) {
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "High Growth",
      };
    } else if (numericValue >= 100) {
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Exceptional Growth",
      };
    }

    return null;
  };

  // Helper functions for Growth Company analytics
  const getGrowthFundingDistribution = (companies: CompanyGrowth[]) => {
    const fundingRanges = {
      "0-1M": 0,
      "1M-10M": 0,
      "10M-50M": 0,
      "50M-100M": 0,
      "100M+": 0,
    };

    companies.forEach((company) => {
      const funding = (company as any).total_funding || "";
      if (funding && funding !== "-") {
        // Extract numeric value, handling formats like "$10M", "10M", "1.5B", etc.
        const cleanFunding = funding.replace(/[\$,]/g, "");
        let numericValue = parseFloat(cleanFunding);

        // Handle billions
        if (cleanFunding.includes("B") || cleanFunding.includes("b")) {
          numericValue *= 1000; // Convert to millions
        }

        if (!isNaN(numericValue) && numericValue > 0) {
          if (numericValue >= 100) {
            fundingRanges["100M+"]++;
          } else if (numericValue >= 50) {
            fundingRanges["50M-100M"]++;
          } else if (numericValue >= 10) {
            fundingRanges["10M-50M"]++;
          } else if (numericValue >= 1) {
            fundingRanges["1M-10M"]++;
          } else {
            fundingRanges["0-1M"]++;
          }
        } else {
          // For companies without clear funding data
          fundingRanges["0-1M"]++;
        }
      } else {
        // For companies without funding data
        fundingRanges["0-1M"]++;
      }
    });

    return Object.entries(fundingRanges).map(([range, count]) => ({
      name: range,
      value: count,
    }));
  };

  const getGrowthIndustryDistribution = (companies: CompanyGrowth[]) => {
    const industries: { [key: string]: number } = {};

    companies.forEach((company) => {
      const industry = company.industry || "Other";
      industries[industry] = (industries[industry] || 0) + 1;
    });

    return Object.entries(industries)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getGrowthRevenueDistribution = (companies: CompanyGrowth[]) => {
    const revenueRanges = {
      "0-1M": 0,
      "1M-10M": 0,
      "10M-50M": 0,
      "50M-100M": 0,
      "100M+": 0,
    };

    companies.forEach((company) => {
      const revenue =
        (company as any).annual_revenue ||
        (company as any).estimated_revenue ||
        "";
      if (revenue && revenue !== "-") {
        // Extract numeric value, handling formats like "$10M", "10M", "1.5B", etc.
        const cleanRevenue = revenue.replace(/[\$,]/g, "");
        let numericValue = parseFloat(cleanRevenue);

        // Handle billions
        if (cleanRevenue.includes("B") || cleanRevenue.includes("b")) {
          numericValue *= 1000; // Convert to millions
        }

        if (!isNaN(numericValue) && numericValue > 0) {
          if (numericValue >= 100) {
            revenueRanges["100M+"]++;
          } else if (numericValue >= 50) {
            revenueRanges["50M-100M"]++;
          } else if (numericValue >= 10) {
            revenueRanges["10M-50M"]++;
          } else if (numericValue >= 1) {
            revenueRanges["1M-10M"]++;
          } else {
            revenueRanges["0-1M"]++;
          }
        } else {
          // For companies without clear revenue data
          revenueRanges["0-1M"]++;
        }
      } else {
        // For companies without revenue data
        revenueRanges["0-1M"]++;
      }
    });

    return Object.entries(revenueRanges).map(([range, count]) => ({
      name: range,
      value: count,
    }));
  };

  // Growth rate distribution function
  const getGrowthRateDistribution = (companies: CompanyGrowth[]) => {
    const growthRanges = {
      "0-25%": 0,
      "25-50%": 0,
      "50-100%": 0,
      "100-200%": 0,
      "200%+": 0,
    };

    companies.forEach((company) => {
      const growthRate =
        (company as any).growth_rate || (company as any).growthRate || "";
      if (growthRate && growthRate !== "-") {
        const numericValue = parseFloat(growthRate.replace(/[^0-9.-]/g, ""));
        if (!isNaN(numericValue)) {
          if (numericValue >= 200) {
            growthRanges["200%+"]++;
          } else if (numericValue >= 100) {
            growthRanges["100-200%"]++;
          } else if (numericValue >= 50) {
            growthRanges["50-100%"]++;
          } else if (numericValue >= 25) {
            growthRanges["25-50%"]++;
          } else {
            growthRanges["0-25%"]++;
          }
        } else {
          growthRanges["0-25%"]++;
        }
      } else {
        growthRanges["0-25%"]++;
      }
    });

    return Object.entries(growthRanges).map(([range, count]) => ({
      name: range,
      value: count,
    }));
  };

  // Helper functions for Franchise analytics
  const getFranchiseInvestmentDistribution = (
    franchises: CompanyFranchise[],
  ) => {
    const investmentRanges = {
      "Under $50K": 0,
      "$50K-$100K": 0,
      "$100K-$250K": 0,
      "$250K-$500K": 0,
      "$500K+": 0,
    };

    franchises.forEach((franchise) => {
      const investment = (franchise as any).initial_investment || "";
      if (investment && investment !== "-") {
        // Parse investment amounts - handling various formats
        const cleanInvestment = investment.replace(/[\$,]/g, "").toLowerCase();
        const numericValue = parseFloat(cleanInvestment);

        if (!isNaN(numericValue)) {
          if (cleanInvestment.includes("k")) {
            if (numericValue < 50) {
              investmentRanges["Under $50K"]++;
            } else if (numericValue < 100) {
              investmentRanges["$50K-$100K"]++;
            } else if (numericValue < 250) {
              investmentRanges["$100K-$250K"]++;
            } else if (numericValue < 500) {
              investmentRanges["$250K-$500K"]++;
            } else {
              investmentRanges["$500K+"]++;
            }
          } else if (cleanInvestment.includes("m")) {
            investmentRanges["$500K+"]++;
          } else {
            // Raw numbers, assume thousands
            if (numericValue < 50000) {
              investmentRanges["Under $50K"]++;
            } else if (numericValue < 100000) {
              investmentRanges["$50K-$100K"]++;
            } else if (numericValue < 250000) {
              investmentRanges["$100K-$250K"]++;
            } else if (numericValue < 500000) {
              investmentRanges["$250K-$500K"]++;
            } else {
              investmentRanges["$500K+"]++;
            }
          }
        } else {
          investmentRanges["Under $50K"]++;
        }
      } else {
        investmentRanges["Under $50K"]++;
      }
    });

    return Object.entries(investmentRanges).map(([range, count]) => ({
      name: range,
      value: count,
    }));
  };

  const getFranchiseIndustryDistribution = (franchises: CompanyFranchise[]) => {
    const industries: { [key: string]: number } = {};

    franchises.forEach((franchise) => {
      const industry = franchise.industry || "Other";
      industries[industry] = (industries[industry] || 0) + 1;
    });

    return Object.entries(industries)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getFranchiseFoundedDistribution = (franchises: CompanyFranchise[]) => {
    const foundedRanges = {
      "2020+": 0,
      "2010-2019": 0,
      "2000-2009": 0,
      "1990-1999": 0,
      "1980-1989": 0,
      "Pre-1980": 0,
    };

    franchises.forEach((franchise) => {
      const founded = franchise.founded;
      if (founded && !isNaN(Number(founded))) {
        const year = Number(founded);
        if (year >= 2020) {
          foundedRanges["2020+"]++;
        } else if (year >= 2010) {
          foundedRanges["2010-2019"]++;
        } else if (year >= 2000) {
          foundedRanges["2000-2009"]++;
        } else if (year >= 1990) {
          foundedRanges["1990-1999"]++;
        } else if (year >= 1980) {
          foundedRanges["1980-1989"]++;
        } else {
          foundedRanges["Pre-1980"]++;
        }
      } else {
        foundedRanges["Pre-1980"]++;
      }
    });

    return Object.entries(foundedRanges).map(([range, count]) => ({
      name: range,
      value: count,
    }));
  };

  // Helper functions for VC analytics
  const getVcInvestmentStageDistribution = (vcCompanies: CompanyVc[]) => {
    const stageRanges = {
      Seed: 0,
      "Series A": 0,
      "Series B": 0,
      "Series C+": 0,
      Growth: 0,
      Other: 0,
    };

    vcCompanies.forEach((vc) => {
      const stage =
        (vc as any).investment_stage || (vc as any).investmentStage || "";
      if (stage.toLowerCase().includes("seed")) {
        stageRanges["Seed"]++;
      } else if (stage.toLowerCase().includes("series a")) {
        stageRanges["Series A"]++;
      } else if (stage.toLowerCase().includes("series b")) {
        stageRanges["Series B"]++;
      } else if (
        stage.toLowerCase().includes("series c") ||
        stage.toLowerCase().includes("late")
      ) {
        stageRanges["Series C+"]++;
      } else if (stage.toLowerCase().includes("growth")) {
        stageRanges["Growth"]++;
      } else {
        stageRanges["Other"]++;
      }
    });

    return Object.entries(stageRanges).map(([stage, count]) => ({
      name: stage,
      value: count,
    }));
  };

  const getVcLocationDistribution = (vcAnalytics: any) => {
    const regions = vcAnalytics?.regionalDistribution || [];
    
    // Debug: Log all regions to ensure we have all 18
    console.log("🌍 All VC Regions Data:", {
      totalRegions: regions.length,
      allRegions: regions.map((r: any) => ({ name: r.name, value: r.value })),
      sortedByValue: regions.sort((a: any, b: any) => b.value - a.value)
    });
    
    return regions;
  };

  const getVcIndustryDistribution = (vcAnalytics: any) => {
    const industries = vcAnalytics?.industryDistribution || [];
    
    // Debug: Log industry data structure
    console.log("🏭 All VC Industries Data:", {
      totalIndustries: industries.length,
      top10Industries: industries.slice(0, 10).map((i: any) => ({ name: i.name, value: i.value })),
      smallestIndustries: industries.slice(-10).map((i: any) => ({ name: i.name, value: i.value })),
      dataStructure: industries[0],
      isValidData: industries.length > 0 && industries[0]?.value !== undefined
    });
    
    // For performance, limit to top 1000 industries if there are too many
    if (industries.length > 1000) {
      console.log("⚡ Limiting industries to top 1000 for better rendering performance");
      const sortedIndustries = industries.sort((a: any, b: any) => b.value - a.value);
      const top1000 = sortedIndustries.slice(0, 1000);
      const remainingSum = sortedIndustries.slice(1000).reduce((sum: number, item: any) => sum + item.value, 0);
      
      return [
        ...top1000,
        {
          name: `Others (${industries.length - 1000} categories)`,
          value: remainingSum
        }
      ];
    }
    
    return industries;
  };

  // Helper functions for limiting legend display to top 10 items
  const getTop10ForLegend = (data: Array<{ name: string; value: number }>) => {
    return data.slice(0, 10);
  };

  const renderCustomLegend = (
    props: any,
    data: Array<{ name: string; value: number }>,
  ) => {
    const { payload } = props;
    // Show all items instead of limiting to 5
    const limitedPayload = payload;

    return (
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-xs max-w-full">
        {limitedPayload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1 bg-background/50 px-2 py-1 rounded border">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground font-medium">
              {entry.value.length > 15 ? `${entry.value.substring(0, 12)}...` : entry.value} ({data.find((item) => item.name === entry.value)?.value || 0})
            </span>
          </div>
        ))}
      </div>
    );
  };

  const handleFilterChange = (type: string, value: string) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleExternalSearch = async (query: string) => {
    setIsExternalSearching(true);
    setExternalSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search

    // The search will be triggered by the query change in CompaniesTable
    setTimeout(() => {
      setIsExternalSearching(false);
    }, 1000);
  };

  const getCompanyImage = (company: CompanyStartup) => {
    if (company.image) {
      return company.image.startsWith("http")
        ? company.image
        : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/companies/Startups/${company.image}`;
    }
    return null;
  };

  const getGrowthCompanyImage = (company: CompanyGrowth) => {
    if ((company as any).image) {
      return (company as any).image.startsWith("http")
        ? (company as any).image
        : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/companies/High-growth/${(company as any).image}`;
    }
    return null;
  };

  const getFranchiseCompanyImage = (company: CompanyFranchise) => {
    if ((company as any).image) {
      return (company as any).image.startsWith("http")
        ? (company as any).image
        : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/companies/Franchises/${(company as any).image}`;
    }
    return null;
  };

  const getVcCompanyImage = (company: CompanyVc) => {
    if ((company as any).image) {
      return (company as any).image.startsWith("http")
        ? (company as any).image
        : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/companies/VC/${(company as any).image}`;
    }
    return null;
  };

  const formatSocialCount = (count: string | null) => {
    if (!count) return "0";
    const num = parseInt(count);
    if (isNaN(num)) return count;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderStartupCard = (company: CompanyStartup, isListView = false) => {
    if (isListView) {
      return (
        <Card
          key={company.id}
          className="border-0 shadow-sm bg-card/80 backdrop-blur hover:shadow-lg transition-all duration-200"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Company Logo/Avatar */}
              <div className="flex-shrink-0">
                {getCompanyImage(company) ? (
                  <img
                    src={getCompanyImage(company)!}
                    alt={company.name || "Company"}
                    className="w-16 h-16 rounded-lg object-cover border border-border"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      const nextSibling =
                        target.nextElementSibling as HTMLElement;
                      target.style.display = "none";
                      if (nextSibling) nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl ${getCompanyImage(company) ? "hidden" : "flex"}`}
                >
                  {company.name?.charAt(0) || "?"}
                </div>
              </div>

              {/* Company Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground truncate">
                      {company.name || "Unnamed Company"}
                    </h3>
                    {company.shortDescription && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {company.shortDescription}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      {/* Location */}
                      {(company.country || company.state) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {[company.state, company.country]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Founded */}
                      {company.founded && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Founded {company.founded}</span>
                        </div>
                      )}

                      {/* Website */}
                      {company.website && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          <a
                            href={
                              company.website.startsWith("http")
                                ? company.website
                                : `https://${company.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {company.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {company.tags
                          .split(",")
                          .slice(0, 3)
                          .map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag.trim()}
                            </Badge>
                          ))}
                        {company.tags.split(",").length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{company.tags.split(",").length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metrics & Actions */}
                  <div className="flex flex-col items-end gap-2 ml-4">
                    {/* Rank */}
                    {company.rank && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        <Award className="h-3 w-3 mr-1" />
                        Rank #{company.rank}
                      </Badge>
                    )}

                    {/* Social Metrics */}
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {company.twitterFollowers && (
                        <div className="flex items-center gap-1">
                          <Twitter className="h-3 w-3" />
                          {formatSocialCount(company.twitterFollowers)}
                        </div>
                      )}
                      {company.facebookFans && (
                        <div className="flex items-center gap-1">
                          <Facebook className="h-3 w-3" />
                          {formatSocialCount(company.facebookFans)}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartupClick(company)}
                      className="mt-2"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Grid View
    return (
      <Card
        key={company.id}
        className="border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      >
        <div className="relative">
          {/* Company Image/Avatar */}
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
            {getCompanyImage(company) ? (
              <img
                src={getCompanyImage(company)!}
                alt={company.name || "Company"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLElement;
                  target.style.display = "none";
                  if (nextSibling) nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl ${getCompanyImage(company) ? "hidden" : "flex"}`}
            >
              {company.name?.charAt(0) || "?"}
            </div>

            {/* Rank Badge */}
            {company.rank && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-background/90 text-foreground border-0">
                  <Award className="h-3 w-3 mr-1" />#{company.rank}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Company Name */}
            <h3 className="text-lg font-bold text-foreground truncate">
              {company.name || "Unnamed Company"}
            </h3>

            {/* Description */}
            {company.shortDescription && (
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {company.shortDescription}
              </p>
            )}

            {/* Location & Founded */}
            <div className="space-y-2">
              {(company.country || company.state) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {[company.state, company.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}

              {company.founded && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Founded {company.founded}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {company.tags && (
              <div className="flex flex-wrap gap-1">
                {company.tags
                  .split(",")
                  .slice(0, 2)
                  .map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                {company.tags.split(",").length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{company.tags.split(",").length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Social Stats */}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <div className="flex gap-3 text-xs text-muted-foreground">
                {company.twitterFollowers && (
                  <div className="flex items-center gap-1">
                    <Twitter className="h-3 w-3" />
                    {formatSocialCount(company.twitterFollowers)}
                  </div>
                )}
                {company.facebookFans && (
                  <div className="flex items-center gap-1">
                    <Facebook className="h-3 w-3" />
                    {formatSocialCount(company.facebookFans)}
                  </div>
                )}
              </div>

              {/* View Details Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStartupClick(company)}
                className="h-8 px-3"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDetailModal = () => {
    if (!selectedCompany) return null;

    // Debug: Log the selected company data
    console.log("Selected company data:", selectedCompany);
    console.log("Company type detected:", activeTab);
    console.log("Available fields:", Object.keys(selectedCompany));

    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {getCompanyImage(selectedCompany) ? (
              <img
                src={getCompanyImage(selectedCompany)!}
                alt={selectedCompany.name || "Company"}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLElement;
                  target.style.display = "none";
                  if (nextSibling) nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg ${getCompanyImage(selectedCompany) ? "hidden" : "flex"}`}
            >
              {(selectedCompany.name || selectedCompany.title)?.charAt(0) ||
                "?"}
            </div>
            <span className="font-semibold text-lg dark:text-white">
              {selectedCompany.name || "Company Details"}
            </span>
          </DialogTitle>
          <DialogDescription>
            Comprehensive company information and business metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Company Details
                </h4>
                <div className="space-y-2 text-sm">
                  {(selectedCompany.country ||
                    selectedCompany.state ||
                    selectedCompany.location) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>
                        {selectedCompany.location ||
                          [selectedCompany.state, selectedCompany.country]
                            .filter(Boolean)
                            .join(", ")}
                      </span>
                    </div>
                  )}
                  {selectedCompany.founded && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Founded {selectedCompany.founded}</span>
                    </div>
                  )}
                  {(selectedCompany.website || selectedCompany.url) && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-500" />
                      <a
                        href={
                          (
                            selectedCompany.website || selectedCompany.url
                          ).startsWith("http")
                            ? selectedCompany.website || selectedCompany.url
                            : `https://${selectedCompany.website || selectedCompany.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Visit Website <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Startup Rankings & Scores - Always show section */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Rankings & Scores
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedCompany.rank && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium">
                        Rank
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        #{selectedCompany.rank}
                      </div>
                    </div>
                  )}
                  {(selectedCompany as any).sr_score2 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-xs text-green-600 font-medium">
                        SR Score
                      </div>
                      <div className="text-lg font-bold text-green-900">
                        {(selectedCompany as any).sr_score2}
                      </div>
                    </div>
                  )}
                  {(selectedCompany as any).sr_web && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-xs text-purple-600 font-medium">
                        SR Web
                      </div>
                      <div className="text-lg font-bold text-purple-900">
                        {(selectedCompany as any).sr_web}
                      </div>
                    </div>
                  )}
                  {(selectedCompany as any).sr_social && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-xs text-orange-600 font-medium">
                        SR Social
                      </div>
                      <div className="text-lg font-bold text-orange-900">
                        {(selectedCompany as any).sr_social}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media Metrics for Startups */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Social Media Analytics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(selectedCompany as any).facebook_fans && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium">
                        Facebook Fans
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {(selectedCompany as any).facebook_fans}
                      </div>
                    </div>
                  )}
                  {(selectedCompany as any).facebook_engagement && (
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium">
                        FB Engagement
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {(selectedCompany as any).facebook_engagement}
                      </div>
                    </div>
                  )}
                  {(selectedCompany as any).twitter_followers && (
                    <div className="bg-sky-50 p-3 rounded-lg">
                      <div className="text-xs text-sky-600 font-medium">
                        Twitter Followers
                      </div>
                      <div className="text-lg font-bold text-sky-900">
                        {(selectedCompany as any).twitter_followers}
                      </div>
                    </div>
                  )}
                  {(selectedCompany as any).twitter_engagement && (
                    <div className="bg-sky-100 p-3 rounded-lg">
                      <div className="text-xs text-sky-600 font-medium">
                        Twitter Engagement
                      </div>
                      <div className="text-lg font-bold text-sky-900">
                        {(selectedCompany as any).twitter_engagement}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Metrics - Always show section */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Business Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(selectedCompany.annual_revenue ||
                    selectedCompany.estimated_revenue) && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-xs text-green-600 font-medium">
                        Annual Revenue
                      </div>
                      <div className="text-lg font-bold text-green-900">
                        <div className="text-xl font-bold text-emerald-600 dark:text-white">
                          {selectedCompany.annual_revenue ||
                            selectedCompany.estimated_revenue}
                        </div>
                      </div>
                    </div>
                  )}
                  {(selectedCompany.employees ||
                    selectedCompany.number_of_employees) && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium">
                        Employees
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {selectedCompany.employees ||
                          selectedCompany.number_of_employees}
                      </div>
                    </div>
                  )}
                  {selectedCompany.total_funding && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-xs text-purple-600 font-medium">
                        Total Funding
                      </div>
                      <div className="text-lg font-bold text-purple-900">
                        {selectedCompany.total_funding}
                      </div>
                    </div>
                  )}
                  {(selectedCompany.valuation ||
                    selectedCompany.current_valuation) && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-xs text-orange-600 font-medium">
                        Valuation
                      </div>
                      <div className="text-lg font-bold text-orange-900">
                        {selectedCompany.valuation ||
                          selectedCompany.current_valuation}
                      </div>
                    </div>
                  )}
                  {selectedCompany.growjo_ranking && (
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <div className="text-xs text-indigo-600 font-medium">
                        Growjo Ranking
                      </div>
                      <div className="text-lg font-bold text-indigo-900">
                        {selectedCompany.growjo_ranking}
                      </div>
                    </div>
                  )}
                  {(selectedCompany.employee_growth_percent ||
                    selectedCompany.grew_employee_count) && (
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <div className="text-xs text-teal-600 font-medium">
                        Employee Growth
                      </div>
                      <div className="text-lg font-bold text-teal-900">
                        {selectedCompany.employee_growth_percent ||
                          selectedCompany.grew_employee_count}
                      </div>
                    </div>
                  )}
                  {selectedCompany.estimated_revenue_per_employee && (
                    <div className="bg-cyan-50 p-3 rounded-lg">
                      <div className="text-xs text-cyan-600 font-medium">
                        Revenue per Employee
                      </div>
                      <div className="text-lg font-bold text-cyan-900">
                        ${selectedCompany.estimated_revenue_per_employee}
                      </div>
                    </div>
                  )}
                  {selectedCompany.accelerator &&
                    selectedCompany.accelerator !== "N/A" && (
                      <div className="bg-pink-50 p-3 rounded-lg">
                        <div className="text-xs text-pink-600 font-medium">
                          Accelerator
                        </div>
                        <div className="text-lg font-bold text-pink-900">
                          {selectedCompany.accelerator}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Franchise Metrics */}
              {(selectedCompany.initial_investment ||
                selectedCompany.units_as_of_2024 ||
                selectedCompany.num_of_units ||
                selectedCompany.initial_franchise_fee ||
                selectedCompany.net_worth_requirement) && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Franchise Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCompany.initial_investment && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-xs text-green-600 font-medium">
                          Initial Investment
                        </div>
                        <div className="text-lg font-bold text-green-900">
                          {selectedCompany.initial_investment}
                        </div>
                      </div>
                    )}
                    {(selectedCompany.units_as_of_2024 ||
                      selectedCompany.num_of_units) && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-blue-600 font-medium">
                          Total Units
                        </div>
                        <div className="text-lg font-bold text-blue-900">
                          {selectedCompany.units_as_of_2024 ||
                            selectedCompany.num_of_units}
                        </div>
                      </div>
                    )}
                    {selectedCompany.initial_franchise_fee && (
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="text-xs text-orange-600 font-medium">
                          Franchise Fee
                        </div>
                        <div className="text-lg font-bold text-orange-900">
                          {selectedCompany.initial_franchise_fee}
                        </div>
                      </div>
                    )}
                    {selectedCompany.net_worth_requirement && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-xs text-purple-600 font-medium">
                          Net Worth Required
                        </div>
                        <div className="text-lg font-bold text-purple-900">
                          {selectedCompany.net_worth_requirement}
                        </div>
                      </div>
                    )}
                    {selectedCompany.cash_requirement && (
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <div className="text-xs text-indigo-600 font-medium">
                          Cash Required
                        </div>
                        <div className="text-lg font-bold text-indigo-900">
                          {selectedCompany.cash_requirement}
                        </div>
                      </div>
                    )}
                    {selectedCompany.royalty_fee && (
                      <div className="bg-teal-50 p-3 rounded-lg">
                        <div className="text-xs text-teal-600 font-medium">
                          Royalty Fee
                        </div>
                        <div className="text-lg font-bold text-teal-900">
                          {selectedCompany.royalty_fee}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Growth Company Additional Metrics */}
              {(selectedCompany.growjo_ranking ||
                selectedCompany.estimated_revenue_per_employee) && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Growth Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCompany.growjo_ranking && (
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <div className="text-xs text-indigo-600 font-medium">
                          Growjo Ranking
                        </div>
                        <div className="text-lg font-bold text-indigo-900">
                          {selectedCompany.growjo_ranking}
                        </div>
                      </div>
                    )}
                    {selectedCompany.estimated_revenue_per_employee && (
                      <div className="bg-cyan-50 p-3 rounded-lg">
                        <div className="text-xs text-cyan-600 font-medium">
                          Revenue per Employee
                        </div>
                        <div className="text-lg font-bold text-cyan-900">
                          ${selectedCompany.estimated_revenue_per_employee}
                        </div>
                      </div>
                    )}
                    {(selectedCompany.grew_employee_count ||
                      selectedCompany.employee_growth_percent) && (
                      <div className="bg-teal-50 p-3 rounded-lg">
                        <div className="text-xs text-teal-600 font-medium">
                          Employee Growth
                        </div>
                        <div className="text-lg font-bold text-teal-900">
                          {selectedCompany.grew_employee_count ||
                            selectedCompany.employee_growth_percent}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Media - Always show section */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Social Presence
                </h4>
                <div className="space-y-2">
                  {selectedCompany.facebook && (
                    <a
                      href={selectedCompany.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook{" "}
                      {(selectedCompany as any).facebook_fans &&
                        `(${formatSocialCount((selectedCompany as any).facebook_fans)} fans)`}
                      {(selectedCompany as any).facebook_engagement &&
                        ` - ${(selectedCompany as any).facebook_engagement} engagement`}
                    </a>
                  )}
                  {selectedCompany.twitter && (
                    <a
                      href={selectedCompany.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter{" "}
                      {(selectedCompany as any).twitter_followers &&
                        `(${formatSocialCount((selectedCompany as any).twitter_followers)} followers)`}
                      {(selectedCompany as any).twitter_engagement &&
                        ` - ${(selectedCompany as any).twitter_engagement} engagement`}
                    </a>
                  )}
                  {selectedCompany.linkedin && (
                    <a
                      href={selectedCompany.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

              {/* SEO Metrics for Startups */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  SEO Metrics
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {(selectedCompany as any).moz_domain_auth && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-xs text-purple-600 font-medium">
                        MOZ Domain Authority
                      </div>
                      <div className="text-lg font-bold text-purple-900">
                        {(selectedCompany as any).moz_domain_auth}
                      </div>
                    </div>
                  )}
                  {(selectedCompany as any).moz_page_auth && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-xs text-orange-600 font-medium">
                        MOZ Page Authority
                      </div>
                      <div className="text-lg font-bold text-orange-900">
                        {(selectedCompany as any).moz_page_auth}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description - Always show section */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              About
            </h4>
            {(selectedCompany as any).long_description ||
            (selectedCompany as any).short_description ||
            selectedCompany.what_is ? (
              <div className="text-sm text-slate-600 leading-relaxed">
                <p className="whitespace-pre-line">
                  {(selectedCompany as any).long_description ||
                    (selectedCompany as any).short_description ||
                    selectedCompany.what_is}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                No description available
              </p>
            )}
          </div>

          {/* Tags - Always show section */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Tags
            </h4>
            {selectedCompany.tags ? (
              <div className="flex flex-wrap gap-2">
                {selectedCompany.tags.split(",").map((tag: any, index: any) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {tag.trim().replace(/[\[\]']/g, "")}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No tags available</p>
            )}
          </div>

          {/* Growth Company News Section */}
          {selectedCompany.news && (
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Recent News
              </h4>
              <div className="bg-slate-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-sm text-slate-600 whitespace-pre-line">
                  {selectedCompany.news}
                </p>
              </div>
            </div>
          )}

          {/* Additional Data Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(selectedCompany as any).funding_table && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Funding Information
                </h5>
                <div className="text-sm text-slate-600 max-h-32 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (selectedCompany as any).funding_table,
                    }}
                  />
                </div>
              </div>
            )}

            {(selectedCompany as any).team_table && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Information
                </h5>
                <div className="text-sm text-slate-600 max-h-32 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (selectedCompany as any).team_table,
                    }}
                  />
                </div>
              </div>
            )}

            {(selectedCompany as any).products_table && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Products & Services
                </h5>
                <div className="text-sm text-slate-600 max-h-32 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (selectedCompany as any).products_table,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Competitor sections removed as requested */}

            {selectedCompany.other_companies && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Similar Companies
                </h5>
                <div className="text-sm text-slate-600 max-h-32 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedCompany.other_companies,
                    }}
                  />
                </div>
              </div>
            )}

            {(selectedCompany as any).acquisitions_table && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Acquisitions
                </h5>
                <div className="text-sm text-slate-600 max-h-32 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (selectedCompany as any).acquisitions_table,
                    }}
                  />
                </div>
              </div>
            )}

            {(selectedCompany as any).news_table && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  News Archive
                </h5>
                <div className="text-sm text-slate-600 max-h-32 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (selectedCompany as any).news_table,
                    }}
                  />
                </div>
              </div>
            )}

            {(selectedCompany as any).statistics_table && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Key Statistics
                </h5>
                <div className="text-sm text-slate-600 max-h-32 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (selectedCompany as any).statistics_table,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <AppLayout
      title="Companies"
      subtitle="Explore startups, scaleups, and growth companies"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 dark:from-gray-900 dark:via-green-950/30 dark:to-emerald-950/20 -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6">
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px] bg-card/80 backdrop-blur border border-border">
            <TabsTrigger
              value="external"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
            >
              External Search
            </TabsTrigger>
            <TabsTrigger
              value="startups"
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
            >
              Startups
            </TabsTrigger>
            <TabsTrigger
              value="growth"
              className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900"
            >
              High Growth
            </TabsTrigger>
            <TabsTrigger
              value="franchises"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900"
            >
              Franchises
            </TabsTrigger>
            <TabsTrigger
              value="vc"
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900"
            >
              VC Companies
            </TabsTrigger>
          </TabsList>

          {/* External Companies Search Tab */}
          <TabsContent value="external" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 max-w-2xl">
                <FloatingSearch
                  onSearch={(query) => {
                    setExternalSearchQuery(query);
                    setCurrentPage(1); // Reset to first page on new search
                  }}
                  isSearching={isExternalSearching}
                />
              </div>
              <div className="ml-4">
                <SearchConditionsModal
                  currentConditions={searchConditions}
                  onApplyConditions={(conditions) => {
                    setSearchConditions(conditions);
                    setCurrentPage(1); // Reset to first page on condition change
                  }}
                />
              </div>
            </div>

            <CompaniesTable
              searchQuery={externalSearchQuery}
              isSearching={isExternalSearching}
              searchConditions={searchConditions}
              currentPage={currentPage}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
              onResultsCountChange={(count, hasSearch) => {
                setResultsCount(count);
                setHasActiveSearch(hasSearch);
              }}
            />
          </TabsContent>

          {/* Startups Tab */}
          <TabsContent value="startups" className="space-y-6">
            {/* Startup Analytics Section */}
            {!startupsLoading && startups && startups.length > 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Startup Analytics
                  </h2>
                  <p className="text-muted-foreground">
                    Comprehensive insights into startup ecosystem, industry
                    distribution, and geographical spread
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Country Distribution Chart */}
                  <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        Country Distribution
                        <Badge variant="secondary" className="ml-2">
                          {startupsAnalytics?.countryDistribution?.length || 0} Countries
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={320}>
                        {startupsAnalyticsLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <RechartsPieChart>
                            <Pie
                              data={startupsAnalytics?.countryDistribution || []}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              innerRadius={35}
                              dataKey="value"
                            >
                              {(startupsAnalytics?.countryDistribution || []).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name, props) => [
                                `${value} companies`,
                                props.payload.name || "Companies",
                              ]}
                              contentStyle={{
                                background: "#fff",
                                color: "#333",
                                border: "1px solid #e0e0e0",
                                borderRadius: "6px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={60}
                              wrapperStyle={{
                                paddingTop: "10px",
                                fontSize: "11px",
                                color: "hsl(var(--foreground))"
                              }}
                              payload={(startupsAnalytics?.countryDistribution || []).slice(0, 10).map((entry: any, index: number) => ({
                                value: `${entry.name} (${entry.value})`,
                                type: 'rect',
                                color: CHART_COLORS[index % CHART_COLORS.length],
                                payload: entry
                              }))}
                            />
                          </RechartsPieChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* State Distribution Chart */}
                  <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        State Distribution (US)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={320}>
                        {startupsAnalyticsLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                          </div>
                        ) : (
                          <RechartsPieChart>
                            <Pie
                              data={startupsAnalytics?.stateDistribution || []}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              innerRadius={35}
                              dataKey="value"
                            >
                              {(startupsAnalytics?.stateDistribution || []).map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={getChartColor(index)}
                                  />
                                ),
                              )}
                            </Pie>
                            <Tooltip
                              formatter={(value: any, name: any, props: any) => [
                                value,
                                props.payload.name || "Companies"
                              ]}
                              contentStyle={{
                                background: "#fff",
                                color: "#333",
                                border: "1px solid #e0e0e0",
                                borderRadius: "6px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={60}
                              wrapperStyle={{
                                paddingTop: "10px",
                                fontSize: "11px",
                                color: "hsl(var(--foreground))"
                              }}
                              payload={(startupsAnalytics?.stateDistribution || []).slice(0, 10).map((entry: any, index: number) => ({
                                value: `${entry.name} (${entry.value})`,
                                type: 'rect',
                                color: CHART_COLORS[index % CHART_COLORS.length],
                                payload: entry
                              }))}
                            />
                          </RechartsPieChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Startup Filters - Always visible */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Startup Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search startups..."
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      className="pl-10 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-gray-700 focus:border-orange-500"
                    />
                  </div>

                  {/* Industry Filter */}
                  <Select
                    value={filters.industry}
                    onValueChange={(value) =>
                      handleFilterChange("industry", value)
                    }
                  >
                    <SelectTrigger className="bg-background/70 border-border hover:bg-muted/50 text-foreground focus:border-blue-500 focus:ring-blue-500/20 text-sm">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="ai">AI</SelectItem>
                      <SelectItem value="health">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Country Filter */}
                  <Select
                    value={filters.country}
                    onValueChange={(value) =>
                      handleFilterChange("country", value)
                    }
                  >
                    <SelectTrigger className="bg-background/70 border-border hover:bg-muted/50 text-foreground focus:border-blue-500 focus:ring-blue-500/20 text-sm">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="sg">Singapore</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* State Filter */}
                  <Select
                    value={filters.state || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("state", value)
                    }
                  >
                    <SelectTrigger className="bg-background/70 border-border hover:bg-muted/50 text-foreground focus:border-blue-500 focus:ring-blue-500/20 text-sm">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      <SelectItem value="California">California</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                      <SelectItem value="Texas">Texas</SelectItem>
                      <SelectItem value="Florida">Florida</SelectItem>
                      <SelectItem value="Illinois">Illinois</SelectItem>
                      <SelectItem value="Massachusetts">
                        Massachusetts
                      </SelectItem>
                      <SelectItem value="Washington">Washington</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Colorado">Colorado</SelectItem>
                      <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
                      <SelectItem value="North Carolina">
                        North Carolina
                      </SelectItem>
                      <SelectItem value="Virginia">Virginia</SelectItem>
                      <SelectItem value="Michigan">Michigan</SelectItem>
                      <SelectItem value="Ohio">Ohio</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Rank Filter */}
                  <Select
                    value={filters.rank || "all"}
                    onValueChange={(value) => handleFilterChange("rank", value)}
                  >
                    <SelectTrigger className="bg-background/70 border-border hover:bg-muted/50 text-foreground focus:border-blue-500 focus:ring-blue-500/20 text-sm">
                      <SelectValue placeholder="Rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ranks</SelectItem>
                      <SelectItem value="1-10">Top 10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-100">51-100</SelectItem>
                      <SelectItem value="101-500">101-500</SelectItem>
                      <SelectItem value="501-1000">501-1000</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Prognosticz Score Filter */}
                  <Input
                    type="number"
                    placeholder="Prognosticz Score"
                    value={filters.srScore2 || ""}
                    onChange={(e) =>
                      handleFilterChange("srScore2", e.target.value)
                    }
                    className="bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-gray-700 focus:border-orange-500"
                  />

                  {/* Founded Filter */}
                  <Input
                    type="number"
                    placeholder="Founded Year"
                    value={filters.founded || ""}
                    onChange={(e) =>
                      handleFilterChange("founded", e.target.value)
                    }
                    className="bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-gray-700 focus:border-orange-500"
                  />

                  {/* Clear Filters Button */}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilters({
                        search: "",
                        industry: "all",
                        location: "all",
                        ranking: "all",
                        annualRevenue: "all",
                        employees: "all",
                        growthRate: "all",
                        rank: "all",
                        initialInvestment: "all",
                        founded: "all",
                        empAtHq: "all",
                        units2024: "all",
                        country: "all",
                        state: "all",
                        srScore2: "",
                      })
                    }
                    className="bg-background/70 border-border hover:bg-muted/50 text-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Startups Table */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  {/* <div className="w-max"> */}
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-border bg-muted/50">
                        <TableHead className="w-16 text-center font-semibold text-muted-foreground py-4 whitespace-nowrap">
                          Logo
                        </TableHead>
                        <TableHead className="min-w-[200px] font-semibold text-muted-foreground py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            Name
                            <ChevronLeft className="h-4 w-4 rotate-90 text-muted-foreground" />
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                          Country
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                          State
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                          Rank
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                          Prognosticz
                          <br />
                          Score
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                          Founded
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                          Domain
                          <br />
                          Authority
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                          Facebook
                          <br />
                          Followers
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {startups?.map((company, index) => (
                        <TableRow
                          key={company.id}
                          className={`border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group ${index % 2 === 0 ? "bg-card" : "bg-muted/30"}`}
                          onClick={() => handleStartupClick(company)}
                        >
                          <TableCell className="py-2 px-3">
                            <div className="">
                              {getCompanyImage(company) ? (
                                <img
                                  src={getCompanyImage(company)!}
                                  alt={company.name || "Company"}
                                  className="!w-12 h-12 rounded-lg object-cover border border-border shadow-sm"
                                  onError={(e) => {
                                    const target =
                                      e.currentTarget as HTMLImageElement;
                                    const nextSibling =
                                      target.nextElementSibling as HTMLElement;
                                    target.style.display = "none";
                                    if (nextSibling)
                                      nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ${getCompanyImage(company) ? "hidden" : "flex"}`}
                              >
                                {company.name?.charAt(0) || "?"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-1">
                              <div className="font-semibold text-foreground text-sm">
                                {company.name || "Unnamed Company"}
                              </div>
                              {company.website && (
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {company.website
                                    .replace(/^https?:\/\//, "")
                                    .replace(/\/$/, "")}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium">
                            {company.country || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium">
                            {company.state || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                            {company.rank ? (
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-semibold">
                                #{company.rank}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                            {(company as any).sr_score2 ? (
                              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-semibold">
                                {(company as any).sr_score2}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                            {company.founded || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                            {(company as any).moz_domain_auth ? (
                              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-semibold">
                                {(company as any).moz_domain_auth}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                            {(company as any).facebook_fans &&
                            parseInt((company as any).facebook_fans) > 0 ? (
                              <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-semibold">
                                {formatSocialCount(
                                  (company as any).facebook_fans,
                                )}
                              </span>
                            ) : (
                              "0"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* </div> */}
                </div>
              </CardContent>
            </Card>

            {/* Pagination for Startups */}
            {startups && startups.length > 0 && startupsCount && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    startupsCount.count,
                  )}{" "}
                  of {startupsCount.count} startups
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          Math.ceil(startupsCount.count / pagination.limit),
                        ),
                      },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pagination.page === pageNum
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: pageNum,
                              }))
                            }
                            className="h-8 w-8"
                          >
                            {pageNum}
                          </Button>
                        );
                      },
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(
                          Math.ceil(startupsCount.count / prev.limit),
                          prev.page + 1,
                        ),
                      }))
                    }
                    disabled={
                      pagination.page >=
                      Math.ceil(startupsCount.count / pagination.limit)
                    }
                    className="h-8"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Growth Companies Tab */}
          <TabsContent value="growth" className="space-y-6">
            {/* Growth Analytics Section */}
            {!growthLoading &&
              growthCompanies &&
              growthCompanies.length > 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      Growth Analytics
                    </h2>
                    <p className="text-slate-600">
                      Comprehensive insights into high-growth companies, funding
                      sizes, and industry distribution
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Industry Portfolio Chart */}
                    <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-green-600" />
                          Industry Portfolio
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-4">
                        <ResponsiveContainer width="100%" height={400}>
                          {growthAnalyticsLoading ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            </div>
                          ) : (
                            <RechartsPieChart
                              margin={{
                                top: 20,
                                right: 20,
                                bottom: 60,
                                left: 20,
                              }}
                            >
                              <Pie
                                data={
                                  growthAnalytics?.industryDistribution || []
                                }
                                cx="50%"
                                cy="45%"
                                outerRadius={120}
                                dataKey="value"
                                minAngle={1}
                                stroke="#fff"
                                strokeWidth={0.5}
                              >
                                {(
                                  growthAnalytics?.industryDistribution || []
                                ).map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={getChartColor(index)}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(
                                  value: any,
                                  name: any,
                                  props: any,
                                ) => [value, props.payload.name || "Companies"]}
                                contentStyle={{
                                  background: "#fff",
                                  color: "#333",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: "6px",
                                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={50}
                                wrapperStyle={{
                                  paddingTop: "10px",
                                  fontSize: "11px",
                                  color: "hsl(var(--foreground))"
                                }}
                                payload={(growthAnalytics?.industryDistribution || []).slice(0, 10).map((entry: any, index: number) => ({
                                  value: `${entry.name} (${entry.value})`,
                                  type: 'rect',
                                  color: getChartColor(index),
                                  payload: entry
                                }))}
                              />
                            </RechartsPieChart>
                          )}
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Growth Rate Distribution */}
                    <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                          Growth Rate Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-4">
                        <ResponsiveContainer width="100%" height={320}>
                          {growthAnalyticsLoading ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            </div>
                          ) : (
                            <BarChart
                              data={
                                growthAnalytics?.growthRateDistribution || []
                              }
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 40,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                              />
                              <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={11}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: "#fff",
                                  color: "#333",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: "6px",
                                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                                }}
                                formatter={(value: any, name: any) => [value, "Companies"]}
                              />
                              <Bar
                                dataKey="value"
                                fill="#8b5cf6"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

            {/* High Growth Search & Filters */}
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Growth Company Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search growth companies..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="pl-10 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-gray-700 focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Select
                      value={filters.ranking || "all"}
                      onValueChange={(value) =>
                        handleFilterChange("ranking", value)
                      }
                    >
                      <SelectTrigger className="w-[160px] border-border bg-background/80">
                        <SelectValue placeholder="Ranking" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rankings</SelectItem>
                        <SelectItem value="1-100">Top 100</SelectItem>
                        <SelectItem value="101-500">101-500</SelectItem>
                        <SelectItem value="501-1000">501-1000</SelectItem>
                        <SelectItem value="1000+">1000+</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.industry}
                      onValueChange={(value) =>
                        handleFilterChange("industry", value)
                      }
                    >
                      <SelectTrigger className="w-[160px] border-border bg-background/80">
                        <SelectValue placeholder="Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.annualRevenue || "all"}
                      onValueChange={(value) =>
                        handleFilterChange("annualRevenue", value)
                      }
                    >
                      <SelectTrigger className="w-[160px] border-border bg-background/80">
                        <SelectValue placeholder="Annual Revenue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Revenue</SelectItem>
                        <SelectItem value="0-1M">$0-1M</SelectItem>
                        <SelectItem value="1M-10M">$1M-10M</SelectItem>
                        <SelectItem value="10M-100M">$10M-100M</SelectItem>
                        <SelectItem value="100M+">$100M+</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.employees || "all"}
                      onValueChange={(value) =>
                        handleFilterChange("employees", value)
                      }
                    >
                      <SelectTrigger className="w-[160px] border-border bg-background/80">
                        <SelectValue placeholder="Employees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sizes</SelectItem>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-1000">201-1000</SelectItem>
                        <SelectItem value="1000+">1000+</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.growthRate || "all"}
                      onValueChange={(value) =>
                        handleFilterChange("growthRate", value)
                      }
                    >
                      <SelectTrigger className="w-[155px] border-border bg-background/80">
                        <SelectValue placeholder="Growth Rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Growth</SelectItem>
                        <SelectItem value="0-10">0-10%</SelectItem>
                        <SelectItem value="10-25">10-25%</SelectItem>
                        <SelectItem value="25-50">25-50%</SelectItem>
                        <SelectItem value="50-100">50-100%</SelectItem>
                        <SelectItem value="100+">100%+</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.location}
                      onValueChange={(value) =>
                        handleFilterChange("location", value)
                      }
                    >
                      <SelectTrigger className="w-[155px] border-border bg-background/80">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {growthLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                <CardContent className="p-0">
                  <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <Table className="table-auto min-w-[1400px]">
                      <TableHeader>
                        <TableRow className="border-b-2 border-border bg-muted/50">
                          <TableHead className="w-16 text-center font-semibold text-muted-foreground py-4 whitespace-nowrap">
                            Logo
                          </TableHead>
                          <TableHead className="min-w-[200px] font-semibold text-muted-foreground py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              Name
                              <ChevronLeft className="h-4 w-4 rotate-90 text-muted-foreground" />
                            </div>
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Location
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Industry
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Annual
                            <br />
                            Revenue
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Employees
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Total
                            <br />
                            Funding
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Valuation
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Growth
                            <br />
                            Rate
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Ranking
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {growthCompanies?.map((company, index) => (
                          <TableRow
                            key={company.id}
                            className={`border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group ${index % 2 === 0 ? "bg-card" : "bg-muted/30"}`}
                            onClick={() => handleGrowthCompanyClick(company)}
                          >
                            <TableCell className="text-sm px-2 py-2 max-w-[100px] text-center truncate">
                              <div className="">
                                {getGrowthCompanyImage(company) ? (
                                  <img
                                    src={getGrowthCompanyImage(company)!}
                                    alt={company.name || "Company"}
                                    className="w-12 h-12 rounded-lg object-cover border border-border shadow-sm"
                                    onError={(e) => {
                                      const target =
                                        e.currentTarget as HTMLImageElement;
                                      const nextSibling =
                                        target.nextElementSibling as HTMLElement;
                                      target.style.display = "none";
                                      if (nextSibling)
                                        nextSibling.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ${getGrowthCompanyImage(company) ? "hidden" : "flex"}`}
                                >
                                  {company.name?.charAt(0) || "?"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm px-2 py-2 max-w-[100px] text-center truncate">
                              <div className="space-y-1">
                                <div className="font-semibold text-foreground text-sm">
                                  {company.name || "Unnamed Company"}
                                </div>
                                {/* GrowJo URL removed as requested */}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm px-2 py-2 max-w-[100px] text-center truncate">
                              {company.location || "-"}
                            </TableCell>
                            <TableCell className="text-sm px-2 py-2 max-w-[100px] text-center truncate">
                              {company.industry || "-"}
                            </TableCell>
                            <TableCell className="text-sm px-2 py-2 max-w-[100px] text-center truncate">
                              {(company as any).annual_revenue ||
                              (company as any).estimated_revenue ? (
                                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-semibold">
                                  {(company as any).annual_revenue ||
                                    (company as any).estimated_revenue}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-sm px-2 py-2 max-w-[100px] text-center truncate">
                              {(company as any).employees ||
                              (company as any).number_of_employees ? (
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-semibold">
                                  {(company as any).employees ||
                                    (company as any).number_of_employees}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-sm px-2 py-2 max-w-[100px] text-center truncate">
                              {(company as any).total_funding ? (
                                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-semibold">
                                  {(company as any).total_funding}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-sm px-2 py-2 max-w-[100px] text-center truncate">
                              {(company as any).valuation ||
                              (company as any).current_valuation ? (
                                <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-semibold">
                                  {(company as any).valuation ||
                                    (company as any).current_valuation}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-sm px-2 py-2 max-w-[100px] text-center truncate">
                              {(company as any).employee_growth_percent
                                ? (() => {
                                    const colorConfig = getGrowthRateColor(
                                      (company as any).employee_growth_percent,
                                    );
                                    const value = (company as any)
                                      .employee_growth_percent;
                                    const cleanValue =
                                      typeof value === "string"
                                        ? value.replace(/%+$/, "")
                                        : value;
                                    return colorConfig ? (
                                      <span
                                        className={`${colorConfig.bg} ${colorConfig.text} px-2 py-1 rounded-full text-xs font-semibold`}
                                      >
                                        {cleanValue}%
                                      </span>
                                    ) : (
                                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs font-semibold">
                                        {cleanValue}%
                                      </span>
                                    );
                                  })()
                                : "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                              {(company as any).growjo_ranking ? (
                                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full text-xs font-semibold">
                                  #
                                  {String(
                                    (company as any).growjo_ranking,
                                  ).replace(/^#+/, "")}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pagination for Growth Companies */}
            {growthCompanies && growthCompanies.length > 0 && growthCount && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    growthCount.count,
                  )}{" "}
                  of {growthCount.count} growth companies
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          Math.ceil(growthCount.count / pagination.limit),
                        ),
                      },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pagination.page === pageNum
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: pageNum,
                              }))
                            }
                            className="h-8 w-8"
                          >
                            {pageNum}
                          </Button>
                        );
                      },
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(
                          Math.ceil(growthCount.count / prev.limit),
                          prev.page + 1,
                        ),
                      }))
                    }
                    disabled={
                      pagination.page >=
                      Math.ceil(growthCount.count / pagination.limit)
                    }
                    className="h-8"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Franchises Tab */}
          <TabsContent value="franchises" className="space-y-6">
            {/* Franchise Analytics Section */}
            {!franchisesLoading && franchises && franchises.length > 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground dark:text-slate-100 mb-2">
                    Franchise Analytics
                  </h2>
                  <p className="text-muted-foreground">
                    Comprehensive insights into franchise investment, industry
                    distribution, and founding timeline
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Investment Distribution Chart */}
                  <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Investment Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={320}>
                        {franchisesAnalyticsLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                          </div>
                        ) : (
                          <RechartsPieChart>
                            <Pie
                              data={
                                franchisesAnalytics?.investmentDistribution ||
                                []
                              }
                              cx="50%"
                              cy="40%"
                              outerRadius={80}
                              dataKey="value"
                            >
                              {(
                                franchisesAnalytics?.investmentDistribution ||
                                []
                              ).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(
                                value: any,
                                name: any,
                                props: any,
                              ) => [
                                value,
                                props.payload.name || "Investment Range",
                              ]}
                              contentStyle={{
                                background: "#fff",
                                color: "#333",
                                border: "1px solid #e0e0e0",
                                borderRadius: "6px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={60}
                              wrapperStyle={{
                                paddingTop: "10px",
                                fontSize: "11px",
                                color: "hsl(var(--foreground))"
                              }}
                              payload={(franchisesAnalytics?.investmentDistribution || []).slice(0, 10).map((entry: any, index: number) => ({
                                value: `${entry.name} (${entry.value})`,
                                type: 'rect',
                                color: CHART_COLORS[index % CHART_COLORS.length],
                                payload: entry
                              }))}
                            />
                          </RechartsPieChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Industry Distribution Chart */}
                  <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-blue-600" />
                        Industry Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={320}>
                        {franchisesAnalyticsLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <RechartsPieChart>
                            <Pie
                              data={
                                franchisesAnalytics?.industryDistribution || []
                              }
                              cx="50%"
                              cy="40%"
                              outerRadius={80}
                              dataKey="value"
                            >
                              {(
                                franchisesAnalytics?.industryDistribution || []
                              ).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(
                                value: any,
                                name: any,
                                props: any,
                              ) => [value, props.payload.name || "Industry"]}
                              contentStyle={{
                                background: "#fff",
                                color: "#333",
                                border: "1px solid #e0e0e0",
                                borderRadius: "6px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={60}
                              wrapperStyle={{
                                paddingTop: "10px",
                                fontSize: "11px",
                                color: "hsl(var(--foreground))"
                              }}
                              payload={(franchisesAnalytics?.industryDistribution || []).slice(0, 5).map((entry: any, index: number) => ({
                                value: `${entry.name} (${entry.value})`,
                                type: 'rect',
                                color: CHART_COLORS[index % CHART_COLORS.length],
                                payload: entry
                              }))}
                            />
                          </RechartsPieChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Founding Year Timeline */}
                  <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        Founded Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={320}>
                        {franchisesAnalyticsLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                          </div>
                        ) : (
                          <BarChart
                            data={franchisesAnalytics?.foundedTimeline || []}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                            />
                            <XAxis
                              dataKey="name"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <YAxis
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <Tooltip
                              formatter={(value: any) => [value, "Franchises"]}
                              contentStyle={{
                                background: "#18181b",
                                color: "#fff",
                                border: "none",
                              }}
                            />
                            <Bar
                              dataKey="value"
                              fill="#8b5cf6"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Franchise Filters */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Franchise Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Search */}
                  <div className="relative w-[110px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search..."
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      className="pl-10 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-gray-700 focus:border-orange-500"
                    />
                  </div>

                  {/* Rank Filter */}
                  <Select
                    value={filters.rank}
                    onValueChange={(value) => handleFilterChange("rank", value)}
                  >
                    <SelectTrigger className="w-[110px] bg-background/70 border-border focus:border-blue-500 focus:ring-blue-500/20 text-sm">
                      <SelectValue placeholder="Rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ranks</SelectItem>
                      <SelectItem value="1-100">Top 100</SelectItem>
                      <SelectItem value="101-200">101-200</SelectItem>
                      <SelectItem value="201-300">201-300</SelectItem>
                      <SelectItem value="301-400">301-400</SelectItem>
                      <SelectItem value="401-500">401-500</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Initial Investment Filter */}
                  <Select
                    value={filters.initialInvestment}
                    onValueChange={(value) =>
                      handleFilterChange("initialInvestment", value)
                    }
                  >
                    <SelectTrigger className="w-[110px] bg-background/70 border-border focus:border-blue-500 focus:ring-blue-500/20 text-sm">
                      <SelectValue placeholder="Initial Investment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Investments</SelectItem>
                      <SelectItem value="0-50k">Under $50K</SelectItem>
                      <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                      <SelectItem value="100k-250k">$100K - $250K</SelectItem>
                      <SelectItem value="250k-500k">$250K - $500K</SelectItem>
                      <SelectItem value="500k+">$500K+</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Industry Filter */}
                  {/* <Select
                    value={filters.industry}
                    onValueChange={(value) =>
                      handleFilterChange("industry", value)
                    }
                  >
                    <SelectTrigger  className="w-[110px] bg-background/70 border-border focus:border-blue-500 focus:ring-blue-500/20 text-sm">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="Food & Beverage">
                        Food & Beverage
                      </SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Health & Fitness">
                        Health & Fitness
                      </SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Automotive">Automotive</SelectItem>
                      <SelectItem value="Home Services">
                        Home Services
                      </SelectItem>
                      <SelectItem value="Business Services">
                        Business Services
                      </SelectItem>
                    </SelectContent>
                  </Select> */}

                  {/* Founded Filter */}
                  <Select
                    value={filters.founded}
                    onValueChange={(value) =>
                      handleFilterChange("founded", value)
                    }
                  >
                    <SelectTrigger className="w-[110px] bg-background/70 border-border focus:border-blue-500 focus:ring-blue-500/20 text-sm">
                      <SelectValue placeholder="Founded" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="2020+">2020 or Later</SelectItem>
                      <SelectItem value="2010-2019">2010-2019</SelectItem>
                      <SelectItem value="2000-2009">2000-2009</SelectItem>
                      <SelectItem value="1990-1999">1990-1999</SelectItem>
                      <SelectItem value="1980-1989">1980-1989</SelectItem>
                      <SelectItem value="pre-1980">Before 1980</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Employees at HQ Filter */}
                  <Select
                    value={filters.empAtHq}
                    onValueChange={(value) =>
                      handleFilterChange("empAtHq", value)
                    }
                  >
                    <SelectTrigger className="w-[110px] bg-background/70 border-border focus:border-blue-500 focus:ring-blue-500/20 text-sm">
                      <SelectValue placeholder="Emp. At HQ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sizes</SelectItem>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-100">51-100</SelectItem>
                      <SelectItem value="101-500">101-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>

                  {/*  */}
                  <Select
                    value={filters.units2024}
                    onValueChange={(value) =>
                      handleFilterChange("units2024", value)
                    }
                  >
                    <SelectTrigger className="w-[110px] bg-background/70 border-border focus:border-blue-500 focus:ring-blue-500/20 text-sm">
                      <SelectValue placeholder="Units (2024)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Unit Counts</SelectItem>
                      <SelectItem value="1-50">1-50 Units</SelectItem>
                      <SelectItem value="51-100">51-100 Units</SelectItem>
                      <SelectItem value="101-500">101-500 Units</SelectItem>
                      <SelectItem value="501-1000">501-1000 Units</SelectItem>
                      <SelectItem value="1000+">1000+ Units</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters Button */}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilters({
                        search: "",
                        industry: "all",
                        location: "all",
                        ranking: "all",
                        annualRevenue: "all",
                        employees: "all",
                        growthRate: "all",
                        rank: "all",
                        initialInvestment: "all",
                        founded: "all",
                        empAtHq: "all",
                        units2024: "all",
                      })
                    }
                    className="bg-background/70 border-border hover:bg-muted/50 text-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>

                {/* Units 2024 Filter - Full Width */}
                <div className="flex flex-wrap gap-2 items-center"></div>
              </CardContent>
            </Card>

            {franchisesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                <CardContent className="p-0">
                  <div className="overflow-x-auto w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b-2 border-border bg-muted/50">
                          <TableHead className="w-16 text-center font-semibold text-muted-foreground py-4 whitespace-nowrap">
                            Logo
                          </TableHead>
                          <TableHead className="min-w-[200px] font-semibold text-muted-foreground py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              Brand Name
                              <ChevronLeft className="h-4 w-4 rotate-90 text-muted-foreground" />
                            </div>
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Industry
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Rank
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Initial
                            <br />
                            Investment
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Units
                            <br />
                            (2024)
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Founded
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Franchise
                            <br />
                            Fee
                          </TableHead>
                          <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                            Net Worth
                            <br />
                            Required
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {franchises?.map((company, index) => (
                          <TableRow
                            key={company.id}
                            className={`border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group ${index % 2 === 0 ? "bg-card" : "bg-muted/30"}`}
                            onClick={() => handleFranchiseClick(company)}
                          >
                            <TableCell className="text-sm px-2 py-2 max-w-[100px] text-center truncate">
                              <div className="">
                                {getFranchiseCompanyImage(company) ? (
                                  <img
                                    src={getFranchiseCompanyImage(company)!}
                                    alt={company.title || "Franchise"}
                                    className="w-12 h-12 rounded-lg object-cover border border-border shadow-sm"
                                    onError={(e) => {
                                      const target =
                                        e.currentTarget as HTMLImageElement;
                                      const nextSibling =
                                        target.nextElementSibling as HTMLElement;
                                      target.style.display = "none";
                                      if (nextSibling)
                                        nextSibling.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ${getFranchiseCompanyImage(company) ? "hidden" : "flex"}`}
                                >
                                  {company.title?.charAt(0) || "?"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="space-y-1">
                                <div className="font-semibold text-foreground text-sm">
                                  {company.title || "Unnamed Franchise"}
                                </div>
                                {company.url && (
                                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {company.url
                                      .replace(/^https?:\/\//, "")
                                      .replace(/\/$/, "")}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium">
                              {company.industry || "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                              {company.rank ? (
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-semibold">
                                  #{company.rank}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                              {(company as any).initial_investment ? (
                                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-semibold">
                                  {(company as any).initial_investment}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                              {(company as any).units_as_of_2024 ||
                              (company as any).num_of_units ? (
                                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-semibold">
                                  {(company as any).units_as_of_2024 ||
                                    (company as any).num_of_units}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                              {company.founded || "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                              {(company as any).initial_franchise_fee ? (
                                <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-semibold">
                                  {(company as any).initial_franchise_fee}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium text-center">
                              {(company as any).net_worth_requirement ? (
                                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full text-xs font-semibold">
                                  {(company as any).net_worth_requirement}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pagination for Franchises */}
            {franchises && franchises.length > 0 && franchisesCount && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    franchisesCount.count,
                  )}{" "}
                  of {franchisesCount.count} franchises
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          Math.ceil(franchisesCount.count / pagination.limit),
                        ),
                      },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pagination.page === pageNum
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: pageNum,
                              }))
                            }
                            className="h-8 w-8"
                          >
                            {pageNum}
                          </Button>
                        );
                      },
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(
                          Math.ceil(franchisesCount.count / prev.limit),
                          prev.page + 1,
                        ),
                      }))
                    }
                    disabled={
                      pagination.page >=
                      Math.ceil(franchisesCount.count / pagination.limit)
                    }
                    className="h-8"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* VC Companies Tab */}
          <TabsContent value="vc" className="space-y-6">
            {/* VC Analytics Section */}
            {!vcLoading && vcCompanies && vcCompanies.length > 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground dark:text-slate-100 mb-2">
                    VC Analytics
                  </h2>
                  <p className="text-muted-foreground">
                    Comprehensive insights into venture capital firms,
                    investment stages, and portfolio distribution
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Location Distribution */}
                  <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        Location Distribution
                        <span className="text-xs text-muted-foreground font-normal ml-2">
                          ({vcAnalytics?.regionalDistribution?.length || 0} regions, 6,255 companies)
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={320}>
                        {vcAnalyticsLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                          </div>
                        ) : (
                          <RechartsPieChart>
                            <Pie
                              data={getVcLocationDistribution(vcAnalytics)}
                              cx="50%"
                              cy="40%"
                              outerRadius={80}
                              dataKey="value"
                              minAngle={1}
                              stroke="#fff"
                              strokeWidth={1}
                            >
                              {(vcAnalytics?.regionalDistribution || []).map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={getChartColor(index)}
                                  />
                                ),
                              )}
                            </Pie>
                            <Tooltip
                              formatter={(value: any, name: any) => [value, name]}
                              contentStyle={{
                                background: "#fff",
                                color: "#333",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={60}
                              wrapperStyle={{
                                paddingTop: "10px",
                                fontSize: "11px",
                                color: "hsl(var(--foreground))"
                              }}
                              payload={getVcLocationDistribution(vcAnalytics).slice(0, 10).map((entry: any, index: number) => ({
                                value: `${entry.name} (${entry.value})`,
                                type: 'rect',
                                color: getChartColor(index),
                                payload: entry
                              }))}
                            />
                          </RechartsPieChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Industry Focus */}
                  <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-purple-600" />
                        Industry Focus
                        <span className="text-xs text-muted-foreground font-normal ml-2">
                          ({vcAnalytics?.industryDistribution?.length || 0} categories, 6,255 companies)
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={320}>
                        {vcAnalyticsLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                          </div>
                        ) : (
                          <RechartsPieChart>
                            <Pie
                              data={getVcIndustryDistribution(vcAnalytics)}
                              cx="50%"
                              cy="40%"
                              outerRadius={80}
                              dataKey="value"
                              minAngle={0.5}
                              stroke="#fff"
                              strokeWidth={0.5}
                            >
                              {getVcIndustryDistribution(vcAnalytics).map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={getChartColor(index)}
                                  />
                                ),
                              )}
                            </Pie>
                            <Tooltip
                              formatter={(value: any, name: any) => [value, name]}
                              contentStyle={{
                                background: "#fff",
                                color: "#333",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={60}
                              wrapperStyle={{
                                paddingTop: "10px",
                                fontSize: "11px",
                                color: "hsl(var(--foreground))"
                              }}
                              payload={getVcIndustryDistribution(vcAnalytics).slice(0, 3).map((entry: any, index: number) => ({
                                value: `${entry.name} (${entry.value})`,
                                type: 'rect',
                                color: getChartColor(index),
                                payload: entry
                              }))}
                            />
                          </RechartsPieChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* VC Filters */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search VC companies..."
                          value={filters.search}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="pl-10 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-gray-700 focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* VC-specific filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select
                      value={filters.location}
                      onValueChange={(value) =>
                        handleFilterChange("location", value)
                      }
                    >
                      <SelectTrigger className="w-[130px] border-border bg-background/80">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="United States">
                          United States
                        </SelectItem>
                        <SelectItem value="United Kingdom">
                          United Kingdom
                        </SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Singapore">Singapore</SelectItem>
                        <SelectItem value="Netherlands">Netherlands</SelectItem>
                        <SelectItem value="Switzerland">Switzerland</SelectItem>
                        <SelectItem value="South Africa">
                          South Africa
                        </SelectItem>
                        <SelectItem value="Finland">Finland</SelectItem>
                        <SelectItem value="Estonia">Estonia</SelectItem>
                        <SelectItem value="Italy">Italy</SelectItem>
                        <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                        <SelectItem value="Malaysia">Malaysia</SelectItem>
                        <SelectItem value="Portugal">Portugal</SelectItem>
                        <SelectItem value="Russia">Russia</SelectItem>
                        <SelectItem value="Tunisia">Tunisia</SelectItem>
                        <SelectItem value="Ukraine">Ukraine</SelectItem>
                        <SelectItem value="Austria">Austria</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.industry}
                      onValueChange={(value) =>
                        handleFilterChange("industry", value)
                      }
                    >
                      <SelectTrigger className="w-[130px] border-border bg-background/80">
                        <SelectValue placeholder="Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        <SelectItem value="Fintech">FinTech</SelectItem>
                        <SelectItem value="Financial Services">
                          Financial Services
                        </SelectItem>
                        <SelectItem value="Healthcare Services">
                          Healthcare
                        </SelectItem>
                        <SelectItem value="HealthTech">HealthTech</SelectItem>
                        <SelectItem value="MedTech">MedTech</SelectItem>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="AI">AI/ML</SelectItem>
                        <SelectItem value="Machine Learning (ML)">
                          Machine Learning
                        </SelectItem>
                        <SelectItem value="Business Services (B2B)">
                          B2B Services
                        </SelectItem>
                        <SelectItem value="Consumer Services (B2C)">
                          B2C Services
                        </SelectItem>
                        <SelectItem value="E-commerce/Marketplace">
                          E-commerce
                        </SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Edtech">EdTech</SelectItem>
                        <SelectItem value="CleanTech">CleanTech</SelectItem>
                        <SelectItem value="ClimateTech">ClimateTech</SelectItem>
                        <SelectItem value="AgriTech">AgriTech</SelectItem>
                        <SelectItem value="Foodtech">FoodTech</SelectItem>
                        <SelectItem value="TravelTech">TravelTech</SelectItem>
                        <SelectItem value="AdTech">AdTech</SelectItem>
                        <SelectItem value="HRTech">HRTech</SelectItem>
                        <SelectItem value="LegalTech">LegalTech</SelectItem>
                        <SelectItem value="Blockchain/Crypto">
                          Blockchain/Crypto
                        </SelectItem>
                        <SelectItem value="Web3">Web3</SelectItem>
                        <SelectItem value="Cybersecurity">
                          Cybersecurity
                        </SelectItem>
                        <SelectItem value="Cloud">Cloud</SelectItem>
                        <SelectItem value="Internet of Things (IoT)">
                          IoT
                        </SelectItem>
                        <SelectItem value="VR/AR">VR/AR</SelectItem>
                        <SelectItem value="Gaming">Gaming</SelectItem>
                        <SelectItem value="Media and Entertainment">
                          Media & Entertainment
                        </SelectItem>
                        <SelectItem value="Marketing and Advertising">
                          Marketing & Advertising
                        </SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="PropTech / ConTech">
                          PropTech
                        </SelectItem>
                        <SelectItem value="Transportation">
                          Transportation
                        </SelectItem>
                        <SelectItem value="Mobility">Mobility</SelectItem>
                        <SelectItem value="Logistics">Logistics</SelectItem>
                        <SelectItem value="Energy">Energy</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Biotechnology">
                          Biotechnology
                        </SelectItem>
                        <SelectItem value="Life Sciences">
                          Life Sciences
                        </SelectItem>
                        <SelectItem value="Pharmaceuticals">
                          Pharmaceuticals
                        </SelectItem>
                        <SelectItem value="Medical Devices">
                          Medical Devices
                        </SelectItem>
                        <SelectItem value="Fashion/Beauty">
                          Fashion/Beauty
                        </SelectItem>
                        <SelectItem value="Food and Beverage">
                          Food & Beverage
                        </SelectItem>
                        <SelectItem value="Sports/SportsTech">
                          Sports/SportsTech
                        </SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Femtech">FemTech</SelectItem>
                        <SelectItem value="KidTech/FamilyTech">
                          KidTech/FamilyTech
                        </SelectItem>
                        <SelectItem value="Deeptech">DeepTech</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.investmentStage}
                      onValueChange={(value) =>
                        handleFilterChange("investmentStage", value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[130px] border-border bg-background/80">
                        <SelectValue placeholder="Investment Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stages</SelectItem>
                        <SelectItem value="Pre-seed">Pre-Seed</SelectItem>
                        <SelectItem value="Seed">Seed</SelectItem>
                        <SelectItem value="Series A">Series A</SelectItem>
                        <SelectItem value="Series B">Series B</SelectItem>
                        <SelectItem value="Series C">Series C</SelectItem>
                        <SelectItem value="Late Stage">Late Stage</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.aum}
                      onValueChange={(value) =>
                        handleFilterChange("aum", value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[125px] border-border bg-background/80">
                        <SelectValue placeholder="AUM Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All AUM</SelectItem>
                        <SelectItem value="under-50m">Under $50M</SelectItem>
                        <SelectItem value="50m-100m">$50M - $100M</SelectItem>
                        <SelectItem value="100m-500m">$100M - $500M</SelectItem>
                        <SelectItem value="500m-1b">$500M - $1B</SelectItem>
                        <SelectItem value="over-1b">Over $1B</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.investmentTicket}
                      onValueChange={(value) =>
                        handleFilterChange("investmentTicket", value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[125px] border-border bg-background/80">
                        <SelectValue placeholder="Ticket Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sizes</SelectItem>
                        <SelectItem value="$0-1 m">$0-1M</SelectItem>
                        <SelectItem value="$1-5 m">$1-5M</SelectItem>
                        <SelectItem value="$5-10 m">$5-10M</SelectItem>
                        <SelectItem value="$10-50 m">$10-50M</SelectItem>
                        <SelectItem value="$100+ m">$100M+</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          search: "",
                          industry: "all",
                          location: "all",
                          investmentStage: "all",
                          aum: "all",
                          investmentTicket: "all",
                        }));
                        setPagination((prev) => ({ ...prev, page: 1 }));
                      }}
                      className="w-full sm:w-[125px] border-border bg-background/80"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear Filters
                    </Button>
                  </div>

                  {/* Filter summary and clear */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {vcCount?.count || 0} VC companies found
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {vcLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                {/* VC Companies Table */}
                <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto w-full">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b-2 border-border bg-muted/50">
                            <TableHead className="w-16 text-center font-semibold text-muted-foreground py-4 whitespace-nowrap">
                              Logo
                            </TableHead>
                            <TableHead className="min-w-[200px] font-semibold text-muted-foreground py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                Name
                                <ChevronLeft className="h-4 w-4 rotate-90 text-muted-foreground" />
                              </div>
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                              Location
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                              Founded
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                              AUM
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                              Investment
                              <br />
                              Stage
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                              Investment
                              <br />
                              Ticket
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                              Industry
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold py-4 whitespace-nowrap">
                              Region
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vcCompanies?.map((company, index) => (
                            <TableRow
                              key={company.id}
                              className={`border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group ${index % 2 === 0 ? "bg-card" : "bg-muted/30"}`}
                              onClick={() => handleVcClick(company)}
                            >
                              <TableCell className="py-2 px-3">
                                <div className="">
                                  {getVcCompanyImage(company) ? (
                                    <img
                                      src={getVcCompanyImage(company)!}
                                      alt={company.title || "VC Company"}
                                      className="w-12 h-12 rounded-lg object-cover border border-border shadow-sm"
                                      onError={(e) => {
                                        const target =
                                          e.currentTarget as HTMLImageElement;
                                        const nextSibling =
                                          target.nextElementSibling as HTMLElement;
                                        target.style.display = "none";
                                        if (nextSibling)
                                          nextSibling.style.display = "flex";
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ${getVcCompanyImage(company) ? "hidden" : "flex"}`}
                                  >
                                    {company.title?.charAt(0) || "?"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="space-y-1">
                                  <div className="font-semibold text-foreground text-sm">
                                    {company.title || "Unnamed VC"}
                                  </div>
                                  {company.url && (
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {company.url
                                        .replace(/^https?:\/\//, "")
                                        .replace(/\/$/, "")}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium">
                                {company.location || "-"}
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium">
                                {company.founded || "-"}
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="text-sm font-semibold text-foreground">
                                  {company.aum || "-"}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium">
                                {company.investmentStage || "-"}
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium">
                                {company.investmentTicket || "-"}
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium">
                                {company.industry || "-"}
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4 px-6 text-sm font-medium">
                                {company.regionOfInvestment || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* VC Pagination */}
                {vcCompanies && vcCompanies.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        vcCount?.count || 0,
                      )}{" "}
                      of {vcCount?.count || 0} results
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: Math.max(1, prev.page - 1),
                          }))
                        }
                        disabled={pagination.page === 1}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground px-3">
                        Page {pagination.page} of{" "}
                        {Math.ceil((vcCount?.count || 0) / pagination.limit)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: prev.page + 1,
                          }))
                        }
                        disabled={
                          pagination.page >=
                          Math.ceil((vcCount?.count || 0) / pagination.limit)
                        }
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Dialog Components */}
        <StartupDetailDialog
          company={selectedStartup}
          open={isStartupDialogOpen}
          onOpenChange={setIsStartupDialogOpen}
        />

        {selectedGrowthCompany && (
          <GrowthDetailDialog
            company={selectedGrowthCompany}
            open={isGrowthDialogOpen}
            onOpenChange={setIsGrowthDialogOpen}
          />
        )}

        <FranchiseDetailDialog
          company={selectedFranchise}
          open={isFranchiseDialogOpen}
          onOpenChange={setIsFranchiseDialogOpen}
        />

        <VcDetailDialog
          company={selectedVcCompany}
          open={isVcDialogOpen}
          onOpenChange={setIsVcDialogOpen}
        />
      </div>
    </AppLayout>
  );
}
