import { PrismaClient } from "@prisma/client";
import { env } from "./env";

/**
 * Single shared Prisma client for the whole API.
 * Importing `env` first guarantees .env has been loaded.
 */
export const prisma = new PrismaClient({
  log: env.isProduction ? ["error"] : ["warn", "error"],
});
