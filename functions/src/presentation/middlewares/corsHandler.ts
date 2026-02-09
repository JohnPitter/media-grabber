import cors from "cors";
import { CORS_ORIGINS } from "../../shared/constants";

export const corsHandler = cors({
  origin: [...CORS_ORIGINS],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
});
