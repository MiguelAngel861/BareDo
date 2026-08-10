export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  match?: string;
  custom?: (value: string) => boolean;
  message: string;
}

export const USERNAME_RULES: ValidationRule[] = [
  { required: true, message: 'Username is required' },
  { min: 3, message: 'Username must be at least 3 characters' },
  { max: 50, message: 'Username must be 50 characters or less' },
];

export const PASSWORD_RULES: ValidationRule[] = [
  { required: true, message: 'Password is required' },
  { min: 8, message: 'Password must be at least 8 characters' },
  { max: 128, message: 'Password must be 128 characters or less' },
];

export function confirmPasswordRules(getPassword: () => string): ValidationRule[] {
  return [
    { required: true, message: 'Please confirm your password' },
    { match: getPassword(), message: 'Passwords do not match' },
  ];
}
