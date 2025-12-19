import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '..', 'secrets', 'firebase-service-account.json');
const DOCKER_COMPOSE_PATH = path.resolve(__dirname, '..', 'docker-compose.yml');
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

  if (!fs.existsSync(DOCKER_COMPOSE_PATH)) {
    console.error(`docker-compose.yml not found at ${DOCKER_COMPOSE_PATH}`);
    process.exit(1);
  }

  let composeText = fs.readFileSync(DOCKER_COMPOSE_PATH, 'utf8');

  // Work line-by-line to avoid ever producing malformed YAML
  const lines = composeText.split('\n')
    // Remove any firebase-service-account.json volume mount line if present
    .filter((line) => !line.includes('firebase-service-account.json'));

  const envLinePrefix = '      FIREBASE_SA_ENC:';
  const newEnvLine = `${envLinePrefix} "${cipherBundle}"`;

  const envIndex = lines.findIndex((line) => line.trimStart().startsWith('FIREBASE_SA_ENC:'));

  if (envIndex !== -1) {
    // Replace the entire FIREBASE_SA_ENC line
    lines[envIndex] = newEnvLine;
  } else {
    const anchor = '      AUTH_JWT_SECRET: dev-jwt-secret';
    const anchorIndex = lines.findIndex((line) => line === anchor);
    if (anchorIndex === -1) {
      console.error('Could not find AUTH_JWT_SECRET anchor to insert FIREBASE_SA_ENC under server.environment');
      process.exit(1);
    }
    lines.splice(anchorIndex + 1, 0, newEnvLine);
  }

  composeText = lines.join('\n');

  fs.writeFileSync(DOCKER_COMPOSE_PATH, composeText, 'utf8');

  // Update or create .env with FIREBASE_SA_KEY so no manual step is needed
  let envLines: string[] = [];
  if (fs.existsSync(ENV_PATH)) {
    const envText = fs.readFileSync(ENV_PATH, 'utf8');
    envLines = envText.split('\n').filter((line) => line.trim().length > 0);
    const keyIndex = envLines.findIndex((line) => line.trimStart().startsWith('FIREBASE_SA_KEY='));
    const newKeyLine = `FIREBASE_SA_KEY=${keyB64}`;
    if (keyIndex !== -1) {
      envLines[keyIndex] = newKeyLine;
    } else {
      envLines.push(newKeyLine);
    }
  } else {
    envLines = [`FIREBASE_SA_KEY=${keyB64}`];
  }

  fs.writeFileSync(ENV_PATH, envLines.join('\n') + '\n', 'utf8');

  console.log('Updated docker-compose.yml with FIREBASE_SA_ENC');
  console.log('Updated .env with FIREBASE_SA_KEY (keep this file local and gitignored).');
}

main();
