import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Express 4 does not catch rejected promises from async handlers.
 * This wrapper forwards them to the error-handling middleware.
 */
export function asyncHandler(controller: AsyncController): RequestHandler {
  return (req, res, next) => {
    controller(req, res, next).catch(next);
  };
}
