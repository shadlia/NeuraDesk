import { client } from "./client";
import { LLMRequest, LLMResponse, Conversation, Message } from "../types/api";

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
};
