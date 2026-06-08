import { onRequest } from 'firebase-functions/v2/https';
import { createRequire } from 'module';

const requireShared = createRequire(__filename);
const { createApiApp } = requireShared('../shared/api-server');

const apiApp = createApiApp();

export const api = onRequest(
  {
    cors: true,
    memory: '512MiB',
    timeoutSeconds: 120,
    maxInstances: 10,
  },
  apiApp
);
