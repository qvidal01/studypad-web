import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  UploadResponse,
  DocumentsResponse,
  QueryResponse,
  QueryRequest,
  StudioRequest,
  StudioResponse,
  ErrorResponse,
} from '@/types/api';
import { config } from '@/lib/config';

/**
 * Enhanced axios client with retry logic and better error handling
 */

// Retry configuration
const MAX_RETRIES = config.api.retryAttempts;
const RETRY_DELAY = config.api.retryDelay;

// Helper function to determine if request should be retried
const shouldRetry = (error: AxiosError): boolean => {
  // Retry on network errors or 5xx server errors
  if (!error.response) return true; // Network error
  if (error.response.status >= 500 && error.response.status < 600) return true;
  if (error.response.status === 429) return true; // Rate limit
  return false;
};

// Helper function to wait for retry delay with exponential backoff
const wait = (ms: number, attempt: number): Promise<void> => {
  const delay = ms * Math.pow(2, attempt); // Exponential backoff
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens and retry config
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Initialize retry count
    if (!config.headers) {
      config.headers = {} as any;
    }

    // Add auth token here if you implement authentication
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: number };

    // Initialize retry count if not present
    if (originalRequest && !originalRequest._retry) {
      originalRequest._retry = 0;
    }

    // Check if we should retry
    if (
      originalRequest &&
      shouldRetry(error) &&
      originalRequest._retry !== undefined &&
      originalRequest._retry < MAX_RETRIES
    ) {
      originalRequest._retry += 1;

      // Wait before retrying with exponential backoff
      await wait(RETRY_DELAY, originalRequest._retry - 1);

      console.warn(
        `Retrying request (attempt ${originalRequest._retry}/${MAX_RETRIES}):`,
        originalRequest.url
      );

      return apiClient(originalRequest);
    }

    // Handle errors after all retries exhausted
    let errorMessage = 'An error occurred';

    if (error.response) {
      // Server responded with error
      if (typeof error.response.data?.detail === 'string') {
        errorMessage = error.response.data.detail;
      } else if (Array.isArray(error.response.data?.detail)) {
        // Handle validation errors from FastAPI
        errorMessage = error.response.data.detail
          .map((err: any) => err.msg)
          .join(', ');
      }
      console.error('API Error:', {
        status: error.response.status,
        message: errorMessage,
        url: originalRequest?.url,
      });
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'Network error: Unable to reach server';
      console.error('Network Error:', errorMessage);
    } else {
      // Error in request setup
      errorMessage = error.message;
      console.error('Request Error:', errorMessage);
    }

    // Attach user-friendly message to error
    error.message = errorMessage;
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // Upload document
  uploadDocument: async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>('/api/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Get all documents
  getDocuments: async (): Promise<DocumentsResponse> => {
    const response = await apiClient.get<DocumentsResponse>('/api/v1/documents');
    return response.data;
  },

  // Delete document
  deleteDocument: async (docId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/v1/documents/${docId}`);
    return response.data;
  },

  // Query documents
  query: async (request: QueryRequest): Promise<QueryResponse> => {
    const response = await apiClient.post<QueryResponse>('/api/v1/query', request);
    return response.data;
  },

  // Studio actions
  studio: async (request: StudioRequest): Promise<StudioResponse> => {
    const response = await apiClient.post<StudioResponse>('/api/v1/studio', request);
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiClient;
