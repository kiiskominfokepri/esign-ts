import { createEsignClient } from '@kiiskominfokepri/esign';
import { loadEnv, requireEnv, getEnv } from '../env.js';

loadEnv();

const baseUrl = requireEnv('ESIGN_BASE_URL');
const username = requireEnv('ESIGN_USERNAME');
const password = requireEnv('ESIGN_PASSWORD');
const nik = requireEnv('ESIGN_NIK');
const email = requireEnv('ESIGN_EMAIL');
const idSubscriber = requireEnv('ESIGN_ID_SUBSCRIBER');
const totp = requireEnv('ESIGN_TOTP');

const esign = createEsignClient({
  version: 'v2',
  baseUrl,
  username,
  password,
  nik,
  email,
});

console.log('Requesting seal TOTP (V2)...');

const totpResponse = await esign.requestSealTotp(idSubscriber, 1, totp);

if (totpResponse.ok) {
  console.log('Seal TOTP requested successfully');
  console.log('Raw:', JSON.stringify(totpResponse.data, null, 2));
} else {
  console.error('Error requesting seal TOTP:', totpResponse.errors);
  process.exit(1);
}