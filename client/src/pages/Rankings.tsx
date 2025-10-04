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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trophy,
  TrendingUp,
  TrendingDown,
  Globe,
  Users,
  Building2,
  Target,
  MapPin,
  Calendar,
  Star,
  BarChart3,
  ExternalLink,
  Crown,
  Medal,
  Award,
  GraduationCap,
  University,
  Flag,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import {
  rankingsTopCities,
  rankingsTopCountries,
  rankingsUniversities,
} from "@/../../shared/schema";
import { ChartContainer } from "@/components/ui/chart";
import {
  BarChart,
  PieChart,
  Pie,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Bar,
  Legend,
} from "recharts";
import React from "react";
import { ResponsiveContainer } from "recharts";

type RankingTopCity = typeof rankingsTopCities.$inferSelect;
type RankingTopCountry = typeof rankingsTopCountries.$inferSelect;
type RankingUniversity = typeof rankingsUniversities.$inferSelect;

interface RankingFilters {
  search: string;
  country: string;
  year: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

type RankingTabType = "cities" | "countries" | "universities";

const sampleResearchQuality = [
  { country: "Algeria", value: 1200 },
  { country: "Tanzania", value: 400 },
  { country: "Ukraine", value: 300 },
  { country: "Turkey", value: 2000 },
  { country: "Malaysia", value: 1800 },
  { country: "Czech Republic", value: 700 },
  { country: "Russian Federation", value: 1600 },
  { country: "Ecuador", value: 900 },
];
const sampleIndustryImpact = [
  { country: "Algeria", value: 1200 },
  { country: "Tanzania", value: 400 },
  { country: "Ukraine", value: 300 },
  { country: "Turkey", value: 2000 },
  { country: "Malaysia", value: 1800 },
  { country: "Czech Republic", value: 700 },
  { country: "Russian Federation", value: 1600 },
  { country: "Ecuador", value: 900 },
  { country: "India", value: 1100 },
  { country: "Japan", value: 800 },
  { country: "Brazil", value: 600 },
  { country: "Tunisia", value: 500 },
  { country: "Morocco", value: 400 },
  { country: "Vietnam", value: 300 },
  { country: "Chile", value: 200 },
];

// Add color palette for countries
const donutColors = [
  "#10b981",
  "#f59e42",
  "#3b82f6",
  "#f43f5e",
  "#06b6d4",
  "#a3e635",
  "#a21caf",
  "#ec4899",
  "#fbbf24",
  "#6366f1",
  "#f87171",
  "#34d399",
  "#eab308",
  "#0ea5e9",
  "#f472b6",
  "#22d3ee",
  "#facc15",
  "#fb7185",
  "#818cf8",
  "#fde68a",
  "#fcd34d",
  "#fca5a5",
  "#f472b6",
  "#a3e635",
  "#f59e42",
  "#3b82f6",
  "#f43f5e",
  "#06b6d4",
  "#a21caf",
  "#ec4899",
  "#fbbf24",
  "#6366f1",
  "#f87171",
  "#34d399",
  "#eab308",
  "#0ea5e9",
  "#f472b6",
  "#22d3ee",
  "#facc15",
  "#fb7185",
  "#818cf8",
  "#fde68a",
  "#fcd34d",
  "#fca5a5",
  "#f472b6",
  "#a3e635",
];

// Add CHART_COLORS for consistency with Country Distribution
const CHART_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#84CC16",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
  "#F472B6",
  "#A78BFA",
  "#34D399",
  "#FBBF24",
];

export default function Rankings() {
  const [activeTab, setActiveTab] = useState<RankingTabType>("cities");
  const [filters, setFilters] = useState<RankingFilters>({
    search: "",
    country: "all",
    year: "2024",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 25,
  });
  const [selectedItem, setSelectedItem] = useState<
    RankingTopCity | RankingTopCountry | RankingUniversity | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate offset for API calls
  const offset = (pagination.page - 1) * pagination.limit;

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("limit", pagination.limit.toString());
    params.set("page", pagination.page.toString());
    params.set("offset", offset.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.country !== "all") params.set("country", filters.country);

    // For universities, default to 2024 if year is 'all'
    if (activeTab === "universities") {
      params.set("year", filters.year !== "all" ? filters.year : "2024");
    } else if (filters.year !== "all") {
      params.set("year", filters.year);
    }

    return params.toString();
  };

  // Get API endpoint based on active tab
  const getApiEndpoint = () => {
    switch (activeTab) {
      case "cities":
        return "/api/rankings/cities";
      case "countries":
        return "/api/rankings/countries";
      case "universities":
        return "/api/rankings/universities";
      default:
        return "/api/rankings/cities";
    }
  };

  // Fetch rankings data
  const { data: rankingData, isLoading } = useQuery({
    queryKey: [getApiEndpoint(), activeTab, pagination.page, filters],
    queryFn: async () => {
      const response = await fetch(`${getApiEndpoint()}?${buildQueryParams()}`);
      if (!response.ok) throw new Error("Failed to fetch rankings");
      return response.json();
    },
  });

  // Fetch counts for stats
  const { data: citiesCount } = useQuery({
    queryKey: ["/api/rankings/cities/count"],
    queryFn: async () => {
      const response = await fetch("/api/rankings/cities/count");
      if (!response.ok) throw new Error("Failed to fetch cities count");
      return response.json();
    },
  });

  const { data: countriesCount } = useQuery({
    queryKey: ["/api/rankings/countries/count"],
    queryFn: async () => {
      const response = await fetch("/api/rankings/countries/count");
      if (!response.ok) throw new Error("Failed to fetch countries count");
      return response.json();
    },
  });

  const { data: universitiesCount } = useQuery({
    queryKey: ["/api/rankings/universities/count"],
    queryFn: async () => {
      const response = await fetch("/api/rankings/universities/count");
      if (!response.ok) throw new Error("Failed to fetch universities count");
      return response.json();
    },
  });

  // Add country analytics fetching
  const { data: countryAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["country-analytics", filters, pagination],
    queryFn: async () => {
      const res = await fetch("/api/rankings/countries/analytics?year=2024");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: activeTab === "countries",
  });

  // University analytics aggregation
  const { data: universityRankings, isLoading: universityAnalyticsLoading } =
    useQuery({
      queryKey: ["university-analytics", filters.year],
      queryFn: async () => {
        const res = await fetch(
          `/api/rankings/universities?year=${filters.year !== "all" ? filters.year : "2024"}&limit=1000`,
        );
        if (!res.ok) throw new Error("Failed to fetch university rankings");
        return res.json();
      },
      enabled: activeTab === "universities",
    });

  const universityResearchQuality = React.useMemo(() => {
    if (!universityRankings) return [];
    const map = new Map();
    universityRankings.forEach((u: any) => {
      if (!u.country) return;
      const prev = map.get(u.country) || 0;
      map.set(u.country, prev + (Number(u.researchQualityScore) || 0));
    });
    return Array.from(map.entries())
      .map(([country, value]) => ({ country, value }))
      .sort((a, b) => b.value - a.value);
  }, [universityRankings]);

  const universityIndustryImpact = React.useMemo(() => {
    if (!universityRankings) return [];
    const map = new Map();
    universityRankings.forEach((u: any) => {
      if (!u.country) return;
      const prev = map.get(u.country) || 0;
      map.set(u.country, prev + (Number(u.industryImpactScore) || 0));
    });
    return Array.from(map.entries())
      .map(([country, value]) => ({ country, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [universityRankings]);

  // Reset pagination when changing tabs or filters
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeTab, filters]);

  // Set default year to 2024 for universities tab
  useEffect(() => {
    if (activeTab === "universities" && filters.year === "all") {
      setFilters((prev) => ({ ...prev, year: "2024" }));
    }
  }, [activeTab]);

  const handleFilterChange = (key: keyof RankingFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getTabIcon = (tab: RankingTabType) => {
    switch (tab) {
      case "cities":
        return Building2;
      case "countries":
        return Flag;
      case "universities":
        return GraduationCap;
      default:
        return Trophy;
    }
  };

  const getTabColor = (tab: RankingTabType) => {
    switch (tab) {
      case "cities":
        return "from-amber-500 to-orange-600";
      case "countries":
        return "from-emerald-500 to-teal-600";
      case "universities":
        return "from-violet-500 to-purple-600";
      default:
        return "from-amber-500 to-orange-600";
    }
  };

  const getRankIcon = (rank: number | null) => {
    if (!rank) return Medal;
    if (rank === 1) return Crown;
    if (rank <= 3) return Trophy;
    if (rank <= 10) return Medal;
    return Award;
  };

  const getRankColor = (rank: number | null) => {
    if (!rank) return "text-slate-400";
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    if (rank <= 10) return "text-blue-500";
    return "text-slate-600";
  };

  const formatRankChange = (change: string | null) => {
    if (!change || change === "0") return null;
    const num = parseInt(change);
    if (isNaN(num)) return null;

    if (num > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ChevronUp className="h-3 w-3" />
          <span className="text-xs font-medium">+{num}</span>
        </div>
      );
    } else if (num < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <ChevronDown className="h-3 w-3" />
          <span className="text-xs font-medium">{num}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-slate-400">
        <Minus className="h-3 w-3" />
        <span className="text-xs font-medium">0</span>
      </div>
    );
  };

  const formatScore = (score: string | null) => {
    if (!score) return "N/A";
    const num = parseFloat(score);
    if (isNaN(num)) return score;
    return num.toFixed(1);
  };

  const totalPages = Math.ceil(
    (activeTab === "cities"
      ? citiesCount?.count || 0
      : activeTab === "countries"
        ? countriesCount?.count || 0
        : universitiesCount?.count || 0) / pagination.limit,
  );

  return (
    <AppLayout
      title="Rankings"
      subtitle="Explore global startup and investor rankings"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 dark:from-gray-900 dark:via-amber-950/30 dark:to-orange-950/20 -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-700 dark:to-orange-800 rounded-xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 dark:from-slate-100 dark:via-amber-200 dark:to-orange-200 bg-clip-text text-transparent">
            Startup & Investor Rankings
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium">
            See the top performers in the ecosystem
          </p>
        </div>

        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl mt-9 sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">
                Global Rankings
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium">
                Discover top-performing cities, countries, and universities
                worldwide
              </p>
            </div>
          </div>

          {/* Rankings Analytics Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Rankings Analytics
              </h2>
              <p className="text-slate-600">
                Comprehensive insights into global rankings across cities,
                countries, and universities
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-amber-500 dark:text-amber-300" />
                    <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                      Top Cities
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {citiesCount?.count || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Flag className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                    <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                      Countries
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {countriesCount?.count || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <GraduationCap className="h-4 w-4 text-violet-500 dark:text-violet-300" />
                    <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                      Universities
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {universitiesCount?.count || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Crown className="h-4 w-4 text-yellow-500 dark:text-yellow-300" />
                    <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                      Top Ranked
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {rankingData?.filter(
                      (item: any) => item.rank && item.rank <= 10,
                    ).length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Rankings Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as RankingTabType)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-lg p-1">
            <TabsTrigger
              value="cities"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium"
            >
              <Building2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Top Cities</span>
              <span className="sm:hidden">Cities</span>
            </TabsTrigger>
            <TabsTrigger
              value="countries"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white font-medium"
            >
              <Flag className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Countries</span>
              <span className="sm:hidden">Countries</span>
            </TabsTrigger>
            <TabsTrigger
              value="universities"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Universities</span>
              <span className="sm:hidden">Unis</span>
            </TabsTrigger>
          </TabsList>

          {/* Rankings Grid */}
          <TabsContent value={activeTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {activeTab === "cities"
                  ? "Top Startup Cities"
                  : activeTab === "countries"
                    ? "Top Countries"
                    : "Top Universities"}
              </h2>
              {rankingData && (
                <Badge variant="secondary" className="text-sm">
                  {activeTab === "cities"
                    ? citiesCount?.count || 0
                    : activeTab === "countries"
                      ? countriesCount?.count || 0
                      : universitiesCount?.count || 0}{" "}
                  ranked
                </Badge>
              )}
            </div>

            {activeTab === "cities" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Startup Ecosystem Score by City - 2024 (Horizontal Bar) */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Startup Ecosystem Score by City - 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-8 w-32" />
                      </div>
                    ) : (
                      <ChartContainer config={{}}>
                        <BarChart
                          data={(() => {
                            if (!rankingData) return [];
                            return rankingData
                              .slice(0, 10)
                              .map((city: any) => ({
                                city: city.city || "Unknown City",
                                value: parseFloat(city.totalScore) || 0,
                              }))
                              .sort((a, b) => b.value - a.value);
                          })()}
                          layout="vertical"
                          margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
                          barCategoryGap={16}
                          height={300}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="city" type="category" width={120} />
                          <Tooltip
                            formatter={(value: any, name: any, props: any) => [
                              Math.round(value),
                              props?.payload?.city || name || "Value",
                            ]}
                          />
                          <Bar
                            dataKey="value"
                            fill="#f59e0b"
                            radius={[4, 4, 4, 4]}
                          />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
                {/* City Distribution by Country - 2024 (Donut) */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-amber-600" />
                      City Distribution by Country - 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={400}>
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                        </div>
                      ) : (
                        <PieChart>
                          <Pie
                            data={(() => {
                              if (!rankingData) return [];
                              const map = new Map();
                              rankingData.forEach((city: any) => {
                                const key = city.country || "Unknown Country";
                                map.set(key, (map.get(key) || 0) + 1);
                              });
                              return Array.from(map, ([country, value]) => ({
                                country,
                                value,
                              }))
                                .sort((a, b) => b.value - a.value)
                                .slice(0, 10);
                            })()}
                            cx="50%"
                            cy="45%"
                            outerRadius={140}
                            dataKey="value"
                            nameKey="country"
                          >
                            {(() => {
                              const data = (() => {
                                if (!rankingData) return [];
                                const map = new Map();
                                rankingData.forEach((city: any) => {
                                  const key = city.country || "Unknown Country";
                                  map.set(key, (map.get(key) || 0) + 1);
                                });
                                return Array.from(map, ([country, value]) => ({
                                  country,
                                  value,
                                }))
                                  .sort((a, b) => b.value - a.value)
                                  .slice(0, 10);
                              })();
                              return data.map((entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ));
                            })()}
                          </Pie>
                          <Tooltip
                            formatter={(value: any, name: any, props: any) => [
                              Math.round(value),
                              props?.payload?.country || name || "Value",
                            ]}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={60}
                            wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
                            formatter={(value: string, entry: any) =>
                              `${value} (${entry.payload.value})`
                            }
                            payload={(() => {
                              const data = (() => {
                                if (!rankingData) return [];
                                const map = new Map();
                                rankingData.forEach((city: any) => {
                                  const key = city.country || "Unknown Country";
                                  map.set(key, (map.get(key) || 0) + 1);
                                });
                                return Array.from(map, ([country, value]) => ({
                                  country,
                                  value,
                                }))
                                  .sort((a, b) => b.value - a.value)
                                  .slice(0, 10);
                              })();
                              return data.map((entry: any, i: number) => ({
                                value: entry.country,
                                type: "square",
                                color: CHART_COLORS[i % CHART_COLORS.length],
                                payload: entry,
                              }));
                            })()}
                          />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "countries" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Research Quality by Country - 2024 (Horizontal Bar) */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Research Quality by Country - 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-8 w-32" />
                      </div>
                    ) : (
                      <ChartContainer config={{}}>
                        <BarChart
                          data={
                            countryAnalytics?.researchQuality &&
                            countryAnalytics.researchQuality.length > 0
                              ? countryAnalytics.researchQuality
                              : sampleResearchQuality
                          }
                          layout="vertical"
                          margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
                          barCategoryGap={16}
                          height={300}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="country"
                            type="category"
                            width={120}
                          />
                          <Tooltip
                            formatter={(value: any, name: any, props: any) => [
                              Math.round(value),
                              props?.payload?.country || name || "Value",
                            ]}
                          />
                          <Bar
                            dataKey="value"
                            fill="#10b981"
                            radius={[4, 4, 4, 4]}
                          />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
                {/* Industry Impact by Country - 2024 (Donut) */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Industry Impact by Country - 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={230}>
                      {analyticsLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <PieChart>
                          <Pie
                            data={
                              countryAnalytics?.industryImpact ||
                              sampleIndustryImpact
                            }
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            nameKey="country"
                          >
                            {(
                              countryAnalytics?.industryImpact ||
                              sampleIndustryImpact
                            ).map(
                              (
                                entry: { country: string; value: number },
                                index: number,
                              ) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ),
                            )}
                          </Pie>
                          <Tooltip
                            formatter={(value: any, name: any, props: any) => [
                              Math.round(value),
                              props?.payload?.country || name || "Value",
                            ]}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={60}
                            wrapperStyle={{
                              paddingTop: "10px",
                              fontSize: "12px",
                            }}
                            formatter={(value: string, entry: any) =>
                              `${value} (${entry.payload.value})`
                            }
                            payload={(() => {
                              const data =
                                countryAnalytics?.industryImpact ||
                                sampleIndustryImpact;
                              return data
                                .slice(0, 10)
                                .map((entry: any, i: number) => ({
                                  value: entry.country,
                                  type: "square",
                                  color: CHART_COLORS[i % CHART_COLORS.length],
                                  payload: entry,
                                }));
                            })()}
                          />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "universities" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Research Quality by Country - 2024 (Horizontal Bar) */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      International Student by Country - 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {universityAnalyticsLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-8 w-32" />
                      </div>
                    ) : (
                      <ChartContainer config={{}}>
                        <BarChart
                          data={universityResearchQuality}
                          layout="vertical"
                          margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
                          barCategoryGap={16}
                          height={300}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="country"
                            type="category"
                            width={120}
                          />
                          <Tooltip
                            formatter={(value: any, name: any, props: any) => [
                              Math.round(value),
                              props?.payload?.country || name || "Value",
                            ]}
                          />
                          <Bar
                            dataKey="value"
                            fill="#10b981"
                            radius={[4, 4, 4, 4]}
                          />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
                {/* Industry Impact by Country - 2024 (Donut) */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      University Score by Country - 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={250}>
                      {universityAnalyticsLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <PieChart>
                          <Pie
                            data={universityIndustryImpact}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            nameKey="country"
                          >
                            {universityIndustryImpact.map(
                              (
                                entry: { country: string; value: number },
                                index: number,
                              ) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ),
                            )}
                          </Pie>
                          <Tooltip
                            formatter={(value: any, name: any, props: any) => [
                              value,
                              props?.payload?.country || name || "Value",
                            ]}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={60}
                            wrapperStyle={{
                              paddingTop: "10px",
                              fontSize: "12px",
                            }}
                            formatter={(value: string, entry: any) =>
                              `${value} (${entry.payload.value})`
                            }
                            payload={(() => {
                              const data = universityIndustryImpact;
                              return data
                                .slice(0, 10)
                                .map((entry: any, i: number) => ({
                                  value: entry.country,
                                  type: "square",
                                  color: CHART_COLORS[i % CHART_COLORS.length],
                                  payload: entry,
                                }));
                            })()}
                          />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
            {/* Filters and Search */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur mb-6 sm:mb-8">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder={`Search ${activeTab}...`}
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      className="pl-10 border-slate-200 focus:border-amber-400 focus:ring-amber-400/20"
                    />
                  </div>

                  {/* Country Filter */}
                  <Select
                    value={filters.country}
                    onValueChange={(value) =>
                      handleFilterChange("country", value)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-48 border-slate-200">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="United States">
                        United States
                      </SelectItem>
                      <SelectItem value="United Kingdom">
                        United Kingdom
                      </SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Year Filter - only for universities */}
                  {activeTab === "universities" && (
                    <Select
                      value={filters.year}
                      onValueChange={(value) =>
                        handleFilterChange("year", value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-32 border-slate-200">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="all">All Years</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
            {isLoading ? (
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border bg-muted/80">
                          <TableHead className="font-semibold text-muted-foreground">
                            Rank
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            {activeTab === "cities"
                              ? "City"
                              : activeTab === "countries"
                                ? "Country"
                                : "University"}
                          </TableHead>
                          {activeTab !== "countries" && (
                            <TableHead className="font-semibold text-muted-foreground">
                              Country
                            </TableHead>
                          )}
                          <TableHead className="font-semibold text-muted-foreground">
                            Change
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Score
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...Array(12)].map((_, i) => (
                          <TableRow
                            key={i}
                            className="border-border hover:bg-muted/50"
                          >
                            <TableCell>
                              <Skeleton className="h-4 w-8" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            {activeTab !== "countries" && (
                              <TableCell>
                                <Skeleton className="h-4 w-24" />
                              </TableCell>
                            )}
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-12" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-16" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : rankingData?.length > 0 ? (
              <>
                <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border bg-muted/80">
                            <TableHead className="font-semibold text-muted-foreground">
                              Rank
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground">
                              {activeTab === "cities"
                                ? "City"
                                : activeTab === "countries"
                                  ? "Country"
                                  : "University"}
                            </TableHead>
                            {activeTab !== "countries" && (
                              <TableHead className="font-semibold text-muted-foreground">
                                Country
                              </TableHead>
                            )}
                            <TableHead className="font-semibold text-muted-foreground">
                              Change
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground">
                              Score
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rankingData?.map((item: any) => {
                            const RankIcon = getRankIcon(item.rank);
                            const rankColor = getRankColor(item.rank);
                            const hasRankChange = "rankChange" in item;
                            const rankChange = hasRankChange
                              ? formatRankChange(item.rankChange || null)
                              : null;
                            let scoreValue: string | null = null;
                            if (
                              "totalScore" in item &&
                              item.totalScore !== undefined &&
                              item.totalScore !== null
                            ) {
                              scoreValue = item.totalScore;
                            } else if (
                              "overallScore" in item &&
                              item.overallScore !== undefined &&
                              item.overallScore !== null
                            ) {
                              scoreValue = item.overallScore;
                            }
                            return (
                              <TableRow
                                key={item.id}
                                className="border-border hover:bg-muted/50"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <RankIcon
                                      className={`h-4 w-4 ${rankColor}`}
                                    />
                                    <span className="font-semibold text-foreground">
                                      #{item.rank || "N/A"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {activeTab === "cities" &&
                                    (item.city || "N/A")}
                                  {activeTab === "countries" &&
                                    (item.country || "N/A")}
                                  {activeTab === "universities" &&
                                    (item.name || "N/A")}
                                </TableCell>
                                {activeTab !== "countries" && (
                                  <TableCell>{item.country || "N/A"}</TableCell>
                                )}
                                <TableCell>
                                  {hasRankChange ? (
                                    rankChange || (
                                      <span className="text-muted-foreground text-xs">
                                        N/A
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-muted-foreground text-xs">
                                      N/A
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {scoreValue !== null ? (
                                    <Badge
                                      variant="secondary"
                                      className="font-mono"
                                    >
                                      {Number(scoreValue).toFixed(1)}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">
                                      N/A
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsDialogOpen(true);
                                    }}
                                    className="border-border hover:bg-muted/50"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Count and Pagination */}
                <div className="flex items-center justify-between mt-8">
                  {/* Results Count - Left Side */}
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, activeTab === "cities" ? (citiesCount?.count || 0) : activeTab === "countries" ? (countriesCount?.count || 0) : (universitiesCount?.count || 0))} of{" "}
                    <span className="font-medium text-foreground">
                      {activeTab === "cities" ? (citiesCount?.count || 0) : activeTab === "countries" ? (countriesCount?.count || 0) : (universitiesCount?.count || 0)} results
                    </span>
                  </div>

                  {/* Pagination Controls - Right Side */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="border-border"
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
                                  : "border-border"
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
                        className="border-border"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No rankings found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search filters to find more rankings.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Ranking Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                {selectedItem && (
                  <>
                    <div
                      className={`p-2 bg-gradient-to-br ${getTabColor(activeTab)} rounded-lg`}
                    >
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <span className="dark:text-white">
                      {activeTab === "universities" && "name" in selectedItem
                        ? selectedItem.name
                        : "city" in selectedItem
                          ? selectedItem.city
                          : "country" in selectedItem &&
                              !("city" in selectedItem)
                            ? selectedItem.country
                            : selectedItem.country || "Ranking Details"}
                    </span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-6">
                {/* Basic Ranking Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Rank
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const RankIcon = getRankIcon(selectedItem.rank);
                        return (
                          <RankIcon
                            className={`h-5 w-5 ${getRankColor(selectedItem.rank)}`}
                          />
                        );
                      })()}
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        #{selectedItem.rank || "N/A"}
                      </span>
                    </div>
                  </div>
                  {selectedItem.rankChange && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Rank Change
                      </label>
                      <div className="mt-1">
                        {formatRankChange(selectedItem.rankChange)}
                      </div>
                    </div>
                  )}
                  {(selectedItem.totalScore || selectedItem.overallScore) && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Overall Score
                      </label>
                      <p className="text-2xl font-bold text-blue-600 dark:text-white mt-1">
                        {formatScore(
                          selectedItem.totalScore || selectedItem.overallScore,
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Location Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedItem.country && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Country
                      </label>
                      <p className="text-slate-900 dark:text-slate-100 mt-1">
                        {selectedItem.country}
                      </p>
                    </div>
                  )}
                  {"city" in selectedItem && selectedItem.city && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        City
                      </label>
                      <p className="text-slate-900 dark:text-slate-100 mt-1">
                        {selectedItem.city}
                      </p>
                    </div>
                  )}
                </div>

                {/* University specific details */}
                {activeTab === "universities" &&
                  "studentPopulation" in selectedItem && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedItem.studentPopulation && (
                          <div>
                            <label className="text-sm font-medium text-slate-600">
                              Student Population
                            </label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                              {selectedItem.studentPopulation.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {selectedItem.year && (
                          <div>
                            <label className="text-sm font-medium text-slate-600">
                              Year
                            </label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                              {selectedItem.year}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Detailed Scores */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                          Detailed Scores
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedItem.teachingScore && (
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Teaching Score
                              </label>
                              <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {formatScore(selectedItem.teachingScore)}
                              </p>
                            </div>
                          )}
                          {selectedItem.researchEnvironmentScore && (
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Research Environment
                              </label>
                              <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {formatScore(
                                  selectedItem.researchEnvironmentScore,
                                )}
                              </p>
                            </div>
                          )}
                          {selectedItem.researchQualityScore && (
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Research Quality
                              </label>
                              <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {formatScore(selectedItem.researchQualityScore)}
                              </p>
                            </div>
                          )}
                          {selectedItem.industryImpactScore && (
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Industry Impact
                              </label>
                              <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {formatScore(selectedItem.industryImpactScore)}
                              </p>
                            </div>
                          )}
                          {selectedItem.internationalOutlookScore && (
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                International Outlook
                              </label>
                              <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {formatScore(
                                  selectedItem.internationalOutlookScore,
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Student Demographics */}
                      {(selectedItem.studentsToStaffRatio ||
                        selectedItem.internationalStudents ||
                        selectedItem.femaleToMaleRatio) && (
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                            Student Demographics
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {selectedItem.studentsToStaffRatio && (
                              <div>
                                <label className="text-sm font-medium text-slate-600">
                                  Student-to-Staff Ratio
                                </label>
                                <p className="text-slate-900 dark:text-slate-100 mt-1">
                                  {selectedItem.studentsToStaffRatio}
                                </p>
                              </div>
                            )}
                            {selectedItem.internationalStudents && (
                              <div>
                                <label className="text-sm font-medium text-slate-600">
                                  International Students
                                </label>
                                <p className="text-slate-900 dark:text-slate-100 mt-1">
                                  {selectedItem.internationalStudents}
                                </p>
                              </div>
                            )}
                            {selectedItem.femaleToMaleRatio && (
                              <div>
                                <label className="text-sm font-medium text-slate-600">
                                  Female-to-Male Ratio
                                </label>
                                <p className="text-slate-900 dark:text-slate-100 mt-1">
                                  {selectedItem.femaleToMaleRatio}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
