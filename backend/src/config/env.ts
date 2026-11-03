import dotenv from "dotenv";

// Load variables from backend/.env (if present) before anything else reads them.
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable "${name}". Copy backend/.env.example to backend/.env and fill it in.`
    );
  }
  return value.trim();
}

function parsePort(raw: string | undefined): number {
  const port = Number(raw ?? 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be a whole number between 1 and 65535 (received "${raw}").`);
  }
  return port;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: parsePort(process.env.PORT),
  // Validated here so a missing value fails fast; Prisma reads DATABASE_URL itself.
  databaseUrl: requireEnv("DATABASE_URL"),
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
};
