import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, FileText, Calendar, Globe, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XBRLApiResponse, XBRLFiling, XBRLEntity } from "@shared/schema";

interface FilterOptions {
  countries: { code: string; name: string }[];
  programmes: { code: string; name: string }[];
  success: boolean;
}

export function FinancialStatements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch filter options
  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: ["/api/filings/xbrl/filters"],
  });

  // Fetch XBRL filings
  const { data: filingsData, isLoading, error } = useQuery<XBRLApiResponse>({
    queryKey: ["/api/filings/xbrl", debouncedSearchTerm, selectedCountry, selectedProgramme, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
      if (selectedCountry && selectedCountry !== 'all') params.set('country', selectedCountry);
      if (selectedProgramme && selectedProgramme !== 'all') params.set('programme', selectedProgramme);
      
      const response = await fetch(`/api/filings/xbrl?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${response.status}: ${JSON.stringify(errorData)}`);
      }
      
      return response.json();
    },
  });

  const handleSearch = () => {
    setDebouncedSearchTerm(searchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Reset to first page when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Show a message when programme filter yields limited results
  const showLimitedResultsMessage = selectedProgramme === 'ESEF' && filingsData?.data && filingsData.data.length < 10;

  // Helper function to get entity name from included entities
  const getEntityName = (filing: XBRLFiling): string => {
    // Try to find entity in included entities using the relationship
    if (filing.relationships?.entity?.data?.id && filingsData?.included) {
      const entity = filingsData.included.find(
        (entity: XBRLEntity) => entity.id === filing.relationships?.entity?.data?.id
      );
      return entity?.attributes.name || 'Unknown Entity';
    }
    
    return 'Unknown Entity';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getLanguageDisplayName = (filing: XBRLFiling | undefined) => {
    if (!filing?.attributes?.country) return 'Unknown';
    
    // XBRL API doesn't provide direct language field in filing attributes
    // Infer language from country information
    const country = filing.attributes.country?.toUpperCase();
    
    // Language mapping based on country
    const countryLanguageMap: { [key: string]: string } = {
      'GB': 'English',
      'UK': 'English', 
      'FR': 'French',
      'DE': 'German',
      'ES': 'Spanish',
      'IT': 'Italian',
      'NL': 'Dutch',
      'DK': 'Danish',
      'SE': 'Swedish',
      'NO': 'Norwegian',
      'FI': 'Finnish',
      'PT': 'Portuguese',
      'SI': 'Slovenian',
      'BE': 'Dutch/French',
      'LU': 'French/German',
      'IE': 'English',
      'UA': 'Ukrainian'
    };
    
    return countryLanguageMap[country || ''] || 'Unknown';
  };

  const getCountryDisplayName = (countryCode: string | undefined) => {
    if (!countryCode) return 'Unknown';
    
    const countries: { [key: string]: string } = {
      'GB': 'United Kingdom',
      'FR': 'France',
      'DE': 'Germany',
      'ES': 'Spain',
      'IT': 'Italy',
      'NL': 'Netherlands',
      'DK': 'Denmark',
      'SE': 'Sweden',
      'NO': 'Norway',
      'FI': 'Finland',
      'PT': 'Portugal',
      'SI': 'Slovenia',
      'BE': 'Belgium',
      'LU': 'Luxembourg',
      'IE': 'Ireland',
      'UA': 'Ukraine'
    };
    return countries[countryCode.toUpperCase()] || countryCode.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Financial Statements
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Browse XBRL financial filings from companies across Europe and beyond
          </p>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                Search
              </Button>
            </div>
            
            {/* Filter Dropdowns */}
            <div className="flex gap-2">
              <Select value={selectedProgramme} onValueChange={(value) => {
                setSelectedProgramme(value);
                handleFilterChange();
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Programme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programmes</SelectItem>
                  {filterOptions?.programmes?.map((programme) => (
                    <SelectItem key={programme.code} value={programme.code}>
                      {programme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedCountry} onValueChange={(value) => {
                setSelectedCountry(value);
                handleFilterChange();
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {filterOptions?.countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading financial statements...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Failed to load financial statements</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          ) : !filingsData?.data || filingsData.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No financial statements found</p>
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-blue-600 text-white rounded-t-lg">
                <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium">
                  <div className="col-span-3">ENTITY</div>
                  <div className="col-span-1 text-center">LANGUAGE</div>
                  <div className="col-span-2 text-center">COUNTRY</div>
                  <div className="col-span-2 text-center">PERIOD ENDING</div>
                  <div className="col-span-2 text-center">DATE ADDED</div>
                  <div className="col-span-2 text-center">VIEW</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg">
                {filingsData.data.map((filing: XBRLFiling, index: number) => (
                  <div key={filing.id} className={`grid grid-cols-12 gap-4 p-4 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}`}>
                    {/* Entity Name */}
                    <div className="col-span-3 font-medium text-gray-900 dark:text-gray-100">
                      {getEntityName(filing)}
                    </div>
                    
                    {/* Language */}
                    <div className="col-span-1 text-center">
                      <Badge variant="outline" className="text-xs">
                        {getLanguageDisplayName(filing)}
                      </Badge>
                    </div>
                    
                    {/* Country */}
                    <div className="col-span-2 text-center">
                      <Badge variant="secondary" className="text-xs">
                        {getCountryDisplayName(filing.attributes.country)}
                      </Badge>
                    </div>
                    
                    {/* Period Ending */}
                    <div className="col-span-2 text-center text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(filing.attributes.period_end || filing.attributes.period_ending || '')}
                      </div>
                    </div>
                    
                    {/* Date Added */}
                    <div className="col-span-2 text-center text-gray-600 dark:text-gray-400">
                      {formatDate(filing.attributes.date_added)}
                    </div>
                    
                    {/* View Link */}
                    <div className="col-span-2 text-center">
                      <a
                        href={filing.attributes.viewer_url ? `https://filings.xbrl.org${filing.attributes.viewer_url}` : filing.attributes.package_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {filingsData && (filingsData.meta || filingsData.links) && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {filingsData?.meta?.count ? (
                      <>
                        Page {currentPage} of {Math.ceil(filingsData.meta.count / pageSize)} 
                        ({filingsData.meta.count.toLocaleString()} total filings)
                      </>
                    ) : (
                      <>Page {currentPage} ({filingsData?.data?.length || 0} filings)</>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1 || isLoading}
                    >
                      Previous
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!filingsData.links?.next || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}