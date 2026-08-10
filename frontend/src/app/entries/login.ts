import { AuthFormHandler } from '@/features/auth/ui/auth-form.ts';
import { PASSWORD_RULES, USERNAME_RULES } from '@/shared/utils/validations.ts';

class LoginPage extends AuthFormHandler {
  constructor() {
    super('login-form', 'login');

    this.registerField('username', 'username', 'username-error');
    this.registerField('password', 'password', 'password-error');
    this.registerGlobalError('global-error');
    this.registerSubmitButton('submit-btn');

    this.validateOnBlur('username', USERNAME_RULES);
    this.validateOnBlur('password', PASSWORD_RULES);

    this.handleSubmit(async () => {
      await this.validateAndSubmit();
    });
  }

  async validateAndSubmit(): Promise<void> {
    const usernameValid = this.validateField('username', USERNAME_RULES);
    const passwordValid = this.validateField('password', PASSWORD_RULES);

    if (!usernameValid || !passwordValid) {
      return;
    }

    await this.execute(this.getFieldValue('username'), this.getFieldValue('password'));
  }
}

new LoginPage();
