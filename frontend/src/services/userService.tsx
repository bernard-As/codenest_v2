// frontend/src/services/userService.ts (Create this new file or add to authService.ts)
import apiClient from './apiClient';
import type { User } from '../types/auth'; // Assuming User type is defined here
 // Assuming User type is defined here

interface UserSearchParams {
  search?: string; // Optional search term
}

// Fetches a list of users, optionally filtered by a search term
const searchUsers = async (params?: UserSearchParams): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/auth/users/', { params }); // Use your user search endpoint
  // If backend uses pagination for user search, response.data might be { results: User[] }
  // return response.data.results || response.data;
  return response.data;
};

export const userService = {
  searchUsers,
};