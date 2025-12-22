import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  title?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isLoading?: boolean;
}

export const ChatHeader = ({ 
  title = "New Conversation", 
  isFavorite = false, 
  onToggleFavorite,
  isLoading = false
}: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 h-16">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <MessageSquare className="h-5 w-5 text-accent" />
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm font-heading font-semibold truncate text-foreground/90">
            {isLoading ? (
              <span className="animate-pulse bg-muted h-4 w-32 block rounded"></span>
            ) : (
              title
            )}
          </h2>
          {!isLoading && (
            <p className="text-xs text-muted-foreground truncate">
              AI Knowledge Assistant
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFavorite}
          disabled={isLoading}
          className={cn(
            "h-9 w-9 transition-all duration-300 hover:bg-amber-500/10 hover:text-amber-500",
            isFavorite ? "text-amber-500" : "text-muted-foreground"
          )}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star 
            className={cn(
              "h-5 w-5 transition-all duration-300", 
              isFavorite && "fill-current scale-110"
            )} 
          />
          <span className="sr-only">Toggle favorite</span>
        </Button>
      </div>
    </div>
  );
};
