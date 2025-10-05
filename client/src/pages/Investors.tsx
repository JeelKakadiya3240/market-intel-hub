import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  MapPin,
  Globe,
  Target,
  Briefcase,
  Phone,
  Mail,
  ExternalLink,
  Star,
  BarChart3,
  UserCheck,
  Handshake,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Pie,
  Cell,
  PieChart,
  Legend,
} from "recharts";

// Chart color palette for charts (same as FundingRounds, Rankings, Companies)
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

interface InvestorFilters {
  search: string;
  type: string;
  location: string;
  investmentRange: string;
  sweetSpot: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

type InvestorTabType = "investors" | "contacts";

export default function Investors() {
  const [activeTab, setActiveTab] = useState<InvestorTabType>("investors");
  const [filters, setFilters] = useState<InvestorFilters>({
    search: "",
    type: "all",
    location: "all",
    investmentRange: "all",
    sweetSpot: "all",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
  });
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate offset for API calls
  const offset = (pagination.page - 1) * pagination.limit;

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("limit", pagination.limit.toString());
    if (activeTab === "investors") {
      // Use page-based pagination for investors
      params.set("page", pagination.page.toString());
    } else {
      // Use offset-based pagination for contacts
      params.set("offset", offset.toString());
    }
    if (filters.search) params.set("search", filters.search);
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.location !== "all") params.set("location", filters.location);
    if (filters.investmentRange !== "all") params.set("investmentRange", filters.investmentRange);
    if (filters.sweetSpot !== "all") params.set("sweetSpot", filters.sweetSpot);
    return params.toString();
  };

  // Get API endpoint based on active tab
  const getApiEndpoint = () => {
    return activeTab === "investors"
      ? "/api/investors"
      : "/api/investors/contacts";
  };

  // Fetch investor stats
  const { data: investorStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/investors/stats"],
    queryFn: async () => {
      const response = await fetch("/api/investors/stats");
      if (!response.ok) throw new Error("Failed to fetch investor stats");
      return response.json();
    },
  });

  // Fetch investor data (paginated for table)
  const { data: investorData, isLoading } = useQuery({
    queryKey: [
      getApiEndpoint(),
      activeTab,
      pagination.page,
      pagination.limit,
      filters.search,
      filters.type,
      filters.location,
      filters.investmentRange,
      filters.sweetSpot,
    ],
    queryFn: async () => {
      const response = await fetch(`${getApiEndpoint()}?${buildQueryParams()}`);
      if (!response.ok) throw new Error("Failed to fetch investor data");
      return response.json();
    },
  });

  // Fetch filtered investor analytics data for charts (synced with table filters)
  const { data: investorAnalyticsData } = useQuery({
    queryKey: [
      "/api/investors/analytics", 
      activeTab,
      filters.search,
      filters.type,
      filters.location,
      filters.investmentRange,
      filters.sweetSpot,
    ],
    queryFn: async () => {
      if (activeTab !== "investors") return null;
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.type !== "all") params.set("type", filters.type);
      if (filters.location !== "all") params.set("location", filters.location);
      if (filters.investmentRange !== "all") params.set("investmentRange", filters.investmentRange);
      if (filters.sweetSpot !== "all") params.set("sweetSpot", filters.sweetSpot);
      
      const response = await fetch(`/api/investors/analytics?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch investor analytics");
      return response.json();
    },
    enabled: activeTab === "investors",
  });

  // Use the filtered data for dropdown options when no filters are active, 
  // otherwise fetch unfiltered data for dropdown options
  const hasActiveFilters = Boolean(filters.search || filters.type !== "all" || filters.location !== "all" || 
                          filters.investmentRange !== "all" || filters.sweetSpot !== "all");
  
  const { data: dropdownOptionsData } = useQuery({
    queryKey: ["/api/investors/analytics", activeTab, "unfiltered"],
    queryFn: async () => {
      if (activeTab !== "investors") return null;
      const response = await fetch("/api/investors/analytics");
      if (!response.ok) throw new Error("Failed to fetch dropdown options");
      return response.json();
    },
    enabled: activeTab === "investors" && hasActiveFilters === true,
  });

  // Use filtered data for dropdowns when no filters are active, otherwise use unfiltered data
  const optionsData = hasActiveFilters ? dropdownOptionsData : investorAnalyticsData;


  // Fetch ALL contacts analytics data for dropdown filters
  const { data: contactsAnalyticsData } = useQuery({
    queryKey: ["/api/investors/contacts/charts", activeTab],
    queryFn: async () => {
      if (activeTab !== "contacts") return null;
      const response = await fetch("/api/investors/contacts/charts");
      if (!response.ok) throw new Error("Failed to fetch contacts analytics");
      return response.json();
    },
    enabled: activeTab === "contacts",
  });

  // Fetch total count for pagination
  const { data: countData } = useQuery({
    queryKey: [
      getApiEndpoint() + "/count",
      activeTab,
      filters.search,
      filters.type,
      filters.location,
      filters.investmentRange,
      filters.sweetSpot,
    ],
    queryFn: async () => {
      const countEndpoint =
        activeTab === "investors"
          ? "/api/investors/count"
          : "/api/investors/contacts/count";
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.type !== "all") params.set("type", filters.type);
      if (filters.location !== "all") params.set("location", filters.location);
      if (filters.investmentRange !== "all") params.set("investmentRange", filters.investmentRange);
      if (filters.sweetSpot !== "all") params.set("sweetSpot", filters.sweetSpot);

      const response = await fetch(`${countEndpoint}?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch count");
      return response.json();
    },
  });

  // Reset pagination when changing tabs or filters
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeTab, filters]);

  const handleFilterChange = (key: keyof InvestorFilters, value: string) => {
    // If searching by name, clear location and type filters to search globally
    if (key === "search" && value.trim() !== "") {
      setFilters((prev) => ({ 
        ...prev, 
        [key]: value,
        location: "all",
        type: "all"
      }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getTabIcon = (tab: InvestorTabType) => {
    switch (tab) {
      case "investors":
        return Building2;
      case "contacts":
        return UserCheck;
      default:
        return Building2;
    }
  };

  const getTabColor = (tab: InvestorTabType) => {
    switch (tab) {
      case "investors":
        return "from-blue-500 to-indigo-600";
      case "contacts":
        return "from-green-500 to-emerald-600";
      default:
        return "from-blue-500 to-indigo-600";
    }
  };

  const formatInvestorType = (type: string | null) => {
    if (!type) return "Unknown";
    return type.replace(/[_-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (date: string | null) => {
    if (!date || date === "2025-01-01" || date === "1970-01-01") return "N/A";
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

  // Helper function to format investment amounts (database stores values in millions format)
  const formatInvestmentAmount = (amount: number | null | undefined, context?: { isMax?: boolean, min?: number }) => {
    if (!amount) return "N/A";
    
    // Database stores values in millions format, but some max values might be in different units
    // Handle inconsistent data where max < min (suggests different storage formats)
    
    if (context?.isMax && context?.min && amount < context.min && context.min >= 25) {
      // If max is much smaller than min and min is large, max might be in billions format
      // Apply this logic when min >= $25M and max < min (suggests format mismatch)
      if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}B`;
      } else {
        return `$${amount}B`;
      }
    }
    
    if (amount >= 1000) {
      // Values >= 1000 millions = billions
      return `$${(amount / 1000).toFixed(1)}B`;
    } else {
      // Values < 1000 are already in millions format
      if (amount % 1 === 0) {
        // Whole numbers: 1 = $1M, 100 = $100M
        return `$${amount}M`;
      } else {
        // Decimals: 1.5 = $1.5M
        return `$${amount.toFixed(1)}M`;
      }
    }
  };

  // Helper function to format investment ranges
  const formatInvestmentRange = (min: number | null | undefined, max: number | null | undefined) => {
    if (min && max) {
      return `${formatInvestmentAmount(min)} - ${formatInvestmentAmount(max, { isMax: true, min })}`;
    }
    if (min) {
      return `${formatInvestmentAmount(min)}+`;
    }
    if (max) {
      return `Up to ${formatInvestmentAmount(max)}`;
    }
    return "N/A";
  };

  const renderInvestorCard = (investor: any) => {
    const Icon = getTabIcon(activeTab);
    const isContact = activeTab === "contacts";

    return (
      <Card
        key={investor.id}
        className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
        onClick={() => {
          setSelectedInvestor(investor);
          setIsDialogOpen(true);
        }}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`p-3 bg-gradient-to-br ${getTabColor(activeTab)} rounded-xl flex-shrink-0`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg truncate group-hover:text-blue-600 transition-colors">
                    {isContact
                      ? investor.name ||
                        investor.firstName + " " + investor.lastName ||
                        "Unknown Contact"
                      : investor.name ||
                        investor.investorName ||
                        "Unknown Investor"}
                  </h3>
                  {investor.ranking && investor.ranking > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-800 border-orange-200 text-xs"
                    >
                      #{investor.ranking}
                    </Badge>
                  )}
                </div>
                {investor.type && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {formatInvestorType(investor.type)}
                  </Badge>
                )}
                {isContact && investor.title && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {investor.title}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="truncate">
                {investor.location ||
                  investor.city ||
                  investor.country ||
                  "Location not specified"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Current Position */}
              {investor.currentPosition && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{investor.currentPosition}</span>
                </div>
              )}

              {/* Investment Focus or Company */}
              {investor.investmentFocus && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Target className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{investor.investmentFocus}</span>
                </div>
              )}

              {isContact && investor.company && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{investor.company}</span>
                </div>
              )}

              {/* Connections */}
              {investor.connections && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="truncate">
                    {investor.connections} connections
                  </span>
                </div>
              )}

              {/* Contact Information */}
              {investor.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{investor.email}</span>
                </div>
              )}

              {investor.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{investor.phone}</span>
                </div>
              )}

              {/* Additional fields */}
              {investor.stage && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{investor.stage}</span>
                </div>
              )}

              {investor.checkSize && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{investor.checkSize}</span>
                </div>
              )}

              {/* Investment Range */}
              {(investor.investmentMin || investor.investmentMax) && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="truncate">
                    {formatInvestmentRange(investor.investmentMin, investor.investmentMax)}
                  </span>
                </div>
              )}

              {/* Sweet Spot */}
              {investor.sweetSpot && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Target className="h-4 w-4 text-green-400" />
                  <span className="truncate font-medium">
                    Sweet Spot: ${(investor.sweetSpot / 1000).toFixed(0)}k
                  </span>
                </div>
              )}
            </div>

            {/* Website */}
            {investor.website && (
              <div className="pt-2 border-t border-slate-100">
                <a
                  href={investor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  Website
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const totalCount = countData?.count || 0;
  const totalPages = Math.ceil(totalCount / pagination.limit);

  return (
    <AppLayout
      title="Investors"
      subtitle="Connect with venture capital and angel investors"
    >
      <div
        className="min-h-screen bg-[rgb(17,24,39)/var(--tw-bg-opacity,1)] -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6
"
      >
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Handshake className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Investor Network
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium">
                Access a comprehensive database of investors and investment
                contacts
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {!statsLoading && investorStats && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      <span className="text-xs sm:text-sm font-medium text-slate-600">
                        Total Investors
                      </span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                      {investorStats.totalInvestors.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      <span className="text-xs sm:text-sm font-medium text-slate-600">
                        Contacts
                      </span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                      {investorStats.totalContacts.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-xs sm:text-sm font-medium text-slate-600">
                        VC Funds
                      </span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                      {investorStats.vcFunds.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-orange-500" />
                      <span className="text-xs sm:text-sm font-medium text-slate-600">
                        Angel Investors
                      </span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                      {investorStats.angelInvestors.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Chart Grid - Investor Analytics */}
        {activeTab === "investors" &&
          investorAnalyticsData &&
          investorAnalyticsData.totalRecords > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Investment Range (Bar) */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Investment Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={investorAnalyticsData?.investmentRanges || []}
                      layout="vertical"
                      margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
                      barCategoryGap={16}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip
                        formatter={(value: any, name: any, props: any) => [
                          `${value.toLocaleString()} investors`,
                          props?.payload?.name || name || "Investment Range",
                        ]}
                      />
                      <Bar
                        dataKey="value"
                        fill="#10b981"
                        radius={[4, 4, 4, 4]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* Investor Locations (Donut) */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Investor Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={investorAnalyticsData?.locations || []}
                        cx="50%"
                        cy="70%"
                        innerRadius={55}
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                      >
                        {(investorAnalyticsData?.locations || []).map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      {/* Center label for total */}
                      <text
                        x="50%"
                        y="40%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="24"
                        fontWeight="bold"
                        fill="#10b981"
                      >
                        {(() => {
                          if (!investorData) return 0;
                          return investorData.filter((inv: any) => 
                            inv.location || inv.city || inv.country
                          ).length;
                        })()}
                      </text>
                      <text
                        x="50%"
                        y="55%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                        fill="#888"
                      >
                        Total
                      </text>
                      <Tooltip
                        formatter={(value: any, name: any, props: any) => [
                          value,
                          props?.payload?.name || name || "Value",
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={60}
                        wrapperStyle={{ paddingTop: "70px", fontSize: "12px" }}
                        formatter={(value: string, entry: any) =>
                          `${value} (${entry.payload.value})`
                        }
                        payload={(investorAnalyticsData?.locations || []).slice(0, 10).map((entry: any, i: number) => ({
                          value: entry.name,
                          type: "square",
                          color: CHART_COLORS[i % CHART_COLORS.length],
                          payload: entry,
                        }))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* Sweet Spot (Bar) */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Sweet Spot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={investorAnalyticsData?.sweetSpots || []}
                      layout="vertical"
                      margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
                      barCategoryGap={16}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={120}
                        tickFormatter={(value) => {
                          // Values are already formatted like "$1.5M", "$25K", etc.
                          // Just return them as-is
                          return value;
                        }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const sweetSpotValue = data.payload?.name || label;
                            // Values are already formatted like "$1.5M", "$25K", etc.
                            // Just use them as-is
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                <p className="font-semibold text-gray-900">{sweetSpotValue}</p>
                                <p className="text-sm text-green-600">Count: {data.value?.toLocaleString() || 0}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#10b981"
                        radius={[4, 4, 4, 4]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Investor Types (Donut) */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Investor Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={investorAnalyticsData?.types || []}
                        cx="50%"
                        cy="70%"
                        innerRadius={55}
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                      >
                        {(investorAnalyticsData?.types || []).map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
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
                        {investorAnalyticsData?.types?.reduce((sum: number, item: any) => sum + item.value, 0) || 0}
                      </text>
                      <text
                        x="50%"
                        y="60%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                        fill="#64748b"
                      >
                        Total
                      </text>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            return (
                              <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
                                <p className="font-semibold">{data.name}</p>
                                <p className="text-blue-600">Count: {data.value}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={60}
                        wrapperStyle={{ paddingTop: "70px", fontSize: "12px" }}
                        formatter={(value: string, entry: any) =>
                          `${value} (${entry.payload.value})`
                        }
                        payload={(investorAnalyticsData?.types || []).map((entry: any, i: number) => ({
                          value: entry.name,
                          type: "square",
                          color: CHART_COLORS[i % CHART_COLORS.length],
                          payload: entry,
                        }))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        {/* Filters and Search */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search: Try 'Venture', 'Angel', 'United States', 'London'..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>

              {/* Filter Row */}
              <div className="flex gap-3 overflow-x-auto">
                {/* Type Filter */}
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger className="w-36 border-slate-200">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[9999] bg-white border border-slate-200 shadow-lg max-h-96 overflow-y-auto"
                    position="popper"
                    sideOffset={4}
                  >
                    <SelectItem value="all">All Types</SelectItem>
                    {(() => {
                      // Use unfiltered data for dropdown options so all types always appear
                      const dropdownData = activeTab === "investors" ? optionsData : contactsAnalyticsData;
                      const typesData = activeTab === "investors" 
                        ? (dropdownData?.types || [])
                        : (dropdownData || []).reduce((acc: any[], item: any) => {
                            const type = item.investorType || "Unknown";
                            const existing = acc.find(t => t.type === type);
                            if (existing) {
                              existing.value++;
                            } else {
                              acc.push({ type, value: 1 });
                            }
                            return acc;
                          }, []);
                      
                      return typesData.map((type: any) => (
                        <SelectItem key={type.type} value={type.type} className="py-2">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {type.type === 'VC' ? 'Venture Capital' : 
                             type.type === 'Venture Capital' ? 'Venture Capital' : type.type}
                          </span>
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>

                {/* Location Filter */}
                <Select
                  value={filters.location}
                  onValueChange={(value) => handleFilterChange("location", value)}
                >
                  <SelectTrigger className="w-40 border-slate-200">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent className="max-h-96 overflow-y-auto">
                    <SelectItem value="all">All Locations</SelectItem>
                    {(() => {
                      // Use unfiltered data for dropdown options so all locations always appear
                      const dropdownData = activeTab === "investors" ? optionsData : contactsAnalyticsData;
                      const locationsData = activeTab === "investors" 
                        ? (dropdownData?.locations || [])
                        : (dropdownData || []).reduce((acc: any[], item: any) => {
                            const location = item.location || item.country || "Unknown";
                            const existing = acc.find(l => l.location === location);
                            if (existing) {
                              existing.value++;
                            } else {
                              acc.push({ location, value: 1 });
                            }
                            return acc;
                          }, []).sort((a: any, b: any) => b.value - a.value);
                      
                      return locationsData.map((location: any) => (
                        <SelectItem key={location.location} value={location.location} className="py-2">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {location.location}
                          </span>
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>

                {/* Investment Range Filter - Only for Investors tab */}
                {activeTab === "investors" && (
                  <Select
                    value={filters.investmentRange}
                    onValueChange={(value) => handleFilterChange("investmentRange", value)}
                  >
                    <SelectTrigger className="w-40 border-slate-200">
                      <SelectValue placeholder="Investment Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Investment Ranges</SelectItem>
                      <SelectItem value="1-5">$1-5M</SelectItem>
                      <SelectItem value="5-10">$5-10M</SelectItem>
                      <SelectItem value="10-25">$10-25M</SelectItem>
                      <SelectItem value="25-50">$25-50M</SelectItem>
                      <SelectItem value="50-100">$50-100M</SelectItem>
                      <SelectItem value="100">$100M+</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Sweet Spot Filter - Only for Investors tab */}
                {activeTab === "investors" && (
                  <Select
                    value={filters.sweetSpot}
                    onValueChange={(value) => handleFilterChange("sweetSpot", value)}
                  >
                    <SelectTrigger className="w-36 border-slate-200">
                      <SelectValue placeholder="Sweet Spot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Sweet Spot</SelectItem>
                      <SelectItem value="1-5">$1-5M</SelectItem>
                      <SelectItem value="5-10">$5-10M</SelectItem>
                      <SelectItem value="10-25">$10-25M</SelectItem>
                      <SelectItem value="25-50">$25-50M</SelectItem>
                      <SelectItem value="50-100">$50-100M</SelectItem>
                      <SelectItem value="100">$100M+</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Investor Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as InvestorTabType)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-0 shadow-lg p-1">
            <TabsTrigger
              value="investors"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-medium"
            >
              <Building2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Investors</span>
              <span className="sm:hidden">Investors</span>
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-medium"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Contacts</span>
              <span className="sm:hidden">Contacts</span>
            </TabsTrigger>
          </TabsList>

          {/* Investor Grid */}
          <TabsContent value={activeTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {activeTab === "investors"
                  ? "Investment Firms"
                  : "Investment Contacts"}
              </h2>
              {totalCount > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {totalCount.toLocaleString()}{" "}
                  {activeTab === "investors" ? "investors" : "contacts"}
                </Badge>
              )}
            </div>

            {/* Investor Grid */}
            {isLoading ? (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead
                      className={`bg-gradient-to-r ${activeTab === "investors" ? "from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900" : "from-slate-50 to-green-50/30 dark:from-gray-900 dark:to-green-900"} border-b border-slate-200`}
                    >
                      <tr>
                        {[
                          <th
                            key="name"
                            className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                          >
                            {activeTab === "investors" ? "Name" : "Company"}
                          </th>,
                          <th
                            key="type"
                            className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                          >
                            Type
                          </th>,
                          <th
                            key="location"
                            className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                          >
                            Location
                          </th>,
                          ...(activeTab === "contacts"
                            ? [
                                <th
                                  key="email"
                                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                >
                                  Email
                                </th>,
                              ]
                            : []),
                          ...(activeTab === "investors"
                            ? [
                                <th
                                  key="ranking"
                                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                >
                                  Ranking
                                </th>,
                                <th
                                  key="range"
                                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                >
                                  Investment Range
                                </th>,
                                <th
                                  key="sweet"
                                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                >
                                  Sweet Spot
                                </th>,
                                <th
                                  key="fund"
                                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                >
                                  Fund Size
                                </th>,
                              ]
                            : [
                                <th
                                  key="investments"
                                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                >
                                  Investments
                                </th>,
                                <th
                                  key="exits"
                                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                >
                                  Exits
                                </th>,
                                <th
                                  key="employees"
                                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                >
                                  Employees
                                </th>,
                              ]),
                        ]}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-slate-200">
                      {[...Array(10)].map((_, i) => (
                        <tr key={i}>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Skeleton className="h-10 w-10 rounded-lg" />
                              <div className="ml-4">
                                <Skeleton className="h-4 w-32 mb-1" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-4 w-16" />
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
            ) : (investorData && investorData.length > 0) ? (
              <>
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead
                        className={`bg-gradient-to-r ${activeTab === "investors" ? "from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900" : "from-slate-50 to-green-50/30 dark:from-gray-900 dark:to-green-900"} border-b border-slate-200`}
                      >
                        <tr>
                          {[
                            <th
                              key="name"
                              className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                            >
                              {activeTab === "investors" ? "Name" : "Company"}
                            </th>,
                            <th
                              key="type"
                              className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                            >
                              Type
                            </th>,
                            <th
                              key="location"
                              className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                            >
                              Location
                            </th>,
                            ...(activeTab === "contacts"
                              ? [
                                  <th
                                    key="email"
                                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                  >
                                    Email
                                  </th>,
                                  <th
                                    key="phone"
                                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                  >
                                    Phone
                                  </th>,
                                ]
                              : []),
                            ...(activeTab === "investors"
                              ? [
                                  <th
                                    key="ranking"
                                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                  >
                                    Ranking
                                  </th>,
                                  <th
                                    key="range"
                                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                  >
                                    Investment Range
                                  </th>,
                                  <th
                                    key="sweet"
                                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                  >
                                    Sweet Spot
                                  </th>,
                                  <th
                                    key="fund"
                                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                  >
                                    Fund Size
                                  </th>,
                                ]
                              : [
                                  <th
                                    key="investments"
                                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                  >
                                    Investments
                                  </th>,
                                  <th
                                    key="exits"
                                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                  >
                                    Exits
                                  </th>,
                                  <th
                                    key="employees"
                                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                  >
                                    Employees
                                  </th>,
                                ]),
                          ]}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-slate-200">
                        {investorData.map((item: any) => {
                          const formatCurrency = (
                            amount: number | null | undefined,
                          ) => {
                            if (!amount) return "N/A";
                            if (amount >= 1000000000)
                              return `$${(amount / 1000000000).toFixed(1)}B`;
                            if (amount >= 1000000)
                              return `$${(amount / 1000000).toFixed(1)}M`;
                            if (amount >= 1000)
                              return `$${(amount / 1000).toFixed(0)}K`;
                            return `$${amount.toLocaleString()}`;
                          };

                          // Different rendering based on active tab
                          if (activeTab === "investors") {
                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                                onClick={() => {
                                  setSelectedInvestor(item);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      {item.imagePath ? (
                                        <img
                                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/investors/images/${item.imagePath}`}
                                          alt={item.name || "Investor"}
                                          className="h-10 w-10 rounded-lg object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                            const nextElement =
                                              e.currentTarget
                                                .nextElementSibling;
                                            if (
                                              nextElement &&
                                              "style" in nextElement
                                            ) {
                                              (
                                                nextElement as HTMLElement
                                              ).style.display = "flex";
                                            }
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className={`h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ${item.imagePath ? "hidden" : ""}`}
                                      >
                                        <Building2 className="h-5 w-5 text-white" />
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {item.name || "Unknown Investor"}
                                      </div>
                                      {item.currentPosition && (
                                        <div className="text-xs text-gray-500">
                                          {item.currentPosition}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  {item.profile ? (
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      {item.profile}
                                    </Badge>
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      N/A
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-slate-400" />
                                    {item.location ||
                                      item.city ||
                                      item.country ||
                                      "Location not specified"}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {item.ranking && item.ranking > 0 ? (
                                      <Badge
                                        variant="secondary"
                                        className="bg-orange-100 text-orange-800 border-orange-200"
                                      >
                                        #{item.ranking}
                                      </Badge>
                                    ) : (
                                      "N/A"
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {formatInvestmentRange(item.investmentMin, item.investmentMax)}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-green-600">
                                    {formatCurrency(item.sweetSpot)}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {item.currentFundSize
                                      ? formatCurrency(item.currentFundSize)
                                      : "Not specified"}
                                  </div>
                                </td>
                              </tr>
                            );
                          } else {
                            // Contacts tab rendering
                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                                onClick={() => {
                                  setSelectedInvestor(item);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      {item.imagePath ? (
                                        <img
                                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/investors/images/${item.imagePath}`}
                                          alt={
                                            item.companyName ||
                                            item.name ||
                                            "Investor"
                                          }
                                          className="h-10 w-10 rounded-lg object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                            const nextElement =
                                              e.currentTarget
                                                .nextElementSibling;
                                            if (
                                              nextElement &&
                                              "style" in nextElement
                                            ) {
                                              (
                                                nextElement as HTMLElement
                                              ).style.display = "flex";
                                            }
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className={`h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center ${item.imagePath ? "hidden" : ""}`}
                                      >
                                        <UserCheck className="h-5 w-5 text-white" />
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {item.companyName || "Unknown Company"}
                                      </div>
                                      {item.keyPeople && (
                                        <div className="text-xs text-gray-500">
                                          {item.keyPeople}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  {item.investorType ? (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200"
                                    >
                                      {item.investorType}
                                    </Badge>
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      N/A
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-slate-400" />
                                    {item.location || item.country || "N/A"}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {item.contactEmail ? (
                                      <a
                                        href={`mailto:${item.contactEmail}`}
                                        className="text-slate-900 dark:text-slate-100 hover:underline"
                                      >
                                        {item.contactEmail}
                                      </a>
                                    ) : (
                                      "N/A"
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {item.phoneNumber ? (
                                      <a
                                        href={`tel:${item.phoneNumber}`}
                                        className="text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1"
                                      >
                                        <Phone className="h-3 w-3" />
                                        {item.phoneNumber}
                                      </a>
                                    ) : (
                                      "N/A"
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {item.numberOfInvestments &&
                                    item.numberOfInvestments !== ""
                                      ? item.numberOfInvestments
                                      : "N/A"}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {item.numberOfExits &&
                                    item.numberOfExits !== ""
                                      ? item.numberOfExits
                                      : "N/A"}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {item.employeesPeopleDatabase &&
                                    item.employeesPeopleDatabase !== "0" &&
                                    item.employeesPeopleDatabase !== ""
                                      ? item.employeesPeopleDatabase
                                      : "N/A"}
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6 mb-4">
                  {/* Results Count Display - Left Side */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing{" "}
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {totalCount === 0
                        ? 0
                        : (pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {Math.min(pagination.page * pagination.limit, totalCount)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {totalCount.toLocaleString()}
                    </span>{" "}
                    results
                  </div>

                  {/* Pagination Buttons - Right Side */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
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

                      <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = Math.max(1, pagination.page - 2) + i;
                        if (pageNum > totalPages) return null;

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
                                ? `bg-gradient-to-r ${getTabColor(activeTab)}`
                                : "border-slate-200"
                            }
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
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
                  )}
                </div>
              </>
            ) : (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <Globe className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No {activeTab} found
                  </h3>
                  <p className="text-slate-600">
                    Try adjusting your search filters to find more {activeTab}.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Investor Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto dark:bg-gray-900/90 dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                <span className="font-semibold text-lg dark:text-white">
                  {selectedInvestor?.companyName ||
                    selectedInvestor?.name ||
                    "Investor Details"}
                </span>
              </DialogTitle>
            </DialogHeader>
            {selectedInvestor && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Debug: Log the selected investor data */}
                {(() => {
                  console.log("Selected Investor Data:", selectedInvestor);
                  return null;
                })()}

                {/* Profile Image - Left Side - Only show for Investors tab */}
                {activeTab === "investors" && (
                  <div className="flex flex-col items-center justify-center">
                    {selectedInvestor?.imagePath ? (
                      <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/investors/images/${selectedInvestor.imagePath}`}
                        alt={selectedInvestor.name || "Investor"}
                        className="w-full max-w-md h-auto rounded-xl object-cover shadow-lg"
                      />
                    ) : (
                      <div
                        className={`w-full max-w-md h-64 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg`}
                      >
                        <Building2 className="h-24 w-24 text-white" />
                      </div>
                    )}
                  </div>
                )}

                {/* Basic Information - Right Side */}
                <div className="bg-slate-50 dark:bg-gray-900 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Name
                      </label>
                      <p className="text-slate-900 dark:text-white font-medium">
                        {activeTab === "contacts"
                          ? selectedInvestor.companyName || "N/A"
                          : selectedInvestor.investorName ||
                            selectedInvestor.name ||
                            selectedInvestor.companyName ||
                            selectedInvestor.firstName ||
                            selectedInvestor.lastName ||
                            "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Type
                      </label>
                      <p className="text-slate-900 dark:text-white">
                        {activeTab === "contacts"
                          ? selectedInvestor.investorType || "N/A"
                          : selectedInvestor.type ||
                            selectedInvestor.profileType ||
                            selectedInvestor.profile ||
                            "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Profile
                      </label>
                      <p className="text-slate-900 dark:text-white">
                        {activeTab === "contacts"
                          ? selectedInvestor.investorType || "N/A"
                          : selectedInvestor.profile ||
                            selectedInvestor.profileType ||
                            "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Location
                      </label>
                      <p className="text-slate-900 dark:text-white">
                        {selectedInvestor.location ||
                          selectedInvestor.city ||
                          selectedInvestor.country ||
                          "Location not specified"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Current Position
                      </label>
                      <p className="text-slate-900 dark:text-white">
                        {selectedInvestor.currentPosition ||
                          selectedInvestor.title ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Connections
                      </label>
                      <p className="text-slate-900 dark:text-white">
                        {selectedInvestor.connections
                          ? `${selectedInvestor.connections} connections`
                          : "N/A"}
                      </p>
                    </div>
                    {selectedInvestor.ranking &&
                      selectedInvestor.ranking > 0 && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Ranking
                          </label>
                          <p className="text-slate-900 dark:text-white font-medium">
                            #{selectedInvestor.ranking}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Contact Information */}
                {(selectedInvestor.phoneNumber ||
                  selectedInvestor.url ||
                  selectedInvestor.contactEmail ||
                  selectedInvestor.companyUrl ||
                  selectedInvestor.domain ||
                  selectedInvestor.facebook ||
                  selectedInvestor.instagram ||
                  selectedInvestor.linkedin ||
                  selectedInvestor.twitter ||
                  selectedInvestor._1 ||
                  selectedInvestor._2 ||
                  selectedInvestor._3 ||
                  selectedInvestor._4 ||
                  selectedInvestor._5 ||
                  selectedInvestor._6 ||
                  selectedInvestor._7) && (
                  <div className="bg-green-50 dark:bg-gray-900 dark:text-white rounded-lg p-4 mt-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedInvestor.contactEmail && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Email{" "}
                            {selectedInvestor.contactEmailVerified && (
                              <Badge
                                variant="secondary"
                                className="ml-1 text-xs"
                              >
                                Verified
                              </Badge>
                            )}
                          </label>
                          <a
                            href={`mailto:${selectedInvestor.contactEmail}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-white dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {selectedInvestor.contactEmail}
                          </a>
                        </div>
                      )}

                      {/* Additional Email Fields */}
                      {selectedInvestor._1 && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Additional Email 1
                          </label>
                          <a
                            href={`mailto:${selectedInvestor._1}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-white dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {selectedInvestor._1}
                          </a>
                        </div>
                      )}
                      {selectedInvestor._2 && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Additional Email 2
                          </label>
                          <a
                            href={`mailto:${selectedInvestor._2}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-white dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {selectedInvestor._2}
                          </a>
                        </div>
                      )}
                      {selectedInvestor._3 && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Additional Email 3
                          </label>
                          <a
                            href={`mailto:${selectedInvestor._3}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-white dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {selectedInvestor._3}
                          </a>
                        </div>
                      )}
                      {selectedInvestor._4 && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Additional Email 4
                          </label>
                          <a
                            href={`mailto:${selectedInvestor._4}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-white dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {selectedInvestor._4}
                          </a>
                        </div>
                      )}
                      {selectedInvestor._5 && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Additional Email 5
                          </label>
                          <a
                            href={`mailto:${selectedInvestor._5}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-white dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {selectedInvestor._5}
                          </a>
                        </div>
                      )}
                      {selectedInvestor._6 && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Additional Email 6
                          </label>
                          <a
                            href={`mailto:${selectedInvestor._6}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-white dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {selectedInvestor._6}
                          </a>
                        </div>
                      )}
                      {selectedInvestor._7 && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Additional Email 7
                          </label>
                          <a
                            href={`mailto:${selectedInvestor._7}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-white dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {selectedInvestor._7}
                          </a>
                        </div>
                      )}

                      {selectedInvestor.phoneNumber && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Phone Number
                          </label>
                          <p className="text-slate-900 dark:text-white flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {selectedInvestor.phoneNumber}
                          </p>
                        </div>
                      )}

                      {/* Website Links - Disabled */}
                    </div>

                    {/* Social Media Links */}
                    {(selectedInvestor.facebook ||
                      selectedInvestor.instagram ||
                      selectedInvestor.linkedin ||
                      selectedInvestor.twitter) && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">
                          Social Media
                        </label>
                        <div className="flex gap-3">
                          {selectedInvestor.linkedin && (
                            <a
                              href={selectedInvestor.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 dark:text-white dark:hover:text-slate-300 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
                              title="LinkedIn"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                            </a>
                          )}
                          {selectedInvestor.twitter && (
                            <a
                              href={selectedInvestor.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-500 dark:text-white dark:hover:text-slate-300 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
                              title="Twitter"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                              </svg>
                            </a>
                          )}
                          {selectedInvestor.facebook && (
                            <a
                              href={selectedInvestor.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 dark:text-white dark:hover:text-slate-300 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
                              title="Facebook"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                            </a>
                          )}
                          {selectedInvestor.instagram && (
                            <a
                              href={selectedInvestor.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-700 dark:text-white dark:hover:text-slate-300 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
                              title="Instagram"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.928-.796-1.418-1.947-1.418-3.244s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Investment Information */}
                <div className="bg-emerald-50 dark:bg-gray-900 dark:text-white rounded-lg p-4 mt-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Investment Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(selectedInvestor.investmentMin ||
                      selectedInvestor.investmentMax) && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Investment Range
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {formatInvestmentRange(selectedInvestor.investmentMin, selectedInvestor.investmentMax)}
                        </p>
                      </div>
                    )}
                    {selectedInvestor.sweetSpot && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Sweet Spot
                        </label>
                        <p className="text-green-600 font-semibold dark:text-green-300">
                          ${(selectedInvestor.sweetSpot / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Current Fund Size
                      </label>
                      <p className="text-slate-900 dark:text-white font-medium">
                        {selectedInvestor.currentFundSize
                          ? `$${(selectedInvestor.currentFundSize / 1000000).toFixed(1)}M`
                          : "Not specified"}
                      </p>
                    </div>
                    {selectedInvestor.numberOfInvestments && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Number of Investments
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {selectedInvestor.numberOfInvestments}
                        </p>
                      </div>
                    )}
                    {selectedInvestor.numberOfExits && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Number of Exits
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {selectedInvestor.numberOfExits}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile & Description */}
                {(selectedInvestor.profile || selectedInvestor.description) && (
                  <div className="bg-blue-50 dark:bg-gray-900 dark:text-white rounded-lg p-4 mt-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Profile
                    </h3>
                    <p className="text-slate-700 dark:text-white leading-relaxed">
                      {selectedInvestor.profile || selectedInvestor.description}
                    </p>
                  </div>
                )}

                {/* Experience & Education */}
                {((selectedInvestor.experiences &&
                  selectedInvestor.experiences.length > 0) ||
                  (selectedInvestor.education &&
                    selectedInvestor.education.length > 0)) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {selectedInvestor.experiences &&
                      selectedInvestor.experiences.length > 0 && (
                        <div className="bg-purple-50 dark:bg-gray-900 dark:text-white rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Experience
                          </h3>
                          <div className="space-y-2">
                            {Array.isArray(selectedInvestor.experiences) ? (
                              selectedInvestor.experiences.map(
                                (exp: string, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-white dark:bg-gray-900 dark:text-white rounded p-2 text-sm text-slate-700"
                                  >
                                    {exp}
                                  </div>
                                ),
                              )
                            ) : (
                              <div className="bg-white dark:bg-gray-900 dark:text-white rounded p-2 text-sm text-slate-700">
                                {String(selectedInvestor.experiences)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    {selectedInvestor.education &&
                      selectedInvestor.education.length > 0 && (
                        <div className="bg-orange-50 dark:bg-gray-900 dark:text-white rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Education
                          </h3>
                          <div className="space-y-2">
                            {Array.isArray(selectedInvestor.education) ? (
                              selectedInvestor.education.map(
                                (edu: string, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-white dark:bg-gray-900 dark:text-white rounded p-2 text-sm text-slate-700"
                                  >
                                    {edu}
                                  </div>
                                ),
                              )
                            ) : (
                              <div className="bg-white dark:bg-gray-900 dark:text-white rounded p-2 text-sm text-slate-700">
                                {String(selectedInvestor.education)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Investment Portfolio */}
                {selectedInvestor.investments &&
                  selectedInvestor.investments.trim() !== "" && (
                    <div className="bg-yellow-50 dark:bg-gray-900 dark:text-white rounded-lg p-4 mt-6">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Investment Portfolio
                      </h3>
                      <p className="text-slate-700 dark:text-white leading-relaxed">
                        {selectedInvestor.investments}
                      </p>
                    </div>
                  )}

                {/* Additional Information */}
                {(selectedInvestor.industries ||
                  selectedInvestor.program ||
                  selectedInvestor.employeesPeopleDatabase) && (
                  <div className="bg-indigo-50 dark:bg-gray-900 dark:text-white rounded-lg p-4 mt-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedInvestor.industries && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Industries
                          </label>
                          <p className="text-slate-900 dark:text-white">
                            {selectedInvestor.industries}
                          </p>
                        </div>
                      )}
                      {selectedInvestor.program && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Program
                          </label>
                          <p className="text-slate-900 dark:text-white">
                            {selectedInvestor.program}
                          </p>
                        </div>
                      )}
                      {selectedInvestor.employeesPeopleDatabase && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Employees in Database
                          </label>
                          <p className="text-slate-900 dark:text-white">
                            {selectedInvestor.employeesPeopleDatabase}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
