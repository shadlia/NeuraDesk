import { client } from "./client";
import { LLMRequest, LLMResponse, Conversation, Message, MemoryFact } from "../types/api";

export const api = {
  askLLM: async (data: LLMRequest): Promise<LLMResponse> => {
    console.log("askLLM", data);
    return client<LLMResponse>("/api/v1/chat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getConversations: async (userId: string): Promise<Conversation[]> => {
    return client<Conversation[]>(`/api/v1/conversations/${userId}`, {
      method: "GET",
    });
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    return client<Message[]>(`/api/v1/conversations/${conversationId}/messages`, {
      method: "GET",
    });
  },

  getConversation: async (conversationId: string): Promise<Conversation> => {
    return client<Conversation>(`/api/v1/conversation/${conversationId}`, {
      method: "GET",
    });
  },

  updateConversation: async (conversationId: string, updates: Partial<Conversation>): Promise<void> => {
    return client<void>(`/api/v1/conversations/${conversationId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    return client<void>(`/api/v1/conversations/${conversationId}`, {
      method: "DELETE",
    });
  },

  getMemories: async (userId: string): Promise<MemoryFact[]> => {
    return client<MemoryFact[]>(`/api/v1/memory/${userId}`, {
      method: "GET",
    });
  },

  deleteMemory: async (factId: string, userId: string): Promise<void> => {
    return client<void>(`/api/v1/memory/${factId}?user_id=${userId}`, {
      method: "DELETE",
    });
  },
};
