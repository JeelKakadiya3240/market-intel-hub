import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Star,
  Users,
  Rocket,
  Gift,
  Calendar,
  Newspaper,
  Trophy,
  Shield,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Database,
  Target,
  Globe,
  BarChart3,
  Activity,
  Award,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import prognosticzLogo from "@assets/Transparent - PNG_1749995576885.png";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    color: "from-blue-500 to-indigo-600",
    description: "Overview & Analytics",
  },
  {
    name: "Companies",
    href: "/companies",
    icon: Building2,
    color: "from-emerald-500 to-teal-600",
    description: "Startups & Growth Firms",
  },
  {
    name: "Funding Rounds",
    href: "/funding-rounds",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    description: "Investment Activity",
  },
  {
    name: "Financial Statements",
    href: "/financial-statements",
    icon: BarChart3,
    color: "from-blue-500 to-indigo-600",
    description: "XBRL Financial Filings",
  },
  {
    name: "Unicorns",
    href: "/unicorns",
    icon: Sparkles,
    color: "from-purple-500 to-violet-600",
    description: "$1B+ Valuations",
  },
  {
    name: "Investors",
    href: "/investors",
    icon: Users,
    color: "from-blue-500 to-cyan-600",
    description: "VCs & Angel Investors",
  },
  {
    name: "Accelerators",
    href: "/accelerators",
    icon: Rocket,
    color: "from-orange-500 to-red-600",
    description: "Startup Programs",
  },
  {
    name: "Incubators",
    href: "/incubators",
    icon: Target,
    color: "from-blue-500 to-indigo-600",
    description: "Incubator Programs",
  },
  {
    name: "Grants",
    href: "/grants",
    icon: Gift,
    color: "from-pink-500 to-rose-600",
    description: "Funding Opportunities",
  },
  {
    name: "Events",
    href: "/events",
    icon: Calendar,
    color: "from-indigo-500 to-purple-600",
    description: "Industry Events",
  },
  {
    name: "News",
    href: "/news",
    icon: Newspaper,
    color: "from-slate-500 to-gray-600",
    description: "Market Intelligence",
  },
  {
    name: "Rankings",
    href: "/rankings",
    icon: Trophy,
    color: "from-amber-500 to-orange-600",
    description: "Global Rankings",
  },
  {
    name: "Sanctions",
    href: "/sanctions",
    icon: Shield,
    color: "from-red-500 to-rose-600",
    description: "Compliance Screening",
  },
];

interface SidebarProps {
  user?: { name: string; role: string; initials: string } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="hidden lg:flex w-72 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-slate-200/60 dark:border-gray-800 flex-col shadow-sm">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200/60 dark:border-gray-800 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={prognosticzLogo}
              alt="Prognosticz Logo"
              className="w-16 h-16 object-contain"
            />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-700 dark:to-emerald-800 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-500 bg-clip-text text-transparent">
              Prognosticz
            </h1>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Know What's Next
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-3">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </h3>
        </div>

        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <div key={item.name} className="relative">
              <Link href={item.href}>
                <div
                  className={cn(
                    "group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer border",
                    isActive
                      ? `bg-gradient-to-r ${item.color} dark:from-blue-900 dark:to-indigo-900 text-white shadow-lg shadow-black/10 border-transparent`
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-gray-800 border-transparent hover:border-slate-200/50 dark:hover:border-gray-700 hover:shadow-sm",
                  )}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        "flex-shrink-0 p-1.5 rounded-lg transition-colors",
                        isActive
                          ? "bg-white/20 dark:bg-gray-900/20"
                          : "bg-slate-100 dark:bg-gray-800 group-hover:bg-slate-200 dark:group-hover:bg-gray-700",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-slate-600 dark:text-slate-300",
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "font-semibold truncate",
                          isActive
                            ? "text-white"
                            : "text-slate-900 dark:text-slate-100",
                        )}
                      >
                        {item.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isActive && (
                      <ChevronRight className="h-3 w-3 text-white/80" />
                    )}
                  </div>
                </div>
              </Link>

              {/* Active indicator */}
              {isActive && (
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.color} rounded-r-full shadow-sm`}
                ></div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-200/60 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center space-x-3 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-xl border border-slate-200/50 dark:border-gray-700 hover:border-slate-300/50 dark:hover:border-gray-600 transition-all">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {user?.initials || "GU"}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user?.name || "Guest User"}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                {user?.role || "Guest Access"}
              </p>
              {user?.role === "admin" && (
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800"
                >
                  <Award className="h-2.5 w-2.5 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
