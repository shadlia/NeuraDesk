import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // TODO: Check authentication status on mount
  useEffect(() => {
    // Example:
    // const checkAuth = async () => {
    //   const { data: { session } } = await supabase.auth.getSession();
    //   setIsAuthenticated(!!session);
    //   if (!session) {
    //     navigate("/");
    //   }
    // };
    // checkAuth();

    // Placeholder - set to true to test authenticated UI
    setIsAuthenticated(false);
  }, [navigate]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate API call - Replace with actual backend call
    try {
      // Placeholder for API call: POST to /ask endpoint
      // const response = await fetch('/api/ask', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ question: text, context: [] })
      // });
      // const data = await response.json();

      // Simulated AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `I understand you're asking about "${text}". As your AI knowledge assistant, I'm here to help! 

This is a placeholder response. In the full implementation, I'll provide detailed, context-aware answers by processing your question through our AI backend.

What else would you like to know?`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    toast({
      title: "Conversation loaded",
      description: `Loading conversation ${id}...`,
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMessages([]);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <div className="flex h-screen flex-col">
      <Navigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onSelectConversation={handleSelectConversation} />
        <main className="flex flex-1 flex-col overflow-hidden">
          <ChatArea messages={messages} isTyping={isTyping} />
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </main>
      </div>
    </div>
  );
};

export default Index;
