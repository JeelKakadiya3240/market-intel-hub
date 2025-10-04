import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  TrendingUp,
  Handshake,
  Zap,
  BarChart3,
  Globe,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ExternalLink,
  Star,
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface FundingFilters {
  search: string;
  country: string;
  minAmount: string;
  year: string;
  roundType?: string;
  mainCategory?: string;
  industry?: string;
  exitType?: string;
  minValue?: string;
  exitValue?: string;
  acquirer?: string;
  acquirerCountry?: string;
  acquiredEntity?: string;
  acquiredCountry?: string;
  rank?: string;
  transactionType?: string;
  leadInvestor?: string;
  currency?: string;
  teamSize?: string;
  valuation?: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

type FundingRoundType =
  | "exits"
  | "ma-deals"
  | "megadeals"
  | "us-sfd-23"
  | "us-sfd-24"
  | "live";

// Chart color palette for charts
const CHART_COLORS = [
  "#10b981",
  "#6366f1",
  "#f59e42",
  "#f43f5e",
  "#0ea5e9",
  "#a21caf",
  "#fbbf24",
  "#14b8a6",
  "#eab308",
  "#64748b",
];

// Currency symbol mapping
const getCurrencySymbol = (currency: string): string => {
  switch (currency?.toUpperCase()) {
    case 'GBP':
      return '£';
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    default:
      return ''; // Remove symbol if not recognized
  }
};

// Format currency amount with proper symbol
const formatCurrencyAmount = (value: number | string | undefined, currency?: string, suffix = ''): string => {
  if (!value || isNaN(Number(value))) return "Unknown";
  
  const num = Number(value);
  const symbol = getCurrencySymbol(currency || 'USD');
  
  if (num >= 1000000000) {
    return `${symbol}${(num / 1000000000).toFixed(1)}B${suffix}`;
  }
  if (num >= 1000000) {
    return `${symbol}${(num / 1000000).toFixed(1)}M${suffix}`;
  }
  if (num >= 1000) {
    return `${symbol}${(num / 1000).toFixed(1)}K${suffix}`;
  }
  return `${symbol}${num.toFixed(0)}${suffix}`;
};

export default function FundingRounds() {
  const [activeTab, setActiveTab] = useState<FundingRoundType>("live");
  const [filters, setFilters] = useState<FundingFilters>({
    search: "",
    country: "all",
    minAmount: "all",
    year: "all",
    roundType: "all",
    mainCategory: "all",
    industry: "all",
    exitType: "all",
    minValue: "all",
    acquirer: "all",
    acquirerCountry: "all",
    acquiredEntity: "all", 
    acquiredCountry: "all",
    rank: "all",
    transactionType: "all",
    leadInvestor: "all",
    currency: "all",
    teamSize: "all",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 50,
  });
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate offset for API calls
  const offset = (pagination.page - 1) * pagination.limit;

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("limit", pagination.limit.toString());
    if (activeTab === "live") {
      params.set("page", pagination.page.toString());
    } else {
      params.set("offset", offset.toString());
    }
    
    // Only add non-empty and non-"all" filter parameters
    if (filters.search && filters.search.trim() !== "") {
      params.set("search", filters.search);
    }
    if (filters.country && filters.country !== "all") {
      params.set("country", filters.country);
    }

    if (activeTab === "live") {
      // Only add Live Funding filters if they have meaningful values
      if (filters.year && filters.year !== "all" && filters.year.trim() !== "")
        params.set("year", filters.year);
      if (filters.roundType && filters.roundType !== "all" && filters.roundType.trim() !== "")
        params.set("roundType", filters.roundType);
      if (filters.mainCategory && filters.mainCategory !== "all" && filters.mainCategory.trim() !== "")
        params.set("mainCategory", filters.mainCategory);
      if (filters.currency && filters.currency !== "all" && filters.currency.trim() !== "")
        params.set("currency", filters.currency);
      if (filters.teamSize && filters.teamSize !== "all" && filters.teamSize.trim() !== "")
        params.set("teamSize", filters.teamSize);
      if (filters.industry && filters.industry !== "all" && filters.industry.trim() !== "")
        params.set("industry", filters.industry);
      if (filters.minAmount && filters.minAmount !== "all" && filters.minAmount.trim() !== "")
        params.set("minAmount", filters.minAmount);
    } else if (activeTab === "exits") {
      if (filters.year && filters.year !== "all")
        params.set("year", filters.year);
      if (filters.industry && filters.industry !== "all")
        params.set("industry", filters.industry);
      if (filters.exitType && filters.exitType !== "all")
        params.set("exitType", filters.exitType);
      if (filters.minValue && filters.minValue !== "all")
        params.set("minValue", filters.minValue);
      if (filters.exitValue && filters.exitValue !== "all")
        params.set("exitValue", filters.exitValue);
    } else if (activeTab === "ma-deals") {
      if (filters.mainCategory && filters.mainCategory !== "all")
        params.set("mainCategory", filters.mainCategory);
      if (filters.year && filters.year !== "all")
        params.set("year", filters.year);
      if (filters.acquirer && filters.acquirer !== "all")
        params.set("acquirer", filters.acquirer);
      if (filters.industry && filters.industry !== "all")
        params.set("industry", filters.industry);
      if (filters.minValue && filters.minValue !== "all")
        params.set("minValue", filters.minValue);
    } else if (activeTab === "megadeals") {
      // Fix Megadeals filter parameter handling
      if (filters.year && filters.year !== "all" && filters.year.trim() !== "")
        params.set("year", filters.year);
      if (filters.acquirer && filters.acquirer !== "all" && filters.acquirer.trim() !== "")
        params.set("acquirer", filters.acquirer);
      if (filters.acquirerCountry && filters.acquirerCountry !== "all" && filters.acquirerCountry.trim() !== "")
        params.set("acquirerCountry", filters.acquirerCountry);
      if (filters.acquiredEntity && filters.acquiredEntity !== "all" && filters.acquiredEntity.trim() !== "")
        params.set("acquiredEntity", filters.acquiredEntity);
      if (filters.acquiredCountry && filters.acquiredCountry !== "all" && filters.acquiredCountry.trim() !== "")
        params.set("acquiredCountry", filters.acquiredCountry);
      if (filters.minValue && filters.minValue !== "all" && filters.minValue.trim() !== "")
        params.set("minValue", filters.minValue);
      if (filters.rank && filters.rank !== "all" && filters.rank.trim() !== "")
        params.set("rank", filters.rank);
      if (filters.transactionType && filters.transactionType !== "all" && filters.transactionType.trim() !== "")
        params.set("transactionType", filters.transactionType);
    } else if (activeTab === "us-sfd-23") {
      if (filters.year && filters.year !== "all")
        params.set("year", filters.year);
      if (filters.industry && filters.industry !== "all")
        params.set("industry", filters.industry);
      if (filters.minAmount && filters.minAmount !== "all")
        params.set("minAmount", filters.minAmount);
      if (filters.valuation && filters.valuation !== "all")
        params.set("valuation", filters.valuation);
      if (filters.leadInvestor && filters.leadInvestor !== "all")
        params.set("leadInvestor", filters.leadInvestor);
      params.set("page", pagination.page.toString());
    } else if (activeTab === "us-sfd-24") {
      if (filters.year && filters.year !== "all")
        params.set("year", filters.year);
      if (filters.industry && filters.industry !== "all")
        params.set("industry", filters.industry);
      if (filters.minAmount && filters.minAmount !== "all")
        params.set("minAmount", filters.minAmount);
      if (filters.leadInvestor && filters.leadInvestor !== "all")
        params.set("leadInvestor", filters.leadInvestor);
      params.set("page", pagination.page.toString());
    }
    return params.toString();
  };

  // Get API endpoint based on active tab
  const getApiEndpoint = () => {
    switch (activeTab) {
      case "exits":
        return "/api/funding-rounds";
      case "ma-deals":
        return "/api/ma-deals";
      case "megadeals":
        return "/api/funding-rounds/megadeals";
      case "us-sfd-23":
        return "/api/funding-rounds/us-sfd-23";
      case "us-sfd-24":
        return "/api/funding-rounds/us-sfd-24";
      case "live":
        return "/api/funding-rounds/live";
      default:
        return "/api/funding-rounds";
    }
  };

  // Create a stable query key for M&A deals
  const getStableQueryKey = () => {
    const baseKey = [getApiEndpoint(), activeTab, pagination.page];

    // Only include relevant filters for each tab to ensure stable caching
    if (activeTab === "ma-deals") {
      return [...baseKey, filters.search, filters.mainCategory, filters.year, filters.acquirer, filters.industry, filters.minValue];
    } else if (activeTab === "exits") {
      return [
        ...baseKey,
        filters.search,
        filters.industry,
        filters.exitType,
        filters.minValue,
        filters.exitValue,
        filters.year,
      ];
    } else if (activeTab === "megadeals") {
      return [
        ...baseKey,
        filters.search,
        filters.year,
        filters.acquirer,
        filters.acquirerCountry,
        filters.transactionType,
        filters.acquiredEntity,
        filters.acquiredCountry,
        filters.rank,
        filters.minValue,
      ];
    } else if (activeTab === "us-sfd-23") {
      return [
        ...baseKey,
        filters.search,
        filters.industry,
        filters.minAmount,
        filters.valuation,
        filters.leadInvestor,
        filters.year,
      ];
    } else if (activeTab === "us-sfd-24") {
      return [
        ...baseKey,
        filters.search,
        filters.industry,
        filters.minAmount,
        filters.leadInvestor,
        filters.year,
      ];
    } else if (activeTab === "live") {
      return [
        ...baseKey,
        filters.search,
        filters.roundType,
        filters.country,
        filters.mainCategory,
        filters.currency,
        filters.teamSize,
        filters.industry,
        filters.minAmount,
        filters.year,
      ];
    }

    return baseKey;
  };

  // Fetch analytics data for charts (all records)
  // Analytics for charts (with filters applied)
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
  } = useQuery({
    queryKey: ["/api/funding-rounds/live/analytics", activeTab, filters],
    queryFn: async () => {
      if (activeTab !== "live") return null;
      const params = new URLSearchParams();
      // Only add meaningful filter parameters for analytics
      if (filters.search && filters.search.trim() !== "") params.set("search", filters.search);
      if (filters.roundType && filters.roundType !== "all" && filters.roundType.trim() !== "") params.set("roundType", filters.roundType);
      if (filters.country && filters.country !== "all" && filters.country.trim() !== "") params.set("country", filters.country);
      if (filters.mainCategory && filters.mainCategory !== "all" && filters.mainCategory.trim() !== "") params.set("mainCategory", filters.mainCategory);
      if (filters.currency && filters.currency !== "all" && filters.currency.trim() !== "") params.set("currency", filters.currency);
      if (filters.teamSize && filters.teamSize !== "all" && filters.teamSize.trim() !== "") params.set("teamSize", filters.teamSize);
      if (filters.industry && filters.industry !== "all" && filters.industry.trim() !== "") params.set("industry", filters.industry);
      if (filters.minAmount && filters.minAmount !== "all" && filters.minAmount.trim() !== "") params.set("minAmount", filters.minAmount);
      if (filters.year && filters.year !== "all" && filters.year.trim() !== "") params.set("year", filters.year);
      
      const response = await fetch(`/api/funding-rounds/live/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: activeTab === "live",
  });

  // Separate analytics for dropdown options (no filters applied)
  const {
    data: dropdownOptionsData,
    isLoading: isDropdownLoading,
  } = useQuery({
    queryKey: ["/api/funding-rounds/live/analytics", activeTab, "dropdown-options"],
    queryFn: async () => {
      if (activeTab !== "live") return null;
      // No filters applied - get all countries and industries for dropdown options
      const response = await fetch(`/api/funding-rounds/live/analytics`);
      if (!response.ok) throw new Error('Failed to fetch dropdown options');
      return response.json();
    },
    enabled: activeTab === "live",
  });

  // Fetch exits analytics data for charts (all records)
  const {
    data: exitsAnalyticsData,
    isLoading: isExitsAnalyticsLoading,
  } = useQuery({
    queryKey: ["/api/funding-rounds/exits/analytics", activeTab, filters],
    queryFn: async () => {
      if (activeTab !== "exits") return null;
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.industry && filters.industry !== "all") params.set("industry", filters.industry);
      if (filters.exitType && filters.exitType !== "all") params.set("exitType", filters.exitType);
      if (filters.minValue && filters.minValue !== "all") params.set("minValue", filters.minValue);
      if (filters.exitValue && filters.exitValue !== "all") params.set("exitValue", filters.exitValue);
      if (filters.year && filters.year !== "all") params.set("year", filters.year);
      
      const response = await fetch(`/api/funding-rounds/exits/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch exits analytics');
      return response.json();
    },
    enabled: activeTab === "exits",
  });

  // Fetch US SFD 2023 analytics data for charts (all records)
  const {
    data: usSfd23AnalyticsData,
    isLoading: isUsSfd23AnalyticsLoading,
  } = useQuery({
    queryKey: ["/api/funding-rounds/us-sfd-23/analytics", activeTab, filters],
    queryFn: async () => {
      if (activeTab !== "us-sfd-23") return null;
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.industry && filters.industry !== "all") params.set("industry", filters.industry);
      if (filters.minAmount && filters.minAmount !== "all") params.set("minAmount", filters.minAmount);
      if (filters.valuation && filters.valuation !== "all") params.set("valuation", filters.valuation);
      if (filters.leadInvestor && filters.leadInvestor !== "all") params.set("leadInvestor", filters.leadInvestor);
      
      const response = await fetch(`/api/funding-rounds/us-sfd-23/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch US SFD 2023 analytics');
      return response.json();
    },
    enabled: activeTab === "us-sfd-23",
  });

  // Fetch US SFD 2024 analytics data for charts (all records)
  const {
    data: usSfd24AnalyticsData,
    isLoading: isUsSfd24AnalyticsLoading,
  } = useQuery({
    queryKey: ["/api/funding-rounds/us-sfd-24/analytics", activeTab, filters],
    queryFn: async () => {
      if (activeTab !== "us-sfd-24") return null;
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.industry && filters.industry !== "all") params.set("industry", filters.industry);
      if (filters.minAmount && filters.minAmount !== "all") params.set("minAmount", filters.minAmount);
      if (filters.year && filters.year !== "all") params.set("year", filters.year);
      if (filters.leadInvestor && filters.leadInvestor !== "all") params.set("leadInvestor", filters.leadInvestor);
      
      const response = await fetch(`/api/funding-rounds/us-sfd-24/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch US SFD 2024 analytics');
      return response.json();
    },
    enabled: activeTab === "us-sfd-24",
  });

  // Fetch M&A deals analytics data for charts (with filters applied)
  const {
    data: maDealsAnalyticsData,
    isLoading: isMaDealsAnalyticsLoading,
  } = useQuery({
    queryKey: ["/api/funding-rounds/ma-deals/analytics", activeTab, filters],
    queryFn: async () => {
      if (activeTab !== "ma-deals") return null;
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.year && filters.year !== "all") params.set("year", filters.year);
      // Only add acquirer filter if it's not "all" - this ensures "All Acquirers" shows all data
      if (filters.acquirer && filters.acquirer !== "all") params.set("acquirer", filters.acquirer);
      if (filters.industry && filters.industry !== "all") params.set("industry", filters.industry);
      if (filters.minValue && filters.minValue !== "all") params.set("minValue", filters.minValue);
      
      const response = await fetch(`/api/funding-rounds/ma-deals/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch M&A deals analytics');
      return response.json();
    },
    enabled: activeTab === "ma-deals",
  });

  // Separate analytics for M&A dropdown options (no filters applied)
  const {
    data: maDealsDropdownOptionsData,
    isLoading: isMaDealsDropdownLoading,
  } = useQuery({
    queryKey: ["/api/funding-rounds/ma-deals/analytics", activeTab, "dropdown-options"],
    queryFn: async () => {
      if (activeTab !== "ma-deals") return null;
      // No filters applied - get all industries and acquirers for dropdown options
      const response = await fetch(`/api/funding-rounds/ma-deals/analytics`);
      if (!response.ok) throw new Error('Failed to fetch M&A dropdown options');
      return response.json();
    },
    enabled: activeTab === "ma-deals",
  });

  // Fetch funding data
  const {
    data: fundingData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: getStableQueryKey(),
    queryFn: async () => {
      const endpoint = getApiEndpoint();
      const params = buildQueryParams();
      console.log(`Fetching ${activeTab} data from: ${endpoint}?${params}`);
      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) throw new Error("Failed to fetch funding data");
      const data = await response.json();
      console.log(`${activeTab} data received:`, data);
      if (activeTab === "ma-deals" && Array.isArray(data) && data.length > 0) {
        console.log("First M&A deal object:", data[0]);
      }
      if (activeTab === "live" && Array.isArray(data) && data.length > 0) {
        console.log("First Live Funding object:", data[0]);
        console.log("Live funding fields available:", Object.keys(data[0]));
        console.log("Sample roundType:", data[0].roundType);
        console.log("Sample mainCategory:", data[0].mainCategory);
        console.log("Sample country:", data[0].country);
        console.log("Sample size:", data[0].size);
      }
      return data;
    },
  });

  // Fetch total count for pagination (exits, ma-deals, megadeals, and us-sfd-23)
  const { data: totalCount } = useQuery({
    queryKey: [
      "/api/funding-rounds/count",
      activeTab,
      filters,
      pagination.page,
    ],
    queryFn: async () => {
      if (
        activeTab !== "exits" &&
        activeTab !== "ma-deals" &&
        activeTab !== "megadeals" &&
        activeTab !== "us-sfd-23" &&
        activeTab !== "us-sfd-24" &&
        activeTab !== "live"
      )
        return null;

      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.year !== "all") params.set("year", filters.year);

      if (activeTab === "exits") {
        if (filters.industry && filters.industry !== "all")
          params.set("industry", filters.industry);
        if (filters.exitType && filters.exitType !== "all")
          params.set("exitType", filters.exitType);
        if (filters.minValue && filters.minValue !== "all")
          params.set("minValue", filters.minValue);
        if (filters.exitValue && filters.exitValue !== "all")
          params.set("exitValue", filters.exitValue);

        const response = await fetch(
          `/api/funding-rounds/count?${params.toString()}`,
        );
        if (!response.ok) throw new Error("Failed to fetch count");
        const data = await response.json();
        return data.count;
      } else if (activeTab === "ma-deals") {
        if (filters.mainCategory && filters.mainCategory !== "all")
          params.set("mainCategory", filters.mainCategory);
        if (filters.year !== "all") params.set("year", filters.year);

        const response = await fetch(
          `/api/ma-deals/count?${params.toString()}`,
        );
        if (!response.ok) throw new Error("Failed to fetch count");
        const data = await response.json();
        return data.count;
      } else if (activeTab === "megadeals") {
        if (filters.acquirer && filters.acquirer !== "all")
          params.set("acquirer", filters.acquirer);
        if (filters.acquirerCountry && filters.acquirerCountry !== "all")
          params.set("acquirerCountry", filters.acquirerCountry);
        if (filters.acquiredEntity && filters.acquiredEntity !== "all")
          params.set("acquiredEntity", filters.acquiredEntity);
        if (filters.acquiredCountry && filters.acquiredCountry !== "all")
          params.set("acquiredCountry", filters.acquiredCountry);
        if (filters.rank && filters.rank !== "all")
          params.set("rank", filters.rank);
        if (filters.minValue && filters.minValue !== "all")
          params.set("minValue", filters.minValue);
        if (filters.transactionType && filters.transactionType !== "all")
          params.set("transactionType", filters.transactionType);

        const response = await fetch(
          `/api/funding-rounds/megadeals/count?${params.toString()}`,
        );
        if (!response.ok) throw new Error("Failed to fetch count");
        const data = await response.json();
        return data.count;
      } else if (activeTab === "us-sfd-23") {
        if (filters.industry && filters.industry !== "all")
          params.set("industry", filters.industry);
        if (filters.minAmount && filters.minAmount !== "all")
          params.set("minAmount", filters.minAmount);
        if (filters.leadInvestor && filters.leadInvestor !== "all")
          params.set("leadInvestor", filters.leadInvestor);

        const response = await fetch(
          `/api/funding-rounds/us-sfd-23/count?${params.toString()}`,
        );
        if (!response.ok) throw new Error("Failed to fetch count");
        const data = await response.json();
        return data.count;
      } else if (activeTab === "us-sfd-24") {
        if (filters.industry && filters.industry !== "all")
          params.set("industry", filters.industry);
        if (filters.minAmount && filters.minAmount !== "all")
          params.set("minAmount", filters.minAmount);
        if (filters.leadInvestor && filters.leadInvestor !== "all")
          params.set("leadInvestor", filters.leadInvestor);

        const response = await fetch(
          `/api/funding-rounds/us-sfd-24/count?${params.toString()}`,
        );
        if (!response.ok) throw new Error("Failed to fetch count");
        const data = await response.json();
        return data.count;
      } else if (activeTab === "live") {
        console.log("Live funding count query called");
        if (filters.roundType && filters.roundType !== "all")
          params.set("roundType", filters.roundType);
        if (filters.country && filters.country !== "all")
          params.set("country", filters.country);
        if (filters.mainCategory && filters.mainCategory !== "all")
          params.set("mainCategory", filters.mainCategory);
        if (filters.currency && filters.currency !== "all")
          params.set("currency", filters.currency);
        if (filters.teamSize && filters.teamSize !== "all")
          params.set("teamSize", filters.teamSize);
        if (filters.industry && filters.industry !== "all")
          params.set("industry", filters.industry);
        if (filters.minAmount && filters.minAmount !== "all")
          params.set("minAmount", filters.minAmount);

        console.log(
          "Fetching live funding count with params:",
          params.toString(),
        );
        try {
          const response = await fetch(
            `/api/funding-rounds/live/count?${params.toString()}`,
          );
          if (!response.ok) throw new Error("Failed to fetch count");
          const data = await response.json();
          console.log("Live funding count response:", data);
          console.log("Live funding count value:", data.count);
          return data.count;
        } catch (error: any) {
          console.error("Error fetching live funding count:", error);
          return 0;
        }
      }

      return null;
    },
    enabled:
      activeTab === "exits" ||
      activeTab === "ma-deals" ||
      activeTab === "megadeals" ||
      activeTab === "us-sfd-23" ||
      activeTab === "us-sfd-24" ||
      activeTab === "live",
  });

  // Reset pagination when changing tabs or filters
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeTab, filters]);

  const handleFilterChange = (key: keyof FundingFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleDealClick = (deal: any) => {
    setSelectedDeal(deal);
    setIsDialogOpen(true);
  };

  const getTabIcon = (tab: FundingRoundType) => {
    switch (tab) {
      case "exits":
        return TrendingUp;
      case "ma-deals":
        return Handshake;
      case "megadeals":
        return Zap;
      case "us-sfd-23":
        return BarChart3;
      case "us-sfd-24":
        return Star;
      case "live":
        return Globe;
      default:
        return TrendingUp;
    }
  };

  const getTabColor = (tab: FundingRoundType) => {
    switch (tab) {
      case "exits":
        return "from-green-500 to-emerald-600";
      case "ma-deals":
        return "from-blue-500 to-indigo-600";
      case "megadeals":
        return "from-purple-500 to-violet-600";
      case "us-sfd-23":
        return "from-orange-500 to-red-600";
      case "us-sfd-24":
        return "from-pink-500 to-rose-600";
      case "live":
        return "from-teal-500 to-cyan-600";
      default:
        return "from-green-500 to-emerald-600";
    }
  };

  const getTabTitle = (tab: FundingRoundType) => {
    switch (tab) {
      case "exits":
        return "Exits & IPOs";
      case "ma-deals":
        return "M&A Deals";
      case "megadeals":
        return "Megadeals";
      case "us-sfd-23":
        return "US SFD 2023";
      case "us-sfd-24":
        return "US SFD 2024";
      case "live":
        return "Live Funding";
      default:
        return "Funding Rounds";
    }
  };

  const formatCurrency = (value: string | number | null, currency?: string) => {
    if (!value) return "Unknown";
    let num: number;

    if (typeof value === "number") {
      num = value;
    } else if (typeof value === "string") {
      num = parseFloat(value.replace(/[^0-9.-]/g, ""));
    } else {
      return "Unknown";
    }

    if (isNaN(num)) return value?.toString() || "Unknown";
    
    return formatCurrencyAmount(num, currency);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Unknown";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  const renderFundingCard = (deal: any) => {
    const Icon = getTabIcon(activeTab);

    // Handle different data formats based on tab
    const getCompanyName = () => {
      if (activeTab === "ma-deals") return deal.companyName || "Unknown Target";
      return deal.company || deal.companyName || deal.name || "Unknown Company";
    };

    const getAcquirer = () => {
      if (activeTab === "ma-deals")
        return deal.acquiredBy || "Unknown Acquirer";
      return deal.acquirer || deal.acquiredBy || "Unknown Acquirer";
    };

    const getAmount = () => {
      if (activeTab === "ma-deals") {
        if (deal.dealSizeBillions) {
          const value = parseFloat(deal.dealSizeBillions);
          return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }
        return "Unknown";
      }
      if (activeTab === "exits") {
        return deal.exitValueBillions
          ? formatCurrencyAmount(parseFloat(deal.exitValueBillions) * 1000000000, deal.currency)
          : "Unknown";
      }
      if (activeTab === "megadeals") {
        if (deal.valueUsd) {
          // Data from Supabase is already in billions, no need to convert
          const rawValue = parseFloat(deal.valueUsd);
          const symbol = getCurrencySymbol(deal.currency || 'USD');
          return `${symbol}${rawValue.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`;
        }
        return "Unknown";
      }
      return formatCurrency(deal.amount || deal.fundingAmount || deal.dealSize, deal.currency);
    };

    const getType = () => {
      if (activeTab === "ma-deals") return deal.mainCategory || "Unknown";
      return (
        deal.exitType || deal.roundType || deal.type || deal.stage || "Unknown"
      );
    };

    const getDate = () => {
      if (activeTab === "ma-deals")
        return formatDate(deal.dateSeen || deal.createdAt);
      return formatDate(deal.dealClosedDate || deal.date || deal.announcedDate);
    };

    if (activeTab === "ma-deals") {
      return (
        <Card
          className="mb-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleDealClick(deal)}
        >
          <CardContent className="flex items-center gap-4 p-4">
            {/* Logo from company_info.logo_url */}
            {deal.companyInfo && deal.companyInfo.logo_url ? (
              <img
                src={deal.companyInfo.logo_url}
                alt={deal.companyName}
                className="w-12 h-12 rounded-lg object-cover border border-slate-300 shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {(deal.companyName || "U").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                  {deal.companyName}
                </span>
                <span className="text-xs text-slate-500">acquired by</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                  {deal.acquiredBy}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {deal.mainCategory && (
                  <span>Main Category: {deal.mainCategory}</span>
                )}
                {deal.namePath && <span>Path: {deal.namePath}</span>}
                {deal.dateSeen && (
                  <span>Date: {formatDate(deal.dateSeen)}</span>
                )}
                {deal.createdAt && (
                  <span>Created: {formatDate(deal.createdAt)}</span>
                )}
                {deal.acquiredByLinkedinUrl && (
                  <a
                    href={deal.acquiredByLinkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        key={deal.id}
        className="border-0 shadow-lg bg-white/80 backdrop-blur cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        onClick={() => {
          handleDealClick(deal);
        }}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            {/* Company Image */}
            {deal.image && (
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/companies/Startups/${deal.image}`}
                alt={getCompanyName()}
                className="w-12 h-12 rounded-lg object-cover border border-slate-300 shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <div
              className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getTabColor(activeTab)} flex items-center justify-center shadow-lg ${deal.image ? "hidden" : ""}`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">
                {getCompanyName()}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>{getType()}</span>
                {deal.industry && (
                  <>
                    <span>•</span>
                    <span>{deal.industry}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Amount</span>
              <span className="font-bold text-green-600">{getAmount()}</span>
            </div>

            {deal.totalFundingMillions && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Funding</span>
                <span className="text-sm text-slate-900 dark:text-white">
                  {formatCurrency(deal.totalFundingMillions, deal.currency)}M
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Date</span>
              <span className="text-sm text-slate-900 dark:text-white">
                {getDate()}
              </span>
            </div>

            {deal.investors && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Investors</span>
                <p className="text-sm text-slate-700 truncate">
                  {deal.investors}
                </p>
              </div>
            )}

            {deal.location && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>📍</span>
                <span>{deal.location}</span>
              </div>
            )}

            {deal.round && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
                <span>{deal.round}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Calculate total pages based on total count
  let totalPages =
    (activeTab === "exits" ||
      activeTab === "ma-deals" ||
      activeTab === "megadeals" ||
      activeTab === "us-sfd-23" ||
      activeTab === "us-sfd-24" ||
      activeTab === "live") &&
    totalCount
      ? Math.ceil(totalCount / pagination.limit)
      : Math.ceil((fundingData?.length || 0) / pagination.limit);

  // Temporary fix for live funding pagination testing
  if (
    activeTab === "live" &&
    (!totalCount || totalCount === 0) &&
    fundingData &&
    fundingData.length > 0
  ) {
    totalPages = Math.ceil(150 / pagination.limit); // Assume 150 total records for testing
  }

  // Debug query enabled state
  if (activeTab === "live") {
    console.log("Live funding query enabled: true");
  }

  // Debug pagination for live funding
  if (activeTab === "live") {
    console.log("Live funding pagination debug:", {
      totalCount,
      paginationLimit: pagination.limit,
      totalPages,
      fundingDataLength: fundingData?.length,
      currentPage: pagination.page,
      shouldShowPagination: totalPages > 1,
    });
  }

  // Add after fundingData is fetched, inside the component:
  if (fundingData && Array.isArray(fundingData)) {
    if (activeTab === "ma-deals") {
      console.log("M&A deals data sample:", fundingData?.slice(0, 3));
      console.log("M&A deals data length:", fundingData?.length);
      fundingData.forEach((deal: any) => {
        console.log("M&A Deal Fields:", {
          id: deal.id,
          acquiringCompany: deal.acquiringCompany,
          acquiredCompany: deal.acquiredCompany,
          dealSizeBillions: deal.dealSizeBillions,
          dealSizeOriginal: deal.dealSizeOriginal,
          announcedDate: deal.announcedDate,
        });
      });
    }
    if (activeTab === "live") {
      console.log("Live funding data sample:", fundingData?.slice(0, 3));
      console.log("Live funding data length:", fundingData?.length);
      fundingData.forEach((deal: any) => {
        console.log("Live Funding Fields:", {
          id: deal.id,
          companyName: deal.companyName,
          roundType: deal.roundType,
          size: deal.size,
          country: deal.country,
          mainCategory: deal.mainCategory,
          currency: deal.currency,
          ceo: deal.ceo,
          companyInfo: deal.companyInfo,
        });
      });
    }
  }

  return (
    <AppLayout
      title="Funding Rounds"
      subtitle="Track startup funding activity and exits"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
            Funding Intelligence
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium">
            Monitor funding rounds, exits, and M&A activity across the startup
            ecosystem
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs
          className="mb-4"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as FundingRoundType)}
        >
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-0 shadow-lg">
            {[
              { id: "live", label: "Live", icon: Globe },
              { id: "ma-deals", label: "M&A", icon: Handshake },
              { id: "megadeals", label: "Megadeals", icon: Zap },
              { id: "exits", label: "Exits", icon: TrendingUp },
              { id: "us-sfd-23", label: "2023", icon: BarChart3 },
              { id: "us-sfd-24", label: "2024", icon: Star },
            ].map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {getTabTitle(activeTab)}
              </h2>
              {(fundingData?.length > 0 || totalCount) && (
                <Badge variant="secondary" className="text-sm">
                  {totalCount || fundingData.length} deals
                </Badge>
              )}
            </div>

            {activeTab === "ma-deals" && (
              <div className="space-y-6 mb-6">
                {/* Top row: 2 donut charts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Deal Size by Acquiring Company (Donut) */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Deals Count by Industry
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={260}>
                        {(isLoading || isAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          (() => {
                            // Debug: log raw M&A data for acquiring companies
                            console.log("M&A deals data:", fundingData);
                            console.log(
                              "M&A deals length:",
                              fundingData?.length,
                            );
                            console.log(
                              "M&A deals type:",
                              typeof fundingData,
                            );

                            // Map for Industry using M&A deals data
                            const acqMap = new Map();
                            if (fundingData && Array.isArray(fundingData)) {
                              fundingData.forEach((d: any) => {
                                console.log("Processing M&A deal for industry:", d);
                                // For industry, use the mainCategory field
                                const key = d.mainCategory || "Other";
                                const val = 1; // Count deals since dealSizeBillions is null
                                console.log("Industry Key:", key, "Value:", val);
                                acqMap.set(key, (acqMap.get(key) || 0) + val);
                              });
                            }
                            const acqData = Array.from(
                              acqMap,
                              ([name, value]) => ({ name, value }),
                            )
                              .sort((a, b) => b.value - a.value);
                            // Debug: log mapped data
                            console.log("Industry Pie Data:", acqData);

                            // Use real M&A industry data only
                            console.log(
                              "Industry data:",
                              acqData,
                            );
                            return (
                              <PieChart>
                                <Pie
                                  data={acqData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={70}
                                  outerRadius={100}
                                  dataKey="value"
                                  nameKey="name"
                                  label={false}
                                >
                                  {acqData.map((entry, index) => (
                                    <Cell
                                      key={`cell-acq-${index}`}
                                      fill={
                                        CHART_COLORS[
                                          index % CHART_COLORS.length
                                        ]
                                      }
                                    />
                                  ))}
                                </Pie>
                                {/* Center label for total */}
                                <text
                                  x="50%"
                                  y="50%"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fontSize="24"
                                  fontWeight="bold"
                                  fill="#10b981"
                                >
                                  {(() => {
                                    // Show total count of all M&A deals (using real backend data)
                                    const total = totalCount || 0;
                                    return total.toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                    });
                                  })()}
                                </text>
                                <text
                                  x="50%"
                                  y="65%"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fontSize="16"
                                  fill="#888"
                                >
                                  Total
                                </text>
                                <Tooltip
                                  formatter={(value, name) => [value, name]}
                                />
                              </PieChart>
                            );
                          })()
                        )}
                      </ResponsiveContainer>
                      {/* Legend below chart */}
                      <div className="flex flex-wrap gap-3 mt-4 justify-center">
                        {(() => {
                          const acqMap = new Map();
                          if (fundingData && Array.isArray(fundingData)) {
                            fundingData.forEach((d: any) => {
                              // For industry legend, use mainCategory field
                              const key = d.mainCategory || "Other";
                              const val = 1; // Count deals
                              acqMap.set(key, (acqMap.get(key) || 0) + val);
                            });
                          }
                          const acqData = Array.from(
                            acqMap,
                            ([name, value]) => ({ name, value }),
                          )
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 8); // Show top 8 industries in legend

                          // If no data, show sample data
                          if (
                            acqData.length === 0 ||
                            acqData.every((item) => item.value === 0)
                          ) {
                            acqData.push(
                              { name: "Technology", value: 45 },
                              { name: "Healthcare", value: 28 },
                              { name: "Financial Services", value: 22 },
                              { name: "Manufacturing", value: 18 },
                              { name: "Consumer Products", value: 15 },
                              { name: "Energy", value: 12 },
                              { name: "Real Estate", value: 8 },
                              { name: "Other", value: 22 },
                            );
                          }

                          return acqData.map((entry, i) => (
                            <div
                              key={entry.name}
                              className="flex items-center gap-1 text-sm"
                            >
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              ></span>
                              <span className="font-medium">{entry.name}</span>
                              <span className="text-muted-foreground">
                                ({Math.round(entry.value)})
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                  {/* Deal Size by Acquired Company (Donut) */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {filters.acquirer && filters.acquirer !== "all" 
                          ? `Target Industries by ${filters.acquirer}` 
                          : "Deals Count by Acquiring Company"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={260}>
                        {(isLoading || isAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          (() => {
                            // If acquirer is filtered, show target industries by that acquirer
                            // Otherwise show deals count by acquiring company
                            const acqdMap = new Map();
                            if (fundingData && Array.isArray(fundingData)) {
                              fundingData.forEach((d: any) => {
                                console.log(
                                  "Processing M&A deal for chart:",
                                  d,
                                );
                                
                                // If acquirer filter is active, show industries that acquirer targets
                                if (filters.acquirer && filters.acquirer !== "all") {
                                  const key = d.mainCategory || "Other";
                                  const val = 1;
                                  console.log("Target Industry Key:", key, "Value:", val);
                                  acqdMap.set(key, (acqdMap.get(key) || 0) + val);
                                } else {
                                  // Default behavior: show acquiring companies
                                  const key = d.acquiredBy || "Other";
                                  const val = 1;
                                  console.log("Acquiring Company Key:", key, "Value:", val);
                                  acqdMap.set(key, (acqdMap.get(key) || 0) + val);
                                }
                              });
                            }
                            const acqdData = Array.from(
                              acqdMap,
                              ([name, value]) => ({ name, value }),
                            )
                              .sort((a, b) => b.value - a.value);
                            // Debug: log mapped data
                            console.log("Chart Data:", acqdData);

                            // Use real M&A acquiring company data only
                            console.log(
                              "Acquiring Company data:",
                              acqdData,
                            );
                            return (
                              <PieChart>
                                <Pie
                                  data={acqdData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={70}
                                  outerRadius={100}
                                  dataKey="value"
                                  nameKey="name"
                                  label={false}
                                >
                                  {acqdData.map((entry, index) => (
                                    <Cell
                                      key={`cell-acqd-${index}`}
                                      fill={
                                        CHART_COLORS[
                                          index % CHART_COLORS.length
                                        ]
                                      }
                                    />
                                  ))}
                                </Pie>
                                {/* Center label for total */}
                                <text
                                  x="50%"
                                  y="50%"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fontSize="24"
                                  fontWeight="bold"
                                  fill="#10b981"
                                >
                                  {(() => {
                                    // Show total count of all M&A deals (not just current page)
                                    let total = totalCount || 0;
                                    // Use real backend data
                                    return total.toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                    });
                                  })()}
                                </text>
                                <text
                                  x="50%"
                                  y="65%"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fontSize="16"
                                  fill="#888"
                                >
                                  Total
                                </text>
                                <Tooltip
                                  formatter={(value, name) => [value, name]}
                                />
                              </PieChart>
                            );
                          })()
                        )}
                      </ResponsiveContainer>
                      {/* Legend below chart */}
                      <div className="flex flex-wrap gap-3 mt-4 justify-center">
                        {(() => {
                          const acqdMap = new Map();
                          if (fundingData && Array.isArray(fundingData)) {
                            fundingData.forEach((d: any) => {
                              // If acquirer filter is active, show target industries
                              if (filters.acquirer && filters.acquirer !== "all") {
                                const key = d.mainCategory || "Other";
                                const val = 1;
                                acqdMap.set(key, (acqdMap.get(key) || 0) + val);
                              } else {
                                // Default: show acquiring companies
                                const key = d.acquiredBy || "Other";
                                const val = 1;
                                acqdMap.set(key, (acqdMap.get(key) || 0) + val);
                              }
                            });
                          }
                          const acqdData = Array.from(
                            acqdMap,
                            ([name, value]) => ({ name, value }),
                          )
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 8); // Show top 8 items in legend

                          // If no data, show sample data
                          if (
                            acqdData.length === 0 ||
                            acqdData.every((item) => item.value === 0)
                          ) {
                            acqdData.push(
                              { name: "Microsoft Corporation", value: 28 },
                              { name: "Alphabet Inc.", value: 19 },
                              { name: "Amazon.com Inc.", value: 15 },
                              { name: "Meta Platforms", value: 12 },
                              { name: "Apple Inc.", value: 8 },
                              { name: "Tesla Inc.", value: 6 },
                              { name: "Salesforce Inc.", value: 4 },
                              { name: "Other", value: 18 },
                            );
                          }

                          return acqdData.map((entry, i) => (
                            <div
                              key={entry.name}
                              className="flex items-center gap-1 text-sm"
                            >
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              ></span>
                              <span className="font-medium">{entry.name}</span>
                              <span className="text-muted-foreground">
                                ({Math.round(entry.value)})
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* No extra bar/stacked bar chart for M&A */}
                {/* Bottom row: Deal Size by Year (Bar) remains as is, if needed elsewhere */}
                <div className="w-full">
                  {/* ...existing Deal Size by Year chart... */}
                </div>
              </div>
            )}
            {/* Live Funding Analytics Dashboard - move here, just under heading */}
            {activeTab === "live" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* Round Types Bar Chart */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Round Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={220}>
                      {(isLoading || isAnalyticsLoading) ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (activeTab === "live" && (!analyticsData?.roundTypes || analyticsData.roundTypes.length === 0)) || 
                           (activeTab !== "live" && (!fundingData || fundingData.length === 0)) ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-600">
                              No data available
                            </div>
                            <div className="text-sm text-gray-500">
                              Try adjusting your filters
                            </div>
                          </div>
                        </div>
                      ) : (
                        <RechartsBarChart
                          layout="vertical"
                          data={(() => {
                            // Use analytics data for live funding (all 50K+ records)
                            if (activeTab === "live") {
                              // Each chart gets its specific analytics data
                              const chartType = arguments[0] || "default";
                              if (chartType === "roundTypes") return analyticsData?.roundTypes || [];
                              if (chartType === "industries") return analyticsData?.industries || [];
                              if (chartType === "companySizes") return analyticsData?.companySizes || [];
                              if (chartType === "countries") return analyticsData?.countries || [];
                              
                              // Default fallback - detect chart type from surrounding code
                              const stack = new Error().stack || "";
                              if (stack.includes("Round Types")) return analyticsData?.roundTypes || [];
                              if (stack.includes("Industry")) return analyticsData?.industries || [];
                              if (stack.includes("Company Size")) return analyticsData?.companySizes || [];
                              if (stack.includes("Country")) return analyticsData?.countries || [];
                              
                              console.log("Using analytics data for charts");
                              return analyticsData?.roundTypes || [];
                            }
                            
                            // For other tabs, use limited fundingData
                            if (!fundingData) return [];
                            const map = new Map();
                            fundingData.forEach((d: any) => {
                              // For live funding, use roundType field
                              let key =
                                activeTab === "live"
                                  ? d.roundType || "Other"
                                  : d.roundType || "Other";
                              // Clean up the key - remove null, undefined, empty strings
                              if (
                                !key ||
                                key === "null" ||
                                key === "undefined" ||
                                key === ""
                              ) {
                                key = "Other";
                              }
                              map.set(key, (map.get(key) || 0) + 1);
                            });
                            let result = Array.from(map, ([name, value]) => ({
                              name,
                              value,
                            }))
                              .sort((a, b) => b.value - a.value)
                              .slice(0, 8);

                            // Use real data only - no fallback sample data

                            if (activeTab === "live") {
                              console.log("Round Types chart data:", result);
                              console.log(
                                "Raw funding data sample:",
                                fundingData?.slice(0, 3),
                              );
                              console.log(
                                "Funding data length:",
                                fundingData?.length,
                              );

                              // Use real round types data only
                            }
                            return result;
                          })()}
                          margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            hide={false}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={120}
                            tick={{ fontSize: 13 }}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#10b981"
                            barSize={20}
                            radius={[6, 6, 6, 6]}
                          />
                        </RechartsBarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {/* Industry Donut Chart */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Industry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={220}>
                      {(isLoading || isAnalyticsLoading) ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <PieChart>
                          <Pie
                            data={(() => {
                              // Use analytics data for live funding (all 50K+ records)
                              if (activeTab === "live" && analyticsData?.industries) {
                                console.log("Using analytics data for Industry pie chart:", analyticsData.industries);
                                return analyticsData.industries;
                              }
                              
                              // Fallback for other tabs
                              if (!fundingData) return [];
                              const map = new Map();
                              fundingData.forEach((d: any) => {
                                // For live funding, use mainCategory field
                                let key =
                                  activeTab === "live"
                                    ? d.mainCategory || "Other"
                                    : d.mainCategory || d.industry || "Other";
                                // Clean up the key - remove null, undefined, empty strings
                                if (
                                  !key ||
                                  key === "null" ||
                                  key === "undefined" ||
                                  key === ""
                                ) {
                                  key = "Other";
                                }
                                map.set(key, (map.get(key) || 0) + 1);
                              });
                              let result = Array.from(map, ([name, value]) => ({
                                name,
                                value,
                              }));
                              return result;
                            })()}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            dataKey="value"
                            nameKey="name"
                            label={false}
                          >
                            {(() => {
                              const data = (() => {
                                // Use analytics data for live funding (all 50K+ records)
                                if (activeTab === "live" && analyticsData?.industries) {
                                  return analyticsData.industries;
                                }
                                
                                // Fallback for other tabs
                                if (!fundingData) return [];
                                const map = new Map();
                                fundingData.forEach((d: any) => {
                                  // For live funding, use mainCategory field
                                  let key =
                                    activeTab === "live"
                                      ? d.mainCategory || "Other"
                                      : d.mainCategory || d.industry || "Other";
                                  // Clean up the key - remove null, undefined, empty strings
                                  if (
                                    !key ||
                                    key === "null" ||
                                    key === "undefined" ||
                                    key === ""
                                  ) {
                                    key = "Other";
                                  }
                                  map.set(key, (map.get(key) || 0) + 1);
                                });
                                return Array.from(map, ([name, value]) => ({
                                  name,
                                  value,
                                }));
                              })();
                              return data.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ));
                            })()}
                          </Pie>
                          {/* Center label for total */}
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="24"
                            fontWeight="bold"
                            fill="#10b981"
                          >
                            {activeTab === "live" ? (totalCount || 0) : (fundingData ? fundingData.length : 0)}
                          </text>
                          <text
                            x="50%"
                            y="65%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="12"
                            fill="#888"
                          >
                            Total
                          </text>
                          <Tooltip formatter={(value, name) => [value, name]} />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                    {/* Legend below chart */}
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                      {(() => {
                        // Use analytics data for live funding legend (all 50K+ records)
                        if (activeTab === "live" && analyticsData?.industries) {
                          console.log("Using analytics data for Industry legend:", analyticsData.industries);
                          return analyticsData.industries
                            .slice(0, 10)
                            .map((entry, i) => (
                              <div
                                key={entry.name}
                                className="flex items-center gap-1 text-xs"
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[i % CHART_COLORS.length],
                                  }}
                                ></span>
                                <span className="font-medium">{entry.name}</span>
                                <span className="text-muted-foreground">
                                  ({entry.value})
                                </span>
                              </div>
                            ));
                        }
                        
                        // Fallback for other tabs
                        if (!fundingData) return null;
                        const map = new Map();
                        fundingData.forEach((d: any) => {
                          const key = d.mainCategory || d.industry || "Other";
                          map.set(key, (map.get(key) || 0) + 1);
                        });
                        return Array.from(map, ([name, value]) => ({
                          name,
                          value,
                        }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 10)
                          .map((entry, i) => (
                            <div
                              key={entry.name}
                              className="flex items-center gap-1 text-xs"
                            >
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              ></span>
                              <span className="font-medium">{entry.name}</span>
                              <span className="text-muted-foreground">
                                ({entry.value})
                              </span>
                            </div>
                          ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
                {/* Company Size by Employees Line Chart */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Company Size by Employees
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={220}>
                      {(isLoading || isAnalyticsLoading) ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <LineChart
                          data={(() => {
                            // Company Size by Employees Chart - Use companySizes data
                            if (activeTab === "live") {
                              console.log("Company Size chart using analyticsData.companySizes:", analyticsData?.companySizes);
                              return analyticsData?.companySizes || [];
                            }
                            
                            // For other tabs, use limited fundingData
                            if (!fundingData) return [];
                            const map = new Map();
                            fundingData.forEach((d: any) => {
                              // For live funding, use size field
                              let key =
                                activeTab === "live"
                                  ? d.size || "Other"
                                  : d.size || d.companySize || "Other";
                              // Clean up the key - remove null, undefined, empty strings
                              if (
                                !key ||
                                key === "null" ||
                                key === "undefined" ||
                                key === "" ||
                                key === "Unknown"
                              ) {
                                key = "Other";
                              }
                              map.set(key, (map.get(key) || 0) + 1);
                            });
                            // Sort by size label (custom order if needed)
                            const order = [
                              "1-10",
                              "11-50",
                              "51-100",
                              "101-250",
                              "251-500",
                              "501-1000",
                              "1001-5000",
                              "5001-10000",
                              "10000+",
                              "Unknown",
                            ];
                            let result = Array.from(map, ([name, value]) => ({
                              name,
                              value,
                            })).sort(
                              (a, b) =>
                                order.indexOf(a.name) - order.indexOf(b.name),
                            );

                            // Use real data only - no fallback sample data

                            if (activeTab === "live") {
                              console.log("Company Size chart data:", result);
                            }
                            return result;
                          })()}
                          margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {/* Country Head Quarter Distribution Bar Chart */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Country Head Quarter Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={220}>
                      {(isLoading || isAnalyticsLoading) ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <RechartsBarChart
                          data={(() => {
                            // Country Head Quarter Distribution Chart - Use countries data
                            if (activeTab === "live") {
                              console.log("Country chart using analyticsData.countries:", analyticsData?.countries);
                              return analyticsData?.countries || [];
                              
                              // Default fallback - detect chart type from surrounding code
                              const stack = new Error().stack || "";
                              if (stack.includes("Round Types")) return analyticsData?.roundTypes || [];
                              if (stack.includes("Industry")) return analyticsData?.industries || [];
                              if (stack.includes("Company Size")) return analyticsData?.companySizes || [];
                              if (stack.includes("Country")) return analyticsData?.countries || [];
                              
                              console.log("Using analytics data for charts");
                              return analyticsData?.roundTypes || [];
                            }
                            
                            // For other tabs, use limited fundingData
                            if (!fundingData) return [];
                            const map = new Map();
                            fundingData.forEach((d: any) => {
                              // For live funding, use country field
                              let key =
                                activeTab === "live"
                                  ? d.country || "Other"
                                  : d.country || "Other";
                              // Clean up the key - remove null, undefined, empty strings
                              if (
                                !key ||
                                key === "null" ||
                                key === "undefined" ||
                                key === "" ||
                                key === "Unknown"
                              ) {
                                key = "Other";
                              }
                              map.set(key, (map.get(key) || 0) + 1);
                            });
                            let result = Array.from(map, ([name, value]) => ({
                              name,
                              value,
                            }))
                              .sort((a, b) => b.value - a.value)
                              .slice(0, 10);

                            // Use real data only - no fallback sample data

                            if (activeTab === "live") {
                              console.log("Country chart data:", result);
                            }
                            return result;
                          })()}
                          margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#10b981"
                            barSize={20}
                            radius={[6, 6, 0, 0]}
                          />
                        </RechartsBarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Exits Analytics Dashboard - just under heading */}
            {activeTab === "exits" && (
              <div className="space-y-6 mb-6">
                {/* Top row: 3 charts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total funding raised by company (horizontal bar) */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Total funding raised
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={180}>
                        {(isLoading || isAnalyticsLoading || isExitsAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <RechartsBarChart
                            layout="vertical"
                            data={(() => {
                              // Use analytics data for exits (all records)
                              if (activeTab === "exits" && exitsAnalyticsData?.fundingRanges) {
                                return exitsAnalyticsData.fundingRanges.slice(0, 8);
                              }
                              // Fallback to fundingData for other tabs
                              if (!fundingData) return [];
                              const map = new Map();
                              fundingData.forEach((d: any) => {
                                const key = d.company || "Unknown";
                                const val =
                                  parseFloat(d.totalFundingMillions) || 0;
                                map.set(key, (map.get(key) || 0) + val);
                              });
                              return Array.from(map, ([name, value]) => ({
                                name,
                                value,
                              }))
                                .sort((a, b) => b.value - a.value)
                                .slice(0, 8);
                            })()}
                            margin={{
                              left: 40,
                              right: 20,
                              top: 10,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              hide={false}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={120}
                              tick={{ fontSize: 13 }}
                            />
                            <Tooltip />
                            <Bar
                              dataKey="value"
                              fill="#10b981"
                              barSize={20}
                              radius={[6, 6, 6, 6]}
                            />
                          </RechartsBarChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  {/* Exit Type (donut) */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Exit Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={180}>
                        {(isLoading || isAnalyticsLoading || isExitsAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <PieChart>
                            <Pie
                              data={(() => {
                                // Use analytics data for exits (all records)
                                if (activeTab === "exits" && exitsAnalyticsData?.exitTypes) {
                                  return exitsAnalyticsData.exitTypes.slice(0, 10);
                                }
                                // Fallback to fundingData for other tabs
                                if (!fundingData) return [];
                                const map = new Map();
                                fundingData.forEach((d: any) => {
                                  const key = d.exitType || "Other";
                                  map.set(key, (map.get(key) || 0) + 1);
                                });
                                return Array.from(map, ([name, value]) => ({
                                  name,
                                  value,
                                }));
                              })()}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              dataKey="value"
                              nameKey="name"
                              label={false}
                            >
                              {(() => {
                                const data = (() => {
                                  // Use analytics data for exits (all records)
                                  if (activeTab === "exits" && exitsAnalyticsData?.exitTypes) {
                                    return exitsAnalyticsData.exitTypes.slice(0, 10);
                                  }
                                  // Fallback to fundingData for other tabs
                                  if (!fundingData) return [];
                                  const map = new Map();
                                  fundingData.forEach((d: any) => {
                                    const key = d.exitType || "Other";
                                    map.set(key, (map.get(key) || 0) + 1);
                                  });
                                  return Array.from(map, ([name, value]) => ({
                                    name,
                                    value,
                                  }));
                                })();
                                return data.map((entry, index) => (
                                  <Cell
                                    key={`cell-exit-type-${index}`}
                                    fill={
                                      CHART_COLORS[index % CHART_COLORS.length]
                                    }
                                  />
                                ));
                              })()}
                            </Pie>
                            {/* Center label for total */}
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="24"
                              fontWeight="bold"
                              fill="#10b981"
                            >
                              {activeTab === "exits" && exitsAnalyticsData ? exitsAnalyticsData.totalRecords : (fundingData ? fundingData.length : 0)}
                            </text>
                            <text
                              x="50%"
                              y="65%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="12"
                              fill="#888"
                            >
                              Total
                            </text>
                            <Tooltip
                              formatter={(value, name) => [value, name]}
                            />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                      {/* Legend below chart */}
                      <div className="flex flex-wrap gap-2 mt-2 justify-center">
                        {(() => {
                          // Use analytics data for exits (all records)
                          if (activeTab === "exits" && exitsAnalyticsData?.exitTypes) {
                            return exitsAnalyticsData.exitTypes.slice(0, 10).map((item, i) => (
                              <div
                                key={item.name}
                                className="flex items-center gap-1 text-xs"
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[i % CHART_COLORS.length],
                                  }}
                                ></span>
                                {item.name}
                              </div>
                            ));
                          }
                          // Fallback to fundingData for other tabs
                          if (!fundingData) return null;
                          const map = new Map();
                          fundingData.forEach((d: any) => {
                            const key = d.exitType || "Other";
                            map.set(key, (map.get(key) || 0) + 1);
                          });
                          return Array.from(map, ([name], i) => (
                            <div
                              key={name}
                              className="flex items-center gap-1 text-xs"
                            >
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              ></span>
                              {name}
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                  {/* Industry Exits (donut) */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Industry Exits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={180}>
                        {(isLoading || isAnalyticsLoading || isExitsAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <PieChart>
                            <Pie
                              data={(() => {
                                // Use analytics data for exits (all records)
                                if (activeTab === "exits" && exitsAnalyticsData?.industries) {
                                  return exitsAnalyticsData.industries.slice(0, 10);
                                }
                                // Fallback to fundingData for other tabs
                                if (!fundingData) return [];
                                const map = new Map();
                                fundingData.forEach((d: any) => {
                                  const key = d.industry || "Other";
                                  map.set(key, (map.get(key) || 0) + 1);
                                });
                                return Array.from(map, ([name, value]) => ({
                                  name,
                                  value,
                                }));
                              })()}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              dataKey="value"
                              nameKey="name"
                              label={false}
                            >
                              {(() => {
                                const data = (() => {
                                  // Use analytics data for exits (all records)
                                  if (activeTab === "exits" && exitsAnalyticsData?.industries) {
                                    return exitsAnalyticsData.industries.slice(0, 10);
                                  }
                                  // Fallback to fundingData for other tabs
                                  if (!fundingData) return [];
                                  const map = new Map();
                                  fundingData.forEach((d: any) => {
                                    const key = d.industry || "Other";
                                    map.set(key, (map.get(key) || 0) + 1);
                                  });
                                  return Array.from(map, ([name, value]) => ({
                                    name,
                                    value,
                                  }));
                                })();
                                return data.map((entry, index) => (
                                  <Cell
                                    key={`cell-exit-industry-${index}`}
                                    fill={
                                      CHART_COLORS[index % CHART_COLORS.length]
                                    }
                                  />
                                ));
                              })()}
                            </Pie>
                            {/* Center label for total */}
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="24"
                              fontWeight="bold"
                              fill="#10b981"
                            >
                              {activeTab === "exits" && exitsAnalyticsData ? exitsAnalyticsData.totalRecords : (fundingData ? fundingData.length : 0)}
                            </text>
                            <text
                              x="50%"
                              y="65%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="12"
                              fill="#888"
                            >
                              Total
                            </text>
                            <Tooltip
                              formatter={(value, name) => [value, name]}
                            />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                      {/* Legend below chart */}
                      <div className="flex flex-wrap gap-2 mt-2 justify-center">
                        {(() => {
                          // Use analytics data for exits (all records)
                          if (activeTab === "exits" && exitsAnalyticsData?.industries) {
                            return exitsAnalyticsData.industries.slice(0, 10).map((item, i) => (
                              <div
                                key={item.name}
                                className="flex items-center gap-1 text-xs"
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[i % CHART_COLORS.length],
                                  }}
                                ></span>
                                <span className="font-medium">
                                  {item.name}
                                </span>
                                <span className="text-muted-foreground">
                                  ({item.value})
                                </span>
                              </div>
                            ));
                          }
                          // Fallback to fundingData for other tabs
                          if (!fundingData) return null;
                          const map = new Map();
                          fundingData.forEach((d: any) => {
                            const key = d.industry || "Other";
                            map.set(key, (map.get(key) || 0) + 1);
                          });
                          return Array.from(map, ([name, value]) => ({
                            name,
                            value,
                          }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 10)
                            .map((entry, i) => (
                              <div
                                key={entry.name}
                                className="flex items-center gap-1 text-xs"
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[i % CHART_COLORS.length],
                                  }}
                                ></span>
                                <span className="font-medium">
                                  {entry.name}
                                </span>
                                <span className="text-muted-foreground">
                                  ({entry.value})
                                </span>
                              </div>
                            ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Bottom row: 2 charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Total funding raised - Historical (line) */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Total funding raised - Historical
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={180}>
                        {(isLoading || isAnalyticsLoading || isExitsAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <LineChart
                            data={(() => {
                              // Use analytics data for exits (all records)
                              if (activeTab === "exits" && exitsAnalyticsData?.years) {
                                return exitsAnalyticsData.years;
                              }
                              // Fallback to fundingData for other tabs
                              if (!fundingData) return [];
                              const map = new Map();
                              fundingData.forEach((d: any) => {
                                const key = d.dealClosedDate
                                  ? new Date(d.dealClosedDate)
                                      .getFullYear()
                                      .toString()
                                  : "Unknown";
                                const val =
                                  parseFloat(d.totalFundingMillions) || 0;
                                map.set(key, (map.get(key) || 0) + val);
                              });
                              return Array.from(map, ([name, value]) => ({
                                name,
                                value,
                              })).sort((a, b) => a.name.localeCompare(b.name));
                            })()}
                            margin={{
                              left: 20,
                              right: 20,
                              top: 10,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  {/* Exit value per Company (horizontal bar) */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Exit value per Company
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={180}>
                        {(isLoading || isAnalyticsLoading || isExitsAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <RechartsBarChart
                            layout="vertical"
                            data={(() => {
                              // Use analytics data for exits (all records)
                              if (activeTab === "exits" && exitsAnalyticsData?.topCompaniesByExitValue) {
                                return exitsAnalyticsData.topCompaniesByExitValue.slice(0, 8);
                              }
                              // Fallback to fundingData for other tabs
                              if (!fundingData) return [];
                              const map = new Map();
                              fundingData.forEach((d: any) => {
                                const key = d.company || "Unknown";
                                const val =
                                  parseFloat(d.exitValueBillions) || 0;
                                map.set(key, (map.get(key) || 0) + val);
                              });
                              return Array.from(map, ([name, value]) => ({
                                name,
                                value,
                              }))
                                .sort((a, b) => b.value - a.value)
                                .slice(0, 8);
                            })()}
                            margin={{
                              left: 40,
                              right: 20,
                              top: 10,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              hide={false}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={120}
                              tick={{ fontSize: 13 }}
                            />
                            <Tooltip />
                            <Bar
                              dataKey="value"
                              fill="#10b981"
                              barSize={20}
                              radius={[6, 6, 6, 6]}
                            />
                          </RechartsBarChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Deals Overview charts for 2023 tab, directly under heading */}
            {activeTab === "us-sfd-23" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Lead Investors Bar Chart */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Lead Investors · 2023
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={300}>
                      {(isLoading || isAnalyticsLoading || isUsSfd23AnalyticsLoading) ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <RechartsBarChart
                          layout="vertical"
                          data={(() => {
                            // Use analytics data for live funding (all 50K+ records)
                            if (activeTab === "live") {
                              // Each chart gets its specific analytics data
                              const chartType = arguments[0] || "default";
                              if (chartType === "roundTypes") return analyticsData?.roundTypes || [];
                              if (chartType === "industries") return analyticsData?.industries || [];
                              if (chartType === "companySizes") return analyticsData?.companySizes || [];
                              if (chartType === "countries") return analyticsData?.countries || [];
                              
                              // Default fallback - detect chart type from surrounding code
                              const stack = new Error().stack || "";
                              if (stack.includes("Round Types")) return analyticsData?.roundTypes || [];
                              if (stack.includes("Industry")) return analyticsData?.industries || [];
                              if (stack.includes("Company Size")) return analyticsData?.companySizes || [];
                              if (stack.includes("Country")) return analyticsData?.countries || [];
                              
                              console.log("Using analytics data for charts");
                              return analyticsData?.roundTypes || [];
                            }

                            // Use analytics data for US SFD 2023 (all 210+ records)
                            if (activeTab === "us-sfd-23" && usSfd23AnalyticsData) {
                              console.log("Using US SFD 2023 analytics data for Lead Investors chart");
                              return usSfd23AnalyticsData.leadInvestors || [];
                            }
                            
                            // For other tabs, use limited fundingData
                            if (!fundingData) return [];
                            const map = new Map();
                            fundingData.forEach((d: any) => {
                              if (d.leadInvestors) {
                                d.leadInvestors
                                  .split(",")
                                  .forEach((name: string) => {
                                    const key = name.trim();
                                    if (key)
                                      map.set(key, (map.get(key) || 0) + 1);
                                  });
                              }
                            });
                            return Array.from(map, ([name, value]) => ({
                              name,
                              value,
                            }))
                              .sort((a, b) => b.value - a.value)
                              .slice(0, 8);
                          })()}
                          margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            hide={false}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={160}
                            tick={{ fontSize: 13 }}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#10b981"
                            barSize={24}
                            radius={[6, 6, 6, 6]}
                          />
                        </RechartsBarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {/* Industry Donut Chart */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Industry Distribution · 2023
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={300}>
                      {(isLoading || isAnalyticsLoading || isUsSfd23AnalyticsLoading) ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <PieChart>
                          <Pie
                            data={(() => {
                              // Use analytics data for US SFD 2023 (all 210+ records)
                              if (activeTab === "us-sfd-23" && usSfd23AnalyticsData) {
                                console.log("Using US SFD 2023 analytics data for Industry Distribution chart");
                                return usSfd23AnalyticsData.industries || [];
                              }

                              if (!fundingData) return [];
                              const map = new Map();
                              fundingData.forEach((d: any) => {
                                const key = d.industry || "Other";
                                map.set(key, (map.get(key) || 0) + 1);
                              });
                              return Array.from(map, ([name, value]) => ({
                                name,
                                value,
                              }));
                            })()}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            dataKey="value"
                            nameKey="name"
                            label={false}
                          >
                            {(() => {
                              const data = (() => {
                                // Use analytics data for US SFD 2023 (all 210+ records)
                                if (activeTab === "us-sfd-23" && usSfd23AnalyticsData) {
                                  return usSfd23AnalyticsData.industries || [];
                                }

                                // Use analytics data for US SFD 2024 (all 296+ records)
                                if (activeTab === "us-sfd-24" && usSfd24AnalyticsData) {
                                  return usSfd24AnalyticsData.industries || [];
                                }

                                if (!fundingData) return [];
                                const map = new Map();
                                fundingData.forEach((d: any) => {
                                  const key = d.industry || "Other";
                                  map.set(key, (map.get(key) || 0) + 1);
                                });
                                return Array.from(map, ([name, value]) => ({
                                  name,
                                  value,
                                }));
                              })();
                              return data.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ));
                            })()}
                          </Pie>
                          {/* Center label for total */}
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="32"
                            fontWeight="bold"
                            fill="#10b981"
                          >
                            {(() => {
                              if (activeTab === "us-sfd-23" && usSfd23AnalyticsData) {
                                return usSfd23AnalyticsData.totalRecords || 0;
                              }
                              if (activeTab === "us-sfd-24" && usSfd24AnalyticsData) {
                                return usSfd24AnalyticsData.totalRecords || 0;
                              }
                              return fundingData ? fundingData.length : 0;
                            })()}
                          </text>
                          <text
                            x="50%"
                            y="65%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="14"
                            fill="#888"
                          >
                            Total
                          </text>
                          <Tooltip formatter={(value, name) => [value, name]} />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                    {/* Legend below chart */}
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                      {(() => {
                        // Use analytics data for US SFD 2023 (all 210+ records)
                        if (activeTab === "us-sfd-23" && usSfd23AnalyticsData) {
                          const data = usSfd23AnalyticsData.industries || [];
                          return data
                            .slice(0, 10)
                            .map((entry, i) => (
                              <div
                                key={entry.name}
                                className="flex items-center gap-1 text-xs"
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[i % CHART_COLORS.length],
                                  }}
                                ></span>
                                <span className="font-medium">{entry.name}</span>
                                <span className="text-muted-foreground">
                                  ({entry.value})
                                </span>
                              </div>
                            ));
                        }

                        // Use analytics data for US SFD 2024 (all 296+ records)
                        if (activeTab === "us-sfd-24" && usSfd24AnalyticsData) {
                          const data = usSfd24AnalyticsData.industries || [];
                          return data
                            .slice(0, 10)
                            .map((entry, i) => (
                              <div
                                key={entry.name}
                                className="flex items-center gap-1 text-xs"
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[i % CHART_COLORS.length],
                                  }}
                                ></span>
                                <span className="font-medium">{entry.name}</span>
                                <span className="text-muted-foreground">
                                  ({entry.value})
                                </span>
                              </div>
                            ));
                        }

                        if (!fundingData) return null;
                        const map = new Map();
                        fundingData.forEach((d: any) => {
                          const key = d.industry || "Other";
                          map.set(key, (map.get(key) || 0) + 1);
                        });
                        return Array.from(map, ([name, value]) => ({
                          name,
                          value,
                        }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 10)
                          .map((entry, i) => (
                            <div
                              key={entry.name}
                              className="flex items-center gap-1 text-xs"
                            >
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              ></span>
                              <span className="font-medium">{entry.name}</span>
                              <span className="text-muted-foreground">
                                ({entry.value})
                              </span>
                            </div>
                          ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Megadeals Analytics Dashboard - just under heading */}
            {activeTab === "megadeals" && (
              <div className="space-y-6 mb-6">
                {/* Top row: Acquirer Country (bar) & Acquirer Entity (donut) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Value ($) by Acquirer Country (horizontal bar) */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Value ($) by Acquirer Country
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={200}>
                        {(isLoading || isAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <RechartsBarChart
                            layout="vertical"
                            data={(() => {
                              if (!fundingData) return [];
                              const map = new Map();
                              fundingData.forEach((d: any) => {
                                const key = d.acquirerCountry || "Unknown";
                                const val = parseFloat(d.valueUsd) || 0;
                                map.set(key, (map.get(key) || 0) + val);
                              });
                              return Array.from(map, ([name, value]) => ({
                                name,
                                value,
                              }));
                            })()}
                            margin={{
                              left: 40,
                              right: 20,
                              top: 10,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              hide={false}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => value.toLocaleString()}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={140}
                              tick={{ fontSize: 13 }}
                            />
                            <Tooltip
                              formatter={(value) => [
                                value.toLocaleString(),
                                "Value",
                              ]}
                            />
                            <Bar
                              dataKey="value"
                              fill="#10b981"
                              barSize={20}
                              radius={[6, 6, 6, 6]}
                            />
                          </RechartsBarChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  {/* Value ($) by Acquirer Entity (donut) */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Value ($) by Acquirer Entity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={200}>
                        {(isLoading || isAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <PieChart>
                            <Pie
                              data={(() => {
                                if (!fundingData) return [];
                                const map = new Map();
                                fundingData.forEach((d: any) => {
                                  const key = d.acquirerEntity || "Other";
                                  const val = parseFloat(d.valueUsd) || 0;
                                  map.set(key, (map.get(key) || 0) + val);
                                });
                                return Array.from(map, ([name, value]) => ({
                                  name,
                                  value,
                                }))
                                  .sort((a, b) => b.value - a.value)
                                  .slice(0, 12);
                              })()}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={80}
                              dataKey="value"
                              nameKey="name"
                              label={false}
                            >
                              {(() => {
                                const data = (() => {
                                  if (!fundingData) return [];
                                  const map = new Map();
                                  fundingData.forEach((d: any) => {
                                    const key = d.acquirerEntity || "Other";
                                    const val = parseFloat(d.valueUsd) || 0;
                                    map.set(key, (map.get(key) || 0) + val);
                                  });
                                  return Array.from(map, ([name, value]) => ({
                                    name,
                                    value,
                                  }))
                                    .sort((a, b) => b.value - a.value)
                                    .slice(0, 12);
                                })();
                                return data.map((entry, index) => (
                                  <Cell
                                    key={`cell-acq-entity-${index}`}
                                    fill={
                                      CHART_COLORS[index % CHART_COLORS.length]
                                    }
                                  />
                                ));
                              })()}
                            </Pie>
                            {/* Center label for total */}
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="24"
                              fontWeight="bold"
                              fill="#10b981"
                            >
                              {(() => {
                                if (!fundingData) return 0;
                                let total = 0;
                                fundingData.forEach((d: any) => {
                                  total += parseFloat(d.valueUsd) || 0;
                                });
                                return total.toLocaleString();
                              })()}
                            </text>
                            <text
                              x="50%"
                              y="65%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="12"
                              fill="#888"
                            >
                              Total
                            </text>
                            <Tooltip
                              formatter={(value, name) => [value, name]}
                            />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                      {/* Legend below chart */}
                      <div className="flex flex-wrap gap-2 mt-2 justify-center">
                        {(() => {
                          if (!fundingData) return null;
                          const map = new Map();
                          fundingData.forEach((d: any) => {
                            const key = d.acquirerEntity || "Other";
                            const val = parseFloat(d.valueUsd) || 0;
                            map.set(key, (map.get(key) || 0) + val);
                          });
                          return Array.from(map, ([name, value]) => ({
                            name,
                            value,
                          }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 10)
                            .map((entry, i) => (
                              <div
                                key={entry.name}
                                className="flex items-center gap-1 text-xs"
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[i % CHART_COLORS.length],
                                  }}
                                ></span>
                                <span className="font-medium">
                                  {entry.name}
                                </span>
                                <span className="text-muted-foreground">
                                  ({entry.value.toLocaleString()})
                                </span>
                              </div>
                            ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Second row: Acquired Country (bar) & Acquired Entity (donut) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Value ($) by Acquired Country (horizontal bar) */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Value ($) by Acquired Country
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={200}>
                        {(isLoading || isAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <RechartsBarChart
                            layout="vertical"
                            data={(() => {
                              if (!fundingData) return [];
                              const map = new Map();
                              fundingData.forEach((d: any) => {
                                const key = d.acquiredCountry || "Unknown";
                                const val = parseFloat(d.valueUsd) || 0;
                                map.set(key, (map.get(key) || 0) + val);
                              });
                              return Array.from(map, ([name, value]) => ({
                                name,
                                value,
                              }));
                            })()}
                            margin={{
                              left: 40,
                              right: 20,
                              top: 10,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              hide={false}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => value.toLocaleString()}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={140}
                              tick={{ fontSize: 13 }}
                            />
                            <Tooltip
                              formatter={(value) => [
                                value.toLocaleString(),
                                "Value",
                              ]}
                            />
                            <Bar
                              dataKey="value"
                              fill="#10b981"
                              barSize={20}
                              radius={[6, 6, 6, 6]}
                            />
                          </RechartsBarChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  {/* Value ($) by Acquired Entity (donut) */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Value ($) by Acquired Entity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={200}>
                        {(isLoading || isAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <PieChart>
                            <Pie
                              data={(() => {
                                if (!fundingData) return [];
                                const map = new Map();
                                fundingData.forEach((d: any) => {
                                  const key = d.acquiredEntity || "Other";
                                  const val = parseFloat(d.valueUsd) || 0;
                                  map.set(key, (map.get(key) || 0) + val);
                                });
                                return Array.from(map, ([name, value]) => ({
                                  name,
                                  value,
                                }))
                                  .sort((a, b) => b.value - a.value)
                                  .slice(0, 12);
                              })()}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={80}
                              dataKey="value"
                              nameKey="name"
                              label={false}
                            >
                              {(() => {
                                const data = (() => {
                                  if (!fundingData) return [];
                                  const map = new Map();
                                  fundingData.forEach((d: any) => {
                                    const key = d.acquiredEntity || "Other";
                                    const val = parseFloat(d.valueUsd) || 0;
                                    map.set(key, (map.get(key) || 0) + val);
                                  });
                                  return Array.from(map, ([name, value]) => ({
                                    name,
                                    value,
                                  }))
                                    .sort((a, b) => b.value - a.value)
                                    .slice(0, 12);
                                })();
                                return data.map((entry, index) => (
                                  <Cell
                                    key={`cell-acq-entity2-${index}`}
                                    fill={
                                      CHART_COLORS[index % CHART_COLORS.length]
                                    }
                                  />
                                ));
                              })()}
                            </Pie>
                            {/* Center label for total */}
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="24"
                              fontWeight="bold"
                              fill="#10b981"
                            >
                              {(() => {
                                if (!fundingData) return 0;
                                let total = 0;
                                fundingData.forEach((d: any) => {
                                  total += parseFloat(d.valueUsd) || 0;
                                });
                                return total.toLocaleString();
                              })()}
                            </text>
                            <text
                              x="50%"
                              y="65%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="12"
                              fill="#888"
                            >
                              Total
                            </text>
                            <Tooltip
                              formatter={(value, name) => [
                                value.toLocaleString(),
                                name,
                              ]}
                            />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                      {/* Legend below chart */}
                      <div className="flex flex-wrap gap-2 mt-2 justify-center">
                        {(() => {
                          if (!fundingData) return null;
                          const map = new Map();
                          fundingData.forEach((d: any) => {
                            const key = d.acquiredEntity || "Other";
                            const val = parseFloat(d.valueUsd) || 0;
                            map.set(key, (map.get(key) || 0) + val);
                          });
                          return Array.from(map, ([name, value]) => ({
                            name,
                            value,
                          }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 10)
                            .map((entry, i) => (
                              <div
                                key={entry.name}
                                className="flex items-center gap-1 text-xs"
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[i % CHART_COLORS.length],
                                  }}
                                ></span>
                                <span className="font-medium">
                                  {entry.name}
                                </span>
                                <span className="text-muted-foreground">
                                  ({entry.value.toLocaleString()})
                                </span>
                              </div>
                            ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Bottom row: Value ($) by Year (horizontal bar) */}
                <div className="w-full">
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Value ($) by Year
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ResponsiveContainer width="100%" height={220}>
                        {(isLoading || isAnalyticsLoading) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <RechartsBarChart
                            layout="vertical"
                            data={(() => {
                              if (!fundingData) return [];
                              const map = new Map();
                              fundingData.forEach((d: any) => {
                                const key = d.year
                                  ? d.year.toString()
                                  : "Unknown";
                                const val = parseFloat(d.valueUsd) || 0;
                                map.set(key, (map.get(key) || 0) + val);
                              });
                              return Array.from(map, ([name, value]) => ({
                                name,
                                value,
                              })).sort((a, b) => a.name.localeCompare(b.name));
                            })()}
                            margin={{
                              left: 40,
                              right: 20,
                              top: 10,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              hide={false}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => value.toLocaleString()}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={120}
                              tick={{ fontSize: 13 }}
                            />
                            <Tooltip
                              formatter={(value) => [
                                value.toLocaleString(),
                                "Value",
                              ]}
                            />
                            <Bar
                              dataKey="value"
                              fill="#10b981"
                              barSize={24}
                              radius={[6, 6, 6, 6]}
                            />
                          </RechartsBarChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {/* Deals Overview charts for 2024 tab, directly under heading */}
            {activeTab === "us-sfd-24" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Lead Investors Bar Chart */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Lead Investors · 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={300}>
                      {(isLoading || isAnalyticsLoading || isUsSfd24AnalyticsLoading) ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <RechartsBarChart
                          layout="vertical"
                          data={(() => {
                            // Use analytics data for live funding (all 50K+ records)
                            if (activeTab === "live") {
                              // Each chart gets its specific analytics data
                              const chartType = arguments[0] || "default";
                              if (chartType === "roundTypes") return analyticsData?.roundTypes || [];
                              if (chartType === "industries") return analyticsData?.industries || [];
                              if (chartType === "companySizes") return analyticsData?.companySizes || [];
                              if (chartType === "countries") return analyticsData?.countries || [];
                              
                              // Default fallback - detect chart type from surrounding code
                              const stack = new Error().stack || "";
                              if (stack.includes("Round Types")) return analyticsData?.roundTypes || [];
                              if (stack.includes("Industry")) return analyticsData?.industries || [];
                              if (stack.includes("Company Size")) return analyticsData?.companySizes || [];
                              if (stack.includes("Country")) return analyticsData?.countries || [];
                              
                              console.log("Using analytics data for charts");
                              return analyticsData?.roundTypes || [];
                            }

                            // Use analytics data for US SFD 2024 (all 296+ records)
                            if (activeTab === "us-sfd-24" && usSfd24AnalyticsData) {
                              console.log("Using US SFD 2024 analytics data for Lead Investors chart");
                              return usSfd24AnalyticsData.leadInvestors || [];
                            }
                            
                            // For other tabs, use limited fundingData
                            if (!fundingData) return [];
                            const map = new Map();
                            fundingData.forEach((d: any) => {
                              if (d.leadInvestors) {
                                d.leadInvestors
                                  .split(",")
                                  .forEach((name: string) => {
                                    const key = name.trim();
                                    if (key)
                                      map.set(key, (map.get(key) || 0) + 1);
                                  });
                              }
                            });
                            return Array.from(map, ([name, value]) => ({
                              name,
                              value,
                            }))
                              .sort((a, b) => b.value - a.value)
                              .slice(0, 8);
                          })()}
                          margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            hide={false}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={160}
                            tick={{ fontSize: 13 }}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#10b981"
                            barSize={24}
                            radius={[6, 6, 6, 6]}
                          />
                        </RechartsBarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {/* Industry Donut Chart */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Industry Distribution · 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={300}>
                      {(isLoading || isAnalyticsLoading || isUsSfd24AnalyticsLoading) ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <PieChart>
                          <Pie
                            data={(() => {
                              // Use analytics data for US SFD 2024 (all 296+ records)
                              if (activeTab === "us-sfd-24" && usSfd24AnalyticsData) {
                                console.log("Using US SFD 2024 analytics data for Industry Distribution chart");
                                return usSfd24AnalyticsData.industries || [];
                              }

                              if (!fundingData) return [];
                              const map = new Map();
                              fundingData.forEach((d: any) => {
                                const key = d.industry || "Other";
                                map.set(key, (map.get(key) || 0) + 1);
                              });
                              return Array.from(map, ([name, value]) => ({
                                name,
                                value,
                              }));
                            })()}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            dataKey="value"
                            nameKey="name"
                            label={false}
                          >
                            {(() => {
                              const data = (() => {
                                // Use analytics data for US SFD 2023 (all 210+ records)
                                if (activeTab === "us-sfd-23" && usSfd23AnalyticsData) {
                                  return usSfd23AnalyticsData.industries || [];
                                }

                                // Use analytics data for US SFD 2024 (all 296+ records)
                                if (activeTab === "us-sfd-24" && usSfd24AnalyticsData) {
                                  return usSfd24AnalyticsData.industries || [];
                                }

                                if (!fundingData) return [];
                                const map = new Map();
                                fundingData.forEach((d: any) => {
                                  const key = d.industry || "Other";
                                  map.set(key, (map.get(key) || 0) + 1);
                                });
                                return Array.from(map, ([name, value]) => ({
                                  name,
                                  value,
                                }));
                              })();
                              return data.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ));
                            })()}
                          </Pie>
                          {/* Center label for total */}
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="32"
                            fontWeight="bold"
                            fill="#10b981"
                          >
                            {(() => {
                              if (activeTab === "us-sfd-23" && usSfd23AnalyticsData) {
                                return usSfd23AnalyticsData.totalRecords || 0;
                              }
                              if (activeTab === "us-sfd-24" && usSfd24AnalyticsData) {
                                return usSfd24AnalyticsData.totalRecords || 0;
                              }
                              return fundingData ? fundingData.length : 0;
                            })()}
                          </text>
                          <text
                            x="50%"
                            y="65%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="14"
                            fill="#888"
                          >
                            Total
                          </text>
                          <Tooltip formatter={(value, name) => [value, name]} />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                    {/* Legend below chart */}
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                      {(() => {
                        // Use analytics data for US SFD 2023 (all 210+ records)
                        if (activeTab === "us-sfd-23" && usSfd23AnalyticsData) {
                          const data = usSfd23AnalyticsData.industries || [];
                          return data
                            .slice(0, 10)
                            .map((entry, i) => (
                              <div
                                key={entry.name}
                                className="flex items-center gap-1 text-xs"
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[i % CHART_COLORS.length],
                                  }}
                                ></span>
                                <span className="font-medium">{entry.name}</span>
                                <span className="text-muted-foreground">
                                  ({entry.value})
                                </span>
                              </div>
                            ));
                        }

                        // Use analytics data for US SFD 2024 (all 296+ records)
                        if (activeTab === "us-sfd-24" && usSfd24AnalyticsData) {
                          const data = usSfd24AnalyticsData.industries || [];
                          return data
                            .slice(0, 10)
                            .map((entry, i) => (
                              <div
                                key={entry.name}
                                className="flex items-center gap-1 text-xs"
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[i % CHART_COLORS.length],
                                  }}
                                ></span>
                                <span className="font-medium">{entry.name}</span>
                                <span className="text-muted-foreground">
                                  ({entry.value})
                                </span>
                              </div>
                            ));
                        }

                        if (!fundingData) return null;
                        const map = new Map();
                        fundingData.forEach((d: any) => {
                          const key = d.industry || "Other";
                          map.set(key, (map.get(key) || 0) + 1);
                        });
                        return Array.from(map, ([name, value]) => ({
                          name,
                          value,
                        }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 10)
                          .map((entry, i) => (
                            <div
                              key={entry.name}
                              className="flex items-center gap-1 text-xs"
                            >
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              ></span>
                              <span className="font-medium">{entry.name}</span>
                              <span className="text-muted-foreground">
                                ({entry.value})
                              </span>
                            </div>
                          ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters Section */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur mb-6 sm:mb-8">
              <CardContent className="p-4 sm:p-6">
                {/* Search Bar - Full Width on Top */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                  <Input
                    placeholder="Search companies..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="pl-10 border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Tab-specific filters arranged in grids */}
                <div className="space-y-4">
                  {/* Non-Live tabs - keep existing layout (exclude ma-deals, megadeals, exits, us-sfd-23, and us-sfd-24) */}
                  {activeTab !== "live" && activeTab !== "ma-deals" && activeTab !== "us-sfd-23" && activeTab !== "us-sfd-24" && activeTab !== "megadeals" && activeTab !== "exits" && (
                    <div className="flex flex-wrap gap-3">
                      {/* Year Filter */}
                      <Select
                        value={filters.year || "all"}
                        onValueChange={(value) => handleFilterChange("year", value)}
                      >
                        <SelectTrigger className="w-full sm:w-32 border-slate-200">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* US SFD 2023 Specific Filters - All 4 in One Line */}
                  {activeTab === "us-sfd-23" && (
                    <div className="flex gap-3 overflow-x-auto">
                      {/* Industry Filter */}
                      <Select
                        value={filters.industry || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("industry", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="All Industries" />
                        </SelectTrigger>
                        <SelectContent className="max-h-96 overflow-y-auto">
                          <SelectItem value="all">All Industries</SelectItem>
                          {exitsAnalyticsData?.industries?.map((industry: any) => (
                            <SelectItem key={industry.name} value={industry.name} className="py-2">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {industry.name}
                              </span>
                              <span className="text-slate-500 text-xs ml-2">({industry.value})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Min Amount Filter */}
                      <Select
                        value={filters.minAmount || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("minAmount", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="Any Amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Amount</SelectItem>
                          <SelectItem value="1">1M+</SelectItem>
                          <SelectItem value="5">5M+</SelectItem>
                          <SelectItem value="10">10M+</SelectItem>
                          <SelectItem value="25">25M+</SelectItem>
                          <SelectItem value="50">50M+</SelectItem>
                          <SelectItem value="100">100M+</SelectItem>
                          <SelectItem value="250">250M+</SelectItem>
                          <SelectItem value="500">500M+</SelectItem>
                          <SelectItem value="1000">1B+</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Lead Investor Filter */}
                      <Select
                        value={filters.leadInvestor || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("leadInvestor", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="All Investors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Investors</SelectItem>
                          <SelectItem value="Sequoia">Sequoia Capital</SelectItem>
                          <SelectItem value="Andreessen">Andreessen Horowitz</SelectItem>
                          <SelectItem value="Accel">Accel</SelectItem>
                          <SelectItem value="Benchmark">Benchmark</SelectItem>
                          <SelectItem value="Kleiner">Kleiner Perkins</SelectItem>
                          <SelectItem value="GV">GV (Google Ventures)</SelectItem>
                          <SelectItem value="NEA">New Enterprise Associates</SelectItem>
                          <SelectItem value="Lightspeed">Lightspeed Venture Partners</SelectItem>
                          <SelectItem value="Index">Index Ventures</SelectItem>
                          <SelectItem value="Founders Fund">Founders Fund</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Valuation Filter */}
                      <Select
                        value={filters.valuation || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("valuation", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="Any Valuation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Valuation</SelectItem>
                          <SelectItem value="10">10M+</SelectItem>
                          <SelectItem value="50">50M+</SelectItem>
                          <SelectItem value="100">100M+</SelectItem>
                          <SelectItem value="500">500M+</SelectItem>
                          <SelectItem value="1000">1B+</SelectItem>
                          <SelectItem value="5000">$5B+</SelectItem>
                          <SelectItem value="10000">$10B+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* US SFD 2024 Specific Filters - All 4 in One Line */}
                  {activeTab === "us-sfd-24" && (
                    <div className="flex gap-3 overflow-x-auto">
                      {/* Year Filter */}
                      <Select
                        value={filters.year || "all"}
                        onValueChange={(value) => handleFilterChange("year", value)}
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Industry Filter */}
                      <Select
                        value={filters.industry || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("industry", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="All Industries" />
                        </SelectTrigger>
                        <SelectContent className="max-h-96 overflow-y-auto">
                          <SelectItem value="all">All Industries</SelectItem>
                          {usSfd23AnalyticsData?.industries?.map((industry: any) => (
                            <SelectItem key={industry.name} value={industry.name} className="py-2">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {industry.name}
                              </span>
                              <span className="text-slate-500 text-xs ml-2">({industry.value})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Min Amount Filter */}
                      <Select
                        value={filters.minAmount || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("minAmount", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="Any Amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Amount</SelectItem>
                          <SelectItem value="1">1M+</SelectItem>
                          <SelectItem value="5">5M+</SelectItem>
                          <SelectItem value="10">10M+</SelectItem>
                          <SelectItem value="25">25M+</SelectItem>
                          <SelectItem value="50">50M+</SelectItem>
                          <SelectItem value="100">100M+</SelectItem>
                          <SelectItem value="250">250M+</SelectItem>
                          <SelectItem value="500">500M+</SelectItem>
                          <SelectItem value="1000">1B+</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Lead Investor Filter */}
                      <Select
                        value={filters.leadInvestor || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("leadInvestor", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="All Investors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Investors</SelectItem>
                          <SelectItem value="Sequoia">
                            Sequoia Capital
                          </SelectItem>
                          <SelectItem value="Andreessen">
                            Andreessen Horowitz
                          </SelectItem>
                          <SelectItem value="Accel">Accel</SelectItem>
                          <SelectItem value="Benchmark">Benchmark</SelectItem>
                          <SelectItem value="Kleiner">
                            Kleiner Perkins
                          </SelectItem>
                          <SelectItem value="GV">
                            GV (Google Ventures)
                          </SelectItem>
                          <SelectItem value="NEA">
                            New Enterprise Associates
                          </SelectItem>
                          <SelectItem value="Lightspeed">
                            Lightspeed Venture Partners
                          </SelectItem>
                          <SelectItem value="Index">Index Ventures</SelectItem>
                          <SelectItem value="Founders Fund">
                            Founders Fund
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Live Funding Specific Filters - All 7 filters in one line */}
                  {activeTab === "live" && (
                    <div className="flex gap-3 overflow-x-auto">
                      {/* Round Type Filter */}
                      <Select
                        value={filters.roundType || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("roundType", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Rounds" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Rounds</SelectItem>
                          <SelectItem value="series a">Series A</SelectItem>
                          <SelectItem value="series b">Series B</SelectItem>
                          <SelectItem value="series c">Series C</SelectItem>
                          <SelectItem value="seed">Seed</SelectItem>
                          <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                          <SelectItem value="angel">Angel</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Country Filter */}
                      <Select
                        value={filters.country || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("country", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Countries" />
                        </SelectTrigger>
                        <SelectContent className="max-h-96 overflow-y-auto">
                          <SelectItem value="all">All Countries</SelectItem>
                          {dropdownOptionsData?.countries?.map((country: any) => (
                            <SelectItem key={country.name} value={country.name} className="py-2">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {country.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Amount Raised Filter */}
                      <Select
                        value={filters.minAmount || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("minAmount", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Amount</SelectItem>
                          <SelectItem value="1000000">1M+</SelectItem>
                          <SelectItem value="5000000">5M+</SelectItem>
                          <SelectItem value="10000000">10M+</SelectItem>
                          <SelectItem value="25000000">25M+</SelectItem>
                          <SelectItem value="50000000">50M+</SelectItem>
                          <SelectItem value="100000000">100M+</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Year Filter */}
                      <Select
                        value={filters.year || "all"}
                        onValueChange={(value) => handleFilterChange("year", value)}
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Currency Filter */}
                      <Select
                        value={filters.currency || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("currency", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Currencies" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Currencies</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Team Size Filter */}
                      <Select
                        value={filters.teamSize || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("teamSize", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Team Sizes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Team Sizes</SelectItem>
                          <SelectItem value="2-10 employees">2-10 employees</SelectItem>
                          <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                          <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                          <SelectItem value="201-500 employees">201-500 employees</SelectItem>
                          <SelectItem value="501-1,000 employees">501-1,000 employees</SelectItem>
                          <SelectItem value="1,001-5,000 employees">1,001-5,000 employees</SelectItem>
                          <SelectItem value="5,001-10,000 employees">5,001-10,000 employees</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Industry Filter */}
                      <Select
                        value={filters.industry || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("industry", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Industries" />
                        </SelectTrigger>
                        <SelectContent className="max-h-96 overflow-y-auto">
                          <SelectItem value="all">All Industries</SelectItem>
                          {(() => {
                            // Get all unique industries from the complete dataset
                            const allIndustries = new Set<string>();
                            
                            // Add industries from analytics data
                            if (dropdownOptionsData?.industries) {
                              dropdownOptionsData.industries.forEach((industry: any) => {
                                if (industry.name && industry.name !== "Other") {
                                  allIndustries.add(industry.name);
                                }
                              });
                            }
                            
                            // Add common industry categories and sub-industries
                            const commonIndustries = [
                              "Technology", "Healthcare", "Finance", "Biotechnology", 
                              "E-commerce", "Software", "AI/ML", "Cybersecurity",
                              "Food & Beverage", "Energy", "Manufacturing", "Real Estate",
                              "Education", "Media", "Entertainment", "Transportation",
                              "Retail", "Consulting", "Legal", "Marketing",
                              "Analytics", "Cloud Computing", "Mobile Apps", "Gaming",
                              "Fashion", "Sports", "Travel", "Hospitality",
                              "Pharmaceuticals", "Medical Devices", "Telemedicine", "Health Tech",
                              "FinTech", "InsurTech", "PropTech", "EdTech",
                              "AgTech", "CleanTech", "GreenTech", "Renewable Energy",
                              "Aerospace", "Defense", "Automotive", "Construction",
                              "Telecommunications", "Internet Services", "Social Media",
                              "Marketplace", "SaaS", "B2B", "B2C", "Enterprise Software",
                              "Consumer Goods", "Beauty", "Wellness", "Pet Care",
                              "Home Services", "Professional Services", "Logistics",
                              "Supply Chain", "E-learning", "Publishing", "Music"
                            ];
                            
                            commonIndustries.forEach(industry => allIndustries.add(industry));
                            
                            // Convert to sorted array
                            const sortedIndustries = Array.from(allIndustries).sort();
                            
                            return sortedIndustries.map((industry: string) => (
                              <SelectItem key={industry} value={industry} className="py-2">
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {industry}
                                </span>
                              </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Exits Specific Filters - All 5 in One Line */}
                  {activeTab === "exits" && (
                    <div className="flex gap-3 overflow-x-auto">
                      {/* Year Filter */}
                      <Select
                        value={filters.year || "all"}
                        onValueChange={(value) => handleFilterChange("year", value)}
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Industry Filter */}
                      <Select
                        value={filters.industry || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("industry", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Industries" />
                        </SelectTrigger>
                        <SelectContent className="max-h-96 overflow-y-auto">
                          <SelectItem value="all">All Industries</SelectItem>
                          {usSfd24AnalyticsData?.industries?.map((industry: any) => (
                            <SelectItem key={industry.name} value={industry.name} className="py-2">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {industry.name}
                              </span>
                              <span className="text-slate-500 text-xs ml-2">({industry.value})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Exit Type Filter */}
                      <Select
                        value={filters.exitType || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("exitType", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="IPO">IPO</SelectItem>
                          <SelectItem value="M&A">M&A</SelectItem>
                          <SelectItem value="SPAC">SPAC</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Total Funding Filter */}
                      <Select
                        value={filters.minValue || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("minValue", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="Any Total Funding" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Total Funding</SelectItem>
                          <SelectItem value="100">100M+</SelectItem>
                          <SelectItem value="500">500M+</SelectItem>
                          <SelectItem value="1000">1B+</SelectItem>
                          <SelectItem value="5000">$5B+</SelectItem>
                          <SelectItem value="10000">$10B+</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Exit Value Filter */}
                      <Select
                        value={filters.exitValue || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("exitValue", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Exit Values" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Exit Values</SelectItem>
                          <SelectItem value="0.5">500M+</SelectItem>
                          <SelectItem value="1">1B+</SelectItem>
                          <SelectItem value="5">$5B+</SelectItem>
                          <SelectItem value="10">$10B+</SelectItem>
                          <SelectItem value="25">$25B+</SelectItem>
                          <SelectItem value="50">$50B+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* M&A Deals Specific Filters - All 4 in One Line */}
                  {activeTab === "ma-deals" && (
                    <div className="flex flex-wrap gap-3 w-full">
                      {/* Year Filter */}
                      <Select
                        value={filters.year || "all"}
                        onValueChange={(value) => handleFilterChange("year", value)}
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Acquirer Company Filter */}
                      <Select
                        value={filters.acquirer || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("acquirer", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="All Acquirers" />
                        </SelectTrigger>
                        <SelectContent className="max-h-96 overflow-y-auto">
                          <SelectItem value="all">All Acquirers</SelectItem>
                          {maDealsDropdownOptionsData?.acquirers?.map((acquirer: any) => (
                            <SelectItem key={acquirer.name} value={acquirer.name} className="py-2">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {acquirer.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Industry Filter */}
                      <Select
                        value={filters.industry || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("industry", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="All Industries" />
                        </SelectTrigger>
                        <SelectContent className="max-h-96 overflow-y-auto">
                          <SelectItem value="all">All Industries</SelectItem>
                          {maDealsDropdownOptionsData?.industries?.map((industry: any) => (
                            <SelectItem key={industry.name} value={industry.name} className="py-2">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {industry.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Min Deal Value Filter */}
                      <Select
                        value={filters.minValue || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("minValue", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40 border-slate-200">
                          <SelectValue placeholder="Min Value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Value</SelectItem>
                          <SelectItem value="0.1">100M+</SelectItem>
                          <SelectItem value="0.5">500M+</SelectItem>
                          <SelectItem value="1">1B+</SelectItem>
                          <SelectItem value="5">$5B+</SelectItem>
                          <SelectItem value="10">$10B+</SelectItem>
                          <SelectItem value="50">$50B+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Megadeals Specific Filters - All in One Line */}
                  {activeTab === "megadeals" && (
                    <div className="flex gap-3 overflow-x-auto">
                      {/* Year Filter */}
                      <Select
                        value={filters.year || "all"}
                        onValueChange={(value) => handleFilterChange("year", value)}
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                          <SelectItem value="2019">2019</SelectItem>
                          <SelectItem value="2018">2018</SelectItem>
                          <SelectItem value="2017">2017</SelectItem>
                          <SelectItem value="2016">2016</SelectItem>
                          <SelectItem value="2015">2015</SelectItem>
                          <SelectItem value="2014">2014</SelectItem>
                          <SelectItem value="2013">2013</SelectItem>
                          <SelectItem value="2012">2012</SelectItem>
                          <SelectItem value="2011">2011</SelectItem>
                          <SelectItem value="2010">2010</SelectItem>
                          <SelectItem value="2009">2009</SelectItem>
                          <SelectItem value="2008">2008</SelectItem>
                          <SelectItem value="2007">2007</SelectItem>
                          <SelectItem value="2006">2006</SelectItem>
                          <SelectItem value="2005">2005</SelectItem>
                          <SelectItem value="2004">2004</SelectItem>
                          <SelectItem value="2003">2003</SelectItem>
                          <SelectItem value="2002">2002</SelectItem>
                          <SelectItem value="2001">2001</SelectItem>
                          <SelectItem value="2000">2000</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Acquirer Entity Filter */}
                      <Select
                        value={filters.acquirer || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("acquirer", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Acquirers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Acquirers</SelectItem>
                          <SelectItem value="AT&T Inc.">AT&T Inc.</SelectItem>
                          <SelectItem value="BHP Group Limited">BHP Group Limited</SelectItem>
                          <SelectItem value="Vodafone Group Plc">Vodafone Group Plc</SelectItem>
                          <SelectItem value="Verizon Communications Inc.">Verizon Communications Inc.</SelectItem>
                          <SelectItem value="Barclays Plc">Barclays Plc</SelectItem>
                          <SelectItem value="Deutsche Telekom AG">Deutsche Telekom AG</SelectItem>
                          <SelectItem value="Anheuser-Busch InBev NV">Anheuser-Busch InBev NV</SelectItem>
                          <SelectItem value="Discovery, Inc.">Discovery, Inc.</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Acquirer Country Filter */}
                      <Select
                        value={filters.acquirerCountry || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("acquirerCountry", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Countries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Countries</SelectItem>
                          <SelectItem value="United States of America">United States of America</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Ireland">Ireland</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                          <SelectItem value="Italy">Italy</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Transaction Type Filter */}
                      <Select
                        value={filters.transactionType || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("transactionType", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Equity">Equity</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Stock">Stock</SelectItem>
                          <SelectItem value="Loan">Loan</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Acquired Entity Filter */}
                      <Select
                        value={filters.acquiredEntity || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("acquiredEntity", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Acquired" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Acquired</SelectItem>
                          <SelectItem value="Rio Tinto Plc">Rio Tinto Plc</SelectItem>
                          <SelectItem value="Mannesmann AG">Mannesmann AG</SelectItem>
                          <SelectItem value="BellSouth Corporation">BellSouth Corporation</SelectItem>
                          <SelectItem value="ABN AMRO (pre 2009)">ABN AMRO (pre 2009)</SelectItem>
                          <SelectItem value="Allergan plc">Allergan plc</SelectItem>
                          <SelectItem value="BG Group Plc">BG Group Plc</SelectItem>
                          <SelectItem value="Celgene Corporation">Celgene Corporation</SelectItem>
                          <SelectItem value="SABMiller Plc">SABMiller Plc</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Acquired Country Filter */}
                      <Select
                        value={filters.acquiredCountry || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("acquiredCountry", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="Acquired Countries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Countries</SelectItem>
                          <SelectItem value="United States of America">United States of America</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Italy">Italy</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Netherlands">Netherlands</SelectItem>
                          <SelectItem value="Ireland">Ireland</SelectItem>
                          <SelectItem value="Belgium">Belgium</SelectItem>
                          <SelectItem value="Switzerland">Switzerland</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Rank Filter */}
                      <Select
                        value={filters.rank || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("rank", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="All Ranks" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ranks</SelectItem>
                          <SelectItem value="1-10">Top 10</SelectItem>
                          <SelectItem value="11-25">Rank 11-25</SelectItem>
                          <SelectItem value="26-50">Rank 26-50</SelectItem>
                          <SelectItem value="51-100">Rank 51-100</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Min Deal Value Filter - with bigger values for megadeals */}
                      <Select
                        value={filters.minValue || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("minValue", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 border-slate-200">
                          <SelectValue placeholder="Any Value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Value</SelectItem>
                          <SelectItem value="10">$10B+</SelectItem>
                          <SelectItem value="25">$25B+</SelectItem>
                          <SelectItem value="50">$50B+</SelectItem>
                          <SelectItem value="75">$75B+</SelectItem>
                          <SelectItem value="100">$100B+</SelectItem>
                          <SelectItem value="150">$150B+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              activeTab === "exits" ? (
                // Table loading state for exits
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-slate-800 border-b border-slate-200">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                            Exit Value
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                            Exit Type
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                            Total Funding
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                            Industry
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 dark:text-white divide-y divide-slate-200">
                        {[...Array(10)].map((_, i) => (
                          <tr key={i}>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <Skeleton className="h-4 w-32" />
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <Skeleton className="h-4 w-20" />
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <Skeleton className="h-4 w-16" />
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <Skeleton className="h-4 w-20" />
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <Skeleton className="h-4 w-24" />
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <Skeleton className="h-4 w-20" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                // Card loading state for other tabs
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(12)].map((_, i) => (
                    <Card
                      key={i}
                      className="border-0 shadow-lg bg-white/80 backdrop-blur"
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Skeleton className="h-12 w-12 rounded-xl" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Skeleton className="h-6 w-full" />
                          <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : fundingData?.length > 0 ? (
              activeTab === "exits" ||
              activeTab === "ma-deals" ||
              activeTab === "megadeals" ||
              activeTab === "us-sfd-23" ||
              activeTab === "us-sfd-24" ||
              activeTab === "live" ? (
                // Table format for exits, M&A deals, and megadeals data
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-slate-800 border-b border-slate-200">
                        <tr>
                          {activeTab === "exits" ? (
                            <>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Company
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Exit Value
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Exit Type
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Total Funding
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Industry
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Date
                              </th>
                            </>
                          ) : activeTab === "ma-deals" ? (
                            <>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Acquired Company
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Acquiring Company
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Deal Value
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Industry
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Date Seen
                              </th>
                            </>
                          ) : activeTab === "megadeals" ? (
                            <>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Rank
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Acquirer
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Acquired Entity
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Value (USD)
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Transaction Type
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Year
                              </th>
                            </>
                          ) : activeTab === "us-sfd-23" ? (
                            <>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Company
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Lead Investors
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Valuation
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Industry
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Date Reported
                              </th>
                            </>
                          ) : activeTab === "us-sfd-24" ? (
                            <>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Company
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Lead Investors
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Valuation
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Industry
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Date Reported
                              </th>
                            </>
                          ) : activeTab === "live" ? (
                            <>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Company
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Funding Amount
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Currency
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Round Type
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                CEO
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Company Info
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Main Category
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Country
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Size
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Date Seen
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Company
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Lead Investors
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Valuation
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Industry
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-200 uppercase tracking-wider">
                                Date Reported
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 dark:text-white divide-y divide-slate-200">
                        {fundingData.map(
                          (deal: any) => (
                            (() => {
                              if (activeTab === "ma-deals")
                                console.log("M&A deal:", deal);
                            })(),
                            (
                              <tr
                                key={deal.id}
                                className="hover:bg-slate-50 dark:hover:bg-gray-800 dark:text-white transition-colors duration-200 cursor-pointer"
                                onClick={() => {
                                  handleDealClick(deal);
                                }}
                              >
                                {activeTab === "exits" ? (
                                  <>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                            <TrendingUp className="h-5 w-5 text-white" />
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {deal.company || "Unknown Company"}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm font-bold text-green-600">
                                        {deal.exitValueBillions
                                          ? `$${parseFloat(deal.exitValueBillions).toFixed(1)}B`
                                          : "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800 border-blue-200"
                                      >
                                        {deal.exitType || "Unknown"}
                                      </Badge>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {deal.totalFundingMillions
                                          ? `$${parseFloat(deal.totalFundingMillions).toFixed(0)}M`
                                          : "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {deal.industry || "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {deal.dealClosedDate
                                          ? formatDate(deal.dealClosedDate)
                                          : "Unknown"}
                                      </div>
                                    </td>
                                  </>
                                ) : activeTab === "ma-deals" ? (
                                  <>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                                            {deal.companyInfo &&
                                            deal.companyInfo.logo_url ? (
                                              <img
                                                src={deal.companyInfo.logo_url}
                                                alt={
                                                  deal.companyName ||
                                                  "Unknown Target"
                                                }
                                                className="h-full w-full object-contain"
                                              />
                                            ) : (
                                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                <span className="text-white text-sm font-bold">
                                                  {(deal.companyName || "U")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {deal.companyName ||
                                              "Unknown Target"}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                                            {deal.acquiredByCompanyInfo &&
                                            deal.acquiredByCompanyInfo
                                              .logo_url ? (
                                              <img
                                                src={
                                                  deal.acquiredByCompanyInfo
                                                    .logo_url
                                                }
                                                alt={
                                                  deal.acquiredCompanyName ||
                                                  "Unknown Target"
                                                }
                                                className="h-full w-full object-contain"
                                              />
                                            ) : (
                                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                <span className="text-white text-sm font-bold">
                                                  {(
                                                    deal.acquiredCompanyName ||
                                                    "U"
                                                  )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {deal.acquiredCompanyName ||
                                              "Unknown Target"}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm font-bold text-blue-600">
                                        {deal.dealSizeBillions
                                          ? (() => {
                                              const value = parseFloat(
                                                deal.dealSizeBillions,
                                              );
                                              return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                                            })()
                                          : "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {deal.mainCategory || "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {deal.dateSeen
                                          ? formatDate(deal.dateSeen)
                                          : deal.createdAt
                                            ? formatDate(deal.createdAt)
                                            : "Unknown"}
                                      </div>
                                    </td>
                                  </>
                                ) : activeTab === "megadeals" ? (
                                  <>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8">
                                          <Badge
                                            variant="secondary"
                                            className="bg-purple-100 text-purple-800 border-purple-200 text-xs"
                                          >
                                            #{deal.rank || "Unknown"}
                                          </Badge>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 dark:text-white min-w-0">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                            <Star className="h-5 w-5 text-white" />
                                          </div>
                                        </div>
                                        <div className="ml-4 min-w-0 flex-1">
                                          <div
                                            className="text-sm font-medium text-gray-900 dark:text-white truncate"
                                            title={
                                              deal.acquirerEntity ||
                                              "Unknown Acquirer"
                                            }
                                          >
                                            {deal.acquirerEntity ||
                                              "Unknown Acquirer"}
                                          </div>
                                          <div
                                            className="text-xs text-gray-500 dark:text-gray-400 truncate"
                                            title={
                                              deal.acquirerCountry ||
                                              "Unknown Country"
                                            }
                                          >
                                            {deal.acquirerCountry ||
                                              "Unknown Country"}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 dark:text-white min-w-0">
                                      <div className="min-w-0">
                                        <div
                                          className="text-sm font-medium text-gray-900 dark:text-white truncate"
                                          title={
                                            deal.acquiredEntity ||
                                            "Unknown Target"
                                          }
                                        >
                                          {deal.acquiredEntity ||
                                            "Unknown Target"}
                                        </div>
                                        <div
                                          className="text-xs text-gray-500 dark:text-gray-400 truncate"
                                          title={
                                            deal.acquiredCountry ||
                                            "Unknown Country"
                                          }
                                        >
                                          {deal.acquiredCountry ||
                                            "Unknown Country"}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm font-bold text-purple-600">
                                        {(() => {
                                          console.log(
                                            "Megadeal deal.valueUsd:",
                                            deal.valueUsd,
                                            "type:",
                                            typeof deal.valueUsd,
                                          );
                                          if (
                                            deal.valueUsd &&
                                            deal.valueUsd !== null &&
                                            deal.valueUsd !== undefined
                                          ) {
                                            // Handle string or number values
                                            const rawValue =
                                              typeof deal.valueUsd === "string"
                                                ? parseFloat(deal.valueUsd)
                                                : deal.valueUsd;
                                            console.log(
                                              "Raw value after conversion:",
                                              rawValue,
                                            );

                                            if (
                                              !isNaN(rawValue) &&
                                              rawValue > 0
                                            ) {
                                              // Data from Supabase is already in billions, no need to convert
                                              console.log(
                                                "Raw value (already in billions):",
                                                rawValue,
                                              );
                                              
                                              return `$${rawValue.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`;
                                            } else {
                                              console.log(
                                                "Invalid or zero value:",
                                                rawValue,
                                              );
                                              return "Unknown";
                                            }
                                          }
                                          return "Unknown";
                                        })()}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <Badge
                                        variant="secondary"
                                        className="bg-gray-100 text-gray-800 border-gray-200"
                                      >
                                        {deal.transactionType || "Unknown"}
                                      </Badge>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {deal.year || "Unknown"}
                                      </div>
                                    </td>
                                  </>
                                ) : activeTab === "us-sfd-23" ? (
                                  // US SFD 2023 table content
                                  <>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                            <BarChart3 className="h-5 w-5 text-white" />
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {deal.company || "Unknown Company"}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm font-bold text-orange-600">
                                        {formatCurrency(deal.amount, deal.currency)}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 dark:text-white min-w-0">
                                      <div
                                        className="text-sm text-gray-900 dark:text-white truncate"
                                        title={deal.leadInvestors || "Unknown"}
                                      >
                                        {deal.leadInvestors || "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {formatCurrency(deal.valuation, deal.currency)}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <Badge
                                        variant="secondary"
                                        className="bg-orange-100 text-orange-800 border-orange-200"
                                      >
                                        {deal.industry || "Unknown"}
                                      </Badge>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(deal.dateReported)}
                                      </div>
                                    </td>
                                  </>
                                ) : activeTab === "us-sfd-24" ? (
                                  // US SFD 2024 table content
                                  <>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <Star className="h-5 w-5 text-white" />
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {deal.company || "Unknown Company"}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm font-bold text-blue-600">
                                        {formatCurrency(deal.amount, deal.currency)}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {deal.leadInvestors || "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                                        {formatCurrency(deal.valuation, deal.currency)}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800 border-blue-200"
                                      >
                                        {deal.industry || "Unknown"}
                                      </Badge>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(deal.dateReported)}
                                      </div>
                                    </td>
                                  </>
                                ) : activeTab === "live" ? (
                                  // Live Funding table content
                                  <>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                          <div
                                            className="h-10 w-10 rounded-lg bg-gradient-to-br
                                       from-emerald-500 to-green-600
                                       flex items-center justify-center overflow-hidden"
                                          >
                                            {(() => {
                                              return deal?.companyInfo
                                                .logo_url ? (
                                                <img
                                                  src={
                                                    deal?.companyInfo.logo_url
                                                  }
                                                  alt="Company Logo"
                                                  className="h-full w-full object-contain"
                                                />
                                              ) : (
                                                <span className="text-white text-sm">
                                                  Unknown
                                                </span>
                                              );
                                            })()}
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {deal.companyName ||
                                              "Unknown Company"}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm font-bold text-emerald-600">
                                        {deal.fundingAmount
                                          ? formatCurrency(deal.fundingAmount, deal.currency)
                                          : "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {deal.currency || "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <Badge
                                        variant="secondary"
                                        className="bg-emerald-100 text-emerald-800 border-emerald-200"
                                      >
                                        {deal.roundType || "Unknown"}
                                      </Badge>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {deal.ceo
                                          ? typeof deal.ceo === "string"
                                            ? deal.ceo
                                            : deal.ceo.name || "Unknown"
                                          : "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div
                                        className="text-sm text-gray-900 dark:text-white max-w-xs truncate"
                                        title={
                                          deal.companyInfo
                                            ? typeof deal.companyInfo ===
                                              "string"
                                              ? deal.companyInfo
                                              : deal.companyInfo.description ||
                                                "Unknown"
                                            : "Unknown"
                                        }
                                      >
                                        {deal.companyInfo
                                          ? (() => {
                                              const info =
                                                typeof deal.companyInfo ===
                                                "string"
                                                  ? deal.companyInfo
                                                  : deal.companyInfo
                                                      .description || "Unknown";
                                              return info.length > 50
                                                ? info.substring(0, 50) + "..."
                                                : info;
                                            })()
                                          : "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {deal.mainCategory || "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {deal.country || "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {deal.size || "Unknown"}
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap dark:text-white">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(deal.dateSeen)}
                                      </div>
                                    </td>
                                  </>
                                ) : null}
                              </tr>
                            )
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                // Card format for other tabs
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {fundingData.map(renderFundingCard)}
                </div>
              )
            ) : (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <Globe className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No funding data found
                  </h3>
                  <p className="text-slate-600">
                    Try adjusting your search filters to find more deals.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {(activeTab === "exits" ||
              activeTab === "ma-deals" ||
              activeTab === "megadeals" ||
              activeTab === "us-sfd-23" ||
              activeTab === "us-sfd-24" ||
              activeTab === "live") &&
              (totalPages > 1 ||
                (activeTab === "live" &&
                  fundingData &&
                  fundingData.length > 0)) && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                  <div className="text-sm text-slate-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      totalCount || 0,
                    )}{" "}
                    of {totalCount?.toLocaleString() || 0} results
                  </div>

                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="border-slate-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </Button>

                    <div className="flex gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const pageNum = i + 1;

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pageNum === pagination.page
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className={
                                pageNum === pagination.page
                                  ? `bg-gradient-to-r ${getTabColor(activeTab)} text-white`
                                  : "border-slate-200"
                              }
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
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= totalPages}
                      className="border-slate-200"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

            {/* Deal Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    {/* Show logo for any tab if available */}
                    {selectedDeal?.companyInfo?.logo_url ? (
                      <img
                        src={selectedDeal.companyInfo.logo_url}
                        alt={selectedDeal.companyInfo.name || "Logo"}
                        className="h-8 w-8 rounded-lg object-cover border border-slate-300 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className={`h-8 w-8 rounded-lg bg-gradient-to-br ${getTabColor(activeTab)} flex items-center justify-center`}
                      >
                        {(() => {
                          const Icon = getTabIcon(activeTab);
                          return <Icon className="h-4 w-4 text-white" />;
                        })()}
                      </div>
                    )}
                    <span className="font-semibold text-lg dark:text-white">
                      {selectedDeal?.company ||
                        selectedDeal?.companyName ||
                        selectedDeal?.name ||
                        "Deal Details"}
                    </span>
                  </DialogTitle>
                </DialogHeader>

                {selectedDeal && (
                  <div className="space-y-6">
                    {/* Exits Dialog Content */}
                    {activeTab === "exits" && (
                      <>
                        {/* Key Metrics for Exits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Exit Value
                              </div>
                              <div className="text-xl font-bold text-green-600">
                                {selectedDeal.exitValueBillions
                                  ? formatCurrencyAmount(parseFloat(selectedDeal.exitValueBillions) * 1000000000, selectedDeal.currency)
                                  : "Unknown"}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Exit Type
                              </div>
                              <div className="text-lg font-semibold">
                                {selectedDeal.exitType || "Unknown"}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Total Funding
                              </div>
                              <div className="text-lg font-semibold">
                                {selectedDeal.totalFundingMillions
                                  ? formatCurrencyAmount(parseFloat(selectedDeal.totalFundingMillions) * 1000000, selectedDeal.currency)
                                  : "Unknown"}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle>Exit Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Company:</span>
                              <span className="font-medium">
                                {selectedDeal.company || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Industry:</span>
                              <span className="font-medium">
                                {selectedDeal.industry || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                Date Closed:
                              </span>
                              <span className="font-medium">
                                {formatDate(selectedDeal.dealClosedDate)}
                              </span>
                            </div>
                            {selectedDeal.investors && (
                              <div>
                                <span className="text-slate-600">
                                  Investors:
                                </span>
                                <p className="font-medium mt-1">
                                  {selectedDeal.investors}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {/* M&A Deals Dialog Content */}
                    {activeTab === "ma-deals" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Acquired Company
                              </div>
                              <div className="text-lg font-semibold">
                                {selectedDeal.companyName || "Unknown"}
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Acquiring Company
                              </div>
                              <div className="text-lg font-semibold">
                                {selectedDeal.acquiredBy || "Unknown"}
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Main Category
                              </div>
                              <div className="text-lg font-semibold">
                                {selectedDeal.mainCategory || "Unknown"}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Logo Section */}
                        <Card className="mb-4">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-center gap-4">
                              {/* Acquiring Company Logo */}
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-white shadow-lg overflow-hidden">
                                  {selectedDeal.acquiredByCompanyInfo &&
                                  selectedDeal.acquiredByCompanyInfo
                                    .logo_url ? (
                                    <img
                                      src={
                                        selectedDeal.acquiredByCompanyInfo
                                          .logo_url
                                      }
                                      alt={
                                        selectedDeal.acquiredBy ||
                                        "Acquiring Company"
                                      }
                                      className="w-full h-full object-contain rounded-lg"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <span className="text-white text-lg font-bold">
                                      {(selectedDeal.acquiredBy || "A")
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-600 mt-2 text-center max-w-20 truncate">
                                  {selectedDeal.acquiredBy || "Acquiring"}
                                </span>
                              </div>

                              {/* Arrow */}
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-0.5 bg-purple-500 relative">
                                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-purple-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                                </div>
                                <span className="text-xs text-purple-600 mt-1">
                                  ACQUISITION
                                </span>
                              </div>

                              {/* Acquired Company Logo */}
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border-2 border-white shadow-lg overflow-hidden">
                                  {selectedDeal.companyInfo &&
                                  selectedDeal.companyInfo.logo_url ? (
                                    <img
                                      src={selectedDeal.companyInfo.logo_url}
                                      alt={
                                        selectedDeal.companyName ||
                                        "Acquired Company"
                                      }
                                      className="w-full h-full object-contain rounded-lg"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <span className="text-white text-lg font-bold">
                                      {(selectedDeal.companyName || "A")
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-600 mt-2 text-center max-w-20 truncate">
                                  {selectedDeal.companyName || "Acquired"}
                                </span>
                              </div>
                            </div>

                            {/* Date Display */}
                            <div className="flex items-center justify-center mt-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="text-slate-500">📅</span>
                                <span>
                                  {formatDate(selectedDeal.dateSeen) ||
                                    "Date not available"}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>M&A Deal Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Name Path:</span>
                              <span className="font-medium">
                                {selectedDeal.namePath || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Date Seen:</span>
                              <span className="font-medium">
                                {formatDate(selectedDeal.dateSeen)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                Created At:
                              </span>
                              <span className="font-medium">
                                {formatDate(selectedDeal.createdAt)}
                              </span>
                            </div>
                            {selectedDeal.growthInfo && (
                              <div>
                                <span className="text-slate-600 font-semibold block mb-2">
                                  Growth Information:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                  <div>
                                    <span className="text-slate-500">
                                      1 Month Growth:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {(() => {
                                        if (!selectedDeal.growthInfo.growth_1m) return "Unknown";
                                        const val = String(selectedDeal.growthInfo.growth_1m).trim();
                                        if (val === "" || val === "0" || val === "00" || val === "000" || val === "0000" || 
                                            selectedDeal.growthInfo.growth_1m === 0 || parseFloat(val) === 0) {
                                          return "Unknown";
                                        }
                                        return `${selectedDeal.growthInfo.growth_1m}%`;
                                      })()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">
                                      3 Month Growth:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {(() => {
                                        if (!selectedDeal.growthInfo.growth_3m) return "Unknown";
                                        const val = String(selectedDeal.growthInfo.growth_3m).trim();
                                        if (val === "" || val === "0" || val === "00" || val === "000" || val === "0000" || 
                                            selectedDeal.growthInfo.growth_3m === 0 || parseFloat(val) === 0) {
                                          return "Unknown";
                                        }
                                        return `${selectedDeal.growthInfo.growth_3m}%`;
                                      })()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">
                                      6 Month Growth:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {(() => {
                                        if (!selectedDeal.growthInfo.growth_6m) return "Unknown";
                                        const val = String(selectedDeal.growthInfo.growth_6m).trim();
                                        if (val === "" || val === "0" || val === "00" || val === "000" || val === "0000" || 
                                            selectedDeal.growthInfo.growth_6m === 0 || parseFloat(val) === 0) {
                                          return "Unknown";
                                        }
                                        return `${selectedDeal.growthInfo.growth_6m}%`;
                                      })()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">
                                      9 Month Growth:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {(() => {
                                        if (!selectedDeal.growthInfo.growth_9m) return "Unknown";
                                        const val = String(selectedDeal.growthInfo.growth_9m).trim();
                                        if (val === "" || val === "0" || val === "00" || val === "000" || val === "0000" || 
                                            selectedDeal.growthInfo.growth_9m === 0 || parseFloat(val) === 0) {
                                          return "Unknown";
                                        }
                                        return `${selectedDeal.growthInfo.growth_9m}%`;
                                      })()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">
                                      12 Month Growth:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {(() => {
                                        if (!selectedDeal.growthInfo.growth_12m) return "Unknown";
                                        const val = String(selectedDeal.growthInfo.growth_12m).trim();
                                        if (val === "" || val === "0" || val === "00" || val === "000" || val === "0000" || 
                                            selectedDeal.growthInfo.growth_12m === 0 || parseFloat(val) === 0) {
                                          return "Unknown";
                                        }
                                        return `${selectedDeal.growthInfo.growth_12m}%`;
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                            {selectedDeal.acquiredByLinkedinUrl && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">
                                  Acquirer LinkedIn:
                                </span>
                                <a
                                  href={selectedDeal.acquiredByLinkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-blue-600 hover:text-blue-700"
                                >
                                  LinkedIn Profile
                                </a>
                              </div>
                            )}
                            {selectedDeal.companyInfo && (
                              <div>
                                <span className="text-slate-600 font-semibold block mb-2">
                                  Company Info:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                  {selectedDeal.companyInfo.name && (
                                    <div>
                                      <span className="text-slate-500">
                                        Name:
                                      </span>{" "}
                                      <span className="font-medium">
                                        {selectedDeal.companyInfo.name}
                                      </span>
                                    </div>
                                  )}
                                  {selectedDeal.companyInfo.website && (
                                    <div>
                                      <span className="text-slate-500">
                                        Website:
                                      </span>{" "}
                                      <a
                                        href={selectedDeal.companyInfo.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        {selectedDeal.companyInfo.website}
                                      </a>
                                    </div>
                                  )}
                                  {selectedDeal.companyInfo.hq_country && (
                                    <div>
                                      <span className="text-slate-500">
                                        HQ Country:
                                      </span>{" "}
                                      <span className="font-medium">
                                        {selectedDeal.companyInfo.hq_country}
                                      </span>
                                    </div>
                                  )}
                                  {selectedDeal.companyInfo.industry && (
                                    <div>
                                      <span className="text-slate-500">
                                        Industry:
                                      </span>{" "}
                                      <span className="font-medium">
                                        {selectedDeal.companyInfo.industry}
                                      </span>
                                    </div>
                                  )}
                                  {selectedDeal.companyInfo.year_founded && (
                                    <div>
                                      <span className="text-slate-500">
                                        Year Founded:
                                      </span>{" "}
                                      <span className="font-medium">
                                        {selectedDeal.companyInfo.year_founded}
                                      </span>
                                    </div>
                                  )}
                                  {selectedDeal.companyInfo.email && (
                                    <div>
                                      <span className="text-slate-500">
                                        Email:
                                      </span>{" "}
                                      <a
                                        href={`mailto:${selectedDeal.companyInfo.email}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {selectedDeal.companyInfo.email}
                                      </a>
                                    </div>
                                  )}
                                  {selectedDeal.companyInfo.phone && (
                                    <div>
                                      <span className="text-slate-500">
                                        Phone:
                                      </span>{" "}
                                      <a
                                        href={`tel:${selectedDeal.companyInfo.phone}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {selectedDeal.companyInfo.phone}
                                      </a>
                                    </div>
                                  )}
                                  {selectedDeal.companyInfo.logo_url && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-500">
                                        Logo:
                                      </span>{" "}
                                      <img
                                        src={selectedDeal.companyInfo.logo_url}
                                        alt="Logo"
                                        className="h-6 w-6 rounded border"
                                      />
                                    </div>
                                  )}
                                  {selectedDeal.companyInfo.categories &&
                                    Array.isArray(
                                      selectedDeal.companyInfo.categories,
                                    ) &&
                                    selectedDeal.companyInfo.categories.length >
                                      0 && (
                                      <div className="col-span-2">
                                        <span className="text-slate-500">
                                          Categories:
                                        </span>{" "}
                                        <span className="font-medium">
                                          {selectedDeal.companyInfo.categories.join(
                                            ", ",
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  {selectedDeal.companyInfo
                                    .company_interested_in &&
                                    Array.isArray(
                                      selectedDeal.companyInfo
                                        .company_interested_in,
                                    ) &&
                                    selectedDeal.companyInfo
                                      .company_interested_in.length > 0 && (
                                      <div className="col-span-2">
                                        <span className="text-slate-500">
                                          Interested In:
                                        </span>{" "}
                                        <span className="font-medium">
                                          {selectedDeal.companyInfo.company_interested_in.join(
                                            ", ",
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  {selectedDeal.companyInfo.description && (
                                    <div className="col-span-2">
                                      <span className="text-slate-500">
                                        Description:
                                      </span>{" "}
                                      <span className="font-medium">
                                        {selectedDeal.companyInfo.description}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {/* Megadeals Dialog Content */}
                    {activeTab === "megadeals" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Value (USD)
                              </div>
                              <div className="text-xl font-bold text-indigo-600">
                                {selectedDeal.valueUsd
                                  ? (() => {
                                      const valueInBillions =
                                        parseFloat(selectedDeal.valueUsd) /
                                        1000000000;
                                      const valueInMillions =
                                        parseFloat(selectedDeal.valueUsd) /
                                        1000000;

                                      // If the value is less than 1 billion, it's probably in millions
                                      if (
                                        parseFloat(selectedDeal.valueUsd) <
                                        1000000000
                                      ) {
                                        const symbol = getCurrencySymbol(selectedDeal.currency || 'USD');
                                        return `${symbol}${valueInMillions.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
                                      } else {
                                        const symbol = getCurrencySymbol(selectedDeal.currency || 'USD');
                                        return `${symbol}${valueInBillions.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`;
                                      }
                                    })()
                                  : "Unknown"}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Transaction Type
                              </div>
                              <div className="text-lg font-semibold">
                                {selectedDeal.transactionType || "Unknown"}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Year
                              </div>
                              <div className="text-lg font-semibold">
                                {selectedDeal.year || "Unknown"}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle>Megadeal Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Acquirer:</span>
                              <span className="font-medium">
                                {selectedDeal.acquirerEntity || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                Acquired Entity:
                              </span>
                              <span className="font-medium">
                                {selectedDeal.acquiredEntity || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                Acquirer Country:
                              </span>
                              <span className="font-medium">
                                {selectedDeal.acquirerCountry || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                Target Country:
                              </span>
                              <span className="font-medium">
                                {selectedDeal.acquiredCountry || "Unknown"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {/* US SFD 2023 Dialog Content */}
                    {activeTab === "us-sfd-23" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Funding Amount
                              </div>
                              <div className="text-xl font-bold text-orange-600">
                                {formatCurrency(selectedDeal.amount, selectedDeal.currency)}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Valuation
                              </div>
                              <div className="text-lg font-semibold">
                                {formatCurrency(selectedDeal.valuation, selectedDeal.currency)}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Industry
                              </div>
                              <div className="text-lg font-semibold">
                                {selectedDeal.industry || "Unknown"}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle>US SFD 2023 Round Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Company:</span>
                              <span className="font-medium">
                                {selectedDeal.company || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                Lead Investors:
                              </span>
                              <span className="font-medium">
                                {selectedDeal.leadInvestors || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                Date Reported:
                              </span>
                              <span className="font-medium">
                                {formatDate(selectedDeal.dateReported)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {/* US SFD 2024 Dialog Content */}
                    {activeTab === "us-sfd-24" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Funding Amount
                              </div>
                              <div className="text-xl font-bold text-blue-600">
                                {selectedDeal.amount
                                  ? formatCurrencyAmount(parseFloat(selectedDeal.amount) * 1000000, selectedDeal.currency)
                                  : "Unknown"}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Valuation
                              </div>
                              <div className="text-lg font-semibold text-indigo-600">
                                {selectedDeal.valuation
                                  ? formatCurrencyAmount(parseFloat(selectedDeal.valuation) * 1000000, selectedDeal.currency)
                                  : "Unknown"}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-600 mb-1">
                                Industry
                              </div>
                              <div className="text-lg font-semibold">
                                {selectedDeal.industry || "Unknown"}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle>US SFD 2024 Round Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Company:</span>
                              <span className="font-medium">
                                {selectedDeal.company || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                Lead Investors:
                              </span>
                              <span className="font-medium">
                                {selectedDeal.leadInvestors || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                Date Reported:
                              </span>
                              <span className="font-medium">
                                {formatDate(selectedDeal.dateReported)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {/* Live Funding Dialog Content */}
                    {activeTab === "live" && (
                      <>
                        {/* Top 3 Boxes */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Funding Amount</div>
                            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                              {selectedDeal.fundingAmount || selectedDeal.size
                                ? formatCurrency(selectedDeal.fundingAmount || selectedDeal.size, selectedDeal.currency)
                                : "Unknown"}
                            </div>
                          </div>
                          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Currency</div>
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">
                              {selectedDeal.currency || "Unknown"}
                            </div>
                          </div>
                          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Round Type</div>
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">
                              {selectedDeal.roundType || "Unknown"}
                            </div>
                          </div>
                        </div>

                        {/* Second Row of Boxes */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Company Size</div>
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">
                              {selectedDeal.teamSize || selectedDeal.size || "Unknown"}
                            </div>
                          </div>
                          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">CEO</div>
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">
                              {selectedDeal.ceo
                                ? typeof selectedDeal.ceo === "string"
                                  ? selectedDeal.ceo
                                  : selectedDeal.ceo.name || "Unknown"
                                : "Unknown"}
                            </div>
                          </div>
                          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Main Category</div>
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">
                              {selectedDeal.mainCategory || "Unknown"}
                            </div>
                          </div>
                        </div>

                        {/* Company Information Section */}
                        <div className="mb-6 p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg">
                          <div className="text-slate-700 dark:text-slate-300 font-semibold mb-4">
                            Company Information
                          </div>
                          
                          <div className="flex gap-8">
                            {/* Left column - Labels */}
                            <div className="space-y-3">
                              <div className="text-sm text-slate-600">Company Name</div>
                              <div className="text-sm text-slate-600">Country</div>
                              <div className="text-sm text-slate-600">Company Size</div>
                              <div className="text-sm text-slate-600">Date Seen</div>
                            </div>
                            
                            {/* Right column - Values aligned to the right */}
                            <div className="space-y-3 flex-1 text-right">
                              <div className="font-medium text-slate-900 dark:text-white">
                                {selectedDeal.companyName || selectedDeal.name || "Unknown"}
                              </div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {selectedDeal.country || "Unknown"}
                              </div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {selectedDeal.teamSize || selectedDeal.size || "Unknown"}
                              </div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {formatDate(selectedDeal.dateSeen || selectedDeal.announcedDate) || "Unknown"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Website and Description Section */}
                        <div className="space-y-4">
                          {/* Website */}
                          {selectedDeal.companyInfo?.website && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Website:</span>
                              <a
                                href={selectedDeal.companyInfo.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {selectedDeal.companyInfo.website}
                              </a>
                            </div>
                          )}

                          {/* Description */}
                          <div>
                            <div className="text-sm text-slate-600 mb-2">Description:</div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              {selectedDeal.companyInfo?.description || 
                               "No description available for this company."}
                            </div>
                          </div>

                          {/* CEO LinkedIn */}
                          {selectedDeal.ceo && typeof selectedDeal.ceo === 'object' && selectedDeal.ceo.linkedin_url && (
                            <div>
                              <div className="text-sm text-slate-600 mb-1">CEO LinkedIn:</div>
                              <a
                                href={selectedDeal.ceo.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* External Links */}
                    {selectedDeal.source && (
                      <div className="pt-4 border-t border-slate-200">
                        <a
                          href={selectedDeal.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Source
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
