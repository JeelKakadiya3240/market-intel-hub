import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Globe,
  MapPin,
  Clock,
  ExternalLink,
  CalendarDays,
  Mic,
  Network,
  Users,
  Grid3X3,
  Table as TableIcon,
} from "lucide-react";
import { Event, EventEuropeanStartup } from "@shared/schema";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

// Calendar styles
const calendarStyles = `
  .fc {
    font-family: inherit;
  }
  .fc-toolbar {
    margin-bottom: 1rem;
  }
  .fc-toolbar-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: hsl(var(--foreground));
  }
  .fc-button {
    background-color: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    color: hsl(var(--foreground));
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
  }
  .fc-button:hover {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
  .fc-button-active {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border-color: hsl(var(--primary));
  }
  .fc-daygrid-day {
    background-color: hsl(var(--background));
    border-color: hsl(var(--border));
  }
  .fc-daygrid-day:hover {
    background-color: hsl(var(--accent));
  }
  .fc-daygrid-day.fc-day-today {
    background-color: hsl(var(--accent));
  }
  .fc-daygrid-day-number {
    color: hsl(var(--foreground));
    font-weight: 500;
  }
  .dark .fc-daygrid-day-number {
    color: white !important;
    font-weight: 600;
  }
  .dark .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
    color: white !important;
    font-weight: 700;
  }
  .dark .fc-daygrid-day.fc-day-other .fc-daygrid-day-number {
    color: rgba(255, 255, 255, 0.5) !important;
  }
  .dark .fc-daygrid-day.fc-day-past .fc-daygrid-day-number {
    color: white !important;
    opacity: 0.8;
  }
  .dark .fc-daygrid-day.fc-day-future .fc-daygrid-day-number {
    color: white !important;
    opacity: 1;
  }
  .fc-col-header-cell {
    background-color: hsl(var(--muted));
    border-color: hsl(var(--border));
  }
  .fc-col-header-cell-cushion {
    color: hsl(var(--foreground));
    font-weight: 600;
  }
  .fc-event {
    border-radius: 0.375rem;
    border: none;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.125rem 0.25rem;
    margin: 0.125rem;
  }
  .fc-event:hover {
    opacity: 0.8;
  }
  .fc-more-link {
    color: hsl(var(--primary));
    font-weight: 500;
  }
  .fc-more-link:hover {
    color: hsl(var(--primary));
    text-decoration: underline;
  }

  /* Dark mode specific styles */
  .dark .fc {
    color: hsl(var(--foreground));
  }
  .dark .fc-button {
    background-color: hsl(var(--background));
    border-color: hsl(var(--border));
    color: hsl(var(--foreground));
  }
  .dark .fc-button:hover {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
  .dark .fc-button-active {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }
  .dark .fc-daygrid-day {
    background-color: hsl(var(--background));
    border-color: hsl(var(--border));
  }
  .dark .fc-daygrid-day:hover {
    background-color: hsl(var(--accent));
  }
  .dark .fc-daygrid-day.fc-day-today {
    background-color: hsl(var(--accent));
  }
  .dark .fc-daygrid-day-number {
    color: hsl(var(--foreground));
  }
  .dark .fc-col-header-cell {
    background-color: hsl(var(--muted));
    border-color: hsl(var(--border));
  }
  .dark .fc-col-header-cell-cushion {
    color: hsl(var(--foreground));
  }
  .dark .fc-event {
    border-radius: 0.375rem;
    border: none;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.125rem 0.25rem;
    margin: 0.125rem;
  }
  .dark .fc-event:hover {
    opacity: 0.8;
  }
  .dark .fc-more-link {
    color: hsl(var(--primary));
  }
  .dark .fc-more-link:hover {
    color: hsl(var(--primary));
    text-decoration: underline;
  }

  /* Enhanced dark mode styles */
  .dark .fc-toolbar {
    background-color: hsl(var(--card));
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  .dark .fc-toolbar-title {
    color: hsl(var(--foreground));
    font-weight: 700;
  }
  .dark .fc-button {
    background-color: hsl(var(--secondary));
    border-color: hsl(var(--border));
    color: hsl(var(--secondary-foreground));
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
  }
  .dark .fc-button:hover {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
    transform: translateY(-1px);
  }
  .dark .fc-button-active {
    background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-foreground)));
    color: white;
    border-color: hsl(var(--primary));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .dark .fc-daygrid-day {
    background-color: hsl(var(--card));
    border-color: hsl(var(--border));
    transition: all 0.2s;
  }
  .dark .fc-daygrid-day:hover {
    background-color: hsl(var(--accent));
    transform: scale(1.02);
  }
  .dark .fc-daygrid-day.fc-day-today {
    background: linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-foreground)));
    color: white;
    font-weight: 700;
  }
  .dark .fc-daygrid-day-number {
    color: hsl(var(--foreground));
    font-weight: 600;
  }
  .dark .fc-col-header-cell {
    background: linear-gradient(135deg, hsl(var(--muted)), hsl(var(--muted-foreground)));
    border-color: hsl(var(--border));
    font-weight: 700;
  }
  .dark .fc-col-header-cell-cushion {
    color: hsl(var(--foreground));
    font-weight: 700;
  }
  .dark .fc-event {
    border-radius: 0.5rem;
    border: none;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    margin: 0.125rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s;
  }
  .dark .fc-event:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
  .dark .fc-more-link {
    color: hsl(var(--primary));
    font-weight: 600;
  }
  .dark .fc-more-link:hover {
    color: hsl(var(--primary));
    text-decoration: underline;
  }

  /* Calendar container styling */
  .calendar-container {
    background-color: hsl(var(--card));
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  .dark .calendar-container {
    background-color: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  /* Additional dark mode enhancements */
  .dark .fc-daygrid-day.fc-day-other {
    background-color: hsl(var(--muted));
    opacity: 0.5;
  }
  .dark .fc-daygrid-day.fc-day-past {
    opacity: 0.7;
  }
  .dark .fc-daygrid-day.fc-day-future {
    opacity: 1;
  }
  .dark .fc-daygrid-day.fc-day-today {
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
    color: white;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  .dark .fc-event {
    border-radius: 0.5rem;
    border: none;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    margin: 0.125rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s;
    backdrop-filter: blur(8px);
  }
  .dark .fc-event:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
  .dark .fc-toolbar {
    background: linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)));
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid hsl(var(--border));
  }
  .dark .fc-toolbar-title {
    color: hsl(var(--foreground));
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  .dark .fc-button {
    background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--muted)));
    border-color: hsl(var(--border));
    color: hsl(var(--secondary-foreground));
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .dark .fc-button:hover {
    background: linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)));
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  .dark .fc-button-active {
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
    color: white;
    border-color: #7c3aed;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
`;

interface EventFilters {
  search: string;
  eventType: string;
  location: string;
  month: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

type EventTabType = "general" | "european";
type ViewType = "table" | "calendar";

export default function Events() {
  const [activeTab, setActiveTab] = useState<EventTabType>("general");
  const [viewType, setViewType] = useState<ViewType>("table");
  const [filters, setFilters] = useState<EventFilters>({
    search: "",
    eventType: "all",
    location: "all",
    month: "all",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
  });
  const [selectedEvent, setSelectedEvent] = useState<
    Event | EventEuropeanStartup | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate offset for API calls
  const offset = (pagination.page - 1) * pagination.limit;

  // Convert month name to number for backend
  const getMonthNumber = (monthName: string): string => {
    const monthMap: { [key: string]: string } = {
      "January": "01", "February": "02", "March": "03", "April": "04",
      "May": "05", "June": "06", "July": "07", "August": "08",
      "September": "09", "October": "10", "November": "11", "December": "12"
    };
    return monthMap[monthName] || monthName;
  };

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("limit", pagination.limit.toString());
    params.set("page", pagination.page.toString());
    params.set("offset", offset.toString());
    if (filters.search) params.set("search", filters.search);

    if (filters.eventType !== "all") params.set("eventType", filters.eventType);

    if (filters.location !== "all") params.set("location", filters.location);
    
    // Convert month name to number before sending to backend
    if (filters.month !== "all") {
      const monthNumber = getMonthNumber(filters.month);
      params.set("month", monthNumber);
    }

    return params.toString();
  };

  // Get API endpoint based on active tab
  const getApiEndpoint = () => {
    return activeTab === "general"
      ? "/api/events"
      : "/api/events/european-startup";
  };

  // Fetch events data
  const { data: eventData, isLoading } = useQuery({
    queryKey: [getApiEndpoint(), activeTab, pagination.page, filters],
    queryFn: async () => {
      const response = await fetch(`${getApiEndpoint()}?${buildQueryParams()}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  // Fetch counts for stats
  const { data: generalCount } = useQuery({
    queryKey: ["/api/events/count"],
    queryFn: async () => {
      const response = await fetch("/api/events/count");
      if (!response.ok) throw new Error("Failed to fetch events count");
      return response.json();
    },
  });

  const { data: europeanCount } = useQuery({
    queryKey: ["/api/events/european-startup/count"],
    queryFn: async () => {
      const response = await fetch("/api/events/european-startup/count");
      if (!response.ok)
        throw new Error("Failed to fetch European events count");
      return response.json();
    },
  });

  // Fetch unique event types for debugging
  const { data: uniqueEventTypes } = useQuery({
    queryKey: ["/api/events/unique-types"],
    queryFn: async () => {
      const response = await fetch("/api/events/unique-types");
      if (!response.ok) throw new Error("Failed to fetch unique event types");
      return response.json();
    },
  });

  // Fetch unique European event types for debugging
  const { data: uniqueEuropeanEventTypes } = useQuery({
    queryKey: ["/api/events/european-startup/unique-types"],
    queryFn: async () => {
      const response = await fetch("/api/events/european-startup/unique-types");
      if (!response.ok)
        throw new Error("Failed to fetch unique European event types");
      return response.json();
    },
  });
  
  // Fetch dynamic location options
  const { data: eventLocations = [] } = useQuery({
    queryKey: ["/api/events/locations"],
    queryFn: async () => {
      const response = await fetch("/api/events/locations");
      if (!response.ok) throw new Error("Failed to fetch event locations");
      return response.json();
    },
  });
  
  const { data: europeanEventLocations = [] } = useQuery({
    queryKey: ["/api/events/european-startup/locations"],
    queryFn: async () => {
      const response = await fetch("/api/events/european-startup/locations");
      if (!response.ok) throw new Error("Failed to fetch European event locations");
      return response.json();
    },
  });

  // Debug: Log unique event types
  useEffect(() => {
    if (uniqueEventTypes?.types) {
      console.log("Available event types in database:", uniqueEventTypes.types);
    }
    if (uniqueEuropeanEventTypes?.types) {
      console.log(
        "Available European event names in database:",
        uniqueEuropeanEventTypes.types,
      );
    }
  }, [uniqueEventTypes, uniqueEuropeanEventTypes]);

  // Debug: Log current filters and data
  useEffect(() => {
    console.log("Current filters:", filters);
    console.log("Current event data length:", eventData?.length);
    console.log("Active tab:", activeTab);
    if (eventData && eventData.length > 0) {
      console.log("Sample event data:", eventData[0]);
      console.log("All event data:", eventData);

      // Specific debug for European events
      if (activeTab === "european") {
        console.log("European events debug:");
        eventData.forEach(
          (event: Event | EventEuropeanStartup, index: number) => {
            console.log(`Event ${index}:`, {
              id: event.id,
              eventName: (event as EventEuropeanStartup).eventName,
              location: event.location,
              dateText: (event as EventEuropeanStartup).dateText,
            });
          },
        );
      }
    }
  }, [filters, eventData, activeTab]);

  // Reset pagination when changing tabs or filters
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeTab, filters]);

  // Reset event type filter when switching tabs
  useEffect(() => {
    setFilters((prev) => ({ ...prev, eventType: "all" }));
  }, [activeTab]);

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getTabColor = (tab: EventTabType) => {
    switch (tab) {
      case "general":
        return "from-indigo-500 to-purple-600";
      case "european":
        return "from-blue-500 to-cyan-600";
      default:
        return "from-indigo-500 to-purple-600";
    }
  };

  const formatEventDate = (date: string | Date | null) => {
    if (!date) return "TBD";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "TBD";
    }
  };

  const getEventInitials = (name: string | null) => {
    if (!name) return "EV";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calendar event handling
  const handleDateClick = (arg: any) => {
    console.log("Date clicked:", arg.dateStr);
  };

  const handleEventClick = (arg: any) => {
    const eventId = arg.event.id;
    const event = eventData?.find(
      (e: Event | EventEuropeanStartup) => e.id.toString() === eventId,
    );
    if (event) {
      setSelectedEvent(event);
      setIsDialogOpen(true);
    }
  };

  // Convert events to FullCalendar format
  const getCalendarEvents = () => {
    if (!eventData) {
      return [];
    }

    const calendarEvents = eventData.map((event: Event | EventEuropeanStartup) => {
      const eventName =
        activeTab === "general"
          ? (event as Event).eventName
          : (event as EventEuropeanStartup).eventName;

      let startDate: Date | null = null;
      let endDate: Date | null = null;

      if (activeTab === "general") {
        const generalEvent = event as Event;
        
        if (generalEvent.startDate) {
          startDate = new Date(generalEvent.startDate);
          if (isNaN(startDate.getTime())) {
            startDate = null;
          }
        }
        
        if (generalEvent.endDate) {
          endDate = new Date(generalEvent.endDate);
          if (isNaN(endDate.getTime())) {
            endDate = null;
          }
        }
      } else {
        const europeanEvent = event as EventEuropeanStartup;
        
        if (europeanEvent.dateText) {
          // Try multiple date parsing strategies
          const dateStr = europeanEvent.dateText.trim();
          
          // Try ISO date first
          startDate = new Date(dateStr);
          
          // If that fails, try other formats
          if (isNaN(startDate.getTime())) {
            // Try parsing common date formats like "DD/MM/YYYY" or "DD-MM-YYYY"
            const datePatterns = [
              /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/, // DD/MM/YYYY or DD-MM-YYYY
              /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/, // YYYY/MM/DD or YYYY-MM-DD
            ];
            
            for (const pattern of datePatterns) {
              const match = dateStr.match(pattern);
              if (match) {
                if (pattern === datePatterns[0]) {
                  // DD/MM/YYYY format
                  startDate = new Date(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`);
                } else {
                  // YYYY/MM/DD format
                  startDate = new Date(`${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`);
                }
                break;
              }
            }
          }
          
          // If still invalid, use a default date in the future
          if (isNaN(startDate.getTime())) {
            startDate = new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000); // Random date in next year
          }
        }
      }

      // Use fallback dates if no valid dates found - spread events over the next 6 months
      const fallbackStartDate = new Date();
      fallbackStartDate.setDate(fallbackStartDate.getDate() + Math.floor(Math.random() * 180)); // Random date in next 6 months
      
      const finalStartDate = startDate || fallbackStartDate;
      const finalEndDate = endDate || finalStartDate;

      const calendarEvent = {
        id: event.id.toString(),
        title: eventName || "Unnamed Event",
        start: finalStartDate.toISOString().split('T')[0], // Use ISO date string format
        end: finalEndDate.toISOString().split('T')[0],
        backgroundColor: activeTab === "general" ? "#8b5cf6" : "#06b6d4",
        borderColor: activeTab === "general" ? "#7c3aed" : "#0891b2",
        textColor: "#ffffff",
        extendedProps: {
          location: event.location,
          eventType:
            activeTab === "general"
              ? (event as Event).eventType
              : "European Startup Event",
          link:
            activeTab === "general"
              ? (event as Event).link
              : (event as EventEuropeanStartup).websiteUrl,
        },
      };
      
      return calendarEvent;
    });
    
    return calendarEvents;
  };

  // Calculate pagination values
  const currentCount =
    activeTab === "general" ? generalCount?.count : europeanCount?.count;
  const totalRecords = currentCount || 0;
  const totalPages = Math.ceil(totalRecords / pagination.limit);

  return (
    <AppLayout
      title="Events"
      subtitle="Explore upcoming and past startup events"
    >
      <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
            Events
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium">
            Discover and join events in the startup ecosystem
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Events
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {eventData?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Locations
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {new Set(
                  eventData
                    ?.map((e: Event | EventEuropeanStartup) => e.location)
                    .filter(Boolean),
                ).size || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Event Types
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {new Set(
                  eventData
                    ?.map((e: Event | EventEuropeanStartup) =>
                      activeTab === "general"
                        ? (e as Event).eventType
                        : "European Startup Event",
                    )
                    .filter(Boolean),
                ).size || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-orange-500" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Months
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {new Set(
                  eventData
                    ?.map((e: Event | EventEuropeanStartup) =>
                      activeTab === "general"
                        ? (e as Event).startDate
                          ? new Date(
                              (e as Event).startDate!,
                            ).toLocaleDateString("en-US", { month: "long" })
                          : null
                        : (e as EventEuropeanStartup).month,
                    )
                    .filter(Boolean),
                ).size || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20"
                />
              </div>

              {/* Event Type Filter */}
              <Select
                value={filters.eventType}
                onValueChange={(value) =>
                  handleFilterChange("eventType", value)
                }
              >
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {activeTab === "general" ? (
                    uniqueEventTypes?.types?.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))
                  ) : (
                    uniqueEuropeanEventTypes?.types?.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select
                value={filters.location}
                onValueChange={(value) => handleFilterChange("location", value)}
              >
                <SelectTrigger className="w-full sm:w-48 border-slate-200">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {activeTab === "general" ? (
                    eventLocations.map((location: string) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))
                  ) : (
                    europeanEventLocations.map((location: string) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Month Filter */}
              <Select
                value={filters.month}
                onValueChange={(value) => handleFilterChange("month", value)}
              >
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="January">January</SelectItem>
                  <SelectItem value="February">February</SelectItem>
                  <SelectItem value="March">March</SelectItem>
                  <SelectItem value="April">April</SelectItem>
                  <SelectItem value="May">May</SelectItem>
                  <SelectItem value="June">June</SelectItem>
                  <SelectItem value="July">July</SelectItem>
                  <SelectItem value="August">August</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                  <SelectItem value="October">October</SelectItem>
                  <SelectItem value="November">November</SelectItem>
                  <SelectItem value="December">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={viewType === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("table")}
              className={
                viewType === "table"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  : ""
              }
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Table View
            </Button>
            <Button
              variant={viewType === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("calendar")}
              className={
                viewType === "calendar"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                  : ""
              }
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
          </div>

          {eventData?.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              {eventData.length} events
            </Badge>
          )}
        </div>

        {/* Event Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as EventTabType)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 bg-card/80 backdrop-blur border-0 shadow-lg p-1">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">General Events</span>
              <span className="sm:hidden">General</span>
            </TabsTrigger>
            <TabsTrigger
              value="european"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white font-medium"
            >
              <Globe className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">European Startups</span>
              <span className="sm:hidden">European</span>
            </TabsTrigger>
          </TabsList>

          {/* Events Table */}
          <TabsContent value={activeTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {activeTab === "general"
                  ? "General Events"
                  : "European Startup Events"}
              </h2>
            </div>

            {viewType === "table" ? (
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Event
                            </div>
                          </TableHead>
                          <TableHead className="py-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Location
                            </div>
                          </TableHead>
                          <TableHead className="py-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Date
                            </div>
                          </TableHead>
                          <TableHead className="py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Type
                            </div>
                          </TableHead>
                          <TableHead className="text-center py-4">
                            <div className="flex items-center gap-2 justify-center">
                              <ExternalLink className="h-4 w-4" />
                              Actions
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          [...Array(10)].map((_, i) => (
                            <TableRow key={i} className="border-border">
                              <TableCell>
                                <Skeleton className="h-4 w-48" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-24" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-32" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-24" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-8 w-16 mx-auto" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : eventData?.length > 0 ? (
                          eventData.map(
                            (event: Event | EventEuropeanStartup) => (
                              <TableRow
                                key={event.id}
                                className="border-border hover:bg-muted/50 transition-colors cursor-pointer group"
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <TableCell className="py-4">
                                  <div className="space-y-1">
                                    <div className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                                      {(() => {
                                        const eventName =
                                          activeTab === "general"
                                            ? (event as Event).eventName
                                            : (event as EventEuropeanStartup)
                                                .eventName;
                                        console.log("Event name for display:", {
                                          activeTab,
                                          eventName,
                                          eventId: event.id,
                                          fullEvent: event,
                                        });
                                        return eventName || "Unnamed Event";
                                      })()}
                                    </div>
                                    {((activeTab === "general" &&
                                      (event as Event).link) ||
                                      (activeTab === "european" &&
                                        (event as EventEuropeanStartup)
                                          .websiteUrl)) && (
                                      <div className="text-sm text-muted-foreground line-clamp-2">
                                        <ExternalLink className="h-3 w-3 inline mr-1" />
                                        Website
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="text-sm text-muted-foreground">
                                    {event.location || "TBD"}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="text-sm text-muted-foreground">
                                    {activeTab === "general"
                                      ? formatEventDate(
                                          (event as Event).startDate,
                                        )
                                      : (event as EventEuropeanStartup)
                                          .dateText || "TBD"}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="text-sm text-muted-foreground">
                                    {activeTab === "general"
                                      ? (event as Event).eventType || "N/A"
                                      : "European Startup Event"}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-blue-600 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(event);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ),
                          )
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="py-12 text-center"
                            >
                              <div className="text-center">
                                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                  No events found
                                </h3>
                                <p className="text-muted-foreground">
                                  Try adjusting your search filters to find more
                                  events.
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {eventData?.length > 0 && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200">
                      <div className="text-sm text-slate-600">
                        Showing{" "}
                        {(
                          (pagination.page - 1) * pagination.limit +
                          1
                        ).toLocaleString()}
                        -
                        {Math.min(
                          pagination.page * pagination.limit,
                          totalRecords,
                        ).toLocaleString()}{" "}
                        of {totalRecords.toLocaleString()} events
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="border-slate-200"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">
                            Previous
                          </span>
                        </Button>

                        <div className="flex items-center gap-1">
                          {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const pageNum =
                              Math.max(1, pagination.page - 2) + i;
                            if (pageNum > totalPages) return null;

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  pageNum === pagination.page
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className={
                                  pageNum === pagination.page
                                    ? `bg-gradient-to-r ${getTabColor(activeTab)} text-white border-0`
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
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-96 w-full" />
                    </div>
                  ) : eventData?.length > 0 ? (
                    <div className="calendar-container bg-card/80 backdrop-blur border border-border rounded-xl p-6">
                      <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        initialDate={new Date()}
                        events={getCalendarEvents()}
                        eventClick={handleEventClick}
                        height="auto"
                        headerToolbar={{
                          left: "prev,next today",
                          center: "title",
                          right: "dayGridMonth,dayGridWeek",
                        }}
                        buttonText={{
                          today: "Today",
                          month: "Month",
                          week: "Week",
                        }}
                        dayMaxEvents={3}
                        eventDisplay="block"
                        eventTimeFormat={{
                          hour: "numeric",
                          minute: "2-digit",
                          meridiem: "short",
                        }}
                        titleFormat={{
                          month: "long",
                          year: "numeric",
                        }}
                        firstDay={1}
                        weekends={true}
                        selectable={true}
                        selectMirror={true}
                        eventContent={(arg) => (
                          <div className="p-1 text-xs">
                            <div className="font-semibold truncate">
                              {arg.event.title}
                            </div>
                            {arg.event.extendedProps.location && (
                              <div className="text-xs opacity-75 truncate">
                                📍 {arg.event.extendedProps.location}
                              </div>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No events found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search filters to find more events.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Event Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                {selectedEvent && (
                  <>
                    <div
                      className={`p-2 bg-gradient-to-br ${getTabColor(activeTab)} rounded-lg`}
                    >
                      <CalendarDays className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg dark:text-white">
                      {activeTab === "general"
                        ? (selectedEvent as Event).eventName || "Event Details"
                        : (selectedEvent as EventEuropeanStartup).eventName ||
                          "Event Details"}
                    </span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                      Event Type
                    </span>
                    <div className="text-slate-900 dark:text-white">
                      {activeTab === "general"
                        ? (selectedEvent as Event).eventType || "N/A"
                        : "European Startup Event"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                      Location
                    </span>
                    <div className="text-slate-900 dark:text-white flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedEvent.location || "TBD"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                      {activeTab === "general" ? "Start Date" : "Date"}
                    </span>
                    <div className="text-slate-900 dark:text-white flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {activeTab === "general"
                        ? formatEventDate((selectedEvent as Event).startDate)
                        : (selectedEvent as EventEuropeanStartup).dateText ||
                          "TBD"}
                    </div>
                  </div>
                  {activeTab === "general" &&
                    (selectedEvent as Event).endDate && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                          End Date
                        </span>
                        <div className="text-slate-900 dark:text-white flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatEventDate((selectedEvent as Event).endDate)}
                        </div>
                      </div>
                    )}
                  {activeTab === "european" &&
                    (selectedEvent as EventEuropeanStartup).month && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                          Month
                        </span>
                        <div className="text-slate-900 dark:text-white">
                          {(selectedEvent as EventEuropeanStartup).month}
                        </div>
                      </div>
                    )}
                </div>

                {/* Website Link */}
                {((activeTab === "general" && (selectedEvent as Event).link) ||
                  (activeTab === "european" &&
                    (selectedEvent as EventEuropeanStartup).websiteUrl)) && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                      Website
                    </span>
                    <div className="text-slate-900 dark:text-white">
                      <a
                        href={
                          activeTab === "general"
                            ? (selectedEvent as Event).link!
                            : (selectedEvent as EventEuropeanStartup)
                                .websiteUrl!
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-white dark:hover:text-slate-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 dark:text-white" />
                        Visit Event Website
                      </a>
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
