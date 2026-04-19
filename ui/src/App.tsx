import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Activity, Banknote, Clipboard, Network, Zap } from "lucide-react";
import { AgentsPage } from "./pages/Agents";
import { AgentDetailPage } from "./pages/AgentDetail";
import { ActivityPage } from "./pages/Activity";
import { SpendingPage } from "./pages/Spending";
import { TasksPage } from "./pages/Tasks";
import { OrgChartPage } from "./pages/OrgChart";

const TABS = [
  { to: "/agents", label: "Agents", icon: Clipboard },
  { to: "/org", label: "Org", icon: Network },
  { to: "/tasks", label: "Tasks", icon: Zap },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/spending", label: "Spending", icon: Banknote },
];

export function App() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
          <Link to="/agents" className="flex items-center gap-2 font-semibold hover:opacity-80">
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Clipboard className="size-4" />
            </span>
            <span>Clipboard</span>
          </Link>
          <nav className="flex items-center gap-1">
            {TABS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/agents" replace />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/:id" element={<AgentDetailPage />} />
          <Route path="/org" element={<OrgChartPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/spending" element={<SpendingPage />} />
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
