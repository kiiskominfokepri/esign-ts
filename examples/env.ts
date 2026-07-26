import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadEnv(): void {
  config({ path: resolve(__dirname, '.env') });
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}. Copy .env.example to .env and fill in your credentials.`);
  }
  return value;
}

export function getEnv(key: string, defaultValue = ''): string {
  return process.env[key] ?? defaultValue;
}