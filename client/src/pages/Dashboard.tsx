import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  DollarSign,
  Building2,
  Zap,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Globe,
  Star,
  MoreVertical,
  PieChart,
  BarChart3,
  Activity,
  Target,
  TrendingDown,
  ExternalLink,
} from "lucide-react";


interface DashboardMetrics {
  totalCompanies: number;
  activeRounds: number;
  totalFunding: string;
  newUnicorns: number;
}

interface FundingRound {
  id: number;
  company: string | null;
  exitValue: string | null;
  exitDate: string | null;
  country: string | null;
}

interface Event {
  id: number;
  eventName: string | null;
  location: string | null;
  eventDate: string | null;
  eventType: string | null;
}

interface FundingAnalytics {
  totalFundingVolume: string;
  avgDealSize: string;
  totalExits: number;
  totalMegadeals: number;
  thisMonthFunding: string;
  topIndustries: Array<{ industry: string; count: number; volume: string }>;
  monthlyTrends: Array<{ month: string; volume: number; deals: number }>;
  recentMajorDeals: Array<{
    id: number;
    company: string;
    amount: string;
    type: string;
    date: string;
    industry?: string;
    leadInvestors?: string;
  }>;
}

interface FundingActivity {
  id: number;
  company: string;
  amount: string;
  type: "funding" | "exit" | "ma" | "megadeal";
  date: string;
  industry?: string;
  description: string;
}

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } =
    useQuery<DashboardMetrics>({
      queryKey: ["/api/dashboard/metrics"],
    });

  const { data: recentFunding, isLoading: fundingLoading } = useQuery<
    FundingRound[]
  >({
    queryKey: ["/api/dashboard/recent-funding"],
  });

  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/dashboard/upcoming-events"],
  });

  const { data: fundingAnalytics, isLoading: analyticsLoading } =
    useQuery<FundingAnalytics>({
      queryKey: ["/api/dashboard/funding-analytics"],
    });

  const { data: latestActivity, isLoading: activityLoading } = useQuery<
    FundingActivity[]
  >({
    queryKey: ["/api/dashboard/latest-funding-activity"],
  });

  const formatCurrency = (value: string | null) => {
    if (!value) return "N/A";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Your personalized market intelligence overview"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium">
            Welcome to your market intelligence dashboard
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {metricsLoading ? (
            [...Array(4)].map((_, i) => (
              <Card
                key={i}
                className="border-0 shadow-lg bg-card/80 backdrop-blur"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-8 w-16 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="w-10 h-10 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Total Companies
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                        {formatNumber(metrics?.totalCompanies || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Across all sectors
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl ml-2">
                      <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Active Rounds
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                        {formatNumber(metrics?.activeRounds || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Currently raising
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl ml-2">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Total Funding
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                        {metrics?.totalFunding || "$0"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All time volume
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl ml-2">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        New Unicorns
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                        {formatNumber(metrics?.newUnicorns || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This quarter
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl ml-2">
                      <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Market Analytics Section */}
        <div className="space-y-6 mb-8">
          {/* Enhanced Funding Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Funding Volume Card */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Total Funding Volume
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                        {analyticsLoading ? (
                          <Skeleton className="h-8 w-20" />
                        ) : (
                          fundingAnalytics?.totalFundingVolume || "$0"
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across all funding sources
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 dark:bg-blue-900/20 mt-2 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs"
                    >
                      <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      All Time
                    </Badge>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl ml-2">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Deal Size Card */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Avg Deal Size
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                        {analyticsLoading ? (
                          <Skeleton className="h-8 w-20" />
                        ) : (
                          fundingAnalytics?.avgDealSize || "$0"
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per transaction
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 dark:bg-green-900/20 mt-3 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs"
                    >
                      <Target className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      Mean
                    </Badge>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl ml-2">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Exits Card */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Total Exits
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                        {analyticsLoading ? (
                          <Skeleton className="h-8 w-20" />
                        ) : (
                          fundingAnalytics?.totalExits.toLocaleString() || "0"
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Successful exits tracked
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 dark:bg-orange-900/20 mt-2 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 text-xs"
                    >
                      <ArrowUpRight className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl ml-2">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* This Month Funding Card */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      This Month
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                        {analyticsLoading ? (
                          <Skeleton className="h-8 w-20" />
                        ) : (
                          fundingAnalytics?.thisMonthFunding || "$0"
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Month to date funding
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 dark:bg-purple-900/20 mt-3 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-xs"
                    >
                      <Activity className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      MTD
                    </Badge>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl ml-2">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Latest Funding Activity */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader className="border-b border-border bg-gradient-to-r from-muted/50 to-blue-50/50 dark:to-blue-950/50 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                      Live Funding Activity
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Latest funding rounds, exits, and M&A deals
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 sm:h-auto sm:w-auto"
                  >
                    <Activity className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {activityLoading ? (
                  <div className="p-4 sm:p-6 space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {latestActivity?.slice(0, 10).map((activity) => (
                      <div
                        key={activity.id}
                        className="p-4 sm:p-6 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div
                              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white text-xs sm:text-sm font-bold flex-shrink-0 ${
                                activity.type === "funding"
                                  ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                                  : activity.type === "exit"
                                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                    : activity.type === "ma"
                                      ? "bg-gradient-to-br from-orange-500 to-red-600"
                                      : "bg-gradient-to-br from-purple-500 to-violet-600"
                              }`}
                            >
                              {activity.company?.charAt(0) || "?"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">
                                {activity.company}
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">
                                {activity.description}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mt-1">
                                {activity.industry && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs w-fit"
                                  >
                                    {activity.industry}
                                  </Badge>
                                )}
                                {activity.date && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(
                                      activity.date,
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-foreground text-sm sm:text-base">
                              {activity.amount}
                            </div>
                            <Badge
                              variant="outline"
                              className={`mt-1 text-xs ${
                                activity.type === "funding"
                                  ? "border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                  : activity.type === "exit"
                                    ? "border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                    : activity.type === "ma"
                                      ? "border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                                      : "border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                              }`}
                            >
                              {activity.type === "funding"
                                ? "Funding"
                                : activity.type === "exit"
                                  ? "Exit"
                                  : activity.type === "ma"
                                    ? "M&A"
                                    : "Megadeal"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Upcoming Events */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader className="border-b border-border bg-gradient-to-r from-muted/50 to-purple-50/50 dark:to-purple-950/50 p-4 sm:p-6">
                <CardTitle className="text-lg font-bold text-foreground">
                  Upcoming Events
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Don't miss these events
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {eventsLoading ? (
                  <div className="p-3 sm:p-4 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {upcomingEvents?.slice(0, 6).map((event) => (
                      <div
                        key={event.id}
                        className="p-3 sm:p-4 hover:bg-muted/50 transition-colors"
                      >
                        <h5 className="font-semibold text-foreground text-sm leading-tight">
                          {event.eventName || "Unknown Event"}
                        </h5>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {event.location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          {event.eventType && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-1"
                            >
                              {event.eventType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Industries by Funding */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader className="border-b border-border bg-gradient-to-r from-muted/50 to-green-50/50 dark:to-green-950/50 p-4 sm:p-6">
                <CardTitle className="text-lg font-bold text-foreground">
                  Top Industries
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  By funding volume and deal count
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {analyticsLoading ? (
                  <div className="p-3 sm:p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {fundingAnalytics?.topIndustries
                      .slice(0, 5)
                      .map((industry, index) => (
                        <div key={industry.industry} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  index === 0
                                    ? "bg-blue-500"
                                    : index === 1
                                      ? "bg-green-500"
                                      : index === 2
                                        ? "bg-orange-500"
                                        : index === 3
                                          ? "bg-purple-500"
                                          : "bg-muted-foreground"
                                }`}
                              ></div>
                              <span className="text-sm font-medium text-foreground truncate">
                                {industry.industry}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-foreground">
                                {industry.volume}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {industry.count} deals
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={
                              (industry.count /
                                (fundingAnalytics?.topIndustries[0]?.count ||
                                  1)) *
                              100
                            }
                            className="h-1.5"
                          />
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Major Deals */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader className="border-b border-border bg-gradient-to-r from-muted/50 to-purple-50/50 dark:to-purple-950/50 p-4 sm:p-6">
                <CardTitle className="text-lg font-bold text-foreground">
                  Major Deals
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Recent high-value transactions
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {analyticsLoading ? (
                  <div className="p-3 sm:p-4 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {fundingAnalytics?.recentMajorDeals
                      .slice(0, 5)
                      .map((deal) => (
                        <div
                          key={deal.id}
                          className="p-3 sm:p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h5 className="font-semibold text-foreground text-sm leading-tight truncate">
                                {deal.company}
                              </h5>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    deal.type === "Exit"
                                      ? "border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                      : deal.type === "Funding Round"
                                        ? "border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                        : "border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                                  }`}
                                >
                                  {deal.type}
                                </Badge>
                                {deal.industry && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {deal.industry}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-bold text-foreground text-sm">
                                {deal.amount}
                              </div>
                              {deal.date && (
                                <div className="text-xs text-muted-foreground">
                                  {new Date(deal.date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          {deal.leadInvestors && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Led by {deal.leadInvestors}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Market Summary */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader className="border-b border-border bg-gradient-to-r from-muted/50 to-indigo-50/50 dark:to-indigo-950/50 p-4 sm:p-6">
                <CardTitle className="text-lg font-bold text-foreground">
                  Market Summary
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Live funding ecosystem metrics
                </p>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {analyticsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-foreground">
                          Total Exits
                        </span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {fundingAnalytics?.totalExits.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-foreground">
                          Avg Deal Size
                        </span>
                      </div>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {fundingAnalytics?.avgDealSize || "$0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-foreground">
                          Megadeals
                        </span>
                      </div>
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {fundingAnalytics?.totalMegadeals.toLocaleString() ||
                          "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-foreground">
                          This Month
                        </span>
                      </div>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {fundingAnalytics?.thisMonthFunding || "$0"}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>


      </div>
    </AppLayout>
  );
}
