// API service for handling HTTP requests
import { useAuthStore } from "@/store/auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class ApiService {
  private navigationCallback: (() => void) | null = null;

  setNavigationCallback(callback: () => void) {
    this.navigationCallback = callback;
  }

  private getAuthHeaders(): Record<string, string> {
    const { accessToken } = useAuthStore.getState();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if accessToken exists
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const authHeaders = this.getAuthHeaders();

      const response = await fetch(url, {
        headers: {
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Log user out when unauthorized
          const { logout } = useAuthStore.getState();
          console.log("log user out");
          logout();

          // Trigger navigation callback if set
          if (this.navigationCallback) {
            this.navigationCallback();
          }
        }
        return {
          success: false,
          error: data.message || "An error occurred",
          status: response.status,
        };
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  }
}

export const apiService = new ApiService();
