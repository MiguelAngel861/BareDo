import { AuthFormHandler } from '@/features/auth/ui/auth-form.ts';
import {
  PASSWORD_RULES,
  USERNAME_RULES,
  confirmPasswordRules,
} from '@/shared/utils/validations.ts';

class RegisterPage extends AuthFormHandler {
  constructor() {
    super('register-form', 'register');

    this.registerField('username', 'username', 'username-error');
    this.registerField('password', 'password', 'password-error');
    this.registerField('confirmPassword', 'confirm-password', 'confirm-password-error');
    this.registerGlobalError('global-error');
    this.registerSubmitButton('submit-btn');

    this.validateOnBlur('username', USERNAME_RULES);
    this.validateOnBlur('password', PASSWORD_RULES);
    this.validateOnBlur(
      'confirmPassword',
      confirmPasswordRules(() => this.getFieldValue('password'))
    );

    this.handleSubmit(async () => {
      await this.validateAndSubmit();
    });
  }

  async validateAndSubmit(): Promise<void> {
    const usernameValid = this.validateField('username', USERNAME_RULES);
    const passwordValid = this.validateField('password', PASSWORD_RULES);
    const confirmValid = this.validateField(
      'confirmPassword',
      confirmPasswordRules(() => this.getFieldValue('password'))
    );

    if (!usernameValid || !passwordValid || !confirmValid) {
      return;
    }

    await this.execute(this.getFieldValue('username'), this.getFieldValue('password'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RegisterPage();
});
