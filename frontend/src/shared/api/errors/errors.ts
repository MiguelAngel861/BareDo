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

export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (error instanceof Error) {
    const name = error.name;
    const message = error.message;
    if (name === 'TimeoutError' || /timed out/i.test(message)) {
      return 'La solicitud tardó demasiado. Intenta de nuevo';
    }
    if (name === 'NetworkError' || /failed to fetch/i.test(message)) {
      return 'No se pudo conectar con el servidor. Intenta de nuevo';
    }
    return message;
  }
  return fallback;
}

export interface MappedError {
  title: string;
  message: string;
  fieldErrors: Record<string, string> | null;
}

const FRIENDLY_BY_CODE: Record<string, { title: string; message: string }> = {
  VALIDATION_ERROR: {
    title: 'Validation error',
    message: 'Please review the highlighted fields',
  },
  BAD_REQUEST: {
    title: 'Invalid request',
    message: 'The request could not be processed',
  },
  CONFLICT: {
    title: 'Conflict',
    message: 'Username already in use',
  },
  NOT_FOUND: {
    title: 'Not found',
    message: 'The requested resource was not found',
  },
  AUTHENTICATION_ERROR: {
    title: 'Authentication error',
    message: 'Invalid username or password',
  },
  INTERNAL_ERROR: {
    title: 'Internal error',
    message: 'An internal error occurred. Please try again later',
  },
};

export function mapBackendError(error: ApiError): MappedError {
  const friendly = FRIENDLY_BY_CODE[error.code] ?? {
    title: 'Error',
    message: 'An unexpected error occurred',
  };

  let fieldErrors: Record<string, string> | null = null;
  if (error.code === 'VALIDATION_ERROR' && error.details) {
    const details = error.details as {
      body_params?: Array<{ loc?: string[]; msg?: string }>;
    };
    const params = details?.body_params;
    if (Array.isArray(params)) {
      fieldErrors = {};
      for (const p of params) {
        const loc = p.loc;
        const field = loc && loc.length > 0 ? loc[loc.length - 1] : undefined;
        if (field && p.msg) {
          fieldErrors[field] = p.msg;
        }
      }
      if (Object.keys(fieldErrors).length === 0) {
        fieldErrors = null;
      }
    }
  }

  return { title: friendly.title, message: friendly.message, fieldErrors };
}

export interface FriendlyError extends Error {
  title: string;
  code: string;
  status: number;
  fieldErrors: Record<string, string> | null;
}
