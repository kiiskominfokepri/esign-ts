import { createEsignClient, SignatureProperties } from '@kiiskominfokepri/esign';
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
const idSubscriber = requireEnv('ESIGN_ID_SUBSCRIBER');

const esign = createEsignClient({
  version: 'v2',
  baseUrl,
  username,
  password,
  nik,
  email,
});

console.log('Requesting seal activation (V2)...');

const activationResponse = await esign.requestSealActivation(idSubscriber);

if (activationResponse.ok) {
  console.log('Seal activation requested successfully');
  console.log('Raw:', JSON.stringify(activationResponse.data, null, 2));
} else {
  console.error('Error requesting seal activation:', activationResponse.errors);
  process.exit(1);
}