import { Brain, FileText, Settings, Zap } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatsWidget, QuickActions, RecentConversations, GrowthBoardWidget, FutureFeatureCard, InsightsWidget } from "@/components/dashboard/DashboardWidgets";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

import { useState, useEffect } from "react";
import { getUserProfile } from "@/api/profileApi";

const Dashboard = () => {
  const { session } = useAuth();
  const userEmail = session?.user?.email;
  const { user_metadata } = session?.user || {};
  
  // Initialize with session data, but update with separate fetch
  const [displayName, setDisplayName] = useState(
    user_metadata?.first_name || user_metadata?.full_name || userEmail?.split("@")[0] || "Guest"
  );
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    // 1. Determine greeting time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // 2. Fetch fresh profile data
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile?.first_name) {
          setDisplayName(profile.first_name);
        }
      } catch (error) {
        console.error("Failed to fetch latest profile", error);
      }
    };
    
    if (session) {
      fetchProfile();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <Navigation />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block h-full border-r border-border/40">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background/30">
          <div className="mx-auto max-w-[1600px] p-6 sm:p-8 lg:p-12 space-y-12 animate-fade-in-up">
            
            {/* 1. GREETING */}
            <div className="space-y-2">
               <h1 className="text-5xl font-heading font-black tracking-tighter text-foreground">
                {greeting}, {displayName}! 👋
               </h1>
               <p className="text-xl text-muted-foreground font-medium max-w-2xl">
                Ready to conquer the day? Here is your neural progress report.
               </p>
            </div>

            {/* 2. VITALS & TOOLS (Status & Launcher) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch pt-2">
                {/* Status (2/3) */}
                <div className="xl:col-span-8">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-1">Current Vitals</h3>
                        <StatsWidget />
                    </div>
                </div>
                
                {/* Tools (1/3) */}
                <div className="xl:col-span-4">
                    <div className="space-y-4 h-full flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-1">Quick Launch</h3>
                        <div className="bg-card/40 rounded-3xl border border-border/40 p-5 flex-1 flex flex-col justify-center">
                            <QuickActions />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. PRIMARY WORKSPACE: SPLIT GRID (Progress & Insights) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start pt-6">
                
                {/* LEFT: Project Growth (2/3) */}
                <div className="xl:col-span-8 space-y-4 animate-in fade-in slide-in-from-left-4 duration-700">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-1">Project Timelines</h3>
                    <GrowthBoardWidget />
                </div>

                {/* RIGHT: Neural Insights (1/3) */}
                <div className="xl:col-span-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-1">Smart Takeaways</h3>
                    <InsightsWidget />
                </div>
            </div>

            {/* 3. DISCOVERY */}
            <div className="pt-16 border-t border-border/30">
              <div className="flex items-center gap-4 mb-10">
                 <div className="h-1 w-12 bg-accent/20 rounded-full" />
                 <h2 className="text-sm font-black uppercase tracking-[0.5em] text-muted-foreground/60">Neural Roadmap</h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2">
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
