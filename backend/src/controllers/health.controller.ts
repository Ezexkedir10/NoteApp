import { Request, Response } from "express";
import { prisma } from "../config/prisma";

/**
 * GET /api/health
 * Reports whether the API is up AND whether it can reach PostgreSQL.
 */
export async function checkHealth(_req: Request, res: Response): Promise<void> {
  const timestamp = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: "API is healthy",
      data: { status: "ok", database: "connected", uptimeSeconds: Math.round(process.uptime()), timestamp },
    });
  } catch (error) {
    console.error("Health check: database unreachable:", error instanceof Error ? error.message : error);
    res.status(503).json({
      success: false,
      message: "The API is running, but the database is unreachable.",
      data: { status: "degraded", database: "unreachable", uptimeSeconds: Math.round(process.uptime()), timestamp },
    });
  }
}
