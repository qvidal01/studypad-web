/**
 * Application configuration with environment variable validation
 */

const requiredEnvVars = ['NEXT_PUBLIC_API_URL'] as const;

function validateEnv() {
  const missing: string[] = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

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
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: 60000, // 60 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'StudyPad',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    studioEnabled: process.env.NEXT_PUBLIC_ENABLE_STUDIO === 'true',
  },
  upload: {
    maxSize: parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '10485760', 10), // 10MB default
    allowedTypes: ['application/pdf'] as string[],
    maxFileSizeMB: 10,
  },
  query: {
    defaultTopK: 5,
    maxSourcesDisplay: 3,
  },
} as const;

export type AppConfig = typeof config;
