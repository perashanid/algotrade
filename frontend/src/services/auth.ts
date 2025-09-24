import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest, User, APIResponse } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<APIResponse<AuthResponse>>('/auth', {
      action: 'login',
      ...credentials
    });
    
    if (response.data.success && response.data.data) {
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Login failed');
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<APIResponse<AuthResponse>>('/auth', {
      action: 'register',
      ...userData
    });
    
    if (response.data.success && response.data.data) {
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Registration failed');
  },

  async getProfile(): Promise<User> {
    const response = await api.get<APIResponse<User>>('/auth/profile');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to get profile');
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};