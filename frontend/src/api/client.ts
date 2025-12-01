const API_URL = import.meta.env.BACKEND_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const client = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
};
