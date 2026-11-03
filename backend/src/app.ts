import cors from "cors";
import express, { Express } from "express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import apiRoutes from "./routes";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");

  // Only the configured frontend origin(s) may call the API from a browser.
  // Requests without an Origin header (curl, server-to-server) are allowed.
  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, !origin || env.corsOrigins.includes(origin));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    })
  );

  app.use(express.json({ limit: "100kb" }));

  app.get("/", (_req, res) => {
    res.json({ success: true, message: "Notes API is running. Try GET /api/health", data: null });
  });

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
