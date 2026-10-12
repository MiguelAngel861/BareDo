import { render } from 'preact';
import { App } from './App.tsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  render(<App />, rootElement);
}
