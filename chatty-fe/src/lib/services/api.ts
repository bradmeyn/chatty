import axios, { type InternalAxiosRequestConfig } from "axios";

export interface ApiError {
  error?: string;
  message?: string;
  detail?: string;
  errors?: string[];
}

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to support FormData payloads
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
