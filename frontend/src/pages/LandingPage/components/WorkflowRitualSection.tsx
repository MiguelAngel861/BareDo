import type { JSX } from 'preact';

interface RitualStep {
  step: string;
  timestamp: string;
  title: string;
  actionCode: string;
  description: string;
}

const RITUAL_STEPS: RitualStep[] = [
  {
    step: '01',
    timestamp: '09:15',
    title: 'RAPID CAPTURE',
    actionCode: '[C] // BUFFER_APPEND',
    description:
      'Midway through debugging, an urgent subtask appears. Hit [C], type the title, press Enter. Your brain is cleared in 2 seconds without leaving editor focus.',
  },
  {
    step: '02',
    timestamp: '13:40',
    title: 'HOME-ROW TRIAGE',
    actionCode: '[J/K] // CYCLE_BUFFER',
    description:
      'Scan your queue with J and K. Filter by #tag in the Command Palette [Ctrl+K]. Edit inline with [E]. Zero mouse interaction, zero friction.',
  },
  {
    step: '03',
    timestamp: '17:50',
    title: 'QUEUE CLEARED',
    actionCode: '[SPACE] // COMMIT_TASK',
    description:
      'Hit Space on each finished item. Watch tasks clear instantly at 0ms. When the list hits 0 PENDING, your mental RAM is free for the day.',
  },
];

export function WorkflowRitualSection(): JSX.Element {
  return (
    <section
      id="workflow"
      class="landing-section landing-workflow-section"
      aria-labelledby="workflow-title"
    >
      <div class="landing-section-header">
        <span class="landing-section-index">{'[ 03 / 04 ] // WORKFLOW_RITUAL'}</span>
        <h2 id="workflow-title" class="landing-section-title">
          THE 3-SECOND RITUAL.
        </h2>
        <p class="landing-section-subhead">
          How software engineers maintain continuous flow from morning capture to evening shutdown.
        </p>
      </div>

      <div class="landing-ritual-timeline">
        {RITUAL_STEPS.map((item) => (
          <div key={item.step} class="landing-ritual-card">
            <div class="landing-ritual-meta">
              <span class="landing-ritual-step">{item.step}</span>
              <span class="landing-ritual-time">{item.timestamp}</span>
              <span class="landing-ritual-code">{item.actionCode}</span>
            </div>
            <h3 class="landing-ritual-title">{item.title}</h3>
            <p class="landing-ritual-desc">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
