import { Card, CardContent } from "@/components/ui/card";
import { Building2, DollarSign, TrendingUp, Star } from "lucide-react";
import { DashboardMetrics } from "@/types/database";

interface MetricsRowProps {
  metrics: DashboardMetrics;
}

export function MetricsRow({ metrics }: MetricsRowProps) {
  const metricCards = [
    {
      title: "Total Companies",
      value: metrics.totalCompanies.toLocaleString(),
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Building2,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Active Rounds",
      value: metrics.activeRounds.toLocaleString(),
      change: "+8.3%",
      changeType: "positive" as const,
      icon: DollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Total Funding (YTD)",
      value: metrics.totalFunding,
      change: "-3.2%",
      changeType: "negative" as const,
      icon: TrendingUp,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      title: "New Unicorns",
      value: metrics.newUnicorns.toString(),
      change: "+23.7%",
      changeType: "positive" as const,
      icon: Star,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.changeType === 'positive' ? '↗' : '↘'} {metric.change}
                </span>
                <span className="text-gray-500 text-sm ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
