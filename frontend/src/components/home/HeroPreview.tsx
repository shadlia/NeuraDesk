import { Brain, MessageSquare, Send, Sparkles } from "lucide-react";

export const HeroPreview = () => {
  return (
    <div className="relative mx-auto w-full max-w-[800px] rounded-xl border bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Window Controls */}
      <div className="flex items-center gap-1.5 border-b p-4">
        <div className="h-3 w-3 rounded-full bg-red-500/20" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
        <div className="h-3 w-3 rounded-full bg-green-500/20" />
        <div className="ml-4 flex items-center gap-2 rounded-md bg-accent/10 px-2 py-1 text-xs text-muted-foreground">
          <Brain className="h-3 w-3 text-accent" />
          <span>NeuraDesk AI</span>
        </div>
      </div>

      {/* Chat Interface Preview */}
      <div className="flex h-[400px] flex-col p-4">
        {/* Messages */}
        <div className="flex-1 space-y-4">
          {/* AI Welcome */}
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20">
              <Brain className="h-4 w-4 text-accent" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-3 shadow-sm">
              <p className="text-sm">
                Hello! I'm your personal knowledge assistant. How can I help you learn something new today?
              </p>
            </div>
          </div>

          {/* User Query */}
          <div className="flex flex-row-reverse gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-xs font-bold">You</span>
            </div>
            <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-primary-foreground shadow-sm">
              <p className="text-sm">Explain quantum entanglement simply.</p>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20">
              <Brain className="h-4 w-4 text-accent" />
            </div>
            <div className="space-y-2">
              <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-3 shadow-sm">
                <p className="text-sm">
                  Imagine you have two magic dice. No matter how far apart they are—even if one is on Earth and the other on Mars—if you roll a 6 on one, the other will instantly show a 6 too.
                </p>
              </div>
              
              {/* Insight Card Preview */}
              <div className="flex items-start gap-3 rounded-xl border bg-accent/5 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-accent">Key Concept</p>
                  <p className="text-xs text-muted-foreground">
                    "Spooky action at a distance" - Albert Einstein
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area Preview */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border bg-card p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/10">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            Ask a follow-up question...
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
            <Send className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
