import { MessageSquare, Clock, ChevronLeft, Plus, BookmarkIcon, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Getting Started with AI",
    timestamp: "2 min ago",
    preview: "How does NeuraDesk work?"
  },
  {
    id: "2",
    title: "AI Capabilities Overview",
    timestamp: "1 hour ago",
    preview: "What can you help me with?"
  },
  {
    id: "3",
    title: "Machine Learning Basics",
    timestamp: "Yesterday",
    preview: "Explain neural networks to me"
  },
];

const mockSavedNotes: Conversation[] = [
  {
    id: "s1",
    title: "Important Research",
    timestamp: "2 days ago",
    preview: "Key insights about quantum computing"
  },
];

interface SidebarProps {
  onSelectConversation?: (id: string) => void;
}

export const Sidebar = ({ onSelectConversation }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"recent" | "saved">("recent");

  return (
    <aside 
      className={cn(
        "relative border-r bg-sidebar backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "w-0 md:w-14" : "w-72 md:w-80"
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
            className="h-8 w-8 p-0 hover:bg-accent/10"
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
                {activeTab === "recent" ? (
                  <>
                    {mockConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => onSelectConversation?.(conv.id)}
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
                            <p className="text-xs text-muted-foreground truncate mb-2">
                              {conv.preview}
                            </p>
                            <p className="text-xs text-muted-foreground/80">
                              {conv.timestamp}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {mockSavedNotes.length > 0 ? (
                      mockSavedNotes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => onSelectConversation?.(note.id)}
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
                              <p className="text-xs text-muted-foreground truncate mb-2">
                                {note.preview}
                              </p>
                              <p className="text-xs text-muted-foreground/80">
                                {note.timestamp}
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
  );
};
