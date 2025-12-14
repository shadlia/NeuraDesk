import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const Index = () => {
  const { session, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { toast } = useToast();

  // Load conversation history when conversation_id changes
  useEffect(() => {
    const conversationId = searchParams.get("conversation_id");
    
    if (conversationId && conversationId !== currentConversationId) {
      loadConversationHistory(conversationId);
    } else if (!conversationId && currentConversationId) {
      // Clear messages when starting a new conversation
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [searchParams]);

  const loadConversationHistory = async (conversationId: string) => {
    setIsLoadingHistory(true);
    try {
      const messagesData = await api.getMessages(conversationId);
      
      // Convert backend messages to UI format
      const formattedMessages: Message[] = messagesData.map((msg) => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.role === "user",
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      }));
      
      setMessages(formattedMessages);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error("Error loading conversation history:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation history.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Call the actual backend API
    try {
      const response = await api.askLLM({
        user_id: session?.user.id,
        message: text,
        context: "", // Context can be added here later if needed
        conversation_id: currentConversationId || undefined,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // If this was a new conversation, update the URL with the conversation_id
      if (!currentConversationId && response.conversation_id) {
        setCurrentConversationId(response.conversation_id);
        setSearchParams({ conversation_id: response.conversation_id });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setSearchParams({ conversation_id: id });
  };

  return (
    <div className="flex h-screen flex-col">
      <Navigation />
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
