export interface LLMRequest {
  user_id: string;
  message: string;
  context: string;
}

export interface LLMResponse {
  message: string;
  answer: string;
}
