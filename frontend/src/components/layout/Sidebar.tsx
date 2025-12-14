import { MessageSquare, Clock, ChevronLeft, Plus, BookmarkIcon, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Conversation {
  id: string;
  title: string;
  user_id: string;
  is_favourite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  onSelectConversation?: (id: string) => void;
}

export const Sidebar = ({ onSelectConversation }: SidebarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Default to collapsed on mobile (simplistic approach, ideally use media query hook)
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState<"recent" | "saved">("recent");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await api.getConversations(user.id);
        setConversations(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?.id]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const recentConversations = conversations
    .filter(c => !c.is_archived && !c.is_favourite)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const savedConversations = conversations
    .filter(c => c.is_favourite && !c.is_archived)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Mobile Toggle Button (Visible when collapsed) */}
      {isCollapsed && (
        <Button
          variant="outline"
          size="icon"
          className="fixed left-4 top-[4.5rem] z-30 md:hidden shadow-md bg-background"
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </Button>
      )}

      <aside 
        className={cn(
          "border-r bg-sidebar backdrop-blur-sm transition-all duration-300 z-40",
          // Mobile: Absolute positioning, full height
          "absolute inset-y-0 left-0 h-full md:relative",
          // Width handling
          isCollapsed ? "w-0 md:w-14 -translate-x-full md:translate-x-0" : "w-72 md:w-80 translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4 bg-sidebar/95">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-accent" />
                <h2 className="font-heading font-semibold text-sm">Workspace</h2>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 hover:bg-accent/10 ml-auto"
            >
              <ChevronLeft 
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )} 
              />
            </Button>
          </div>
          
          {!isCollapsed && (
            <>
              {/* New Chat Button */}
              <div className="p-3">
                <Button 
                  className="w-full gap-2 bg-accent hover:bg-accent/90 shadow-sm"
                  size="sm"
                  onClick={() => navigate("/chat")}
                >
                  <Plus className="h-4 w-4" />
                  New Conversation
                </Button>
              </div>

              <Separator />

              {/* Tabs */}
              <div className="flex gap-1 p-3 bg-sidebar/50">
                <button
                  onClick={() => setActiveTab("recent")}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                    activeTab === "recent"
                      ? "bg-accent/20 text-accent shadow-sm"
                      : "text-muted-foreground hover:bg-accent/5"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Recent
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                    activeTab === "saved"
                      ? "bg-accent/20 text-accent shadow-sm"
                      : "text-muted-foreground hover:bg-accent/5"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <BookmarkIcon className="h-3.5 w-3.5" />
                    Saved
                  </div>
                </button>
              </div>
              
              {/* Content */}
              <ScrollArea className="flex-1 px-3">
                <div className="space-y-2 pb-4">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Loading conversations...
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-destructive text-sm">
                      {error}
                    </div>
                  ) : activeTab === "recent" ? (
                    <>
                      {recentConversations.length > 0 ? (
                        recentConversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => {
                              if (onSelectConversation) {
                                onSelectConversation(conv.id);
                              } else {
                                navigate(`/chat?conversation_id=${conv.id}`);
                              }
                            }}
                            className="w-full rounded-xl border bg-card/50 backdrop-blur-sm p-3.5 text-left transition-all duration-200 hover:bg-accent/10 hover:border-accent/30 hover:shadow-sm group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                                <MessageSquare className="h-4 w-4 text-accent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-heading font-semibold text-sm truncate mb-1">
                                  {conv.title}
                                </p>
                                <p className="text-xs text-muted-foreground/80">
                                  {formatTimeAgo(conv.updated_at)}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground">No conversations yet</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Start a new chat to get started
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {savedConversations.length > 0 ? (
                        savedConversations.map((note) => (
                          <button
                            key={note.id}
                            onClick={() => {
                              if (onSelectConversation) {
                                onSelectConversation(note.id);
                              } else {
                                navigate(`/chat?conversation_id=${note.id}`);
                              }
                            }}
                            className="w-full rounded-xl border bg-card/50 backdrop-blur-sm p-3.5 text-left transition-all duration-200 hover:bg-accent/10 hover:border-accent/30 hover:shadow-sm group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                                <BookmarkIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-heading font-semibold text-sm truncate mb-1">
                                  {note.title}
                                </p>
                                <p className="text-xs text-muted-foreground/80">
                                  {formatTimeAgo(note.updated_at)}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <BookmarkIcon className="h-8 w-8 text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground">No saved items yet</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Save important chats here
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
