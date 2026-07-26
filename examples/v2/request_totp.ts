import { createEsignClient } from '@kiiskominfokepri/esign';
import { loadEnv, requireEnv, getEnv } from '../env.js';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

loadEnv();

const baseUrl = requireEnv('ESIGN_BASE_URL');
const username = requireEnv('ESIGN_USERNAME');
const password = requireEnv('ESIGN_PASSWORD');
const nik = requireEnv('ESIGN_NIK');
const email = requireEnv('ESIGN_EMAIL');

const esign = createEsignClient({
  version: 'v2',
  baseUrl,
  username,
  password,
  nik,
  email,
});

console.log('Requesting TOTP for signing (V2)...');

const totpResponse = await esign.requestSignTotp(null, null, 1);

if (totpResponse.ok) {
  console.log('TOTP requested successfully');
  console.log('Check your authenticator app');
  console.log('Raw:', JSON.stringify(totpResponse.data, null, 2));
} else {
  console.error('Error requesting TOTP:', totpResponse.errors);
  process.exit(1);
}