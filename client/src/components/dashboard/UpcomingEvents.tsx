import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Event } from "@/types/database";

interface UpcomingEventsProps {
  events: Event[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const getEventTypeBadge = (eventType?: string) => {
    if (!eventType) return <Badge variant="secondary">Event</Badge>;

    const type = eventType.toLowerCase();
    if (type.includes("conference"))
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Conference
        </Badge>
      );
    if (type.includes("demo"))
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Demo Day
        </Badge>
      );
    if (type.includes("summit"))
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800">
          Summit
        </Badge>
      );
    return <Badge variant="secondary">{eventType}</Badge>;
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate) return "TBD";

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    if (end && start.getTime() !== end.getTime()) {
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}-${end.toLocaleDateString("en-US", formatOptions)}`;
    }

    return start.toLocaleDateString("en-US", formatOptions);
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Upcoming Events
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-blue-800"
          >
            View Calendar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              No upcoming events available
            </div>
          ) : (
            events.slice(0, 6).map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {event.eventName || "Unnamed Event"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {event.location || "Location TBD"}
                    </p>
                  </div>
                  {getEventTypeBadge(event.eventType)}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateRange(event.startDate, event.endDate)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
