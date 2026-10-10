import { AuthFormHandler } from '@/features/auth/index.ts';
import { initServerWarmup } from '@/shared/ui/index.ts';
import { confirmPasswordRules } from '@/shared/utils/index.ts';

initServerWarmup();

class RegisterPage extends AuthFormHandler {
  constructor() {
    super('register-form', 'register');
    this.initAuthFields();
    this.registerField('confirmPassword', 'confirm-password', 'confirm-password-error');

    this.validateOnBlur(
      'confirmPassword',
      confirmPasswordRules(() => this.getFieldValue('password'))
    );

    this.handleSubmit(async () => {
      await this.validateAndSubmit();
    });
  }

  async validateAndSubmit(): Promise<void> {
    const credsValid = this.validateCredentials();
    const confirmValid = this.validateField(
      'confirmPassword',
      confirmPasswordRules(() => this.getFieldValue('password'))
    );

    if (!credsValid || !confirmValid) {
      return;
    }

    await this.execute(this.getFieldValue('username'), this.getFieldValue('password'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RegisterPage();
});
