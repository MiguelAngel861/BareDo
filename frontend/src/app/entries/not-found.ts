const VALID_ROUTES = ['/', '/pages/login.html', '/pages/register.html', '/pages/404.html'];

const path = window.location.pathname;

if (!VALID_ROUTES.includes(path)) {
  window.location.replace('/pages/404.html');
}
