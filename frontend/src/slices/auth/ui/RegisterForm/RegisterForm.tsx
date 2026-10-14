import { Button } from '@/shared/ui/index.ts';
import { useLocation } from 'preact-iso';
import { useState } from 'preact/hooks';
import { PasswordSchema, UsernameSchema } from '../../auth.schemas.ts';
import { register } from '../../auth.state.ts';
import { AuthCard } from '../AuthCard/index.ts';
import { PasswordInput } from '../PasswordInput/index.ts';
import './RegisterForm.css';

export function RegisterForm() {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitText, setSubmitText] = useState('Register');

  const validateUsername = (): string | null => {
    const res = UsernameSchema.safeParse(username);
    return res.success ? null : res.error.errors[0]?.message || 'Invalid username';
  };

  const validatePassword = (): string | null => {
    const res = PasswordSchema.safeParse(password);
    return res.success ? null : res.error.errors[0]?.message || 'Invalid password';
  };

  const validateConfirmPassword = (): string | null => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleUsernameBlur = () => {
    setUsernameError(validateUsername());
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword());
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordError(validateConfirmPassword());
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setGlobalError(null);

    const uErr = validateUsername();
    const pErr = validatePassword();
    const cpErr = validateConfirmPassword();

    setUsernameError(uErr);
    setPasswordError(pErr);
    setConfirmPasswordError(cpErr);

    if (uErr || pErr || cpErr) {
      return;
    }

    setIsSubmitting(true);
    setSubmitText('Registering...');

    const slowTimer = window.setTimeout(() => {
      setSubmitText('Iniciando servidor (espera ~30s)...');
    }, 3500);

    try {
      await register(username, password);
      clearTimeout(slowTimer);
      location.route('/');
    } catch (err) {
      clearTimeout(slowTimer);
      const message = err instanceof Error ? err.message : 'Registration failed';
      setGlobalError(message);
    } finally {
      clearTimeout(slowTimer);
      setIsSubmitting(false);
      setSubmitText('Register');
    }
  };

  return (
    <AuthCard
      title="Create Account"
      footer={
        <>
          Already have an account? <a href="/login">Login</a>
        </>
      }
    >
      <form id="register-form" onSubmit={handleSubmit}>
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            minLength={3}
            maxLength={50}
            autoComplete="username"
            placeholder="Choose a username"
            value={username}
            onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
            onBlur={handleUsernameBlur}
          />
          {usernameError && (
            <span class="error-message" id="username-error">
              {usernameError}
            </span>
          )}
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            onBlur={handlePasswordBlur}
          />
          {passwordError && (
            <span class="error-message" id="password-error">
              {passwordError}
            </span>
          )}
          <div class="password-requirements">Minimum 8 characters</div>
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <PasswordInput
            id="confirm-password"
            name="confirm-password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            placeholder="Confirm your password"
            value={confirmPassword}
            toggleAriaLabel={{
              show: 'Show confirm password',
              hide: 'Hide confirm password',
            }}
            onInput={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
            onBlur={handleConfirmPasswordBlur}
          />
          {confirmPasswordError && (
            <span class="error-message" id="confirm-password-error">
              {confirmPasswordError}
            </span>
          )}
        </div>

        {globalError && (
          <div id="global-error" class="global-error">
            {globalError}
          </div>
        )}

        <Button
          type="submit"
          id="submit-btn"
          variant="primary"
          size="lg"
          fullWidth={true}
          isLoading={isSubmitting}
        >
          {submitText}
        </Button>
      </form>
    </AuthCard>
  );
}
