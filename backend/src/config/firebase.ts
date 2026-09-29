import { cert, initializeApp } from 'firebase-admin/app';
import { getDataConnect } from 'firebase-admin/data-connect';
import { readFileSync } from 'node:fs';

import { config } from './env.js';

if (config.useEmulator) {
  process.env.DATA_CONNECT_EMULATOR_HOST = config.emulatorHost;
  initializeApp({ projectId: config.firebaseProjectId });
} else if (config.serviceAccountPath) {
  const serviceAccount = JSON.parse(readFileSync(config.serviceAccountPath, 'utf8')) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };

  initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key
    })
  });
}

export const dataConnect = getDataConnect({
  serviceId: config.sqlConnectServiceId,
  location: config.sqlConnectLocation,
  connector: 'gameplay'
});
