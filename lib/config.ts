/**
 * Application configuration with environment variable validation
 */

// Define environment variables directly so Next.js can inline them
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
const NEXT_PUBLIC_APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;
const NEXT_PUBLIC_APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION;
const NEXT_PUBLIC_ENABLE_STUDIO = process.env.NEXT_PUBLIC_ENABLE_STUDIO;
const NEXT_PUBLIC_MAX_UPLOAD_SIZE = process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE;

function validateEnv() {
  const missing: string[] = [];

  if (!NEXT_PUBLIC_API_URL) {
    missing.push('NEXT_PUBLIC_API_URL');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

// Validate on module load (only in browser, not during build/SSR)
if (typeof window !== 'undefined') {
  validateEnv();
}

export const config = {
  api: {
    baseUrl: NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: 60000, // 60 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  app: {
    name: NEXT_PUBLIC_APP_NAME || 'StudyPad',
    version: NEXT_PUBLIC_APP_VERSION || '1.0.0',
    studioEnabled: NEXT_PUBLIC_ENABLE_STUDIO === 'true',
  },
  upload: {
    maxSize: parseInt(NEXT_PUBLIC_MAX_UPLOAD_SIZE || '10485760', 10), // 10MB default
    allowedTypes: ['application/pdf'] as string[],
    maxFileSizeMB: 10,
  },
  query: {
    defaultTopK: 5,
    maxSourcesDisplay: 3,
  },
} as const;

export type AppConfig = typeof config;
