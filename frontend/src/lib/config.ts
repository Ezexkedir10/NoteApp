/**
 * Backend base URL, read once from the environment.
 * There is intentionally no localhost fallback: a missing value should fail
 * loudly instead of silently calling the wrong server in production.
 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
