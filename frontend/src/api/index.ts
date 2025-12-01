import { client } from "./client";
import { LLMRequest, LLMResponse } from "../types/api";

export const api = {
  askLLM: async (data: LLMRequest): Promise<LLMResponse> => {
    console.log("askLLM", data);
    return client<LLMResponse>("/llm/ask", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
