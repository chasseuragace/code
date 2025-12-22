import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '..', 'secrets', 'firebase-service-account.json');
const ENV_PATH = path.resolve(__dirname, '..', '.env');

function main() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`Service account JSON not found at ${SERVICE_ACCOUNT_PATH}`);
    process.exit(1);
  }

  const plaintext = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');

  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  const keyB64 = key.toString('base64');
  const ivB64 = iv.toString('base64');
  const authTagB64 = authTag.toString('base64');

  const cipherBundle = `${ivB64}:${encrypted}:${authTagB64}`;

  // Update or create .env with both FIREBASE_SA_KEY and FIREBASE_SA_ENC
  let envLines: string[] = [];
  if (fs.existsSync(ENV_PATH)) {
    const envText = fs.readFileSync(ENV_PATH, 'utf8');
    envLines = envText.split('\n').filter((line) => line.trim().length > 0);
    
    // Update or add FIREBASE_SA_KEY
    const keyIndex = envLines.findIndex((line) => line.trimStart().startsWith('FIREBASE_SA_KEY='));
    const newKeyLine = `FIREBASE_SA_KEY=${keyB64}`;
    if (keyIndex !== -1) {
      envLines[keyIndex] = newKeyLine;
    } else {
      envLines.push(newKeyLine);
    }
    
    // Update or add FIREBASE_SA_ENC
    const encIndex = envLines.findIndex((line) => line.trimStart().startsWith('FIREBASE_SA_ENC='));
    const newEncLine = `FIREBASE_SA_ENC=${cipherBundle}`;
    if (encIndex !== -1) {
      envLines[encIndex] = newEncLine;
    } else {
      envLines.push(newEncLine);
    }
  } else {
    envLines = [
      `FIREBASE_SA_KEY=${keyB64}`,
      `FIREBASE_SA_ENC=${cipherBundle}`
    ];
  }

  fs.writeFileSync(ENV_PATH, envLines.join('\n') + '\n', 'utf8');

  console.log('✅ Updated .env with FIREBASE_SA_KEY and FIREBASE_SA_ENC');
  console.log('⚠️  Keep .env file local and gitignored - do not commit to repository');
}

main();
