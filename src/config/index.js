// src/config/index.js
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || "0.0.0.0",
  smtp: {
    host: process.env.SMTP_HOST || "0.0.0.0",
    port: Number(process.env.SMTP_PORT) || 25,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
  },
  mongo: {
    url: process.env.MONGODB_URL || "mongodb://localhost:27017/mailcatcher",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "fallback_secret",
  },
  apiKey: process.env.API_KEY,
  ttlMinutes: Number(process.env.TTL_MINUTES) || 30,
  allowedDomains: (process.env.ALLOWED_DOMAINS || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
  },
};