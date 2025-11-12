// API Response Types

export interface UploadResponse {
  message: string;
  filename: string;
  doc_id: string;
  chunks_created: number;
}

export interface Document {
  id: string;
  filename: string;
  upload_date: string;
  chunks: number;
  size?: number;
}

export interface DocumentsResponse {
  documents: Document[];
}

export interface SourceReference {
  page?: number;
  chunk_id?: string;
  content: string;
  score?: number;
}

export interface QueryResponse {
  answer: string;
  sources: SourceReference[];
  processing_time?: number;
}

export interface QueryRequest {
  query: string;
  doc_id?: string;
  top_k?: number;
}

export interface StudioRequest {
  action: 'generate_audio' | 'generate_video' | 'generate_briefing' | 'generate_study_guide';
  doc_id: string;
  options?: Record<string, unknown>;
}

export interface StudioResponse {
  status: 'success' | 'processing' | 'error';
  result?: {
    url?: string;
    content?: string;
    format?: string;
  };
  message?: string;
  job_id?: string;
}

export interface ErrorResponse {
  detail: string | { msg: string; type: string }[];
}

export interface LLMProvider {
  id: 'gemini' | 'anthropic' | 'openai';
  name: string;
  available: boolean;
}

export interface AppConfig {
  llm_providers: LLMProvider[];
  current_provider: string;
  max_upload_size: number;
  supported_formats: string[];
}
