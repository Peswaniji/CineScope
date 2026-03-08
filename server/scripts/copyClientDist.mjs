import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDist = path.resolve(__dirname, '../../client/dist');
const serverPublic = path.resolve(__dirname, '../public');

if (!fs.existsSync(clientDist)) {
  console.error('client/dist not found. Run frontend build first.');
  process.exit(1);
}

fs.rmSync(serverPublic, { recursive: true, force: true });
fs.mkdirSync(serverPublic, { recursive: true });
fs.cpSync(clientDist, serverPublic, { recursive: true });

console.log('Copied client/dist -> server/public');

