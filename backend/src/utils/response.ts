import { Response } from "express";

/** Sends the consistent success envelope used by every endpoint. */
export function sendSuccess<T>(res: Response, statusCode: number, message: string, data: T): void {
  res.status(statusCode).json({ success: true, message, data });
}
