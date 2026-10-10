export class CustomDropdown {
  private readonly element: HTMLElement;
  private readonly trigger: HTMLButtonElement | null;
  private readonly options: NodeListOf<Element>;
  private value: string;
  private readonly onSelect?: ((value: string) => void) | undefined;

  constructor(element: HTMLElement, onSelect?: ((value: string) => void) | undefined) {
    this.element = element;
    this.trigger = element.querySelector('.dropdown-trigger');
    this.options = element.querySelectorAll('.dropdown-option');
    this.value = element.dataset.value || '';
    this.onSelect = onSelect;

    this.init();
  }

  private init(): void {
    this.trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    for (const option of this.options) {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        this.select(option as HTMLElement);
      });
    }

    this.trigger?.addEventListener('keydown', (e) => this.handleKeyboard(e as KeyboardEvent));

    document.addEventListener('click', () => this.close());
  }

  toggle(): void {
    const isExpanded = this.trigger?.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.trigger?.setAttribute('aria-expanded', 'true');
  }

  close(): void {
    this.trigger?.setAttribute('aria-expanded', 'false');
  }

  getValue(): string {
    return this.value;
  }

  setValue(value: string): void {
    this.value = value;
    this.element.dataset.value = value;

    for (const opt of this.options) {
      const isMatch = opt.getAttribute('data-value') === value;
      opt.classList.toggle('selected', isMatch);
      opt.setAttribute('aria-selected', String(isMatch));
      if (isMatch) {
        const valueEl = this.trigger?.querySelector('.dropdown-value');
        if (valueEl) {
          valueEl.textContent = opt.textContent;
        }
      }
    }
  }

  select(option: HTMLElement): void {
    const val = option.getAttribute('data-value') ?? option.dataset.value ?? '';
    this.setValue(val);
    this.close();

    if (this.onSelect) {
      this.onSelect(this.value);
    }
  }

  private handleKeyboard(e: KeyboardEvent): void {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.toggle();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (this.trigger?.getAttribute('aria-expanded') === 'false') {
          this.open();
        } else {
          this.focusNextOption();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusPrevOption();
        break;
      case 'Escape':
        this.close();
        this.trigger?.focus();
        break;
    }
  }

  private focusNextOption(): void {
    const options = Array.from(this.options);
    const currentIndex = options.findIndex((opt) => opt === document.activeElement);
    const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    (options[nextIndex] as HTMLElement).focus();
  }

  private focusPrevOption(): void {
    const options = Array.from(this.options);
    const currentIndex = options.findIndex((opt) => opt === document.activeElement);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    (options[prevIndex] as HTMLElement).focus();
  }
}
