import { getErrorMessage } from '@/shared/api/errors/index.ts';
import { Button, InputField } from '@/shared/ui/index.ts';
import { useLocation } from 'preact-iso';
import { useState } from 'preact/hooks';
import { validatePasswordField, validateUsernameField } from '../../auth.schemas.ts';
import { register } from '../../auth.state.ts';
import { AuthCard } from '../AuthCard/index.ts';
import { PasswordInput } from '../PasswordInput/index.ts';

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
    setUsernameError(validateUsernameField(username));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePasswordField(password));
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordError(validateConfirmPassword());
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setGlobalError(null);

    const uErr = validateUsernameField(username);
    const pErr = validatePasswordField(password);
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
      setGlobalError(getErrorMessage(err, 'Registration failed'));
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
        <InputField
          id="username"
          name="username"
          label="Username"
          required={true}
          minLength={3}
          maxLength={50}
          autoComplete="username"
          placeholder="Choose a username"
          value={username}
          error={usernameError}
          onInput={(val) => setUsername(val)}
          onBlur={handleUsernameBlur}
          onKeyDown={() => {
            if (usernameError) {
              setUsernameError(null);
            }
          }}
        />

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          required={true}
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          error={passwordError}
          hint="Minimum 8 characters"
          onInput={(val) => setPassword(val)}
          onBlur={handlePasswordBlur}
        />

        <PasswordInput
          id="confirm-password"
          name="confirm-password"
          label="Confirm Password"
          required={true}
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          placeholder="Confirm your password"
          value={confirmPassword}
          error={confirmPasswordError}
          toggleAriaLabel={{
            show: 'Show confirm password',
            hide: 'Hide confirm password',
          }}
          onInput={(val) => setConfirmPassword(val)}
          onBlur={handleConfirmPasswordBlur}
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
