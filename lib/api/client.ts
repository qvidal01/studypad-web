import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  UploadResponse,
  DocumentsResponse,
  QueryResponse,
  QueryRequest,
  StudioRequest,
  StudioResponse,
  ErrorResponse,
} from '@/types/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 60000, // 60 seconds for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error
      const message =
        typeof error.response.data?.detail === 'string'
          ? error.response.data.detail
          : 'An error occurred';

      console.error('API Error:', message);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error: No response from server');
    } else {
      // Error in request setup
      console.error('Error:', error.message);
    }
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
