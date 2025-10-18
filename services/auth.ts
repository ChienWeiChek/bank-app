import { ApiResponse, apiService } from "@/services/api";

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    biometricEnabled: boolean;
    createdAt: string;
    updatedAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

const login = async (
  credentials: LoginRequest
): Promise<ApiResponse<AuthResponse>> => {
  return apiService.request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

const register = async (userData: {
  email: string;
  name: string;
  phoneNumber: string;
  password: string;
}): Promise<ApiResponse<AuthResponse>> => {
  return apiService.request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

const refreshToken = async (
  refreshToken: string
): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
  return apiService.request<{ accessToken: string; refreshToken: string }>(
    "/api/auth/refresh",
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }
  );
};

const getCurrentUser = async (
  accessToken: string
): Promise<ApiResponse<{ user: AuthResponse["user"] }>> => {
  return apiService.request<{ user: AuthResponse["user"] }>("/api/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

const updateBiometricSetting = async (
  biometricEnabled: boolean
): Promise<ApiResponse<{ user: AuthResponse["user"] }>> => {
  return apiService.request<{ user: AuthResponse["user"] }>(
    "/api/auth/biometric",
    {
      method: "PATCH",
      body: JSON.stringify({ biometricEnabled }),
    }
  );
};

const logout = async (): Promise<ApiResponse<{ message: string }>> => {
  return apiService.request<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
};

export default {
  logout,
  updateBiometricSetting,
  login,
  refreshToken,
  getCurrentUser,
  register,
};
