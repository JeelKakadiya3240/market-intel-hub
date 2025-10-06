import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  Gift,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Banknote,
  ExternalLink,
  Calendar,
  Euro,
} from "lucide-react";
import { Grant } from "@shared/schema";

interface GrantFilters {
  search: string;
  status: string;
  programme: string;
  fundedUnder: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

export default function Grants() {
  const [filters, setFilters] = useState<GrantFilters>({
    search: "",
    status: "all",
    programme: "all",
    fundedUnder: "all",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
  });
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate offset for API calls
  const offset = (pagination.page - 1) * pagination.limit;

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("limit", pagination.limit.toString());
    params.set("offset", offset.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.programme !== "all") params.set("programme", filters.programme);
    if (filters.fundedUnder !== "all")
      params.set("fundedUnder", filters.fundedUnder);

    // Debug logging
    console.log("Grants query params:", {
      limit: pagination.limit,
      offset,
      filters,
      queryString: params.toString(),
    });

    return params.toString();
  };

  // Fetch grants data (no caching)
  const { data: grants, isLoading } = useQuery({
    queryKey: [
      "/api/grants",
      pagination.page,
      pagination.limit,
      filters.search,
      filters.status,
      filters.programme,
      filters.fundedUnder,
    ],
    queryFn: async () => {
      const response = await fetch(`/api/grants?${buildQueryParams()}`);
      if (!response.ok) throw new Error("Failed to fetch grants");
      return response.json();
    },
    staleTime: 0, // Disable caching for grants
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Debug logging for grants data
  useEffect(() => {
    if (grants && grants.length > 0) {
      console.log("=== GRANTS DEBUG ===");
      console.log("Grants data received:", grants.length, "grants");
      console.log("First 3 grants with full data:");
      grants.slice(0, 3).forEach((g: Grant, index: number) => {
        console.log(`Grant ${index + 1}:`, {
          id: g.id,
          title: g.title,
          status: g.status,
          programme: g.programme,
        });
      });

      // Test the filtering logic
      const activeGrants = grants.filter(
        (g: Grant) =>
          g.status?.toLowerCase().includes("signed") ||
          g.status?.toLowerCase().includes("ongoing") ||
          g.status?.toLowerCase().includes("active"),
      );
      const upcomingGrants = grants.filter(
        (g: Grant) =>
          g.status?.toLowerCase().includes("preparation") ||
          g.status?.toLowerCase().includes("pending") ||
          g.status?.toLowerCase().includes("upcoming"),
      );
      const terminatedGrants = grants.filter(
        (g: Grant) =>
          g.status?.toLowerCase().includes("terminated") ||
          g.status?.toLowerCase().includes("ended") ||
          g.status?.toLowerCase().includes("closed"),
      );

      // Show unique statuses
      const uniqueStatuses = Array.from(
        new Set(grants.map((g: Grant) => g.status).filter(Boolean)),
      );
      console.log("Unique statuses in current data:", uniqueStatuses);

      // Show count of each status
      const statusCounts: { [key: string]: number } = {};
      grants.forEach((g: Grant) => {
        if (g.status) {
          statusCounts[g.status] = (statusCounts[g.status] || 0) + 1;
        }
      });
      console.log("Status counts:", statusCounts);
      console.log("=== END GRANTS DEBUG ===");
    }
  }, [grants]);

  // Fetch grants count with filters (no caching)
  const { data: countData } = useQuery({
    queryKey: [
      "/api/grants/count",
      filters.search,
      filters.status,
      filters.programme,
      filters.fundedUnder,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.programme !== "all") params.set("programme", filters.programme);
      if (filters.fundedUnder !== "all") params.set("fundedUnder", filters.fundedUnder);
      
      const response = await fetch(`/api/grants/count?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch grants count");
      return response.json();
    },
    staleTime: 0, // Disable caching for grants count
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Fetch available programmes
  const { data: programmes = [] } = useQuery({
    queryKey: ["/api/grants/programmes"],
    queryFn: async () => {
      const response = await fetch("/api/grants/programmes");
      if (!response.ok) throw new Error("Failed to fetch programmes");
      return response.json();
    },
  });
  
  // Fetch available funded under options
  const { data: fundedUnderOptions = [] } = useQuery({
    queryKey: ["/api/grants/funded-under"],
    queryFn: async () => {
      const response = await fetch("/api/grants/funded-under");
      if (!response.ok) throw new Error("Failed to fetch funded under options");
      return response.json();
    },
  });
  
  // Fetch available status options
  const { data: statusOptions = [] } = useQuery({
    queryKey: ["/api/grants/statuses"],
    queryFn: async () => {
      const response = await fetch("/api/grants/statuses");
      if (!response.ok) throw new Error("Failed to fetch status options");
      return response.json();
    },
  });

  // Reset pagination when changing filters
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters]);

  const handleFilterChange = (key: keyof GrantFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatAmount = (amount: string | number | null | undefined) => {
    if (!amount) return "Not specified";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "Not specified";
    if (num >= 1000000) return `€${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `€${(num / 1000).toFixed(0)}K`;
    return `€${num.toLocaleString()}`;
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return null;
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj.getFullYear();
    } catch {
      return date?.toString();
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-slate-100 text-slate-700 border-slate-200";
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("signed") ||
      statusLower.includes("active") ||
      statusLower.includes("ongoing")
    ) {
      return "bg-green-100 text-green-700 border-green-200";
    }
    if (
      statusLower.includes("terminated") ||
      statusLower.includes("closed") ||
      statusLower.includes("ended")
    ) {
      return "bg-red-100 text-red-700 border-red-200";
    }
    if (
      statusLower.includes("preparation") ||
      statusLower.includes("pending")
    ) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getGrantInitials = (title: string | null | undefined) => {
    if (!title) return "GR";
    return title
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  // Calculate pagination
  const totalRecords = countData?.count || 0;
  const totalPages = Math.ceil(totalRecords / pagination.limit);
  const startRecord = (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, totalRecords);

  return (
    <AppLayout
      title="Grants"
      subtitle="Explore grant opportunities for startups and researchers"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
            Grants
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium">
            Discover and apply for grants in the ecosystem
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Gift className="h-4 w-4 text-emerald-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Total Grants
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {totalRecords.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Active
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {grants?.filter(
                  (g: Grant) =>
                    g.status?.toLowerCase().includes("signed") ||
                    g.status?.toLowerCase().includes("ongoing") ||
                    g.status?.toLowerCase().includes("active"),
                ).length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Upcoming
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {grants?.filter(
                  (g: Grant) =>
                    g.status?.toLowerCase().includes("preparation") ||
                    g.status?.toLowerCase().includes("pending") ||
                    g.status?.toLowerCase().includes("upcoming"),
                ).length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Terminated
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {grants?.filter(
                  (g: Grant) =>
                    g.status?.toLowerCase().includes("terminated") ||
                    g.status?.toLowerCase().includes("ended") ||
                    g.status?.toLowerCase().includes("closed"),
                ).length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur mb-8 mt-5">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search grants..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 border-slate-200 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="border-slate-200 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((status: string) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.programme}
                onValueChange={(value) =>
                  handleFilterChange("programme", value)
                }
              >
                <SelectTrigger className="border-slate-200 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Programme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programmes</SelectItem>
                  {programmes.map((programme: string) => (
                    <SelectItem key={programme} value={programme}>
                      {programme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.fundedUnder}
                onValueChange={(value) =>
                  handleFilterChange("fundedUnder", value)
                }
              >
                <SelectTrigger className="border-slate-200 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Funded Under" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {fundedUnderOptions.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grants Table */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-w-full">
              <Table className="bg-white dark:bg-gray-900 w-full">
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-800">
                    <TableHead className="py-4 text-slate-700 dark:text-slate-300 font-semibold w-[40%]">
                      Grant Title
                    </TableHead>
                    <TableHead className="py-4 text-slate-700 dark:text-slate-300 font-semibold w-[15%]">
                      Status
                    </TableHead>
                    <TableHead className="py-4 text-slate-700 dark:text-slate-300 font-semibold w-[15%]">
                      Budget
                    </TableHead>
                    <TableHead className="py-4 text-slate-700 dark:text-slate-300 font-semibold w-[15%]">
                      Programme
                    </TableHead>
                    <TableHead className="py-4 text-slate-700 dark:text-slate-300 font-semibold w-[10%]">
                      Start Year
                    </TableHead>
                    <TableHead className="text-center py-4 text-slate-700 dark:text-slate-300 font-semibold w-[5%]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(10)].map((_, i) => (
                      <TableRow
                        key={i}
                        className="border-slate-100 dark:border-slate-800"
                      >
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-16 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : grants?.length > 0 ? (
                    grants.map((grant: Grant) => (
                      <TableRow
                        key={grant.id}
                        className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                        onClick={() => {
                          setSelectedGrant(grant);
                          setIsDialogOpen(true);
                        }}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">
                                {getGrantInitials(grant.title)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 max-w-[300px]">
                              <div
                                className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors truncate"
                                title={grant.title || "Untitled Grant"}
                              >
                                {grant.title || "Untitled Grant"}
                              </div>
                              {grant.acronym && (
                                <div
                                  className="text-sm text-slate-500 dark:text-slate-400 truncate"
                                  title={grant.acronym}
                                >
                                  {grant.acronym}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={`border ${getStatusColor(grant.status)}`}
                          >
                            {grant.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm font-medium text-emerald-600">
                            {formatAmount(grant.overallBudget)}
                          </div>
                          {grant.euContribution && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              EU: {formatAmount(grant.euContribution)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {grant.programme || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {grant.startDate
                              ? formatDate(grant.startDate)
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGrant(grant);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <Gift className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          No grants found
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          Try adjusting your search filters to find more grant
                          opportunities.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {grants?.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Showing {startRecord.toLocaleString()}-
                  {endRecord.toLocaleString()} of{" "}
                  {totalRecords.toLocaleString()} grants
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum =
                        pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
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
                              ? "bg-emerald-600 hover:bg-emerald-700"
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grant Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                {selectedGrant && (
                  <>
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {getGrantInitials(selectedGrant.title)}
                      </span>
                    </div>
                    <span className="font-semibold text-lg dark:text-white">
                      {selectedGrant.title || "Grant Details"}
                    </span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedGrant && (
              <div className="space-y-6">
                {/* Grant Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Status
                    </label>
                    <Badge
                      className={`mt-1 ${getStatusColor(selectedGrant.status)}`}
                    >
                      {selectedGrant.status || "Unknown"}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Project ID
                    </label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {selectedGrant.projectId || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Budget Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedGrant.overallBudget && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Overall Budget
                      </label>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-white">
                        {formatAmount(selectedGrant.overallBudget)}
                      </p>
                    </div>
                  )}
                  {selectedGrant.euContribution && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        EU Contribution
                      </label>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatAmount(selectedGrant.euContribution)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Programme Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedGrant.programme && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Programme
                      </label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {selectedGrant.programme}
                      </p>
                    </div>
                  )}
                  {selectedGrant.fundedUnder && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Funded Under
                      </label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {selectedGrant.fundedUnder}
                      </p>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedGrant.startDate && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Start Date
                      </label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {selectedGrant.startDate instanceof Date
                          ? selectedGrant.startDate.toLocaleDateString()
                          : new Date(
                              selectedGrant.startDate,
                            ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedGrant.endDate && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        End Date
                      </label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {selectedGrant.endDate instanceof Date
                          ? selectedGrant.endDate.toLocaleDateString()
                          : new Date(
                              selectedGrant.endDate,
                            ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Coordination */}
                {selectedGrant.coordinatedBy && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Coordinated By
                    </label>
                    <p className="text-slate-900 dark:text-slate-100 mt-1">
                      {selectedGrant.coordinatedBy}
                    </p>
                  </div>
                )}

                {/* Objective */}
                {selectedGrant.objective && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Objective
                    </label>
                    <p className="text-slate-900 dark:text-slate-100 mt-1">
                      {selectedGrant.objective}
                    </p>
                  </div>
                )}

                {/* Additional Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedGrant.topic && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Topic
                      </label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {selectedGrant.topic}
                      </p>
                    </div>
                  )}
                  {selectedGrant.typeOfAction && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Type of Action
                      </label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {selectedGrant.typeOfAction}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
