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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Shield,
  AlertTriangle,
  ShieldAlert,
  User,
  Building2,
  Target,
  MapPin,
  Calendar,
  Star,
  BarChart3,
  ExternalLink,
  Flag,
  FileText,
  Ban,
  AlertCircle,
  Users,
  Globe,
  Lock,
  Gavel,
} from "lucide-react";
import type {
  SanctionListExtended,
  SanctionListIndividual,
} from "@/../../shared/schema";

interface SanctionFilters {
  search: string;
  entityType: string;
  country: string;
  nationality: string;
  applicationStatus: string;
  programs: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

type SanctionTabType = "extended" | "individuals";

export default function Sanctions() {
  const [activeTab, setActiveTab] = useState<SanctionTabType>("extended");
  const [filters, setFilters] = useState<SanctionFilters>({
    search: "",
    entityType: "all",
    country: "all",
    nationality: "all",
    applicationStatus: "all",
    programs: "all",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 25,
  });
  const [selectedSanction, setSelectedSanction] = useState<
    SanctionListExtended | SanctionListIndividual | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate offset for API calls
  const offset = (pagination.page - 1) * pagination.limit;

  // Build query parameters based on active tab
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("limit", pagination.limit.toString());
    params.set("page", pagination.page.toString());
    params.set("offset", offset.toString());
    if (filters.search) params.set("search", filters.search);
    
    if (activeTab === "extended") {
      // Extended list filters
      if (filters.entityType !== "all")
        params.set("entityType", filters.entityType);
      if (filters.country !== "all") params.set("country", filters.country);
      if (filters.programs !== "all") params.set("programs", filters.programs);
    } else {
      // Individuals filters  
      if (filters.entityType !== "all")
        params.set("entityType", filters.entityType);
      if (filters.country !== "all") params.set("country", filters.country);
      if (filters.nationality !== "all")
        params.set("nationality", filters.nationality);
      if (filters.programs !== "all") params.set("programs", filters.programs);
    }
    
    return params.toString();
  };

  // Get API endpoint based on active tab
  const getApiEndpoint = () => {
    return activeTab === "extended"
      ? "/api/sanctions/extended"
      : "/api/sanctions/individuals";
  };

  // Fetch sanctions data
  const { data: sanctionData, isLoading } = useQuery({
    queryKey: [getApiEndpoint(), activeTab, pagination.page, filters],
    queryFn: async () => {
      const response = await fetch(`${getApiEndpoint()}?${buildQueryParams()}`);
      if (!response.ok) throw new Error("Failed to fetch sanctions");
      return response.json();
    },
  });

  // Fetch counts for stats
  const { data: extendedCount } = useQuery({
    queryKey: ["/api/sanctions/extended/count"],
    queryFn: async () => {
      const response = await fetch("/api/sanctions/extended/count");
      if (!response.ok)
        throw new Error("Failed to fetch extended sanctions count");
      return response.json();
    },
  });

  const { data: individualsCount } = useQuery({
    queryKey: ["/api/sanctions/individuals/count"],
    queryFn: async () => {
      const response = await fetch("/api/sanctions/individuals/count");
      if (!response.ok)
        throw new Error("Failed to fetch individuals sanctions count");
      return response.json();
    },
  });

  // Fetch all sanctions data for active count calculation
  const { data: allExtendedSanctions } = useQuery({
    queryKey: ["/api/sanctions/extended/all"],
    queryFn: async () => {
      const response = await fetch(
        "/api/sanctions/extended?limit=10000&offset=0",
      );
      if (!response.ok)
        throw new Error("Failed to fetch all extended sanctions");
      return response.json();
    },
  });

  const { data: allIndividualsSanctions } = useQuery({
    queryKey: ["/api/sanctions/individuals/all"],
    queryFn: async () => {
      const response = await fetch(
        "/api/sanctions/individuals?limit=10000&offset=0",
      );
      if (!response.ok)
        throw new Error("Failed to fetch all individuals sanctions");
      return response.json();
    },
  });

  // Reset pagination when changing tabs or filters
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeTab, filters]);

  const handleFilterChange = (key: keyof SanctionFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getTabIcon = (tab: SanctionTabType) => {
    switch (tab) {
      case "extended":
        return Building2;
      case "individuals":
        return User;
      default:
        return Shield;
    }
  };

  const getTabColor = (tab: SanctionTabType) => {
    switch (tab) {
      case "extended":
        return "from-red-500 to-rose-600";
      case "individuals":
        return "from-orange-500 to-amber-600";
      default:
        return "from-red-500 to-rose-600";
    }
  };

  const getEntityTypeColor = (entityType: string | null) => {
    if (!entityType) return "bg-gray-100 text-gray-700 border-gray-200";
    const lowerType = entityType.toLowerCase();
    if (lowerType.includes("individual"))
      return "bg-orange-100 text-orange-700 border-orange-200";
    if (lowerType.includes("entity"))
      return "bg-red-100 text-red-700 border-red-200";
    if (lowerType.includes("vessel"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (lowerType.includes("aircraft"))
      return "bg-sky-100 text-sky-700 border-sky-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-700 border-gray-200";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("active"))
      return "bg-red-100 text-red-700 border-red-200";
    if (lowerStatus.includes("removed"))
      return "bg-green-100 text-green-700 border-green-200";
    if (lowerStatus.includes("pending"))
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const renderSanctionCard = (
    sanction: SanctionListExtended | SanctionListIndividual,
  ) => {
    const Icon = getTabIcon(activeTab);
    const isIndividual = activeTab === "individuals";

    // Get display name based on type
    let displayName: string | null = null;
    if ("fullName" in sanction && typeof sanction.fullName === "string") {
      displayName = sanction.fullName;
    } else if ("name" in sanction && typeof sanction.name === "string") {
      displayName = sanction.name;
    }

    const entityType =
      "entityType" in sanction
        ? sanction.entityType
        : "designation" in sanction
          ? sanction.designation
          : null;

    const location = isIndividual
      ? "nationality" in sanction
        ? sanction.nationality
        : null
      : "country" in sanction
        ? sanction.country
        : null;

    return (
      <Card
        key={sanction.id}
        className="border-0 shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer border-l-4 border-l-red-500"
        onClick={() => {
          setSelectedSanction(sanction);
          setIsDialogOpen(true);
        }}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`p-3 bg-gradient-to-br ${getTabColor(activeTab)} rounded-xl flex-shrink-0`}
              >
                <ShieldAlert className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg truncate group-hover:text-blue-600 transition-colors">
                  {displayName || "Unknown Entity"}
                </h3>
                {entityType && (
                  <Badge
                    variant="outline"
                    className={`mt-1 text-xs ${getEntityTypeColor(entityType)}`}
                  >
                    {entityType}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {/* Location/Country */}
            {location && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="truncate">{location}</span>
              </div>
            )}

            {/* Programs */}
            {"programs" in sanction && sanction.programs && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Gavel className="h-4 w-4 text-slate-400" />
                <span className="truncate">{sanction.programs}</span>
              </div>
            )}

            {/* Date information */}
            {(("listedOn" in sanction && sanction.listedOn) ||
              ("individualDateOfBirth" in sanction &&
                sanction.individualDateOfBirth)) && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>
                  {"listedOn" in sanction && sanction.listedOn
                    ? `Listed: ${formatDate(sanction.listedOn)}`
                    : "individualDateOfBirth" in sanction &&
                        sanction.individualDateOfBirth
                      ? `DOB: ${formatDate(sanction.individualDateOfBirth)}`
                      : ""}
                </span>
              </div>
            )}

            {/* Application Status for individuals */}
            {isIndividual &&
              "applicationStatus" in sanction &&
              sanction.applicationStatus && (
                <div className="pt-2 border-t border-slate-100">
                  <Badge className={getStatusColor(sanction.applicationStatus)}>
                    {sanction.applicationStatus}
                  </Badge>
                </div>
              )}

            {/* Address/Region */}
            {(("regionOrAddress" in sanction && sanction.regionOrAddress) ||
              ("individualAddress" in sanction &&
                sanction.individualAddress)) && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-600 line-clamp-2">
                  {"regionOrAddress" in sanction
                    ? sanction.regionOrAddress
                    : sanction.individualAddress}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const totalPages = Math.ceil(
    (activeTab === "extended"
      ? extendedCount?.count || 0
      : individualsCount?.count || 0) / pagination.limit,
  );

  // Add type guard for SanctionListExtended
  function isSanctionListExtended(obj: any): obj is SanctionListExtended {
    return (
      obj &&
      typeof obj === "object" &&
      "name" in obj &&
      "entityType" in obj &&
      "regionOrAddress" in obj
    );
  }

  return (
    <AppLayout
      title="Sanctions"
      subtitle="Global sanctions and compliance monitoring"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-rose-50/20 dark:from-gray-950 dark:via-red-950/30 dark:to-rose-950/20 -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6">
        {/* Security Warning */}
        <Alert className="mb-6 border-red-200 bg-red-50/50">
          <ShieldAlert className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Compliance Notice:</strong> This sanctions database is for
            compliance screening purposes only. Verify all matches with official
            government sources before taking action.
          </AlertDescription>
        </Alert>

        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-red-900 to-rose-900 bg-clip-text text-transparent">
                Sanctions Database
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium">
                Monitor sanctioned entities and individuals for compliance
                screening
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-red-500 dark:text-red-300" />
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                    Entities
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {extendedCount?.count || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <User className="h-4 w-4 text-orange-500 dark:text-orange-300" />
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                    Individuals
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {individualsCount?.count || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Ban className="h-4 w-4 text-red-600 dark:text-red-300" />
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                    Active
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {(() => {
                    // Only check applicationStatus for individual sanctions
                    // Extended sanctions don't have applicationStatus field
                    const individualSanctions = allIndividualsSanctions || [];

                    // Debug: Log all unique applicationStatus values
                    const uniqueStatuses = Array.from(
                      new Set(
                        individualSanctions
                          .map((s: any) => s.applicationStatus)
                          .filter(Boolean),
                      ),
                    );
                    console.log(
                      "All unique applicationStatus values:",
                      uniqueStatuses,
                    );

                    // Debug: Show sample data
                    if (individualSanctions.length > 0) {
                      console.log(
                        "Sample individual sanctions:",
                        individualSanctions.slice(0, 3).map((s: any) => ({
                          id: s.id,
                          fullName: s.fullName,
                          applicationStatus: s.applicationStatus,
                          nationality: s.nationality,
                        })),
                      );

                      // Debug: Show all available fields from first sanction
                      const firstSanction = individualSanctions[0];
                      console.log(
                        "All fields in first sanction:",
                        Object.keys(firstSanction),
                      );
                      console.log(
                        "Complete first sanction data:",
                        firstSanction,
                      );
                    }

                    // Fix: Count sanctions that either have active status OR have empty status (which defaults to 'Active' in table)
                    const actualActiveCount = individualSanctions.filter(
                      (s: any) => {
                        const status = s.applicationStatus?.toLowerCase() || "";
                        const hasActiveStatus =
                          status.includes("active") ||
                          status.includes("approved") ||
                          status.includes("current") ||
                          status.includes("valid") ||
                          status.includes("* approved");
                        const hasEmptyStatus =
                          !s.applicationStatus ||
                          s.applicationStatus.trim() === "";
                        return hasActiveStatus || hasEmptyStatus; // Empty status defaults to 'Active' in table
                      },
                    ).length;

                    console.log(
                      "Actual Active Count (matching table logic):",
                      actualActiveCount,
                    );

                    return actualActiveCount;
                  })()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Globe className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                    Countries
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {new Set(
                    sanctionData
                      ?.map((s: any) => s.country || s.nationality)
                      .filter(Boolean),
                  ).size || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search sanctions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 border-slate-200 focus:border-red-400 focus:ring-red-400/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Entity Type Filter */}
              <Select
                value={filters.entityType}
                onValueChange={(value) =>
                  handleFilterChange("entityType", value)
                }
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Entity">Entity</SelectItem>
                  <SelectItem value="Vessel">Vessel</SelectItem>
                  <SelectItem value="Aircraft">Aircraft</SelectItem>
                </SelectContent>
              </Select>

              {/* Country Filter */}
              <Select
                value={filters.country}
                onValueChange={(value) => handleFilterChange("country", value)}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="Russia">Russia</SelectItem>
                  <SelectItem value="Iran">Iran</SelectItem>
                  <SelectItem value="China">China</SelectItem>
                  <SelectItem value="North Korea">North Korea</SelectItem>
                  <SelectItem value="Syria">Syria</SelectItem>
                  <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                  <SelectItem value="Belarus">Belarus</SelectItem>
                  <SelectItem value="Cuba">Cuba</SelectItem>
                  <SelectItem value="Iraq">Iraq</SelectItem>
                  <SelectItem value="Lebanon">Lebanon</SelectItem>
                  <SelectItem value="Libya">Libya</SelectItem>
                  <SelectItem value="Myanmar">Myanmar</SelectItem>
                  <SelectItem value="Venezuela">Venezuela</SelectItem>
                  <SelectItem value="Yemen">Yemen</SelectItem>
                  <SelectItem value="Sudan">Sudan</SelectItem>
                  <SelectItem value="Somalia">Somalia</SelectItem>
                  <SelectItem value="Mali">Mali</SelectItem>
                  <SelectItem value="Central African Republic">Central African Republic</SelectItem>
                  <SelectItem value="Democratic Republic of Congo">Democratic Republic of Congo</SelectItem>
                </SelectContent>
              </Select>

              {/* Programs Filter */}
              <Select
                value={filters.programs}
                onValueChange={(value) => handleFilterChange("programs", value)}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="Ukraine Related">
                    Ukraine Related
                  </SelectItem>
                  <SelectItem value="IRAN">Iran Sanctions</SelectItem>
                  <SelectItem value="SYRIA">Syria Sanctions</SelectItem>
                  <SelectItem value="CYBER2">Cyber Related</SelectItem>
                  <SelectItem value="SDGT">Terrorism Related</SelectItem>
                  <SelectItem value="MAGNIT">Magnitsky Act</SelectItem>
                  <SelectItem value="COUNTER-NARCOTICS">Counter Narcotics</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </CardContent>
        </Card>

        {/* Sanctions Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as SanctionTabType)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-0 shadow-lg p-1">
            <TabsTrigger
              value="extended"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-600 data-[state=active]:text-white font-medium"
            >
              <Building2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Extended List</span>
              <span className="sm:hidden">Entities</span>
            </TabsTrigger>
            <TabsTrigger
              value="individuals"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white font-medium"
            >
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Individuals</span>
              <span className="sm:hidden">People</span>
            </TabsTrigger>
          </TabsList>

          {/* Sanctions Grid */}
          <TabsContent value={activeTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {activeTab === "extended"
                  ? "Sanctioned Entities"
                  : "Sanctioned Individuals"}
              </h2>
              {sanctionData?.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {activeTab === "extended"
                    ? extendedCount?.count || 0
                    : individualsCount?.count || 0}{" "}
                  entries
                </Badge>
              )}
            </div>

            {isLoading ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100">
                        <TableHead className="font-semibold text-slate-700">
                          Name
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">
                          Type
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">
                          Location
                        </TableHead>
                        {activeTab === "individuals" && (
                          <TableHead className="font-semibold text-slate-700">
                            Nationality
                          </TableHead>
                        )}
                        <TableHead className="font-semibold text-slate-700">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...Array(10)].map((_, i) => (
                        <TableRow key={i} className="border-slate-100">
                          <TableCell>
                            <Skeleton className="h-4 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          {activeTab === "individuals" && (
                            <TableCell>
                              <Skeleton className="h-4 w-28" />
                            </TableCell>
                          )}
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-16" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : sanctionData?.length > 0 ? (
              <>
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                  <CardContent className="p-0">
                    <Table className="bg-white dark:bg-gray-900">
                      <TableHeader>
                        <TableRow className="border-slate-100 dark:border-slate-800">
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            Name
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            Type
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            Location
                          </TableHead>
                          {activeTab === "individuals" && (
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                              Nationality
                            </TableHead>
                          )}
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sanctionData.map((sanction: any) => {
                          const isIndividual = activeTab === "individuals";
                          let displayName: string | null = null;
                          if (
                            "fullName" in sanction &&
                            typeof sanction.fullName === "string"
                          ) {
                            displayName = sanction.fullName;
                          } else if (
                            "name" in sanction &&
                            typeof sanction.name === "string"
                          ) {
                            displayName = sanction.name;
                          }
                          const entityType =
                            sanction.entityType ||
                            sanction.designation ||
                            "N/A";
                          const location = isIndividual
                            ? sanction.individualAddress
                            : sanction.country;
                          const status = sanction.applicationStatus || "Active";

                          return (
                            <TableRow
                              key={sanction.id}
                              className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-gray-800"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {isIndividual ? (
                                    <User className="h-4 w-4 text-orange-500 dark:text-orange-300" />
                                  ) : (
                                    <Building2 className="h-4 w-4 text-red-500 dark:text-red-300" />
                                  )}
                                  <div>
                                    <div className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                                      {displayName || "N/A"}
                                    </div>
                                    {sanction.referenceNumber && (
                                      <div className="text-xs text-slate-500 dark:text-slate-400">
                                        Ref: {sanction.referenceNumber}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`${getEntityTypeColor(entityType)} text-xs border`}
                                >
                                  {entityType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-slate-400 dark:text-slate-300" />
                                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                                    {location || "N/A"}
                                  </span>
                                </div>
                              </TableCell>
                              {activeTab === "individuals" && (
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Flag className="h-3 w-3 text-slate-400 dark:text-slate-300" />
                                    <span className="text-slate-700 dark:text-slate-300">
                                      {sanction.nationality || "N/A"}
                                    </span>
                                  </div>
                                </TableCell>
                              )}
                              <TableCell>
                                <Badge
                                  className={`${getStatusColor(status)} text-xs border`}
                                >
                                  {status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSanction(sanction);
                                    setIsDialogOpen(true);
                                  }}
                                  className="h-8 px-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Results Count and Pagination */}
                <div className="flex items-center justify-between mt-8">
                  {/* Results Count - Left Side */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, activeTab === "extended" ? (extendedCount?.count || 0) : (individualsCount?.count || 0))} of{" "}
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {activeTab === "extended" ? (extendedCount?.count || 0) : (individualsCount?.count || 0)} results
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
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No sanctions found
                  </h3>
                  <p className="text-slate-600">
                    Try adjusting your search filters to find more entries.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Sanction Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                {selectedSanction && (
                  <>
                    <div
                      className={`p-2 bg-gradient-to-br ${getTabColor(activeTab)} rounded-lg`}
                    >
                      <ShieldAlert className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg dark:text-white">
                      {(() => {
                        if (
                          "name" in selectedSanction &&
                          selectedSanction.name
                        ) {
                          return selectedSanction.name;
                        } else if (
                          "fullName" in selectedSanction &&
                          selectedSanction.fullName
                        ) {
                          return selectedSanction.fullName;
                        }
                        return "Sanction Details";
                      })()}
                    </span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedSanction && (
              <div className="space-y-6">
                {/* Warning Banner */}
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Sanctioned Entity:</strong> This entry is subject to
                    legal restrictions. Consult legal counsel before any
                    business dealings.
                  </AlertDescription>
                </Alert>

                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {"entityType" in selectedSanction &&
                    selectedSanction.entityType && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Entity Type
                        </label>
                        <Badge
                          className={`mt-1 ${getEntityTypeColor(selectedSanction.entityType)}`}
                        >
                          {selectedSanction.entityType}
                        </Badge>
                      </div>
                    )}
                  {(("country" in selectedSanction &&
                    selectedSanction.country) ||
                    ("nationality" in selectedSanction &&
                      selectedSanction.nationality)) && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Location/Nationality
                      </label>
                      <p className="text-slate-900 dark:text-slate-100 mt-1">
                        {"country" in selectedSanction
                          ? selectedSanction.country
                          : selectedSanction.nationality}
                      </p>
                    </div>
                  )}
                  {"regionOrAddress" in selectedSanction &&
                    selectedSanction.regionOrAddress && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Region/Address
                        </label>
                        <p className="text-slate-900 dark:text-slate-100 mt-1">
                          {selectedSanction.regionOrAddress}
                        </p>
                      </div>
                    )}
                  {"listType" in selectedSanction &&
                    selectedSanction.listType && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          List Type
                        </label>
                        <p className="text-slate-900 dark:text-slate-100 mt-1">
                          {selectedSanction.listType}
                        </p>
                      </div>
                    )}
                </div>

                {/* Programs and Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {"programs" in selectedSanction &&
                    selectedSanction.programs && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Sanctions Programs
                        </label>
                        <p className="text-slate-900 dark:text-slate-100 mt-1">
                          {selectedSanction.programs}
                        </p>
                      </div>
                    )}
                  {"applicationStatus" in selectedSanction &&
                    selectedSanction.applicationStatus && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Application Status
                        </label>
                        <Badge
                          className={`mt-1 ${getStatusColor(selectedSanction.applicationStatus)}`}
                        >
                          {selectedSanction.applicationStatus}
                        </Badge>
                      </div>
                    )}
                </div>

                {/* Extended List Only: Created/Updated Dates */}
                {"createdAt" in selectedSanction &&
                  selectedSanction.createdAt && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Created At
                      </label>
                      <p className="text-slate-900 dark:text-slate-100 mt-1">
                        {formatDate(selectedSanction.createdAt.toString())}
                      </p>
                    </div>
                  )}
                {"updatedAt" in selectedSanction &&
                  selectedSanction.updatedAt && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Updated At
                      </label>
                      <p className="text-slate-900 dark:text-slate-100 mt-1">
                        {formatDate(selectedSanction.updatedAt.toString())}
                      </p>
                    </div>
                  )}

                {/* Individual specific details */}
                {activeTab === "individuals" &&
                  "individualDateOfBirth" in selectedSanction && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedSanction.individualDateOfBirth && (
                        <div>
                          <label className="text-sm font-medium text-slate-600">
                            Date of Birth
                          </label>
                          <p className="text-slate-900 dark:text-slate-100 mt-1">
                            {formatDate(selectedSanction.individualDateOfBirth)}
                          </p>
                        </div>
                      )}
                      {selectedSanction.individualPlaceOfBirth && (
                        <div>
                          <label className="text-sm font-medium text-slate-600">
                            Place of Birth
                          </label>
                          <p className="text-slate-900 dark:text-slate-100 mt-1">
                            {selectedSanction.individualPlaceOfBirth}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                {/* Dates and References */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {"listedOn" in selectedSanction &&
                    selectedSanction.listedOn && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Listed Date
                        </label>
                        <p className="text-slate-900 dark:text-slate-100 mt-1">
                          {formatDate(selectedSanction.listedOn)}
                        </p>
                      </div>
                    )}
                  {"referenceNumber" in selectedSanction &&
                    selectedSanction.referenceNumber && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Reference Number
                        </label>
                        <p className="text-slate-900 dark:text-slate-100 mt-1">
                          {selectedSanction.referenceNumber}
                        </p>
                      </div>
                    )}
                </div>

                {/* Addresses */}
                {(("regionOrAddress" in selectedSanction &&
                  selectedSanction.regionOrAddress) ||
                  ("individualAddress" in selectedSanction &&
                    selectedSanction.individualAddress)) && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Address
                    </label>
                    <p className="text-slate-900 dark:text-slate-100 mt-1">
                      {"regionOrAddress" in selectedSanction
                        ? selectedSanction.regionOrAddress
                        : selectedSanction.individualAddress}
                    </p>
                  </div>
                )}

                {/* Additional Information */}
                {(("title" in selectedSanction && selectedSanction.title) ||
                  ("designation" in selectedSanction &&
                    selectedSanction.designation &&
                    typeof selectedSanction.designation === "string")) && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Title/Designation
                    </label>
                    <p className="text-slate-900 dark:text-slate-100 mt-1">
                      {"title" in selectedSanction && selectedSanction.title
                        ? selectedSanction.title
                        : "designation" in selectedSanction &&
                            typeof selectedSanction.designation === "string" &&
                            selectedSanction.designation
                          ? selectedSanction.designation
                          : ""}
                    </p>
                  </div>
                )}

                {/* Comments */}
                {"comments" in selectedSanction &&
                  selectedSanction.comments && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Comments
                      </label>
                      <p className="text-slate-900 dark:text-slate-100 mt-1">
                        {selectedSanction.comments}
                      </p>
                    </div>
                  )}

                {/* Aliases */}
                {"individualAlias" in selectedSanction &&
                  selectedSanction.individualAlias && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Known Aliases
                      </label>
                      <p className="text-slate-900 dark:text-slate-100 mt-1">
                        {selectedSanction.individualAlias}
                      </p>
                    </div>
                  )}

                {/* Documents */}
                {"individualDocument" in selectedSanction &&
                  selectedSanction.individualDocument && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Identity Documents
                      </label>
                      <p className="text-slate-900 dark:text-slate-100 mt-1">
                        {selectedSanction.individualDocument}
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
