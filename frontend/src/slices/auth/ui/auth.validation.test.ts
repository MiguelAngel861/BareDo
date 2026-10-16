import { describe, expect, it } from 'vitest';
import { validatePasswordField, validateUsernameField } from './auth.validation.ts';

describe('auth.validation', () => {
  describe('validateUsernameField', () => {
    it('returns null for valid usernames', () => {
      expect(validateUsernameField('alex')).toBeNull();
      expect(validateUsernameField('valid_user123')).toBeNull();
    });

    it('returns error when username is empty or too short', () => {
      expect(validateUsernameField('')).toBe('Username is required');
      expect(validateUsernameField('ab')).toBe('Username must be at least 3 characters');
    });

    it('returns error when username is too long', () => {
      expect(validateUsernameField('a'.repeat(51))).toBe('Username must be 50 characters or less');
    });
  });

  describe('validatePasswordField', () => {
    it('returns null for valid passwords', () => {
      expect(validatePasswordField('password123')).toBeNull();
    });

    it('returns error when password is empty or too short', () => {
      expect(validatePasswordField('')).toBe('Password is required');
      expect(validatePasswordField('short')).toBe('Password must be at least 8 characters');
    });

    it('returns error when password is too long', () => {
      expect(validatePasswordField('a'.repeat(129))).toBe(
        'Password must be 128 characters or less'
      );
    });
  });
});
