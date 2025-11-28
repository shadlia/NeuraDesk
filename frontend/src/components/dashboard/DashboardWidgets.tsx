import { ArrowRight, Brain, Calendar, FileText, MessageSquare, Plus, Search, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export const StatsWidget = () => {
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
          <CardTitle className="text-4xl font-bold">12</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Active this week
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
    <div className="flex flex-wrap gap-4">
      <Button 
        size="lg" 
        className="bg-accent hover:bg-accent/90 text-white shadow-md"
        onClick={() => navigate("/chat")}
      >
        <Plus className="mr-2 h-5 w-5" /> New Chat
      </Button>
      <Button size="lg" variant="outline" className="bg-card hover:bg-accent/5">
        <FileText className="mr-2 h-5 w-5 text-blue-500" /> Upload Doc
      </Button>
      <Button size="lg" variant="outline" className="bg-card hover:bg-accent/5">
        <Sparkles className="mr-2 h-5 w-5 text-yellow-500" /> Daily Tip
      </Button>
      <Button size="lg" variant="outline" className="bg-card hover:bg-accent/5">
        <Zap className="mr-2 h-5 w-5 text-purple-500" /> Quick Task
      </Button>
    </div>
  );
};

export const RecentConversations = () => {
  const navigate = useNavigate();
  const conversations = [
    { id: 1, title: "Project Planning: Q4 Goals", summary: "Outline for marketing strategy and dev roadmap", time: "2h ago", tag: "Work" },
    { id: 2, title: "React Hooks Explanation", summary: "Deep dive into useEffect and useMemo", time: "Yesterday", tag: "Learning" },
    { id: 3, title: "Email Draft: Client Update", summary: "Drafting follow-up for meeting notes", time: "2 days ago", tag: "Productivity" },
  ];

  return (
    <Card className="h-full bg-card/50 backdrop-blur-sm border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-heading">Recent Conversations</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/chat")}>View All</Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search history..." className="pl-9 bg-background/50" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {conversations.map((chat) => (
          <div 
            key={chat.id} 
            className="group flex items-start gap-4 rounded-xl border p-3 hover:bg-accent/5 hover:border-accent/30 transition-all cursor-pointer"
            onClick={() => navigate("/chat")}
          >
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold leading-none group-hover:text-accent transition-colors">{chat.title}</p>
                <span className="text-xs text-muted-foreground">{chat.time}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{chat.summary}</p>
              <div className="flex gap-2 pt-1">
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {chat.tag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const InsightsWidget = () => {
  return (
    <Card className="h-full bg-gradient-to-br from-accent/5 to-teal-500/5 border-accent/20">
      <CardHeader>
        <CardTitle className="text-xl font-heading flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Smart Takeaways
        </CardTitle>
        <CardDescription>Key points from your recent interactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-background/80 p-4 shadow-sm backdrop-blur-sm border border-accent/10">
          <p className="text-sm font-medium text-accent mb-2">From "React Hooks Explanation"</p>
          <p className="text-sm text-muted-foreground">
            "useEffect runs after every render by default. Add a dependency array [] to run it only once on mount."
          </p>
          <Button variant="link" className="h-auto p-0 text-xs mt-2 text-accent">View Context</Button>
        </div>
        <div className="rounded-xl bg-background/80 p-4 shadow-sm backdrop-blur-sm border border-accent/10">
          <p className="text-sm font-medium text-accent mb-2">From "Project Planning"</p>
          <p className="text-sm text-muted-foreground">
            "Key milestone: MVP launch scheduled for Dec 15th. Focus on core features first."
          </p>
          <Button variant="link" className="h-auto p-0 text-xs mt-2 text-accent">View Context</Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full border-accent/20 hover:bg-accent/5">
          View All Insights
        </Button>
      </CardFooter>
    </Card>
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
