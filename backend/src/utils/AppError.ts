/**
 * An error we deliberately throw for expected problems
 * (bad input, missing resource, ...). The error-handling middleware
 * turns it into a JSON response with the given status code.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string>;

  constructor(statusCode: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
