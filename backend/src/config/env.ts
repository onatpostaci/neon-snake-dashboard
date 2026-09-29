import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');

loadEnv({ path: resolve(serverRoot, '.env') });

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Copy backend/.env.example to backend/.env.`);
  return value;
};

const useEmulator = process.env.SQL_CONNECT_EMULATOR !== 'false';

export const config = {
  port: Number(process.env.PORT ?? 3001),
  useEmulator,
  emulatorHost: process.env.DATA_CONNECT_EMULATOR_HOST ?? '127.0.0.1:9399',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-neon-snake',
  serviceAccountPath: useEmulator ? null : resolve(serverRoot, required('FIREBASE_SERVICE_ACCOUNT_PATH')),
  sqlConnectServiceId: process.env.SQL_CONNECT_SERVICE_ID ?? 'neon-snake-5ed83-service',
  sqlConnectLocation: process.env.SQL_CONNECT_LOCATION ?? 'europe-west3'
};
