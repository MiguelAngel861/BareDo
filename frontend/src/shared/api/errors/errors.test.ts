import { describe, expect, it } from 'vitest';
import { ApiErrorClass, getErrorMessage, isApiError } from './errors.ts';

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
