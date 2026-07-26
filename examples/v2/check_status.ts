import { createEsignClient } from '@kiiskominfokepri/esign';
import { loadEnv, requireEnv, getEnv } from '../env.js';

loadEnv();

const baseUrl = requireEnv('ESIGN_BASE_URL');
const username = requireEnv('ESIGN_USERNAME');
const password = requireEnv('ESIGN_PASSWORD');
const nik = getEnv('ESIGN_NIK');
const email = getEnv('ESIGN_EMAIL');

if (!nik && !email) {
  console.error('Either ESIGN_NIK or ESIGN_EMAIL must be set in .env');
  process.exit(1);
}

const esign = createEsignClient({
  version: 'v2',
  baseUrl,
  username,
  password,
  nik: nik || null,
  email: email || null,
});

console.log('Checking user status (V2)...');

const response = await esign.checkUserStatus();

if (response.ok) {
  console.log(`Status: ${response.data?.user_status ?? 'unknown'}`);
  console.log(`Can sign: ${response.canSign() ? 'yes' : 'no'}`);
  console.log('Raw:', JSON.stringify(response.raw, null, 2));
  process.exit(0);
} else {
  console.error('Error:', response.errors);
  process.exit(1);
}