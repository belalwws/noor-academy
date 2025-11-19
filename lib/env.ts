/**
 * 🔒 Environment Variables Validation
 * Ensures all required environment variables are present
 */

import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL'),
  NEXT_PUBLIC_LIVEKIT_URL: z.string().url('NEXT_PUBLIC_LIVEKIT_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return env;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Environment validation failed');
  }
}

export const env = validateEnv();
