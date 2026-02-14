import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  defaultValue?: string;
}

export const ChatInput = ({ onSend, disabled, defaultValue = "" }: ChatInputProps) => {
  const [input, setInput] = useState(defaultValue);
  const maxLength = 2000;

  // Update input if defaultValue changes (e.g. navigation from Widget)
  useState(() => {
    if (defaultValue) setInput(defaultValue);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled && input.length <= maxLength) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isNearLimit = input.length > maxLength * 0.8;
  const isOverLimit = input.length > maxLength;

  return (
    <div className="p-4 bg-transparent">
      <form 
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl relative"
      >
        <div className="relative flex items-end gap-2 p-2 rounded-3xl border bg-background shadow-lg ring-1 ring-black/5 focus-within:ring-accent/30 transition-all">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message NeuraDesk..."
            disabled={disabled}
            className={cn(
              "min-h-[44px] max-h-32 w-full resize-none border-0 bg-transparent shadow-none focus-visible:ring-0",
              "py-3 px-4 placeholder:text-muted-foreground/60",
              "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
            )}
            rows={1}
            style={{ height: 'auto', overflow: 'hidden' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              target.style.overflow = target.scrollHeight > 128 ? 'auto' : 'hidden';
            }}
          />
          
          <Button
            type="submit"
            disabled={!input.trim() || disabled || isOverLimit}
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0 rounded-full mb-1 mr-1 transition-all",
              input.trim() 
                ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* Helper Text / Counter */}
        <div className="mt-2 flex items-center justify-between px-4 text-xs text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            <span>AI enabled</span>
          </div>
          {isNearLimit && (
            <span className={cn(
              "tabular-nums transition-colors",
              isOverLimit && "text-destructive font-medium"
            )}>
              {input.length}/{maxLength}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
