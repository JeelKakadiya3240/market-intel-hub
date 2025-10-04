import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Building2, 
  Users, 
  DollarSign, 
  Globe, 
  MapPin,
  Calendar,
  Wifi,
  Code,
  Star,
  ExternalLink,
  Check,
  X,
  Eye,
  Linkedin,
  Twitter,
  Facebook,
  Clock,
  BarChart3,
  Briefcase,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CompaniesApiCompany, CompaniesApiResponse } from "@shared/types/companiesApi";

interface SearchCondition {
  attribute: string;
  operator: 'or' | 'and';
  sign: 'equals' | 'exactEquals' | 'greater' | 'lower' | 'notEquals';
  values: string[];
}

interface CompaniesTableProps {
  searchQuery?: string;
  isSearching?: boolean;
  searchConditions?: SearchCondition[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onResultsCountChange?: (count: number, hasSearch: boolean) => void;
}

export function CompaniesTable({ 
  searchQuery, 
  isSearching = false, 
  searchConditions = [], 
  currentPage = 1, 
  onPageChange = () => {},
  onResultsCountChange = () => {}
}: CompaniesTableProps) {
  const [selectedCompany, setSelectedCompany] = useState<CompaniesApiCompany | null>(null);

  const hasConditions = searchConditions.length > 0;
  const hasSearchQuery = !!searchQuery && searchQuery.trim().length > 0;

  // Query for external companies using conditions
  const { data: conditionsData, isLoading: conditionsLoading, error: conditionsError } = useQuery<CompaniesApiResponse>({
    queryKey: ["/api/companies/external/conditions", searchConditions, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        conditions: JSON.stringify(searchConditions),
        page: currentPage.toString(),
        pageSize: "20"
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://market-intel-hub-henrikfennefos2.replit.app'}/api/companies/external/conditions?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${response.status}: ${JSON.stringify(errorData)}`);
      }
      
      return response.json();
    },
    enabled: hasConditions,
  });

  // Query for external companies using search prompt (with conditions if available)
  const { data: searchData, isLoading: searchLoading, error: searchError } = useQuery<CompaniesApiResponse>({
    queryKey: ["/api/companies/external/search", searchQuery, searchConditions, currentPage],
    queryFn: async () => {
      // If we have both search and conditions, use the conditions endpoint with search as a condition
      if (hasConditions && searchConditions.length > 0) {
        // Add search prompt as a general search condition
        const searchWithConditions = [
          ...searchConditions,
          {
            attribute: "ai.search",
            operator: "or",
            sign: "equals",
            values: [searchQuery!]
          }
        ];
        
        const params = new URLSearchParams({
          conditions: JSON.stringify(searchWithConditions),
          page: currentPage.toString(),
          pageSize: "20"
        });
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://market-intel-hub-henrikfennefos2.replit.app'}/api/companies/external/conditions?${params}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`${response.status}: ${JSON.stringify(errorData)}`);
        }
        
        return response.json();
      } else {
        // Use regular search endpoint
        const params = new URLSearchParams({
          prompt: searchQuery!,
          page: currentPage.toString(),
          pageSize: "20"
        });
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://market-intel-hub-henrikfennefos2.replit.app'}/api/companies/external/search?${params}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`${response.status}: ${JSON.stringify(errorData)}`);
        }
        
        return response.json();
      }
    },
    enabled: hasSearchQuery, // Use search when there's a query, may include conditions
  });

  // Use appropriate data source (search query takes precedence and may include conditions)
  const companiesData = hasSearchQuery ? searchData : conditionsData;
  const isLoading = hasSearchQuery ? searchLoading : conditionsLoading;
  const error = hasSearchQuery ? searchError : conditionsError;

  // Update parent with results count when data changes
  useEffect(() => {
    if (companiesData?.companies) {
      const hasActiveSearch = hasSearchQuery || hasConditions;
      onResultsCountChange(companiesData.companies.length, hasActiveSearch);
    } else if (error && !isLoading) {
      // Reset count when there's an error
      onResultsCountChange(0, hasSearchQuery || hasConditions);
    }
  }, [companiesData?.companies, hasSearchQuery, hasConditions, error, isLoading, onResultsCountChange]);

  const formatNumber = (num: number | null) => {
    if (!num || num === 0) return "-";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatRevenue = (revenue: string | null) => {
    if (!revenue || revenue === "-") return "-";
    return revenue.startsWith("$") ? revenue : `$${revenue}`;
  };

  const getBusinessTypeColor = (type: string | null) => {
    if (!type) return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    switch (type.toLowerCase()) {
      case "public":
      case "public company":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "private":
      case "private company":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "startup":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    }
  };

  if (isSearching || isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="grid grid-cols-4 gap-8 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    // Check if it's a "No companies found" error (404) and show a nice message
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNoResultsError = errorMessage?.includes('404') || 
                              errorMessage?.includes('No companies found') ||
                              errorMessage?.includes('matching your conditions');
    
    if (isNoResultsError) {
      return (
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No companies match your current search criteria. Try adjusting your filters or search terms.
            </p>
          </CardContent>
        </Card>
      );
    }
    
    // Show generic error for other types of errors
    return (
      <Card className="border border-red-200 dark:border-red-800">
        <CardContent className="p-8 text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <X className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Search Failed</h3>
            <p className="text-sm mt-2">
              {errorMessage || "An error occurred while searching for companies"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!companiesData?.companies?.length) {
    if (!searchQuery && !hasConditions) {
      return (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No Search Active
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Use the search bar above or set conditions to find companies
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border border-orange-200 dark:border-orange-800">
        <CardContent className="p-8 text-center">
          <div className="text-orange-600 dark:text-orange-400 mb-2">
            <Building2 className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Companies Found</h3>
            <p className="text-sm mt-2">
              Try a different search query or broaden your criteria
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Company Cards Layout */}
      <div className="grid gap-6">
        {companiesData.companies.map((company, index) => (
          <Card 
            key={company.id}
            className="border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-lg cursor-pointer"
            onClick={() => setSelectedCompany(company)}
          >
            <CardContent className="p-6">
              {/* Header Section with Name, Logo, and Basic Info */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={`${company.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<span class="text-white font-bold text-xl">${company.name?.charAt(0) || '?'}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {company.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                        {company.name || 'Unknown Company'}
                      </h3>
                      {company.website && (
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                    
                    {/* Data Score */}
                    {company.dataScore && (
                      <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                        <Star className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                          {company.dataScore}/100
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Industries */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {company.industries?.slice(0, 3).map((industry, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {industry}
                      </Badge>
                    ))}
                    {(company.industries?.length || 0) > 3 && (
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        +{(company.industries?.length || 0) - 3}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Application/Description */}
                  {company.application && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {company.application}
                    </p>
                  )}
                </div>
              </div>

              {/* Main Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                
                {/* Total Employees */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Total Employees
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {typeof company.totalEmployees === 'string' 
                      ? company.totalEmployees 
                      : company.totalEmployees 
                        ? formatNumber(company.totalEmployees)
                        : '-'
                    }
                  </div>
                </div>

                {/* Revenue */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Revenue
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatRevenue(company.revenue)}
                  </div>
                </div>

                {/* Monthly Visitors */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Monthly Visitors
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {company.monthlyVisitors ? formatNumber(company.monthlyVisitors) : '-'}
                  </div>
                </div>

                {/* Business Type */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Business Type
                    </span>
                  </div>
                  <Badge 
                    className={`${getBusinessTypeColor(company.businessType)} text-sm px-2 py-1`}
                  >
                    {company.businessType || 'Unknown'}
                  </Badge>
                </div>

              </div>

              {/* Location and Founding Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                
                {/* Location */}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {[company.city, company.country].filter(Boolean).join(', ') || 'Unknown'}
                  </span>
                </div>

                {/* Year Founded */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Founded:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {company.yearFounded || 'Unknown'}
                  </span>
                </div>
              
              </div>

              {/* Technologies */}
              {company.technologies && company.technologies.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Technologies:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {company.technologies.slice(0, 6).map((tech, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="text-xs px-2 py-1"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {company.technologies.length > 6 && (
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        +{company.technologies.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Social Networks and Last Sync */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                
                {/* Social Networks */}
                <div className="flex items-center gap-3">
                  {company.socialNetwork?.linkedin && (
                    <a 
                      href={company.socialNetwork.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Linkedin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </a>
                  )}
                  {company.socialNetwork?.twitter && (
                    <a 
                      href={company.socialNetwork.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Twitter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </a>
                  )}
                  {company.socialNetwork?.facebook && (
                    <a 
                      href={company.socialNetwork.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Facebook className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </a>
                  )}
                  {!company.socialNetwork?.linkedin && !company.socialNetwork?.twitter && !company.socialNetwork?.facebook && (
                    <span className="text-xs text-gray-400">No social networks</span>
                  )}
                </div>

                {/* Last Sync */}
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>Last sync: {company.lastSync ? new Date(company.lastSync).toLocaleDateString() : 'Unknown'}</span>
                </div>
              
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  {selectedCompany.logo ? (
                    <img 
                      src={selectedCompany.logo} 
                      alt={`${selectedCompany.name} logo`}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<span class="text-white font-bold text-2xl">${selectedCompany.name?.charAt(0) || '?'}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {selectedCompany.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                
                {/* Company Name and Info */}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedCompany.name}
                  </CardTitle>
                  {selectedCompany.website && (
                    <a 
                      href={selectedCompany.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline mb-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {selectedCompany.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.industries?.slice(0, 4).map((industry, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCompany(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                    Total Employees
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatNumber(selectedCompany.totalEmployees)}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-1">
                    Revenue
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatRevenue(selectedCompany.revenue)}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                    Monthly Visitors
                  </div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {formatNumber(selectedCompany.monthlyVisitors)}
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">
                    Data Score
                  </div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {selectedCompany.dataScore || "-"}
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Company Info</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Business Type</div>
                        <div className="font-medium">{selectedCompany.businessType || "Unknown"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Founded</div>
                        <div className="font-medium">{selectedCompany.yearFounded || "Unknown"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="font-medium">
                          {[selectedCompany.city, selectedCompany.country].filter(Boolean).join(", ") || "Unknown"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Industries & Technologies</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Industries</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCompany.industries.map((industry, i) => (
                          <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {selectedCompany.technologies.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Technologies</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedCompany.technologies.slice(0, 6).map((tech, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {selectedCompany.technologies.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{selectedCompany.technologies.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Networks and Application */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Social Networks */}
                {(selectedCompany.socialNetwork?.website || 
                  selectedCompany.socialNetwork?.linkedin || 
                  selectedCompany.socialNetwork?.twitter || 
                  selectedCompany.socialNetwork?.facebook) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Social Networks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.socialNetwork?.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={selectedCompany.socialNetwork.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Globe className="h-3 w-3" />
                            Website
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        </Button>
                      )}
                      {selectedCompany.socialNetwork?.linkedin && (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={selectedCompany.socialNetwork.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Linkedin className="h-3 w-3" />
                            LinkedIn
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        </Button>
                      )}
                      {selectedCompany.socialNetwork?.twitter && (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={selectedCompany.socialNetwork.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Twitter className="h-3 w-3" />
                            Twitter
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        </Button>
                      )}
                      {selectedCompany.socialNetwork?.facebook && (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={selectedCompany.socialNetwork.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Facebook className="h-3 w-3" />
                            Facebook
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {(selectedCompany.description || selectedCompany.application) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Company Description
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedCompany.description || selectedCompany.application}
                      </p>
                    </div>
                  </div>
                )}

                {/* Last Sync Information */}
                <div className="md:col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Last synchronized: {selectedCompany.lastSync ? new Date(selectedCompany.lastSync).toLocaleString() : 'Unknown'}</span>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pagination Controls */}
      {companiesData && (companiesData.pagination || (companiesData.total !== undefined && companiesData.page !== undefined)) && (
        <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3"
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            {(() => {
              // Handle both pagination formats
              const pagination = companiesData.pagination || {
                page: companiesData.page || 1,
                pageSize: companiesData.pageSize || 20,
                total: companiesData.total || 0,
                hasMore: companiesData.hasMore || false
              };
              
              const totalPages = Math.ceil(pagination.total / pagination.pageSize);
              const maxVisiblePages = 5;
              const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
              const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
              
              return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const pageNum = startPage + i;
                const isActive = pageNum === currentPage;
                
                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={`w-10 ${isActive ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                  >
                    {pageNum}
                  </Button>
                );
              });
            })()}
            
            {/* Show "..." if there are more pages after visible range */}
            {(() => {
              // Handle both pagination formats
              const pagination = companiesData.pagination || {
                page: companiesData.page || 1,
                pageSize: companiesData.pageSize || 20,
                total: companiesData.total || 0,
                hasMore: companiesData.hasMore || false
              };
              
              const totalPages = Math.ceil(pagination.total / pagination.pageSize);
              const maxVisiblePages = 5;
              const endPage = Math.min(totalPages, Math.max(1, currentPage - Math.floor(maxVisiblePages / 2)) + maxVisiblePages - 1);
              
              return endPage < totalPages && (
                <span className="px-2 text-gray-500">...</span>
              );
            })()}
            
            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={(() => {
                const pagination = companiesData.pagination || {
                  page: companiesData.page || 1,
                  pageSize: companiesData.pageSize || 20,
                  total: companiesData.total || 0,
                  hasMore: companiesData.hasMore || false
                };
                
                const totalPages = Math.ceil(pagination.total / pagination.pageSize);
                return currentPage >= totalPages;
              })()}
              className="px-3"
            >
              Next
            </Button>
          </div>
          
          {/* Results Info */}
          <div className="ml-6 text-sm text-gray-500 dark:text-gray-400">
            {(() => {
              // Handle both pagination formats
              const pagination = companiesData.pagination || {
                page: companiesData.page || 1,
                pageSize: companiesData.pageSize || 20,
                total: companiesData.total || 0,
                hasMore: companiesData.hasMore || false
              };
              
              const totalPages = Math.ceil(pagination.total / pagination.pageSize);
              return `Showing page ${currentPage} of ${totalPages} (${pagination.total} total results)`;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}