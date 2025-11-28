import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "./ChatBubble";
import { TypingIndicator } from "./TypingIndicator";
import { InsightCard } from "./InsightCard";
import { Sparkles, Brain } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatAreaProps {
  messages: Message[];
  isTyping?: boolean;
}

export const ChatArea = ({ messages, isTyping }: ChatAreaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <ScrollArea className="flex-1 px-4 md:px-6">
      <div className="mx-auto max-w-4xl py-8 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/10 mb-4 mx-auto">
                <Brain className="h-10 w-10 text-accent animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome to Your AI Workspace
              </h2>
              <p className="text-muted-foreground max-w-xl text-lg">
                Your personal knowledge assistant is ready to help you explore, learn, and discover insights.
              </p>
            </div>

            {/* Suggestion Cards */}
            <div className="grid gap-3 w-full max-w-2xl">
              <button className="rounded-2xl border bg-card/50 backdrop-blur-sm p-5 text-left hover:bg-accent/5 hover:border-accent/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group">
                <div className="flex items-start gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">💡</span>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-sm mb-1">Explain complex concepts</p>
                    <p className="text-sm text-muted-foreground">"Explain quantum computing in simple terms"</p>
                  </div>
                </div>
              </button>
              <button className="rounded-2xl border bg-card/50 backdrop-blur-sm p-5 text-left hover:bg-accent/5 hover:border-accent/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group">
                <div className="flex items-start gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🚀</span>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-sm mb-1">Explore trends & insights</p>
                    <p className="text-sm text-muted-foreground">"What are the latest trends in AI?"</p>
                  </div>
                </div>
              </button>
              <button className="rounded-2xl border bg-card/50 backdrop-blur-sm p-5 text-left hover:bg-accent/5 hover:border-accent/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group">
                <div className="flex items-start gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-sm mb-1">Deep dive into topics</p>
                    <p className="text-sm text-muted-foreground">"Help me learn about neural networks"</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Insight Cards Section */}
            <div className="w-full max-w-2xl pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">
                  Quick Tips
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <InsightCard
                  type="tip"
                  title="Pro Tip"
                  description="Ask follow-up questions to dive deeper into any topic."
                />
                <InsightCard
                  type="learning"
                  title="Get Started"
                  description="Try asking questions in natural language - I understand context!"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={message.id} className="space-y-4">
                <ChatBubble
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
                {/* Show insight card after every 3rd AI response */}
                {!message.isUser && (index + 1) % 6 === 0 && (
                  <div className="max-w-[70%]">
                    <InsightCard
                      type="insight"
                      title="Did you know?"
                      description="You can save important conversations for later reference in your workspace."
                    />
                  </div>
                )}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={scrollRef} />
          </>
        )}
      </div>
    </ScrollArea>
  );
};
