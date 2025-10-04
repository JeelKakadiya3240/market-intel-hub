import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FundingRound } from "@/types/database";

interface RecentFundingProps {
  fundingRounds: FundingRound[];
}

export function RecentFunding({ fundingRounds }: RecentFundingProps) {
  const getRoundTypeBadge = (exitType?: string) => {
    if (!exitType) return <Badge variant="secondary">Unknown</Badge>;

    const type = exitType.toLowerCase();
    if (type.includes("series a"))
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Series A
        </Badge>
      );
    if (type.includes("series b"))
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Series B
        </Badge>
      );
    if (type.includes("seed"))
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800">
          Seed
        </Badge>
      );
    return <Badge variant="secondary">{exitType}</Badge>;
  };

  const formatAmount = (millions?: number) => {
    if (!millions) return "N/A";
    return `$${millions}M`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCompanyInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Recent Funding Rounds
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-blue-800"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Round
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fundingRounds.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No funding rounds available
                  </td>
                </tr>
              ) : (
                fundingRounds.slice(0, 10).map((round) => (
                  <tr key={round.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-600 text-sm font-medium">
                            {getCompanyInitials(round.company)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {round.company || "Unknown Company"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {round.industry || "Unknown Industry"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoundTypeBadge(round.exitType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(round.totalFundingMillions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(round.dealClosedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {round.industry || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
