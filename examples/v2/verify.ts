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

const filePath = resolve(__dirname, getEnv('SIGNED_PDF', '../../storage/signed/v2-signed-test.pdf'));
const pdfPassword = getEnv('ESIGN_PDF_PASSWORD');

const esign = createEsignClient({
  version: 'v2',
  baseUrl,
  username,
  password,
});

console.log(`Verifying document: ${filePath}`);

const response = await esign.signVerification(filePath, pdfPassword || null);

if (response.ok) {
  console.log('Conclusion:', response.getConclusion());
  console.log('Description:', response.getDescription());
  console.log('Signatures:', response.getSignatureCounts());
  console.log('Signers:', response.getSigners().join(', '));
  process.exit(0);
} else {
  console.error('Error:', response.errors);
  process.exit(1);
}