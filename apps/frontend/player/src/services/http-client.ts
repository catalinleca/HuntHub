import axios from 'axios';

/**
 * HTTP client for Play API requests
 *
 * In development: Vite proxy handles /api → http://localhost:3000
 * In production: Set VITE_API_URL to backend URL
 */
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add response interceptor for common error handling
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    return Promise.reject(error);
  },
);
