import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Star,
  Users,
  GraduationCap,
  Target,
  Gift,
  Calendar,
  Newspaper,
  Trophy,
  Shield,
  TrendingUp,
} from "lucide-react";
import prognosticzLogo from "@assets/Transparent - PNG_1749995576885.png";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Funding Rounds", href: "/funding-rounds", icon: DollarSign },
  { name: "Unicorns", href: "/unicorns", icon: Star },
  { name: "Investors", href: "/investors", icon: Users },
  { name: "Accelerators", href: "/accelerators", icon: GraduationCap },
  { name: "Incubators", href: "/incubators", icon: Target },
  { name: "Grants", href: "/grants", icon: Gift },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Rankings", href: "/rankings", icon: Trophy },
  { name: "Sanctions", href: "/sanctions", icon: Shield },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  user?: { name: string; role: string; initials: string } | null;
}

export function MobileSidebar({ open, onClose, user }: MobileSidebarProps) {
  const [location] = useLocation();

  if (!open) return null;

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900/80 z-40" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center space-x-3">
              <img
                src={prognosticzLogo}
                alt="Prognosticz Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-500 bg-clip-text text-transparent">
                  Prognosticz
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  Know What's Next
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                location === item.href ||
                (item.href !== "/" && location.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800",
                  )}
                  onClick={onClose}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive
                        ? "text-white"
                        : "text-gray-400 dark:text-gray-300",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          {user && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                  {user.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300">
                    {user.role}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
