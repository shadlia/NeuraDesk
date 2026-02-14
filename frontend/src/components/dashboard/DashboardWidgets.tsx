import React from "react";
import { ArrowRight, Brain, Calendar, FileText, MessageSquare, Plus, Search, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/api";
import { UserProfileWidget } from "./UserProfileWidget"; 
import { GrowthBoardWidget } from "./GrowthBoardWidget"; // Import new widget

export { UserProfileWidget, GrowthBoardWidget }; // Export it

export const StatsWidget = () => {
  const [conversationCount, setConversationCount] = React.useState<number>(0);
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        const conversations = await api.getConversations(user.id);
        setConversationCount(conversations.length);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, [user?.id]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardDescription>Productivity Score</CardDescription>
          <CardTitle className="text-4xl font-bold text-accent">85%</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            <span className="text-green-500 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12%
            </span>
            from last week
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardDescription>Conversations</CardDescription>
          <CardTitle className="text-4xl font-bold">{conversationCount}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Total conversations
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardDescription>Knowledge Saved</CardDescription>
          <CardTitle className="text-4xl font-bold">5</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            New notes added
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button 
        variant="default"
        className="bg-accent hover:bg-accent/90 text-white h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        onClick={() => navigate("/chat")}
      >
        <Plus className="mr-2 h-3 w-3" /> New Chat
      </Button>
      <Button variant="outline" className="bg-card h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/5 border-border/60">
        <FileText className="mr-2 h-3 w-3 text-blue-500" /> Upload
      </Button>
      <Button variant="outline" className="bg-card h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/5 border-border/60">
        <Sparkles className="mr-2 h-3 w-3 text-yellow-500" /> Tips
      </Button>
      <Button variant="outline" className="bg-card h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/5 border-border/60">
        <Zap className="mr-2 h-3 w-3 text-purple-500" /> Tasks
      </Button>
    </div>
  );
};

export const RecentConversations = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await api.getConversations(user.id);
        const sorted = data.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ).slice(0, 4); // Show 4 instead of 3
        setConversations(sorted);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setError("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?.id]);

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Now";
    if (diffInHours < 24) return `${diffInHours}H`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col gap-4">
             {[1, 2, 3].map(i => <div key={i} className="h-16 w-full rounded-2xl bg-muted/40 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="text-xs text-destructive font-bold uppercase tracking-widest text-center py-10 opacity-60">
            {error}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-3xl border border-dashed bg-background/5 p-8">
            <MessageSquare className="h-8 w-8 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">No activity yet</p>
            <Button 
              variant="link" 
              className="mt-4 text-[10px] font-black uppercase tracking-widest text-accent"
              onClick={() => navigate("/chat")}
            >
              Initialize Chat
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((chat) => (
              <div 
                key={chat.id} 
                className="group relative flex items-center gap-4 rounded-2xl border border-transparent p-4 hover:bg-background/80 hover:border-border/50 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigate(`/chat?conversation_id=${chat.id}`)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/5 text-accent/60 group-hover:bg-accent/10 group-hover:text-accent transition-all ring-1 ring-accent/10">
                  <MessageSquare className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-sm font-bold truncate text-foreground/80 group-hover:text-foreground">
                      {chat.title}
                    </p>
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase whitespace-nowrap">
                      {formatShortDate(chat.updated_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {chat.is_favourite && (
                       <Badge variant="outline" className="text-[8px] font-black border-yellow-500/20 text-yellow-600/80 px-1.5 py-0 h-4 bg-yellow-500/5">⭐</Badge>
                    )}
                    <span className="text-[9px] font-medium text-muted-foreground/60 truncate">
                       Sync ID: {chat.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                <ArrowRight className="h-3 w-3 text-muted-foreground/20 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        )}
      </div>

      <Button 
         variant="outline" 
         className="w-full h-11 rounded-2xl border-dashed border-border/60 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all"
         onClick={() => navigate("/chat")}
      >
        Access Full Archive
        <ArrowRight className="ml-2 h-3 w-3" />
      </Button>
    </div>
  );
};

export const InsightsWidget = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-accent/5 to-teal-500/5 rounded-3xl border border-accent/10 p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          <div className="group rounded-2xl bg-background/60 p-5 shadow-sm border border-border/40 hover:border-accent/40 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
               <span className="text-[9px] font-black uppercase tracking-widest text-accent/80">React Architecture</span>
               <Sparkles className="h-3 w-3 text-accent" />
            </div>
            <p className="text-sm font-bold leading-relaxed text-foreground/80 lowercase first-letter:uppercase">
              "useEffect runs after every render by default. Use dependency arrays to optimize performance."
            </p>
            <div className="mt-4 flex items-center justify-between">
                <Button variant="link" className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-accent/60 hover:text-accent">View Source</Button>
                <span className="text-[8px] font-bold text-muted-foreground/30">Synced 2h ago</span>
            </div>
          </div>

          <div className="group rounded-2xl bg-background/60 p-5 shadow-sm border border-border/40 hover:border-blue-500/40 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
               <span className="text-[9px] font-black uppercase tracking-widest text-blue-600/80">Project Management</span>
               <TrendingUp className="h-3 w-3 text-blue-600" />
            </div>
            <p className="text-sm font-bold leading-relaxed text-foreground/80 lowercase first-letter:uppercase">
              "Key milestone: MVP launch scheduled for Dec 15th. Focus on core features first."
            </p>
            <div className="mt-4 flex items-center justify-between">
                <Button variant="link" className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-blue-600/60 hover:text-blue-600">Analyze Context</Button>
                <span className="text-[8px] font-bold text-muted-foreground/30">Synced 5h ago</span>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full h-11 rounded-2xl border-dashed border-border/60 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all">
          View All Smart Takeaways
        </Button>
      </div>

      {/* Proactive Tip Section */}
      <div className="bg-muted/30 rounded-3xl p-6 border border-border/40">
         <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-yellow-500" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Neural Tip</h4>
         </div>
         <p className="text-xs font-bold italic text-muted-foreground/80 leading-relaxed">
           "Your focus has been heavy on frontend state management lately. Would you like to review backend optimization strategies next?"
         </p>
      </div>
    </div>
  );
};

export const FutureFeatureCard = ({ title, description, icon: Icon }: { title: string, description: string, icon: any }) => {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card/50 p-6 text-center">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="relative flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-muted-foreground">
          Coming Soon
        </div>
      </div>
    </div>
  );
};
