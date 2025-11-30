import { Brain, FileText, Settings, Zap } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatsWidget, QuickActions, RecentConversations, InsightsWidget, FutureFeatureCard } from "@/components/dashboard/DashboardWidgets";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { session } = useAuth();
  const userEmail = session?.user?.email;
  const { user_metadata } = session?.user || {};
  const userName = user_metadata?.first_name || user_metadata?.full_name || userEmail?.split("@")[0] || "Guest";

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <Navigation />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block h-full">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
          <div className="mx-auto max-w-7xl space-y-8">
            
            {/* Hero / Welcome */}
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-bold tracking-tight sm:text-4xl">
                Good Morning, {userName}! <span className="text-2xl">👋</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Ready to conquer the day? You have 3 new insights waiting for you.
              </p>
            </div>

            {/* Stats Overview */}
            <StatsWidget />

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <QuickActions />
            </div>

            {/* Main Grid: Recent & Insights */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column: Recent Conversations */}
              <div className="lg:col-span-2 h-full">
                <RecentConversations />
              </div>

              {/* Right Column: AI Insights */}
              <div className="h-full">
                <InsightsWidget />
              </div>
            </div>

            {/* Future Features / Automation Teaser */}
            <div className="space-y-4 pt-8">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Automated Workflows & Knowledge Base
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <FutureFeatureCard 
                  title="Knowledge Base" 
                  description="Upload documents and build a personalized context library for your AI."
                  icon={FileText}
                />
                <FutureFeatureCard 
                  title="Automation Agents" 
                  description="Create workflows to automate repetitive tasks like email drafting and research."
                  icon={Settings}
                />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
