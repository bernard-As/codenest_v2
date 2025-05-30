// frontend/src/stores/AuthStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import type { User, LoginCredentials, RegisterData, Tokens } from '../types/auth'; // Define these types
 // Define these types
import { authService } from '../services/authService'; // We'll create this next

class AuthStore {
  user: User | null = null;
  tokens: Tokens | null = null;
  isAuthenticated: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadUserFromStorage(); // Try to load user if tokens exist
  }

  private setAuthData(userData: User, tokenData: Tokens) {
    this.user = userData;
    this.tokens = tokenData;
    this.isAuthenticated = true;
    this.error = null;
    localStorage.setItem('tokens', JSON.stringify(tokenData));
    // Optionally store minimal user info if needed, but tokens are key
  }

  private clearAuthData() {
    this.user = null;
    this.tokens = null;
    this.isAuthenticated = false;
    localStorage.removeItem('tokens');
    // Clear other related stored data if any
  }

  loadUserFromStorage = async () => {
    const storedTokens = localStorage.getItem('tokens');
    if (storedTokens) {
      this.tokens = JSON.parse(storedTokens);
      if (this.tokens?.access) {
        // Optionally: verify token or fetch user details if token is still valid
        // For simplicity, we'll assume if a token exists, we try to fetch user
        // A better approach would be to decode the token to check expiry first
        this.isLoading = true;
        try {
          const userData = await authService.getCurrentUser(this.tokens.access);
          runInAction(() => {
            this.user = userData;
            this.isAuthenticated = true;
            this.isLoading = false;
          });
        } catch (e) {
          runInAction(() => {
            console.error("Failed to load user with stored token", e);
            this.clearAuthData(); // Token might be invalid/expired
            this.isLoading = false;
          });
        }
      } else {
        this.clearAuthData();
      }
    }
  }

  register = async (registerData: RegisterData) => {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await authService.register(registerData);
      runInAction(() => {
        // Backend returns tokens on successful registration in this setup
        // If not, you'd redirect to login or show a "check email" message
        this.setAuthData(response.user, { access: response.access, refresh: response.refresh });
        this.isLoading = false;
        // Optionally, you can navigate the user here using a router instance
        // For now, we'll just update the state. The UI will react.
      });
      return true; // Indicate success
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.detail || err.response?.data?.email?.[0] || err.response?.data?.password2?.[0] || 'Registration failed. Please try again.';
        this.isLoading = false;
      });
      console.error("Registration error:", err.response?.data || err.message);
      return false; // Indicate failure
    }
  };

  login = async (credentials: LoginCredentials) => {
    this.isLoading = true;
    this.error = null;
    try {
      const tokenData = await authService.login(credentials);
      // After getting tokens, fetch user data
      const userData = await authService.getCurrentUser(tokenData.access);
      runInAction(() => {
        this.setAuthData(userData, tokenData);
        this.isLoading = false;
      });
      return true;
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.detail || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      });
      console.error("Login error:", err.response?.data || err.message);
      return false;
    }
  };

  logout = async () => {
    this.isLoading = true;
    // Optional: Call backend logout to blacklist token if implemented
    // try {
    //   if (this.tokens?.refresh) {
    //     await authService.logout(this.tokens.refresh);
    //   }
    // } catch (e) {
    //   console.error("Logout API call failed", e);
    // }
    runInAction(() => {
      this.clearAuthData();
      this.isLoading = false;
    });
  };
}

export default AuthStore;