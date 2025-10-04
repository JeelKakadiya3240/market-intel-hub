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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Rocket,
  Globe,
  MapPin,
  Calendar,
  Star,
  BarChart3,
  ExternalLink,
  GraduationCap,
  Zap,
  Trophy,
  ArrowUpDown,
  Building2,
  Target,
} from "lucide-react";
import { Accelerator } from "@/types/database";
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

interface AcceleratorFilters {
  search: string;
  country: string;
  industry: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

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

export default function Accelerators() {
  const [filters, setFilters] = useState<AcceleratorFilters>({
    search: "",
    country: "all",
    industry: "all",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
  });
  const [selectedAccelerator, setSelectedAccelerator] =
    useState<Accelerator | null>(null);
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
    if (filters.industry !== "all") params.set("industry", filters.industry);
    return params.toString();
  };

  // Fetch accelerators data
  const { data: accelerators, isLoading } = useQuery({
    queryKey: ["/api/accelerators", pagination.page, filters],
    queryFn: async () => {
      const response = await fetch(`/api/accelerators?${buildQueryParams()}`);
      if (!response.ok) throw new Error("Failed to fetch accelerators");
      return response.json();
    },
  });

  // Fetch total count for stats
  const { data: countData } = useQuery({
    queryKey: ["/api/accelerators/count"],
    queryFn: async () => {
      const response = await fetch("/api/accelerators/count");
      if (!response.ok) throw new Error("Failed to fetch accelerators count");
      return response.json();
    },
  });

  // Fetch all accelerators data
  const { data: allAccelerators, isLoading: isLoadingAll } = useQuery({
    queryKey: ["/api/accelerators", "all", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", "10000");
      params.set("page", "1");
      if (filters.search) params.set("search", filters.search);
      if (filters.country !== "all") params.set("country", filters.country);
      if (filters.industry !== "all") params.set("industry", filters.industry);
      const response = await fetch(`/api/accelerators?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch all accelerators");
      return response.json();
    },
  });

  // Debug: Log accelerator data and categorization
  useEffect(() => {
    if (allAccelerators && allAccelerators.length > 0) {
      console.log("All Accelerators Data:", allAccelerators);

      // Log categorization results
      const categorized = allAccelerators.map((a: Accelerator) => ({
        name: a.name,
        industries: a.industries,
        type: getAcceleratorType(a),
      }));

      console.log("Accelerator Categorization:", categorized);

      // Log counts by type
      const typeCounts = categorized.reduce((acc: any, item: any) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {});

      console.log("Type Counts:", typeCounts);
    }
  }, [allAccelerators]);

  // Reset pagination when changing filters
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters]);

  const handleFilterChange = (key: keyof AcceleratorFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getAcceleratorInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const formatFoundedDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return dateString;
    }
  };

  const getAcceleratorType = (a: Accelerator) => {
    // Check name field for type indicators
    const name = (a.name || "").toLowerCase();
    const industries = (a.industries || "").toLowerCase();

    console.log("Categorizing:", { name, industries });

    // Check for incubator indicators
    if (name.includes("incubator") || industries.includes("incubator")) {
      console.log("Found Incubator:", name);
      return "Incubator";
    }

    // Check for venture studio indicators
    if (
      name.includes("venture studio") ||
      name.includes("studio") ||
      industries.includes("venture studio")
    ) {
      console.log("Found Venture Studio:", name);
      return "Venture Studio";
    }

    // Check for bootcamp indicators
    if (
      name.includes("bootcamp") ||
      name.includes("boot camp") ||
      industries.includes("bootcamp")
    ) {
      console.log("Found Bootcamp:", name);
      return "Bootcamp";
    }

    // Check for accelerator indicators
    if (name.includes("accelerator") || industries.includes("accelerator")) {
      console.log("Found Accelerator:", name);
      return "Accelerator";
    }

    // Check for other common patterns
    if (name.includes("lab") || name.includes("labs")) {
      console.log("Found Venture Studio (Lab):", name);
      return "Venture Studio";
    }

    if (name.includes("foundry") || name.includes("forge")) {
      console.log("Found Venture Studio (Foundry):", name);
      return "Venture Studio";
    }

    if (name.includes("seed") || name.includes("early stage")) {
      console.log("Found Accelerator (Seed):", name);
      return "Accelerator";
    }

    // Check for specific known incubators by name
    const knownIncubators = [
      "y combinator",
      "techstars",
      "500 startups",
      "masschallenge",
      "startx",
      "angelpad",
      "dreamit",
      "alchemist",
      "founders factory",
      "station f",
      "nucleus",
      "hatch",
      "nest",
      "hatchery",
    ];

    if (knownIncubators.some((incubator) => name.includes(incubator))) {
      console.log("Found Known Incubator:", name);
      return "Incubator";
    }

    // Default to Accelerator if no specific type is found
    console.log("Defaulting to Accelerator:", name);
    return "Accelerator";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Incubator":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Venture Studio":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Bootcamp":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
    }
    return (
      <ArrowUpDown
        className={`h-4 w-4 ${sortDirection === "asc" ? "text-orange-600" : "text-orange-600 rotate-180"}`}
      />
    );
  };

  const getAcceleratorIcon = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const totalPages = Math.ceil((countData?.count || 0) / pagination.limit);

  return (
    <AppLayout
      title="Accelerators"
      subtitle="Explore accelerator programs and their impact"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
            Accelerators
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium">
            Discover and analyze accelerator programs in the ecosystem
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Rocket className="h-4 w-4 text-orange-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Total Programs
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {countData?.count || accelerators?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Incubators
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {(() => {
                  const incubators =
                    allAccelerators?.filter(
                      (a: Accelerator) => getAcceleratorType(a) === "Incubator",
                    ) || [];
                  console.log(
                    "Incubators found:",
                    incubators.length,
                    incubators.map((a: Accelerator) => a.name),
                  );
                  return incubators.length;
                })()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="h-4 w-4 text-purple-500" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Venture Studios
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {(() => {
                  const ventureStudios =
                    allAccelerators?.filter(
                      (a: Accelerator) =>
                        getAcceleratorType(a) === "Venture Studio",
                    ) || [];
                  console.log(
                    "Venture Studios found:",
                    ventureStudios.length,
                    ventureStudios.map((a: Accelerator) => a.name),
                  );
                  return ventureStudios.length;
                })()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-green-500" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Countries
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {new Set(
                  allAccelerators
                    ?.map((a: Accelerator) => a.country)
                    .filter(Boolean),
                ).size || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        {allAccelerators && allAccelerators.length > 0 && (
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Accelerator Types */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground">
                  Accelerator Types
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <ResponsiveContainer width="100%" height={230}>
                  <RechartsBarChart
                    layout="vertical"
                    data={(() => {
                      const map = new Map();
                      allAccelerators.forEach((a: any) => {
                        const key = getAcceleratorType(a) || "Unknown";
                        map.set(key, (map.get(key) || 0) + 1);
                      });
                      return Array.from(map, ([name, value]) => ({
                        name,
                        value,
                      }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 15);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Programs in Countries */}
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-foreground">
                    Programs in Countries
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-1">
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsBarChart
                      layout="vertical"
                      data={(() => {
                        const map = new Map();
                        allAccelerators.forEach((a: any) => {
                          const key = a.country || "Unknown";
                          map.set(key, (map.get(key) || 0) + 1);
                        });
                        return Array.from(map, ([name, value]) => ({
                          name,
                          value,
                        }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 15);
                      })()}
                      margin={{ left: 40, right: 20, top: 5, bottom: 5 }}
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
              {/* Funding Distribution (Donut) */}
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-foreground">
                    Industry Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1 pb-1">
                  <ResponsiveContainer width="100%" height={450}>
                    <PieChart>
                      {(() => {
                        // Extract data processing into a function to ensure consistency
                        const processIndustryData = () => {
                          const map = new Map();
                          allAccelerators.forEach((a: any) => {
                            const industries = a.industries || "Unknown";
                            // Split multiple industries and count each separately
                            const industriesList = industries.split(/[,;|]+/).map((i: string) => i.trim()).filter((i: string) => {
                              const cleaned = i.toLowerCase();
                              // Filter out generic/agnostic categories that don't provide meaningful industry info
                              return i && 
                                     i !== 'Unknown' && 
                                     !cleaned.includes('industry agnostic') &&
                                     !cleaned.includes('agnostic') &&
                                     !cleaned.includes('general') &&
                                     !cleaned.includes('various') &&
                                     !cleaned.includes('multiple') &&
                                     !cleaned.includes('all') &&
                                     cleaned.length > 2;
                            });
                            
                            if (industriesList.length === 0) {
                              map.set("General/Various", (map.get("General/Various") || 0) + 1);
                            } else {
                              industriesList.forEach((industry: string) => {
                                const key = industry.charAt(0).toUpperCase() + industry.slice(1);
                                map.set(key, (map.get(key) || 0) + 1);
                              });
                            }
                          });
                          const sortedData = Array.from(map, ([name, value]) => ({
                            name,
                            value,
                          })).sort((a, b) => b.value - a.value);
                          
                          // Take top 15 industries and group the rest as "Others"
                          const topIndustries = sortedData.slice(0, 15);
                          const othersCount = sortedData.slice(15).reduce((sum, item) => sum + item.value, 0);
                          
                          const result = [...topIndustries];
                          if (othersCount > 0) {
                            result.push({ name: "Others", value: othersCount });
                          }
                          
                          return result;
                        };
                        
                        const chartData = processIndustryData();
                        
                        return (
                          <>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="45%"
                              innerRadius={50}
                              outerRadius={90}
                              dataKey="value"
                              nameKey="name"
                              label={false}
                            >
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-industry-${index}`}
                                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            {/* Center label for total */}
                            <text
                              x="50%"
                              y="42%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="20"
                              fontWeight="bold"
                              fill="#10b981"
                            >
                              {allAccelerators.length}
                            </text>
                            <text
                              x="50%"
                              y="48%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="11"
                              fill="#888"
                            >
                              Total
                            </text>
                            <Tooltip formatter={(value, name) => [value, name]} />
                            <Legend
                              verticalAlign="bottom"
                              height={50}
                              wrapperStyle={{ 
                                position: "absolute",
                                width: "442px",
                                height: "50px", 
                                left: "5px",
                                bottom: "100px",
                                fontSize: "12px"
                              }}
                              formatter={(value: string, entry: any) =>
                                `${value} (${entry.payload.value})`
                              }
                              payload={chartData.map((entry: any, i: number) => ({
                                value: entry.name,
                                type: "square",
                                color: CHART_COLORS[i % CHART_COLORS.length],
                                payload: entry,
                              }))}
                            />
                          </>
                        );
                      })()}
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search accelerators..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 border-slate-200 focus:border-orange-400 focus:ring-orange-400/20"
                />
              </div>

              {/* Country Filter */}
              <Select
                value={filters.country}
                onValueChange={(value) => handleFilterChange("country", value)}
              >
                <SelectTrigger className="w-full sm:w-48 border-slate-200">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="Hong Kong">Hong Kong</SelectItem>
                  <SelectItem value="The Netherlands">Netherlands</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Singapore">Singapore</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                  <SelectItem value="South Korea">South Korea</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Sweden">Sweden</SelectItem>
                  <SelectItem value="Ireland">Ireland</SelectItem>
                </SelectContent>
              </Select>

              {/* Industry Filter */}
              <Select
                value={filters.industry}
                onValueChange={(value) => handleFilterChange("industry", value)}
              >
                <SelectTrigger className="w-full sm:w-48 border-slate-200">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="FinTech">FinTech</SelectItem>
                  <SelectItem value="HealthTech">HealthTech</SelectItem>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="EdTech">EdTech</SelectItem>
                  <SelectItem value="Ecommerce">Ecommerce</SelectItem>
                  <SelectItem value="AgTech">AgTech</SelectItem>
                  <SelectItem value="Cleantech">Cleantech</SelectItem>
                  <SelectItem value="Energy">Energy</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="IoT">IoT</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Biotech">Biotech</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        {/* Accelerators Table */}
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-muted-foreground font-semibold"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Name
                        {getSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Type
                      </div>
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </div>
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Industry
                      </div>
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Founded
                      </div>
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Investment
                      </div>
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(20)].map((_, i) => (
                      <TableRow key={i} className="border-border">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-16 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : accelerators?.length > 0 ? (
                    accelerators.map((accelerator: Accelerator) => {
                      const type = getAcceleratorType(accelerator);
                      const typeColor = getTypeColor(type);
                      const initials = getAcceleratorInitials(
                        accelerator.name ?? null,
                      );

                      return (
                        <TableRow
                          key={accelerator.id}
                          className="border-border hover:bg-muted/50 transition-colors cursor-pointer group"
                          onClick={() => {
                            setSelectedAccelerator(accelerator);
                            setIsDialogOpen(true);
                          }}
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-xs">
                                  {initials}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground group-hover:text-orange-600 transition-colors truncate">
                                  {accelerator.name || "Unknown Accelerator"}
                                </p>
                                {accelerator.website && (
                                  <a
                                    href={accelerator.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground hover:text-blue-600 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {accelerator.website.replace(
                                      /^https?:\/\//,
                                      "",
                                    )}
                                  </a>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant="outline"
                              className={`text-xs ${typeColor}`}
                            >
                              {type}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-muted-foreground">
                              {accelerator.city && accelerator.country
                                ? `${accelerator.city}, ${accelerator.country}`
                                : accelerator.country ||
                                  accelerator.city ||
                                  "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-muted-foreground">
                              {accelerator.industries || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-muted-foreground">
                              {accelerator.foundedDate
                                ? formatFoundedDate(accelerator.foundedDate)
                                : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm font-medium text-green-600">
                              N/A
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-orange-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAccelerator(accelerator);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No accelerators found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {!isLoading && accelerators?.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                countData?.count || 0,
              )}{" "}
              of {(countData?.count || 0).toLocaleString()} accelerators
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
                            ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
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

        {/* Accelerator Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-900/90 dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                {selectedAccelerator && (
                  <>
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {getAcceleratorInitials(
                          selectedAccelerator.name ?? null,
                        )}
                      </span>
                    </div>
                    <span className="font-semibold text-lg dark:text-white">
                      {selectedAccelerator.name || "Accelerator Details"}
                    </span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedAccelerator && (
              <div className="space-y-6">
                {/* Program Type and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Program Type
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {getAcceleratorType(selectedAccelerator)}
                    </p>
                    <Badge
                      className={`mt-1 ${getTypeColor(getAcceleratorType(selectedAccelerator))}`}
                    >
                      {getAcceleratorType(selectedAccelerator)}
                    </Badge>
                  </div>
                  {(selectedAccelerator.city ||
                    selectedAccelerator.country) && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Location
                      </label>
                      <p className="text-slate-900 dark:text-white flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {selectedAccelerator.city
                          ? `${selectedAccelerator.city}, ${selectedAccelerator.country}`
                          : selectedAccelerator.country}
                      </p>
                    </div>
                  )}
                </div>

                {/* Program Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedAccelerator.foundedDate && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Founded
                      </label>
                      <p className="text-slate-900 dark:text-white">
                        {formatFoundedDate(selectedAccelerator.foundedDate)}
                      </p>
                    </div>
                  )}
                  {selectedAccelerator.industries && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Industry Focus
                      </label>
                      <p className="text-slate-900 dark:text-white">
                        {selectedAccelerator.industries}
                      </p>
                    </div>
                  )}
                  {selectedAccelerator.numberOfInvestments && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Investments
                      </label>
                      <p className="text-xl font-bold text-emerald-600 dark:text-white">
                        {selectedAccelerator.numberOfInvestments}
                      </p>
                    </div>
                  )}
                  {selectedAccelerator.numberOfExits && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Exits
                      </label>
                      <p className="text-slate-900 dark:text-white">
                        {selectedAccelerator.numberOfExits}
                      </p>
                    </div>
                  )}
                </div>

                {/* Founders */}
                {selectedAccelerator.founders && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Founders
                    </label>
                    <p className="text-slate-900 dark:text-white mt-1">
                      {selectedAccelerator.founders}
                    </p>
                  </div>
                )}

                {/* Website */}
                {selectedAccelerator.website && (
                  <div className="pt-4 border-t border-slate-200">
                    <a
                      href={selectedAccelerator.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Website
                    </a>
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
