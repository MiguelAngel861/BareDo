export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}

export class ApiErrorClass extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiError';
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
  }
}

export function isApiError(error: unknown): error is ApiErrorClass {
  return error instanceof ApiErrorClass;
}
