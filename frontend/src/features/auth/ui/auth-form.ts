import { setTokens } from '@/shared/auth-session.ts';
import { FormHandler } from '@/shared/ui/FormHandler/index.ts';
import { PASSWORD_RULES, USERNAME_RULES } from '@/shared/utils/index.ts';
import { authApi } from '../api.ts';

export class AuthFormHandler extends FormHandler {
  constructor(formId: string, apiMethod: 'login' | 'register', successUrl = '/') {
    super(formId);
    this.apiMethod = apiMethod;
    this.successUrl = successUrl;
  }

  private apiMethod: 'login' | 'register';
  private successUrl: string;

  protected initAuthFields(): void {
    this.registerField('username', 'username', 'username-error');
    this.registerField('password', 'password', 'password-error');
    this.registerGlobalError('global-error');
    this.registerSubmitButton('submit-btn');

    this.validateOnBlur('username', USERNAME_RULES);
    this.validateOnBlur('password', PASSWORD_RULES);
  }

  protected validateCredentials(): boolean {
    const usernameValid = this.validateField('username', USERNAME_RULES);
    const passwordValid = this.validateField('password', PASSWORD_RULES);
    return usernameValid && passwordValid;
  }

  async execute(username: string, password: string): Promise<void> {
    const initialText = this.apiMethod === 'login' ? 'Logging in...' : 'Registering...';
    this.setSubmitting(true, initialText);
    console.log(`[auth] ${this.apiMethod} attempt for user: ${username}`);

    const slowTimer = window.setTimeout(() => {
      this.setSubmitting(true, 'Iniciando servidor (espera ~30s)...');
    }, 3500);

    try {
      const response = await authApi[this.apiMethod](username, password);
      clearTimeout(slowTimer);
      console.log(`[auth] ${this.apiMethod} successful`);
      setTokens(response);
      window.location.href = this.successUrl;
    } catch (error) {
      clearTimeout(slowTimer);
      console.error(`[auth] ${this.apiMethod} failed:`, error);
      const message = error instanceof Error ? error.message : `${this.apiMethod} failed`;
      this.showGlobalError(message);
    } finally {
      clearTimeout(slowTimer);
      this.setSubmitting(false, this.apiMethod === 'login' ? 'Login' : 'Register');
    }
  }
}
