// frontend/src/services/authService.ts
import apiClient from './apiClient'; // You'll need to set up apiClient.ts
import type { LoginCredentials, RegisterData, RegisterResponse, LoginResponse, User, } from '../types/auth';

const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register/', data);
  return response.data;
};

const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login/', credentials);
  return response.data;
};

const getCurrentUser = async (accessToken: string): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me/', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

interface UserSearchParams {
  search?: string; // Optional search term
}

const searchUsers = async (params?: UserSearchParams): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/auth/users/', { params }); // Use your user search endpoint
  // If backend uses pagination for user search, response.data might be { results: User[] }
  // return response.data.results || response.data;
  return response.data;
};

// Optional: Logout if backend has blacklist endpoint
// const logout = async (refreshToken: string): Promise<void> => {
//   await apiClient.post('/auth/logout/', { refresh: refreshToken });
// };

export const authService = {
  register,
  login,
  getCurrentUser,
  searchUsers,

  // logout,
};