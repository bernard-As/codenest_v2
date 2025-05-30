// frontend/src/services/apiClient.ts
import axios from 'axios';
import { authStore } from '../stores'; // To get tokens

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api', // Set in .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.tokens?.access; // Get token from MobX store
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor for handling token refresh or global errors
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry && authStore.tokens?.refresh) {
//       originalRequest._retry = true;
//       try {
//         const { data } = await axios.post<{ access: string }>(
//           `${apiClient.defaults.baseURL}/auth/token/refresh/`,
//           { refresh: authStore.tokens.refresh }
//         );
//         authStore.tokens.access = data.access; // Update token in store
//         localStorage.setItem('tokens', JSON.stringify(authStore.tokens)); // Persist new tokens
//         apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
//         originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         authStore.logout(); // Logout if refresh fails
//         // Optionally redirect to login page
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;