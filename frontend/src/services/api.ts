import axios, { AxiosResponse } from 'axios';
import { APIResponse } from '../types';
import { getApiBaseUrl, logApiConfig } from '../utils/apiConfig';

const API_BASE_URL = getApiBaseUrl();

// Debug logging for troubleshooting
logApiConfig();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse<APIResponse<any>>) => {
    console.log('✅ API Response:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      success: response.data.success,
      data: response.data.data ? 'Present' : 'None',
      error: response.data.error || 'None'
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Don't redirect on login/register failures
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Token expired or invalid (but not a login failure)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Enhance error with backend message if available
    if (error.response?.data?.error?.message) {
      error.message = error.response.data.error.message;
    }
    
    return Promise.reject(error);
  }
);

export default api;