import { describe, expect, it } from 'vitest';
import { ApiErrorClass, getErrorMessage, isApiError, mapBackendError } from './errors.ts';

describe('ApiError and isApiError helper', () => {
  it('instantiates ApiErrorClass properly', () => {
    const err = new ApiErrorClass({
      code: 'VALIDATION_FAILED',
      message: 'Invalid parameters',
      status: 400,
      details: { field: 'email' },
    });

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiError');
    expect(err.code).toBe('VALIDATION_FAILED');
    expect(err.message).toBe('Invalid parameters');
    expect(err.status).toBe(400);
    expect(err.details).toEqual({ field: 'email' });
  });

  it('correctly discriminates ApiErrorClass instances with isApiError', () => {
    const apiErr = new ApiErrorClass({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
      status: 401,
    });
    const standardErr = new Error('Standard error');

    expect(isApiError(apiErr)).toBe(true);
    expect(isApiError(standardErr)).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
    expect(isApiError({ code: 'UNAUTHORIZED' })).toBe(false);
  });

  it('extracts error message from Error instances or returns fallback', () => {
    expect(getErrorMessage(new Error('Network disconnected'), 'Default fallback')).toBe(
      'Network disconnected'
    );
    expect(getErrorMessage('some error string', 'Default fallback')).toBe('Default fallback');
    expect(getErrorMessage(null, 'Default fallback')).toBe('Default fallback');
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
  });
});

describe('mapBackendError', () => {
  it('maps CONFLICT to a friendly message without field errors', () => {
    const result = mapBackendError({
      code: 'CONFLICT',
      message: 'Username already exists',
      status: 409,
    });

    expect(result.title).toBe('Conflict');
    expect(result.message).toBe('Username already in use');
    expect(result.fieldErrors).toBeNull();
  });

  it('maps VALIDATION_ERROR and extracts field errors', () => {
    const result = mapBackendError({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      status: 422,
      details: {
        body_params: [
          { loc: ['body', 'username'], msg: 'ensure this value has at least 3 characters' },
          { loc: ['body', 'password'], msg: 'password too short' },
        ],
      },
    });

    expect(result.title).toBe('Validation error');
    expect(result.message).toBe('Please review the highlighted fields');
    expect(result.fieldErrors).toEqual({
      username: 'ensure this value has at least 3 characters',
      password: 'password too short',
    });
  });

  it('maps unknown codes to a generic friendly error', () => {
    const result = mapBackendError({ code: 'UNKNOWN_CODE', message: 'boom', status: 500 });

    expect(result.title).toBe('Error');
    expect(result.message).toBe('An unexpected error occurred');
    expect(result.fieldErrors).toBeNull();
  });

  it('maps INTERNAL_ERROR without leaking details', () => {
    const result = mapBackendError({
      code: 'INTERNAL_ERROR',
      message: 'Database error',
      status: 500,
      details: { query: 'SELECT * FROM users' },
    });

    expect(result.title).toBe('Internal error');
    expect(result.message).toBe('An internal error occurred. Please try again later');
    expect(result.fieldErrors).toBeNull();
  });
});
