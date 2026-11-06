/** Envelope returned by the backend for successful requests. */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

/** Envelope returned by the backend for failed requests. */
export interface ApiFailure {
  success: false;
  message: string;
  /** Field-level validation messages, e.g. { title: "Title is required." } */
  errors?: Record<string, string>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
