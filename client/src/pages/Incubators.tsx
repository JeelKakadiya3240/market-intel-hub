import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Building2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Target,
  Globe,
  Clock,
  Award,
  Briefcase,
  ExternalLink,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Incubator } from "@shared/schema";

const ITEMS_PER_PAGE = 25;

export default function Incubators() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [programTypeFilter, setProgramTypeFilter] = useState("all");
  const [selectedIncubator, setSelectedIncubator] = useState<Incubator | null>(
    null,
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Debug environment variable
  console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);

  const { data: incubators = [], isLoading } = useQuery({
    queryKey: [
      "/api/incubators",
      currentPage,
      searchQuery,
      countryFilter,
      programTypeFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(countryFilter !== "all" && { country: countryFilter }),
        ...(programTypeFilter !== "all" && { programType: programTypeFilter }),
      });

      const response = await fetch(`/api/incubators?${params}`);
      if (!response.ok) throw new Error("Failed to fetch incubators");
      const data = await response.json();
      console.log("Incubators data received:", data.slice(0, 3)); // Log first 3 items
      return data as Promise<Incubator[]>;
    },
  });

  const { data: totalCount = 0 } = useQuery({
    queryKey: [
      "/api/incubators/count",
      searchQuery,
      countryFilter,
      programTypeFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(countryFilter !== "all" && { country: countryFilter }),
        ...(programTypeFilter !== "all" && { programType: programTypeFilter }),
      });

      const response = await fetch(`/api/incubators/count?${params}`);
      if (!response.ok) throw new Error("Failed to fetch count");
      const data = await response.json();
      return data.count;
    },
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCountryFilter("all");
    setProgramTypeFilter("all");
    setCurrentPage(1);
  };

  const handleRowClick = (incubator: Incubator) => {
    setSelectedIncubator(incubator);
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedIncubator(null);
  };

  const getIncubatorImage = (
    imagePath: string | null | undefined,
    name: string | null | undefined,
  ) => {
    console.log("getIncubatorImage called with:", { imagePath, name });

    if (!imagePath || imageErrors.has(imagePath)) {
      console.log("Returning fallback for:", imagePath);
      return (
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
          {name?.charAt(0)?.toUpperCase() || "I"}
        </div>
      );
    }

    // Patch: If imagePath is just a number, add .jpg
    let imageUrl = imagePath;
    if (/^\d+$/.test(imagePath)) {
      imageUrl = `${imagePath}.jpg`;
    }
    if (imageUrl.startsWith("/storage/")) {
      imageUrl = `${import.meta.env.VITE_SUPABASE_URL}${imageUrl}`;
    } else if (imageUrl.startsWith("http")) {
      // do nothing
    } else {
      imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/incubators-images/images/${imageUrl}`;
    }

    console.log("Constructed image URL:", imageUrl);

    return (
      <>
        <img
          src={imageUrl}
          alt={`${name} logo`}
          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
          onError={() => {
            console.log("Image failed to load:", imageUrl);
            setImageErrors(
              (prev) => new Set(Array.from(prev).concat([imagePath!])),
            );
          }}
          onLoad={() => console.log("Image loaded successfully:", imageUrl)}
          style={{ display: imageErrors.has(imagePath!) ? "none" : "block" }}
        />
        {imageErrors.has(imagePath!) && (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
            {name?.charAt(0)?.toUpperCase() || "I"}
          </div>
        )}
      </>
    );
  };

  const formatFunding = (value: string | null | undefined) => {
    if (!value) return "N/A";
    return value;
  };

  const formatNumber = (value: number | null | undefined) => {
    if (!value) return "N/A";
    return value.toLocaleString();
  };

  const truncateText = (
    text: string | null | undefined,
    maxLength: number = 100,
  ) => {
    if (!text) return "N/A";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const filterImageFilenames = (text: string | null | undefined) => {
    if (!text) return null;
    // Filter out common image filename patterns
    if (/^\d+\.(jpg|jpeg|png|gif|webp)$/i.test(text)) {
      return null;
    }
    return text;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Incubators</h1>
              <p className="text-muted-foreground">
                Explore {totalCount.toLocaleString()} startup incubator and
                accelerator programs worldwide
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
            <CardDescription>
              Find incubators by name, description, location, program type, or
              focus areas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search incubators by name, description, or categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit">Search</Button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Netherlands">Netherlands</SelectItem>
                  <SelectItem value="Singapore">Singapore</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Israel">Israel</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="Brazil">Brazil</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Sweden">Sweden</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                  <SelectItem value="Ireland">Ireland</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                  <SelectItem value="Belgium">Belgium</SelectItem>
                  <SelectItem value="Denmark">Denmark</SelectItem>
                  <SelectItem value="Norway">Norway</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={programTypeFilter}
                onValueChange={setProgramTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Program Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Accelerator">Accelerator</SelectItem>
                  <SelectItem value="Incubator">Incubator</SelectItem>
                  <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Incubator Programs</CardTitle>
            <CardDescription>
              Comprehensive directory of startup incubators and accelerator
              programs
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px] whitespace-nowrap">
                        Program
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Location
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Type & Duration
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Funding
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Focus Areas
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Performance
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incubators.map((incubator) => (
                      <TableRow
                        key={incubator.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleRowClick(incubator)}
                      >
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {getIncubatorImage(
                                incubator.image,
                                incubator.name,
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm leading-tight">
                                {incubator.name || "Unnamed Program"}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {truncateText(
                                  incubator.shortDescription || "",
                                  80,
                                )}
                              </div>
                              {incubator.website && (
                                <a
                                  href={incubator.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mt-1"
                                >
                                  <Globe className="h-3 w-3" />
                                  Website
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">
                                {(() => {
                                  const country = incubator.country || "N/A";
                                  // If multiple countries, show only the first meaningful one
                                  if (country.includes(" ") && !country.startsWith("United")) {
                                    const countries = country.split(/[\s,]+/).filter(c => c.length > 2);
                                    return countries[0] || "N/A";
                                  }
                                  // Handle "United States" and "United Kingdom" specifically
                                  if (country.startsWith("United")) {
                                    if (country.includes("States")) return "United States";
                                    if (country.includes("Kingdom")) return "United Kingdom";
                                    return country.split(" ").slice(0, 2).join(" ");
                                  }
                                  return country;
                                })()}
                              </span>
                            </div>
                            {filterImageFilenames(incubator.cityState) && (
                              <div className="text-xs text-muted-foreground">
                                {filterImageFilenames(incubator.cityState)}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              {incubator.programType || "Program"}
                            </Badge>
                            {incubator.duration && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {incubator.duration}
                              </div>
                            )}
                            {incubator.cohortsPerYear && (
                              <div className="text-xs text-muted-foreground">
                                {incubator.cohortsPerYear} cohorts/year
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            {incubator.fundingType && (
                              <Badge variant="outline" className="text-xs">
                                {incubator.fundingType}
                              </Badge>
                            )}
                            {incubator.offer && (
                              <div className="text-xs text-muted-foreground">
                                {truncateText(incubator.offer, 50)}
                              </div>
                            )}
                            {incubator.programFee && (
                              <div className="text-xs text-orange-600">
                                Fee: {incubator.programFee}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            {incubator.categories && (
                              <div className="text-xs text-muted-foreground">
                                {truncateText(incubator.categories, 60)}
                              </div>
                            )}
                            {incubator.startupsPerCohort && (
                              <div className="flex items-center gap-1 text-xs">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                {incubator.startupsPerCohort} per cohort
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            {incubator.crunchbaseRank && (
                              <div className="flex items-center gap-1 text-xs">
                                <Award className="h-3 w-3 text-muted-foreground" />
                                Rank #{incubator.crunchbaseRank}
                              </div>
                            )}
                            {incubator.startupsInvested && (
                              <div className="text-xs text-green-600">
                                {formatNumber(incubator.startupsInvested)}{" "}
                                invested
                              </div>
                            )}
                            {incubator.exits && (
                              <div className="text-xs text-blue-600">
                                {formatNumber(incubator.exits)} exits
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            {incubator.applicationStatus && (
                              <Badge
                                variant={
                                  incubator.applicationStatus
                                    .toLowerCase()
                                    .includes("open")
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {incubator.applicationStatus}
                              </Badge>
                            )}
                            {incubator.applicationDeadline && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                Deadline: {incubator.applicationDeadline}
                              </div>
                            )}
                            {incubator.startDate && (
                              <div className="text-xs text-muted-foreground">
                                Starts: {incubator.startDate}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count and Pagination */}
        <div className="flex items-center justify-between">
          {/* Results Count - Left Side */}
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
            <span className="font-medium text-foreground">
              {totalCount.toLocaleString()} results
            </span>
          </div>

          {/* Pagination Controls - Right Side */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
                {selectedIncubator && (
                  <>
                    {getIncubatorImage(
                      selectedIncubator.image,
                      selectedIncubator.name,
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {selectedIncubator.name}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {selectedIncubator.country}
                      </p>
                    </div>
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-300">
                Comprehensive incubator program details and metrics
              </DialogDescription>
            </DialogHeader>

            {selectedIncubator && (
              <div className="space-y-6 text-slate-900 dark:text-white">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                        Program Overview
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-900 dark:text-white">
                          {selectedIncubator.shortDescription ||
                            selectedIncubator.description}
                        </p>
                        {selectedIncubator.website && (
                          <a
                            href={selectedIncubator.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Globe className="h-4 w-4" />
                            Visit Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                        Program Details
                      </h3>
                      <div className="space-y-2">
                        {selectedIncubator.programType && (
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <span className="text-sm text-slate-900 dark:text-white">
                              Type: {selectedIncubator.programType}
                            </span>
                          </div>
                        )}
                        {selectedIncubator.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <span className="text-sm text-slate-900 dark:text-white">
                              Duration: {selectedIncubator.duration}
                            </span>
                          </div>
                        )}
                        {selectedIncubator.cohortsPerYear && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <span className="text-sm text-slate-900 dark:text-white">
                              Cohorts per year:{" "}
                              {selectedIncubator.cohortsPerYear}
                            </span>
                          </div>
                        )}
                        {selectedIncubator.startupsPerCohort && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <span className="text-sm text-slate-900 dark:text-white">
                              Startups per cohort:{" "}
                              {selectedIncubator.startupsPerCohort}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                        Location & Contact
                      </h3>
                      <div className="space-y-2">
                        {selectedIncubator.country && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <span className="text-sm text-slate-900 dark:text-white">
                              {selectedIncubator.country}
                            </span>
                          </div>
                        )}
                        {filterImageFilenames(selectedIncubator.cityState) && (
                          <div className="text-sm text-slate-600 dark:text-slate-300 ml-6">
                            {filterImageFilenames(selectedIncubator.cityState)}
                          </div>
                        )}
                        {selectedIncubator.found && (
                          <div className="text-sm text-slate-900 dark:text-white">
                            <span className="font-medium">Founded:</span>{" "}
                            {selectedIncubator.found}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                        Performance Metrics
                      </h3>
                      <div className="space-y-2">
                        {selectedIncubator.crunchbaseRank && (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <span className="text-sm text-slate-900 dark:text-white">
                              Crunchbase Rank: #
                              {selectedIncubator.crunchbaseRank}
                            </span>
                          </div>
                        )}
                        {selectedIncubator.startupsInvested && (
                          <div className="text-sm text-slate-900 dark:text-white">
                            <span className="font-medium text-green-600 dark:text-green-400">
                              Startups Invested:
                            </span>{" "}
                            {formatNumber(selectedIncubator.startupsInvested)}
                          </div>
                        )}
                        {selectedIncubator.exits && (
                          <div className="text-sm text-slate-900 dark:text-white">
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              Exits:
                            </span>{" "}
                            {formatNumber(selectedIncubator.exits)}
                          </div>
                        )}
                        {selectedIncubator.alumniStartups && (
                          <div className="text-sm text-slate-900 dark:text-white">
                            <span className="font-medium">
                              Alumni Startups:
                            </span>{" "}
                            {formatNumber(selectedIncubator.alumniStartups)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Funding Information */}
                <div>
                  <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-3">
                    Funding & Investment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedIncubator.fundingType && (
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="font-medium text-sm text-slate-900 dark:text-white">
                            Funding Type
                          </span>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {selectedIncubator.fundingType}
                        </p>
                      </div>
                    )}
                    {selectedIncubator.offer && (
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="font-medium text-sm text-slate-900 dark:text-white">
                            Offer
                          </span>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {selectedIncubator.offer}
                        </p>
                      </div>
                    )}
                    {selectedIncubator.programFee && (
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="font-medium text-sm text-slate-900 dark:text-white">
                            Program Fee
                          </span>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {selectedIncubator.programFee}
                        </p>
                      </div>
                    )}
                    {selectedIncubator.investmentsPerYear && (
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="font-medium text-sm text-slate-900 dark:text-white">
                            Investments/Year
                          </span>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {selectedIncubator.investmentsPerYear}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories & Application */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedIncubator.categories && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                        Focus Areas
                      </h3>
                      <p className="text-sm text-slate-900 dark:text-white">
                        {selectedIncubator.categories}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                      Application Status
                    </h3>
                    <div className="space-y-2">
                      {selectedIncubator.applicationStatus && (
                        <Badge
                          variant={
                            selectedIncubator.applicationStatus
                              .toLowerCase()
                              .includes("open")
                              ? "default"
                              : "secondary"
                          }
                        >
                          {selectedIncubator.applicationStatus}
                        </Badge>
                      )}
                      {selectedIncubator.applicationDeadline && (
                        <div className="text-sm text-slate-900 dark:text-white">
                          <span className="font-medium">Deadline:</span>{" "}
                          {selectedIncubator.applicationDeadline}
                        </div>
                      )}
                      {selectedIncubator.startDate && (
                        <div className="text-sm text-slate-900 dark:text-white">
                          <span className="font-medium">Start Date:</span>{" "}
                          {selectedIncubator.startDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {(selectedIncubator.offerDetails ||
                  selectedIncubator.otherBenefits ||
                  selectedIncubator.visaAndRelocationSupport) && (
                  <div>
                    <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-3">
                      Additional Information
                    </h3>
                    <div className="space-y-3">
                      {selectedIncubator.offerDetails && (
                        <div>
                          <h4 className="font-medium text-sm mb-1 text-slate-900 dark:text-white">
                            Offer Details
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {selectedIncubator.offerDetails}
                          </p>
                        </div>
                      )}
                      {selectedIncubator.otherBenefits && (
                        <div>
                          <h4 className="font-medium text-sm mb-1 text-slate-900 dark:text-white">
                            Other Benefits
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {selectedIncubator.otherBenefits}
                          </p>
                        </div>
                      )}
                      {selectedIncubator.visaAndRelocationSupport && (
                        <div>
                          <h4 className="font-medium text-sm mb-1 text-slate-900 dark:text-white">
                            Visa & Relocation Support
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {selectedIncubator.visaAndRelocationSupport}
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
