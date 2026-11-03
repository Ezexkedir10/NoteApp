import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

async function start(): Promise<void> {
  // Try to connect up-front so problems show in the terminal immediately.
  // The API still starts if the database is down: requests then get a clear
  // 503 response, and Prisma reconnects automatically once the DB is back.
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL");
  } catch (error) {
    console.error("Could not connect to PostgreSQL at startup:");
    console.error(`  ${error instanceof Error ? error.message : error}`);
    console.error("The API will start anyway and answer 503 until the database is reachable.");
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`Notes API listening on http://localhost:${env.port} (${env.nodeEnv})`);
    console.log(`Allowed CORS origins: ${env.corsOrigins.join(", ")}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${env.port} is already in use. Stop the other process or change PORT in backend/.env.`);
    } else {
      console.error("Server error:", error);
    }
    process.exit(1);
  });

  const shutdown = (signal: string): void => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error("Failed to start the API:", error);
  process.exit(1);
});
