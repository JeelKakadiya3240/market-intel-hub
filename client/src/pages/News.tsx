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
  Eye,
  Newspaper,
  TrendingUp,
  Globe,
  Users,
  Building2,
  Target,
  MapPin,
  Calendar,
  Star,
  BarChart3,
  ExternalLink,
  Clock,
  BookOpen,
  FileText,
  Rss,
  Filter,
  Activity,
  Bookmark,
} from "lucide-react";

interface NewsFilters {
  search: string;
  category: string;
  source: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  source: string;
  url: string;
  tags: string[];
  readTime: number;
  imageUrl?: string;
}

export default function News() {
  const [filters, setFilters] = useState<NewsFilters>({
    search: "",
    category: "all",
    source: "all",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 12,
  });
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch news data from API
  const { data: newsData, isLoading } = useQuery({
    queryKey: ["/api/news", filters, pagination.page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", pagination.limit.toString());
      params.set(
        "offset",
        ((pagination.page - 1) * pagination.limit).toString(),
      );
      if (filters.search) params.set("search", filters.search);
      if (filters.category !== "all") params.set("category", filters.category);
      if (filters.source !== "all") params.set("source", filters.source);

      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) throw new Error("Failed to fetch news");
      return response.json();
    },
  });

  const { data: newsStats } = useQuery({
    queryKey: ["/api/news/stats"],
    queryFn: async () => {
      const response = await fetch("/api/news/stats");
      if (!response.ok) throw new Error("Failed to fetch news stats");
      return response.json();
    },
  });

  // Fetch dynamic source options
  const { data: sourceOptions } = useQuery({
    queryKey: ["/api/news/sources"],
    queryFn: async () => {
      const response = await fetch("/api/news/sources");
      if (!response.ok) throw new Error("Failed to fetch news sources");
      return response.json();
    },
  });

  const handleFilterChange = (key: keyof NewsFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Funding":
        return "bg-green-100 text-green-700 border-green-200";
      case "Market Analysis":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Accelerators":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Climate Tech":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "M&A":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Funding":
        return TrendingUp;
      case "Market Analysis":
        return BarChart3;
      case "Accelerators":
        return Rss;
      case "Climate Tech":
        return Globe;
      case "M&A":
        return Building2;
      default:
        return FileText;
    }
  };

  const renderNewsCard = (article: NewsArticle) => {
    const CategoryIcon = getCategoryIcon(article.category);
    const categoryColor = getCategoryColor(article.category);

    return (
      <Card
        key={article.id}
        className="border-0 shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
        onClick={() => {
          setSelectedArticle(article);
          setIsDialogOpen(true);
        }}
      >
        <CardContent className="p-0">
          {/* Article Image */}
          {article.imageUrl ? (
            <div className="relative h-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-t-lg overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden",
                  );
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center hidden">
                <Newspaper className="h-12 w-12 text-white/70" />
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className={`${categoryColor} text-xs`}>
                  <CategoryIcon className="h-3 w-3 mr-1" />
                  {article.category}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="relative h-48 bg-gradient-to-br from-orange-500 to-red-600 rounded-t-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Newspaper className="h-12 w-12 text-white/70" />
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className={`${categoryColor} text-xs`}>
                  <CategoryIcon className="h-3 w-3 mr-1" />
                  {article.category}
                </Badge>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6 bg-white dark:bg-gray-900/80 backdrop-blur">
            <div className="flex text-slate-900 dark:text-white items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                <span className="font-medium">{article.source}</span>
                <span>•</span>
                <span>{formatDate(article.publishedAt)}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{article.readTime} min read</span>
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

            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
              {article.summary}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {article.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs dark:text-white"
                >
                  {tag}
                </Badge>
              ))}
              {article.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs dark:text-white">
                  +{article.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Read More Link */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 dark:text-white dark:hover:text-slate-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3 dark:text-white" />
                Read Full Article
              </a>

              <Bookmark className="h-4 w-4 text-slate-400 dark:text-slate-300 hover:text-slate-600 transition-colors cursor-pointer" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const articles = newsData?.articles || [];
  const totalPages = Math.ceil((newsData?.total || 0) / pagination.limit);

  return (
    <AppLayout
      title="News"
      subtitle="Latest news and insights from the startup world"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
            News
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium">
            Stay updated with the latest news in the ecosystem
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-0 shadow-lg bg-card/80 dark:bg-gray-900/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Total Articles
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {newsStats?.totalArticles || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/80 dark:bg-gray-900/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Funding News
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {newsStats?.fundingNews || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/80 dark:bg-gray-900/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-orange-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  M&A Deals
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {newsStats?.maDeals || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/80 dark:bg-gray-900/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Rss className="h-4 w-4 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Sources
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {newsStats?.sources || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg bg-card/80 dark:bg-gray-900/80 backdrop-blur mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search news articles..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 border-slate-200 focus:border-gray-400 focus:ring-gray-400/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger className="w-full sm:w-48 border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Funding">Funding</SelectItem>
                  <SelectItem value="Market Analysis">
                    Market Analysis
                  </SelectItem>
                  <SelectItem value="Accelerators">Accelerators</SelectItem>
                  <SelectItem value="Climate Tech">Climate Tech</SelectItem>
                  <SelectItem value="M&A">M&A</SelectItem>
                </SelectContent>
              </Select>

              {/* Source Filter */}
              <Select
                value={filters.source}
                onValueChange={(value) => handleFilterChange("source", value)}
              >
                <SelectTrigger className="w-full sm:w-48 border-slate-200">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sourceOptions?.map((source: string) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* News Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Latest Articles
            </h2>
            {articles.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {newsData?.total || 0} articles
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur"
                >
                  <CardContent className="p-4 sm:p-6">
                    <Skeleton className="h-40 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {articles.map(renderNewsCard)}
              </div>

              {/* Results Count and Pagination */}
              <div className="flex items-center justify-between mt-8">
                {/* Results Count - Left Side */}
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, newsData?.total || 0)} of{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {newsData?.total || 0} results
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
                              pageNum === pagination.page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={
                              pageNum === pagination.page
                                ? "bg-gradient-to-r from-gray-600 to-slate-700"
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
                <Newspaper className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  News Service Not Available
                </h3>
                <p className="text-slate-600">
                  News data requires API integration with external providers.
                  Configure news sources in the backend to display articles.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Article Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                {selectedArticle && (
                  <>
                    <div className="p-2 bg-gradient-to-br from-gray-600 to-slate-700 rounded-lg">
                      <Newspaper className="h-5 w-5 text-white" />
                    </div>
                    <span className="dark:text-white">
                      {selectedArticle.title}
                    </span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedArticle && (
              <div className="space-y-6 dark:text-white">
                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-white">
                  <div className="flex items-center gap-2">
                    <span className="font-medium dark:text-white">
                      {selectedArticle.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="dark:text-white">
                      {formatDate(selectedArticle.publishedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="dark:text-white">
                      {selectedArticle.readTime} min read
                    </span>
                  </div>
                  <Badge
                    className={
                      getCategoryColor(selectedArticle.category) +
                      " dark:text-black"
                    }
                  >
                    {selectedArticle.category}
                  </Badge>
                </div>

                {/* Article Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Summary
                  </h3>
                  <p className="text-slate-700 dark:text-white leading-relaxed">
                    {selectedArticle.summary}
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm dark:text-white"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* External Link */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-white dark:visited:text-white dark:active:text-white dark:focus:text-white hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Read Full Article on {selectedArticle.source}
                  </a>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
