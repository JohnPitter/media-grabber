import { onRequest } from "firebase-functions/v2/https";

export const healthCheck = onRequest(
  {
    region: "us-east1",
    memory: "128MiB",
    timeoutSeconds: 10,
  },
  (_req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  },
);
