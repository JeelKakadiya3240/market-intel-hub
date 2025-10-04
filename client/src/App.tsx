import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthCallback from "@/pages/AuthCallback";
import VerifyEmail from "@/pages/VerifyEmail";
import Dashboard from "@/pages/Dashboard";
import Companies from "@/pages/Companies";
import FundingRounds from "@/pages/FundingRounds";
import { FinancialStatementsPage } from "@/pages/FinancialStatements";
import Unicorns from "@/pages/Unicorns";
import Investors from "@/pages/Investors";
import Accelerators from "@/pages/Accelerators";
import Incubators from "@/pages/Incubators";
import Grants from "@/pages/Grants";
import Events from "@/pages/Events";
import News from "@/pages/News";
import Rankings from "@/pages/Rankings";
import Sanctions from "@/pages/Sanctions";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/companies">
        <ProtectedRoute>
          <Companies />
        </ProtectedRoute>
      </Route>
      <Route path="/funding-rounds">
        <ProtectedRoute>
          <FundingRounds />
        </ProtectedRoute>
      </Route>
      <Route path="/financial-statements">
        <ProtectedRoute>
          <FinancialStatementsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/unicorns">
        <ProtectedRoute>
          <Unicorns />
        </ProtectedRoute>
      </Route>
      <Route path="/investors">
        <ProtectedRoute>
          <Investors />
        </ProtectedRoute>
      </Route>
      <Route path="/accelerators">
        <ProtectedRoute>
          <Accelerators />
        </ProtectedRoute>
      </Route>
      <Route path="/incubators">
        <ProtectedRoute>
          <Incubators />
        </ProtectedRoute>
      </Route>
      <Route path="/grants">
        <ProtectedRoute>
          <Grants />
        </ProtectedRoute>
      </Route>
      <Route path="/events">
        <ProtectedRoute>
          <Events />
        </ProtectedRoute>
      </Route>
      <Route path="/news">
        <ProtectedRoute>
          <News />
        </ProtectedRoute>
      </Route>
      <Route path="/rankings">
        <ProtectedRoute>
          <Rankings />
        </ProtectedRoute>
      </Route>
      <Route path="/sanctions">
        <ProtectedRoute>
          <Sanctions />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
