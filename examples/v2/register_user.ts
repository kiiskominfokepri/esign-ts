import { createEsignClient } from '@kiiskominfokepri/esign';
import { loadEnv, requireEnv, getEnv } from '../env.js';

loadEnv();

const baseUrl = requireEnv('ESIGN_BASE_URL');
const username = requireEnv('ESIGN_USERNAME');
const password = requireEnv('ESIGN_PASSWORD');

const esign = createEsignClient({
  version: 'v2',
  baseUrl,
  username,
  password,
});

const nama = 'Nama Lengkap User';
const email = 'user@example.go.id';

console.log('Registering user (V2)...');

const response = await esign.registerUser(nama, email);

if (response.ok) {
  console.log('User registered successfully');
  console.log('Raw:', JSON.stringify(response.data, null, 2));
  process.exit(0);
} else {
  console.error('Error registering user:', response.errors);
  process.exit(1);
}