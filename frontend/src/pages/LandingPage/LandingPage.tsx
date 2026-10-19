import { useDocumentTitle } from '@/shared/hooks/index.ts';
import type { JSX } from 'preact';
import {
  CovenantSection,
  HeroSection,
  KeyboardEngineSection,
  LandingFooter,
  LandingHeader,
  RazorSection,
  WorkflowRitualSection,
} from './components/index.ts';
import './LandingPage.css';

export function LandingPage(): JSX.Element {
  useDocumentTitle('BareDo — Cut the Noise. Execute.');

  return (
    <div class="landing-page">
      <LandingHeader />
      <main class="landing-main">
        <HeroSection />
        <KeyboardEngineSection />
        <RazorSection />
        <WorkflowRitualSection />
        <CovenantSection />
      </main>
      <LandingFooter />
    </div>
  );
}
