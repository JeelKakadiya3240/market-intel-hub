import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Building2,
  DollarSign,
  MapPin,
  Crown,
  Zap,
  Star,
  Sparkles,
} from "lucide-react";
import { Unicorn } from "@/types/database";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

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

interface UnicornFilters {
  search: string;
  country: string;
  continent: string;
  minValuation: string;
  tier: string;
  funding: string;
  leadInvestor: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

export default function Unicorns() {
  const [filters, setFilters] = useState<UnicornFilters>({
    search: "",
    country: "all",
    continent: "all",
    minValuation: "all",
    tier: "all",
    funding: "all",
    leadInvestor: "all",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
  });
  const [selectedUnicorn, setSelectedUnicorn] = useState<Unicorn | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate offset for API calls
  const offset = (pagination.page - 1) * pagination.limit;

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("limit", pagination.limit.toString());
    params.set("offset", offset.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.country !== "all") params.set("country", filters.country);
    if (filters.continent !== "all") params.set("continent", filters.continent);
    if (filters.minValuation !== "all") params.set("minValuation", filters.minValuation);
    if (filters.tier !== "all") params.set("tier", filters.tier);
    if (filters.funding !== "all") params.set("funding", filters.funding);
    if (filters.leadInvestor !== "all") params.set("leadInvestor", filters.leadInvestor);
    return params.toString();
  };

  // Fetch unicorns data
  const { data: unicorns, isLoading } = useQuery({
    queryKey: ["/api/unicorns", pagination.page, filters],
    queryFn: async () => {
      const response = await fetch(`/api/unicorns?${buildQueryParams()}`);
      if (!response.ok) throw new Error("Failed to fetch unicorns");
      return response.json();
    },
  });

  // Fetch total count for pagination
  const { data: totalCount } = useQuery({
    queryKey: ["/api/unicorns/count", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.country !== "all") params.set("country", filters.country);
      if (filters.continent !== "all")
        params.set("continent", filters.continent);
      if (filters.minValuation !== "all") params.set("minValuation", filters.minValuation);
      if (filters.tier !== "all") params.set("tier", filters.tier);
      if (filters.funding !== "all") params.set("funding", filters.funding);
      if (filters.leadInvestor !== "all") params.set("leadInvestor", filters.leadInvestor);

      const response = await fetch(`/api/unicorns/count?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch count");
      const data = await response.json();
      return data.count;
    },
  });

  // Fetch all unicorns data for charts (without pagination)
  const { data: allUnicornsForCharts } = useQuery({
    queryKey: ["/api/unicorns/all", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", "10000"); // Large limit to get all data
      params.set("offset", "0");
      if (filters.search) params.set("search", filters.search);
      if (filters.country !== "all") params.set("country", filters.country);
      if (filters.continent !== "all")
        params.set("continent", filters.continent);
      if (filters.minValuation !== "all") params.set("minValuation", filters.minValuation);
      if (filters.tier !== "all") params.set("tier", filters.tier);
      if (filters.funding !== "all") params.set("funding", filters.funding);
      if (filters.leadInvestor !== "all") params.set("leadInvestor", filters.leadInvestor);

      const response = await fetch(`/api/unicorns?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch all unicorns");
      const data = await response.json();
      console.log("All unicorns for charts:", data);
      return data;
    },
  });

  // Calculate pagination
  const totalPages = Math.ceil((totalCount || 0) / pagination.limit);

  // Reset pagination when changing filters
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters]);

  const handleFilterChange = (key: keyof UnicornFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatValuation = (valuation: string | null | undefined) => {
    if (!valuation) return "N/A";
    const num = parseFloat(valuation.replace(/[^0-9.-]/g, ""));
    if (isNaN(num)) return valuation;
    if (num >= 1000) return `$${num.toFixed(0)}B`;
    return `$${num.toFixed(1)}B`;
  };

  const getValuationTier = (valuation: string | null | undefined) => {
    if (!valuation)
      return { tier: "Unknown", color: "bg-gray-100 text-gray-700" };
    const num = parseFloat(valuation.replace(/[^0-9.-]/g, ""));
    if (isNaN(num))
      return { tier: "Unknown", color: "bg-gray-100 text-gray-700" };

    if (num >= 100)
      return {
        tier: "Hectocorn",
        color: "bg-purple-100 text-purple-700 border-purple-200",
      };
    if (num >= 10)
      return {
        tier: "Decacorn",
        color: "bg-blue-100 text-blue-700 border-blue-200",
      };
    return {
      tier: "Unicorn",
      color: "bg-pink-100 text-pink-700 border-pink-200",
    };
  };

  const getUnicornIcon = (valuation: string | null | undefined) => {
    const num = parseFloat((valuation || "").replace(/[^0-9.-]/g, ""));
    if (isNaN(num)) return Star;
    if (num >= 100) return Crown;
    if (num >= 10) return Zap;
    return Star;
  };

  return (
    <AppLayout
      title="Unicorns"
      subtitle="Track billion-dollar startups and their investors"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 dark:from-gray-900 dark:via-purple-950/30 dark:to-pink-950/20 -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-500 bg-clip-text text-transparent mb-2">
            Unicorn Intelligence
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
            Discover unicorns, decacorns, and hectocorns by valuation, funding,
            and more
          </p>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="h-4 w-4 text-pink-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Total Unicorns
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {totalCount || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Decacorns
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {(() => {
                  const decacorns =
                    allUnicornsForCharts?.filter((u: any) => {
                      const val = parseFloat(
                        (u.postMoneyValue || "").replace(/[^0-9.-]/g, ""),
                      );
                      const isDecacorn = val >= 10 && val < 100;
                      if (isDecacorn) {
                        console.log(
                          "Found Decacorn:",
                          u.company,
                          "Value:",
                          u.postMoneyValue,
                          "Parsed:",
                          val,
                        );
                      }
                      return isDecacorn;
                    }) || [];
                  console.log("Total Decacorns found:", decacorns.length);
                  return decacorns.length;
                })()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-purple-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Hectocorns
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {(() => {
                  const hectocorns =
                    allUnicornsForCharts?.filter((u: any) => {
                      const val = parseFloat(
                        (u.postMoneyValue || "").replace(/[^0-9.-]/g, ""),
                      );
                      const isHectocorn = val >= 100;
                      if (isHectocorn) {
                        console.log(
                          "Found Hectocorn:",
                          u.company,
                          "Value:",
                          u.postMoneyValue,
                          "Parsed:",
                          val,
                        );
                      }
                      return isHectocorn;
                    }) || [];
                  console.log("Total Hectocorns found:", hectocorns.length);
                  return hectocorns.length;
                })()}
              </p>
            </CardContent>
          </Card>
        </div>

        {allUnicornsForCharts && allUnicornsForCharts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Biggest Unicorns by Lead Investors (Top 10 by Valuation) */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Biggest Unicorns by Lead Investors
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart
                    layout="vertical"
                    data={(() => {
                      const map = new Map();
                      // Filter for top 10 unicorns by valuation
                      const topUnicorns = allUnicornsForCharts
                        .sort((a: any, b: any) => {
                          const valA = parseFloat(
                            (a.postMoneyValue || "0").replace(/[^0-9.-]/g, ""),
                          );
                          const valB = parseFloat(
                            (b.postMoneyValue || "0").replace(/[^0-9.-]/g, ""),
                          );
                          return valB - valA;
                        })
                        .slice(0, 10);

                      topUnicorns.forEach((u: any) => {
                        if (u.leadInvestors) {
                          u.leadInvestors.split(",").forEach((name: string) => {
                            const key = name.trim();
                            if (key) map.set(key, (map.get(key) || 0) + 1);
                          });
                        }
                      });
                      return Array.from(map, ([name, value]) => ({
                        name,
                        value,
                      }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 10);
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
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Biggest Unicorns by Country Distribution (Top 10 by Valuation) */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Biggest Unicorns by Country Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const map = new Map();
                        // Filter for top 10 unicorns by valuation
                        const topUnicorns = allUnicornsForCharts
                          .sort((a: any, b: any) => {
                            const valA = parseFloat(
                              (a.postMoneyValue || "0").replace(
                                /[^0-9.-]/g,
                                "",
                              ),
                            );
                            const valB = parseFloat(
                              (b.postMoneyValue || "0").replace(
                                /[^0-9.-]/g,
                                "",
                              ),
                            );
                            return valB - valA;
                          })
                          .slice(0, 10);

                        topUnicorns.forEach((u: any) => {
                          const key = u.country || "Other";
                          map.set(key, (map.get(key) || 0) + 1);
                        });
                        return Array.from(map, ([name, value]) => ({
                          name,
                          value,
                        }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 10);
                      })()}
                      cx="50%"
                      cy="70%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label={false}
                    >
                      {(() => {
                        const map = new Map();
                        // Filter for top 10 unicorns by valuation
                        const topUnicorns = allUnicornsForCharts
                          .sort((a: any, b: any) => {
                            const valA = parseFloat(
                              (a.postMoneyValue || "0").replace(
                                /[^0-9.-]/g,
                                "",
                              ),
                            );
                            const valB = parseFloat(
                              (b.postMoneyValue || "0").replace(
                                /[^0-9.-]/g,
                                "",
                              ),
                            );
                            return valB - valA;
                          })
                          .slice(0, 10);

                        topUnicorns.forEach((u: any) => {
                          const key = u.country || "Other";
                          map.set(key, (map.get(key) || 0) + 1);
                        });
                        const data = Array.from(map, ([name, value]) => ({
                          name,
                          value,
                        }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 10);
                        return data.map((entry, index) => (
                          <Cell
                            key={`cell-country-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ));
                      })()}
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
                      {allUnicornsForCharts.length}
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
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend
                      verticalAlign="bottom"
                      height={60}
                      wrapperStyle={{ paddingTop: "70px", fontSize: "12px" }}
                      formatter={(value: string, entry: any) =>
                        `${value} (${entry.payload.value})`
                      }
                      payload={(() => {
                        const map = new Map();
                        // Filter for top 10 unicorns by valuation
                        const topUnicorns = allUnicornsForCharts
                          .sort((a: any, b: any) => {
                            const valA = parseFloat(
                              (a.postMoneyValue || "0").replace(
                                /[^0-9.-]/g,
                                "",
                              ),
                            );
                            const valB = parseFloat(
                              (b.postMoneyValue || "0").replace(
                                /[^0-9.-]/g,
                                "",
                              ),
                            );
                            return valB - valA;
                          })
                          .slice(0, 10);

                        topUnicorns.forEach((u: any) => {
                          const key = u.country || "Other";
                          map.set(key, (map.get(key) || 0) + 1);
                        });
                        return Array.from(map, ([name, value]) => ({
                          name,
                          value,
                        }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 10)
                          .map((entry: any, i: number) => ({
                            value: entry.name,
                            type: "square",
                            color: CHART_COLORS[i % CHART_COLORS.length],
                            payload: entry,
                          }));
                      })()}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Recent Unicorns by Lead Investors (Last 100) */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Recent Unicorns by Lead Investors
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart
                    layout="vertical"
                    data={(() => {
                      const map = new Map();
                      // Use last 100 unicorns (assuming they're ordered by creation date)
                      const recentUnicorns = allUnicornsForCharts.slice(-100);
                      recentUnicorns.forEach((u: any) => {
                        if (u.leadInvestors) {
                          u.leadInvestors.split(",").forEach((name: string) => {
                            const key = name.trim();
                            if (key) map.set(key, (map.get(key) || 0) + 1);
                          });
                        }
                      });
                      const data = Array.from(map, ([name, value]) => ({
                        name,
                        value,
                      }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 10);
                      return data;
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
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Recent Unicorns by Country (Last 100) */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Recent Unicorns by Country
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const map = new Map();
                        // Use last 100 unicorns (assuming they're ordered by creation date)
                        const recentUnicorns = allUnicornsForCharts.slice(-100);
                        recentUnicorns.forEach((u: any) => {
                          const key = u.country || "Other";
                          map.set(key, (map.get(key) || 0) + 1);
                        });
                        return Array.from(map, ([name, value]) => ({
                          name,
                          value,
                        }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 10);
                      })()}
                      cx="50%"
                      cy="70%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label={false}
                    >
                      {(() => {
                        const map = new Map();
                        // Use last 100 unicorns (assuming they're ordered by creation date)
                        const recentUnicorns = allUnicornsForCharts.slice(-100);
                        recentUnicorns.forEach((u: any) => {
                          const key = u.country || "Other";
                          map.set(key, (map.get(key) || 0) + 1);
                        });
                        return Array.from(map, ([name, value]) => ({
                          name,
                          value,
                        }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 10)
                          .map((entry: any, i: number) => (
                            <Cell
                              key={`cell-recent-country-${i}`}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                            />
                          ));
                      })()}
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
                      {allUnicornsForCharts.length}
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
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend
                      verticalAlign="bottom"
                      height={60}
                      wrapperStyle={{ paddingTop: "70px", fontSize: "12px" }}
                      formatter={(value: string, entry: any) =>
                        `${value} (${entry.payload.value})`
                      }
                      payload={(() => {
                        const map = new Map();
                        // Use last 100 unicorns (assuming they're ordered by creation date)
                        const recentUnicorns = allUnicornsForCharts.slice(-100);
                        recentUnicorns.forEach((u: any) => {
                          const key = u.country || "Other";
                          map.set(key, (map.get(key) || 0) + 1);
                        });
                        return Array.from(map, ([name, value]) => ({
                          name,
                          value,
                        }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 10)
                          .map((entry: any, i: number) => ({
                            value: entry.name,
                            type: "square",
                            color: CHART_COLORS[i % CHART_COLORS.length],
                            payload: entry,
                          }));
                      })()}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Unicorns Table */}

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 dark:text-white border-slate-200 dark:border-gray-700 mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            {/* Search Bar - Full Width on Top */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search unicorns..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="bg-white dark:bg-gray-900 dark:text-white pl-10 border-slate-200 focus:border-purple-400 focus:ring-purple-400/20"
              />
            </div>

            {/* All Filters in Horizontal Row */}
            <div className="flex gap-3 overflow-x-auto">
              {/* Country Filter */}
              <Select
                value={filters.country}
                onValueChange={(value) => handleFilterChange("country", value)}
              >
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="China">China</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Israel">Israel</SelectItem>
                  <SelectItem value="Sweden">Sweden</SelectItem>
                  <SelectItem value="Singapore">Singapore</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Netherlands">Netherlands</SelectItem>
                  <SelectItem value="Brazil">Brazil</SelectItem>
                  <SelectItem value="South Korea">South Korea</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="Estonia">Estonia</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                </SelectContent>
              </Select>

              {/* Any Valuation Filter */}
              <Select
                value={filters.minValuation}
                onValueChange={(value) =>
                  handleFilterChange("minValuation", value)
                }
              >
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <SelectValue placeholder="Any Valuation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Valuation</SelectItem>
                  <SelectItem value="1">$1B+</SelectItem>
                  <SelectItem value="10">$10B+</SelectItem>
                  <SelectItem value="50">$50B+</SelectItem>
                  <SelectItem value="100">$100B+</SelectItem>
                </SelectContent>
              </Select>

              {/* Any Tier Filter */}
              <Select
                value={filters.tier}
                onValueChange={(value) =>
                  handleFilterChange("tier", value)
                }
              >
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <SelectValue placeholder="Any Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Tier</SelectItem>
                  <SelectItem value="Unicorn">Unicorn ($1B-$10B)</SelectItem>
                  <SelectItem value="Decacorn">Decacorn ($10B-$100B)</SelectItem>
                  <SelectItem value="Hectocorn">Hectocorn ($100B+)</SelectItem>
                </SelectContent>
              </Select>

              {/* Any Funding Filter */}
              <Select
                value={filters.funding}
                onValueChange={(value) =>
                  handleFilterChange("funding", value)
                }
              >
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <SelectValue placeholder="Any Funding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Funding</SelectItem>
                  <SelectItem value="10">$10M+</SelectItem>
                  <SelectItem value="50">$50M+</SelectItem>
                  <SelectItem value="100">$100M+</SelectItem>
                  <SelectItem value="500">$500M+</SelectItem>
                  <SelectItem value="1000">$1B+</SelectItem>
                  <SelectItem value="5000">$5B+</SelectItem>
                  <SelectItem value="10000">$10B+</SelectItem>
                </SelectContent>
              </Select>

              {/* All Lead Investors Filter */}
              <Select
                value={filters.leadInvestor}
                onValueChange={(value) =>
                  handleFilterChange("leadInvestor", value)
                }
              >
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <SelectValue placeholder="All Lead Investors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lead Investors</SelectItem>
                  <SelectItem value="Sequoia Capital">Sequoia Capital</SelectItem>
                  <SelectItem value="Andreessen Horowitz">Andreessen Horowitz</SelectItem>
                  <SelectItem value="Accel">Accel</SelectItem>
                  <SelectItem value="Benchmark">Benchmark</SelectItem>
                  <SelectItem value="Kleiner Perkins">Kleiner Perkins</SelectItem>
                  <SelectItem value="GV">GV (Google Ventures)</SelectItem>
                  <SelectItem value="New Enterprise Associates">New Enterprise Associates</SelectItem>
                  <SelectItem value="Lightspeed Venture Partners">Lightspeed Venture Partners</SelectItem>
                  <SelectItem value="Index Ventures">Index Ventures</SelectItem>
                  <SelectItem value="Founders Fund">Founders Fund</SelectItem>
                  <SelectItem value="General Catalyst">General Catalyst</SelectItem>
                  <SelectItem value="Tiger Global">Tiger Global</SelectItem>
                  <SelectItem value="Insight Partners">Insight Partners</SelectItem>
                  <SelectItem value="DST Global">DST Global</SelectItem>
                </SelectContent>
              </Select>

              {/* All Continents Filter */}
              <Select
                value={filters.continent}
                onValueChange={(value) =>
                  handleFilterChange("continent", value)
                }
              >
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <SelectValue placeholder="All Continents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Continents</SelectItem>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="South America">South America</SelectItem>
                  <SelectItem value="Africa">Africa</SelectItem>
                  <SelectItem value="Oceania">Oceania</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        {isLoading ? (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-white/80 backdrop-blur">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-purple-50/30 dark:from-gray-900 dark:to-purple-900 border-b border-slate-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Valuation
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total Funding
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Lead Investors
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-slate-200">
                  {[...Array(10)].map((_, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 dark:hover:bg-gray-800 dark:text-white transition-colors duration-200 cursor-pointer"
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="ml-4">
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-16" />
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
        ) : unicorns?.length > 0 ? (
          <>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-purple-50/30 dark:from-gray-900 dark:to-purple-900 border-b border-slate-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Valuation
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Total Funding
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Lead Investors
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-slate-200">
                    {unicorns.map((unicorn: Unicorn) => {
                      const tier = getValuationTier(unicorn.postMoneyValue);
                      const UnicornIcon = getUnicornIcon(
                        unicorn.postMoneyValue,
                      );

                      return (
                        <tr
                          key={unicorn.id}
                          className="hover:bg-slate-50 dark:hover:bg-gray-800 dark:text-white transition-colors duration-200 cursor-pointer"
                          onClick={() => {
                            setSelectedUnicorn(unicorn);
                            setIsDialogOpen(true);
                          }}
                        >
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {unicorn.company || "Unknown Company"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">
                              {formatValuation(unicorn.postMoneyValue)}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className={tier.color}>
                              <UnicornIcon className="h-3 w-3 mr-1" />
                              {tier.tier}
                            </Badge>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {unicorn.totalEquityFunding || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {unicorn.leadInvestors || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {unicorn.country || "N/A"}
                            </div>
                            {unicorn.continent && (
                              <Badge
                                variant="secondary"
                                className="mt-1 text-xs"
                              >
                                {unicorn.continent}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {!isLoading && unicorns?.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    totalCount || 0,
                  )}{" "}
                  of {(totalCount || 0).toLocaleString()} unicorns
                </div>

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
                              pageNum === pagination.page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={
                              pageNum === pagination.page
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
            )}
          </>
        ) : (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-white/80 backdrop-blur">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No unicorns found
              </h3>
              <p className="text-slate-600">
                Try adjusting your search filters to find more unicorns.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Unicorn Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                {selectedUnicorn && (
                  <>
                    <div
                      className={`p-2 rounded-lg ${getValuationTier(selectedUnicorn.postMoneyValue).color.includes("purple") ? "bg-purple-500" : getValuationTier(selectedUnicorn.postMoneyValue).color.includes("blue") ? "bg-blue-500" : "bg-pink-500"}`}
                    >
                      {(() => {
                        const UnicornIcon = getUnicornIcon(
                          selectedUnicorn.postMoneyValue,
                        );
                        return <UnicornIcon className="h-5 w-5 text-white" />;
                      })()}
                    </div>
                    <span className="font-semibold text-lg dark:text-white">
                      {selectedUnicorn.company || "Unicorn Details"}
                    </span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedUnicorn && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Valuation
                    </label>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-white">
                      {formatValuation(selectedUnicorn.postMoneyValue)}
                    </p>
                    <Badge
                      className={`mt-1 ${getValuationTier(selectedUnicorn.postMoneyValue).color}`}
                    >
                      {getValuationTier(selectedUnicorn.postMoneyValue).tier}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Total Funding
                    </label>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {selectedUnicorn.totalEquityFunding || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Location
                    </label>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {selectedUnicorn.country || "N/A"}
                    </p>
                    {selectedUnicorn.continent && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {selectedUnicorn.continent}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Investors */}
                {selectedUnicorn.leadInvestors && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Lead Investors
                    </label>
                    <p className="text-slate-900 dark:text-slate-100 mt-1">
                      {selectedUnicorn.leadInvestors}
                    </p>
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
