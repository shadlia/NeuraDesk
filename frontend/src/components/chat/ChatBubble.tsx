import { cn } from "@/lib/utils";
import { Brain, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export const ChatBubble = ({ message, isUser, timestamp }: ChatBubbleProps) => {
  return (
    <div
      className={cn(
        "flex gap-3 chat-bubble-enter",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent/20"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Brain className="h-4 w-4 text-accent" />
        )}
      </div>
      
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%] md:max-w-[70%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-card border rounded-tl-sm"
          )}
        >
          <div className={cn(
            "prose prose-sm max-w-none break-words",
            isUser ? "prose-invert text-primary-foreground" : "dark:prose-invert"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message}
            </ReactMarkdown>
          </div>
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground px-2">{timestamp}</span>
        )}
      </div>
    </div>
  );
};
