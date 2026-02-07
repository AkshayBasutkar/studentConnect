import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Loader2 } from "lucide-react";

// Pages
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import EventsPage from "@/pages/events";
import CreateEventPage from "@/pages/create-event";
import StudentsPage from "@/pages/students";
import ManageUsersPage from "@/pages/manage-users";
import CreateParticipationPage from "@/pages/create-participation";
import ReviewParticipationsPage from "@/pages/review-participations";
import NotFound from "@/pages/not-found";

// Protected Route Component
function ProtectedRoute({ component: Component, allowedRoles }: { component: any, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return (
    <LayoutShell>
      <Component />
    </LayoutShell>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Route */}
      <Route path="/login" component={LoginPage} />

      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute component={DashboardPage} />
      </Route>

      <Route path="/events">
        <ProtectedRoute component={EventsPage} />
      </Route>

      {/* Proctor Routes */}
      <Route path="/events/create">
        <ProtectedRoute component={CreateEventPage} allowedRoles={['proctor', 'admin']} />
      </Route>

      <Route path="/students">
        <ProtectedRoute component={StudentsPage} allowedRoles={['proctor', 'admin']} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/users">
        <ProtectedRoute component={ManageUsersPage} allowedRoles={['admin']} />
      </Route>

      {/* Student Routes */}
      <Route path="/participations">
        {/* Reuse EventsPage or ReviewPage logic for listing own participations for MVP simplicity */}
        <ProtectedRoute component={CreateParticipationPage} allowedRoles={['student']} />
      </Route>
      
      {/* Since we pointed participations to create page, let's fix pathing properly: */}
      <Route path="/participations/new">
        <ProtectedRoute component={CreateParticipationPage} allowedRoles={['student']} />
      </Route>

      {/* Proctor Routes */}
      <Route path="/reviews">
        <ProtectedRoute component={ReviewParticipationsPage} allowedRoles={['proctor', 'admin']} />
      </Route>

      {/* Fallback */}
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
