// API Configuration utility
export const getApiBaseUrl = () => {
  // In production, use the environment variable for backend URL
  if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
    return import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api';
  }
  
  // In development, check for custom API URL first
  if (import.meta.env.VITE_API_URL && window.location.hostname === 'localhost') {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default development URL - local backend server
  return 'http://localhost:3001/api';
};

// Debug function to log API configuration
export const logApiConfig = () => {
  console.log('🔧 API Configuration:', {
    baseURL: getApiBaseUrl(),
    isProd: import.meta.env.PROD,
    hostname: window.location.hostname,
    origin: window.location.origin,
    viteApiUrl: import.meta.env.VITE_API_URL,
    mode: import.meta.env.MODE
  });
};