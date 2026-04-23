import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/Dashboard";
import { AgentsPage } from "./pages/Agents";
import { AgentDetailPage } from "./pages/AgentDetail";
import { ActivityPage } from "./pages/Activity";
import { SkillsPage } from "./pages/Skills";
import { SpendingPage } from "./pages/Spending";
import { TasksPage } from "./pages/Tasks";
import { OrgChartPage } from "./pages/OrgChart";
import { LoginPage } from "./pages/Login";
import { ResetPasswordPage } from "./pages/ResetPassword";
import { SettingsPage } from "./pages/Settings";
import { AppSidebar } from "./components/AppSidebar";
import { useSession } from "./lib/auth";

export function App() {
  // Pre-session routes: the reset-password flow lands here via a link
  // from the email, when the user is by definition not signed in yet.
  // Route-match on the pathname BEFORE the session check so the token
  // in the URL isn't lost to the Login screen's redirect.
  if (typeof window !== "undefined" && window.location.pathname === "/reset-password") {
    return <ResetPasswordPage />;
  }

  // Auth gate: render Login until Better Auth confirms a session.
  // During the initial fetch we show a neutral "Loading" screen instead
  // of the tabbed layout — that avoids the dashboard flashing and then
  // snapping back to the sign-in screen once the /get-session call
  // resolves to no user.
  const session = useSession();
  if (session.isLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }
  if (!session.data?.user) {
    return <LoginPage />;
  }

  return <AuthenticatedApp user={session.data.user} />;
}

function AuthenticatedApp({
  user,
}: {
  user: { email: string | null; name: string | null };
}) {
  return (
    <div className="flex h-dvh bg-background text-foreground">
      <AppSidebar user={user} />
      <main className="flex-1 overflow-auto px-7 py-6 min-w-0">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/:id" element={<AgentDetailPage />} />
          <Route path="/org" element={<OrgChartPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/spending" element={<SpendingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="*"
            element={
              <div className="text-muted-foreground">Page not found.</div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
