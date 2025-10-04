import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrendingWidget() {
  // TODO: Connect to actual industry analytics from Supabase
  const trendingSectors: any[] = [];

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold">
          Trending Sectors
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {trendingSectors.map((sector, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {sector.name}
              </p>
              <p className="text-xs text-gray-500">{sector.dealCount}</p>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-medium ${
                  sector.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {sector.growth}
              </p>
              <p className="text-xs text-gray-500">vs last month</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
