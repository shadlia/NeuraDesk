export interface LLMRequest {
  question: string;
  context: string;
}

export interface LLMResponse {
  question: string;
  answer: string;
}
