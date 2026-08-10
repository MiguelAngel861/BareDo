import { setTokens } from '@/shared/auth-session.ts';
import { FormHandler } from '@/shared/ui/FormHandler/index.ts';
import { authApi } from '../api.ts';

export class AuthFormHandler extends FormHandler {
  constructor(formId: string, apiMethod: 'login' | 'register', successUrl = '/index.html') {
    super(formId);
    this.apiMethod = apiMethod;
    this.successUrl = successUrl;
  }

  private apiMethod: 'login' | 'register';
  private successUrl: string;

  async execute(username: string, password: string): Promise<void> {
    this.setSubmitting(true, this.apiMethod === 'login' ? 'Logging in...' : 'Registering...');

    try {
      const response = await authApi[this.apiMethod](username, password);
      setTokens(response);
      window.location.href = this.successUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : `${this.apiMethod} failed`;
      this.showGlobalError(message);
    } finally {
      this.setSubmitting(false, this.apiMethod === 'login' ? 'Login' : 'Register');
    }
  }
}
