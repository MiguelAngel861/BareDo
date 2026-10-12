import { Button } from '@/shared/ui/index.ts';
import { useLocation } from 'preact-iso';
import { useState } from 'preact/hooks';
import { PasswordSchema, UsernameSchema } from '../auth.schemas.ts';
import { login } from '../auth.state.ts';

export function LoginForm() {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitText, setSubmitText] = useState('Login');

  const validateUsername = (): string | null => {
    const res = UsernameSchema.safeParse(username);
    return res.success ? null : res.error.errors[0]?.message || 'Invalid username';
  };

  const validatePassword = (): string | null => {
    const res = PasswordSchema.safeParse(password);
    return res.success ? null : res.error.errors[0]?.message || 'Invalid password';
  };

  const handleUsernameBlur = () => {
    setUsernameError(validateUsername());
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword());
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setGlobalError(null);

    const uErr = validateUsername();
    const pErr = validatePassword();
    setUsernameError(uErr);
    setPasswordError(pErr);

    if (uErr || pErr) {
      return;
    }

    setIsSubmitting(true);
    setSubmitText('Logging in...');

    const slowTimer = window.setTimeout(() => {
      setSubmitText('Iniciando servidor (espera ~30s)...');
    }, 3500);

    try {
      await login(username, password);
      clearTimeout(slowTimer);
      location.route('/');
    } catch (err) {
      clearTimeout(slowTimer);
      const message = err instanceof Error ? err.message : 'Login failed';
      setGlobalError(message);
    } finally {
      clearTimeout(slowTimer);
      setIsSubmitting(false);
      setSubmitText('Login');
    }
  };

  return (
    <div class="auth-page">
      <div class="auth-container">
        <h1>Login</h1>
        <form id="login-form" onSubmit={handleSubmit}>
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
              placeholder="Enter your username"
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
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={8}
              maxLength={128}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
              onBlur={handlePasswordBlur}
            />
            {passwordError && (
              <span class="error-message" id="password-error">
                {passwordError}
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

        <div class="switch-link">
          Don't have an account? <a href="/register">Register</a>
        </div>
      </div>
    </div>
  );
}
