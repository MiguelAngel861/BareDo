import { AuthFormHandler } from '@/features/auth/index.ts';
import { initServerWarmup } from '@/shared/ui/index.ts';

initServerWarmup();

class LoginPage extends AuthFormHandler {
  constructor() {
    super('login-form', 'login');
    this.initAuthFields();
    this.handleSubmit(async () => {
      await this.validateAndSubmit();
    });
  }

  async validateAndSubmit(): Promise<void> {
    if (!this.validateCredentials()) {
      return;
    }
    await this.execute(this.getFieldValue('username'), this.getFieldValue('password'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LoginPage();
});
