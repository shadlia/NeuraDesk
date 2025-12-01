export interface LLMRequest {
  user_id: string;
  question: string;
  context: string;
}

export interface LLMResponse {
  question: string;
  answer: string;
}
