import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WatchlistWidget() {
  // TODO: Connect to user's actual watchlist from Supabase
  const watchlistItems: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "update":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "update":
        return "Update";
      default:
        return "Quiet";
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Your Watchlist
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-blue-800"
          >
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {watchlistItems.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No companies in watchlist
          </p>
        ) : (
          watchlistItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 text-xs font-medium">
                    {item.initials}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">{item.lastActivity}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}
                ></span>
                <span className="text-xs text-gray-500">
                  {getStatusText(item.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
