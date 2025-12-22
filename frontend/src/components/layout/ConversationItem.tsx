import { useState } from "react";
import { 
  MessageSquare, 
  BookmarkIcon, 
  Pencil, 
  Trash2, 
  MoreHorizontal,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types/api";
import { api } from "@/api";
import { useToast } from "@/hooks/use-toast";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Conversation>) => void;
}

export const ConversationItem = ({ 
  conversation, 
  isActive, 
  onSelect,
  onDelete,
  onUpdate 
}: ConversationItemProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleRename = async () => {
    if (!newTitle.trim()) return;
    
    try {
      await api.updateConversation(conversation.id, { title: newTitle });
      onUpdate?.(conversation.id, { title: newTitle });
      setIsRenameDialogOpen(false);
      toast({ title: "Updated", description: "Conversation renamed." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to rename conversation.", variant: "destructive" });
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const newStatus = !conversation.is_favourite;
      await api.updateConversation(conversation.id, { is_favourite: newStatus });
      onUpdate?.(conversation.id, { is_favourite: newStatus });
      toast({ 
        title: newStatus ? "Saved" : "Removed", 
        description: newStatus ? "Conversation saved to favorites" : "Removed from favorites" 
      });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update favorite status.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      setIsDeleting(true);
      try {
        await api.deleteConversation(conversation.id);
        onDelete?.(conversation.id);
        toast({ title: "Deleted", description: "Conversation deleted." });
        if (isActive) {
            navigate("/chat");
        }
      } catch (e) {
        toast({ title: "Error", description: "Failed to delete conversation.", variant: "destructive" });
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <button
            onClick={() => onSelect(conversation.id)}
            disabled={isDeleting}
            className={cn(
              "w-full rounded-xl border bg-card/50 backdrop-blur-sm p-3.5 text-left transition-all duration-200 hover:bg-accent/10 hover:border-accent/30 hover:shadow-sm group relative",
              isActive && "border-accent/50 bg-accent/5 shadow-sm",
              isDeleting && "opacity-50 pointer-events-none"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                conversation.is_favourite 
                  ? "bg-amber-500/10 group-hover:bg-amber-500/20" 
                  : "bg-accent/10 group-hover:bg-accent/20"
              )}>
                {conversation.is_favourite ? (
                  <MessageSquare className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-accent" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-sm truncate mb-1 pr-4">
                  {conversation.title}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  {formatTimeAgo(conversation.updated_at)}
                </p>
              </div>
            </div>
            
            {/* Hover actions - visible only on desktop hover */}
            {/* <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div> */}
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
            <ContextMenuItem onClick={handleRename}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
            </ContextMenuItem>
            <ContextMenuItem onClick={handleToggleFavorite}>
                <Star className={cn("mr-2 h-4 w-4", conversation.is_favourite && "fill-amber-500 text-amber-500")} />
                {conversation.is_favourite ? "Remove from Favorites" : "Add to Favorites"}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>
              Enter a new name for this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Conversation title..."
              onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRename}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
