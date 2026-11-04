import { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";

interface NormalizedError {
  statusCode: number;
  message: string;
  errors?: Record<string, string>;
}

const DATABASE_UNAVAILABLE: NormalizedError = {
  statusCode: 503,
  message: "The database is currently unavailable. Please try again in a moment.",
};

// Prisma codes that mean "could not reach / talk to the database".
const CONNECTION_ERROR_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);

/** Reads the `type` that body-parser attaches to its errors (bad JSON, body too large). */
function getBodyParserErrorType(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "type" in err) {
    const type = (err as { type: unknown }).type;
    return typeof type === "string" ? type : undefined;
  }
  return undefined;
}

/** Converts any thrown value into a safe status code + message. */
function normalizeError(err: unknown): NormalizedError {
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, message: err.message, errors: err.errors };
  }

  const bodyParserType = getBodyParserErrorType(err);
  if (bodyParserType === "entity.parse.failed") {
    return { statusCode: 400, message: "Request body contains invalid JSON." };
  }
  if (bodyParserType === "entity.too.large") {
    return { statusCode: 413, message: "Request body is too large." };
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return DATABASE_UNAVAILABLE;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") return { statusCode: 404, message: "Note not found." };
    if (err.code === "P2023") return { statusCode: 400, message: "Invalid note ID." };
    if (CONNECTION_ERROR_CODES.has(err.code)) return DATABASE_UNAVAILABLE;
  }

  return { statusCode: 500, message: "Something went wrong on our side. Please try again." };
}

/**
 * Central error handler. Clients only ever receive the sanitised message;
 * the full error (stack, Prisma details) is logged on the server.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const { statusCode, message, errors } = normalizeError(err);

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${statusCode}`);
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};
