export interface LLMRequest {
  user_id: string;
  message: string;
  context: string;
  conversation_id?: string;
}

export interface LLMResponse {
  message: string;
  answer: string;
  conversation_id: string;
  title?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  is_favourite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: string; // 'user' or 'assistant'
  content: string;
  created_at: string;
}

export interface MemoryFact {
  id: string;
  user_id: string;
  category: "personal" | "preference" | "project" | "project_milestone" | "ephemeral";
  importance: number;
  key: string;
  value: string;
  context?: string;
  created_at: string;
  updated_at: string;
}
