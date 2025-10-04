import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Header } from "./Header";
import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userProfile = user
    ? {
        name:
          user.user_metadata?.username || user.email?.split("@")[0] || "User",
        role: user.user_metadata?.role || "User",
        initials: (
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          "U"
        )
          .substring(0, 2)
          .toUpperCase(),
      }
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <Sidebar user={userProfile} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={userProfile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-background">
        <Header
          title={title || undefined}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 bg-background text-foreground">
          {children}
        </main>
      </div>
    </div>
  );
}
