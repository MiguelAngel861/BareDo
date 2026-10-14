import { signal } from '@preact/signals';

export const isCommandPaletteOpenSignal = signal<boolean>(false);

export function openCommandPalette(): void {
  isCommandPaletteOpenSignal.value = true;
}

export function closeCommandPalette(): void {
  isCommandPaletteOpenSignal.value = false;
}

export function toggleCommandPalette(): void {
  isCommandPaletteOpenSignal.value = !isCommandPaletteOpenSignal.value;
}
