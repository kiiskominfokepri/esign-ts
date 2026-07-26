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

console.log('Revoking seal activation (V2)...');

const response = await esign.revokeSealActivation(idSubscriber, totp);

if (response.ok) {
  console.log('Seal activation revoked successfully');
  console.log('Raw:', JSON.stringify(response.data, null, 2));
  process.exit(0);
} else {
  console.error('Error revoking seal activation:', response.errors);
  process.exit(1);
}