import { type RenderOptions, type RenderResult, render } from '@testing-library/preact';
import type { ComponentChild, VNode } from 'preact';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: (props: { children: ComponentChild }) => VNode;
}

/**
 * Custom render helper that can wrap components with global providers if needed.
 */
export function renderWithProviders(ui: VNode, options?: CustomRenderOptions): RenderResult {
  return render(ui, options);
}

export * from '@testing-library/preact';
