// Frontend Types

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: SourceReference[];
  isLoading?: boolean;
}

export interface SourceReference {
  page?: number;
  chunk_id?: string;
  content: string;
  score?: number;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface StudioJob {
  id: string;
  type: 'audio' | 'video' | 'briefing' | 'study_guide';
  status: 'pending' | 'processing' | 'complete' | 'error';
  doc_id: string;
  created_at: Date;
  completed_at?: Date;
  result?: {
    url?: string;
    content?: string;
  };
  error?: string;
}

// Re-export API types
export * from './api';
