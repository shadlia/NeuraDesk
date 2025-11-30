import { Brain } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 chat-bubble-enter">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20">
        <Brain className="h-4 w-4 text-accent" />
      </div>
      
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-card border px-4 py-3 shadow-sm">
        <div className="typing-dot h-2 w-2 rounded-full bg-accent"></div>
        <div className="typing-dot h-2 w-2 rounded-full bg-accent"></div>
        <div className="typing-dot h-2 w-2 rounded-full bg-accent"></div>
      </div>
    </div>
  );
};
