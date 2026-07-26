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
const sealTotp = requireEnv('ESIGN_SEAL_TOTP');

const filePaths = [resolve(__dirname, '../../storage/TEST-TTE-ESIGN.pdf')];

const esign = createEsignClient({
  version: 'v2',
  baseUrl,
  username,
  password,
  nik,
  email,
});

const props = SignatureProperties.invisible();

console.log('Sealing PDF with seal TOTP (V2)...');

const response = await esign.sealPdf(idSubscriber, sealTotp, filePaths, [props]);

if (response.ok) {
  response.saveToFile(resolve(__dirname, '../../storage/signed/v2-sealed.pdf'));
  console.log('Sealed PDF saved');
  process.exit(0);
} else {
  console.error('Error sealing PDF:', response.errors);
  process.exit(1);
}