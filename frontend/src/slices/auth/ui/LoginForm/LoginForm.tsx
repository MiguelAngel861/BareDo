import { Button, InputField } from '@/shared/ui/index.ts';
import { useLocation } from 'preact-iso';
import { useState } from 'preact/hooks';
import { PasswordSchema, UsernameSchema } from '../../auth.schemas.ts';
import { login } from '../../auth.state.ts';
import { AuthCard } from '../AuthCard/index.ts';
import { PasswordInput } from '../PasswordInput/index.ts';

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
    <AuthCard
      title="Login"
      footer={
        <>
          Don't have an account? <a href="/register">Register</a>
        </>
      }
    >
      <form id="login-form" onSubmit={handleSubmit}>
        <InputField
          id="username"
          name="username"
          label="Username"
          required={true}
          minLength={3}
          maxLength={50}
          autoComplete="username"
          placeholder="Enter your username"
          value={username}
          error={usernameError}
          onInput={(val) => setUsername(val)}
          onBlur={handleUsernameBlur}
        />

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          required={true}
          minLength={8}
          maxLength={128}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          error={passwordError}
          onInput={(val) => setPassword(val)}
          onBlur={handlePasswordBlur}
        />

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
