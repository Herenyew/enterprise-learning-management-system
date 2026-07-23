import dotenv from "dotenv";

dotenv.config();

const toBoolean = (value: string | undefined, fallback = false) => {
  if (value === undefined) return fallback;
  return ["true", "1", "yes", "on"].includes(value.toLowerCase());
};

const required = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  apiPrefix: process.env.API_PREFIX ?? "/api",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  corsOrigins: (process.env.CORS_ORIGINS ?? process.env.FRONTEND_URL ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  corsAllowAll: toBoolean(process.env.CORS_ALLOW_ALL),
};

export type AppEnv = typeof env;
