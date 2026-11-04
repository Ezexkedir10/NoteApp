import { RequestHandler } from "express";
import { AppError } from "../utils/AppError";

/** Catches any request that did not match a route. */
export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, "Route not found."));
};
