import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const maxLength = 2000;

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
    <form 
      onSubmit={handleSubmit}
      className="sticky bottom-0 border-t bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 p-4 shadow-[0_-4px_6px_-1px_rgb(0_0_0_/_0.05)]"
    >
      <div className="mx-auto max-w-4xl space-y-3">
        {/* Input Area */}
        <div className="relative flex gap-3 items-end">
          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything... (Shift + Enter for new line)"
              disabled={disabled}
              className={cn(
                "min-h-[56px] max-h-32 resize-none rounded-2xl bg-card shadow-sm pr-12",
                "focus-visible:ring-accent focus-visible:ring-2 transition-all",
                "placeholder:text-muted-foreground/60",
                isOverLimit && "ring-2 ring-destructive focus-visible:ring-destructive"
              )}
              rows={1}
            />
            {input.length > 0 && (
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                {isNearLimit && (
                  <span className={cn(
                    "text-xs font-medium tabular-nums",
                    isOverLimit ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {input.length}/{maxLength}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={!input.trim() || disabled || isOverLimit}
            size="icon"
            className={cn(
              "h-[56px] w-[56px] shrink-0 rounded-2xl shadow-md transition-all",
              "bg-gradient-to-br from-accent to-accent/90 hover:from-accent hover:to-accent",
              "hover:shadow-lg hover:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* Helper Text */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>AI-powered suggestions enabled</span>
          </div>
          <span className="text-muted-foreground/70 hidden sm:block">
            Press Enter to send
          </span>
        </div>
      </div>
    </form>
  );
};
