import { Dropdown, type DropdownOption } from '@/shared/ui/index.ts';
import { getPriorityDescription, prioritiesSignal } from '@/slices/priorities/priorities.state.ts';
import './PriorityDropdown.css';

export interface PriorityDropdownProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  id?: string;
  showHelper?: boolean;
  includeAllOption?: boolean;
}

export function PriorityDropdown({
  value,
  onChange,
  id = 'priority-select',
  showHelper = true,
  includeAllOption = false,
}: PriorityDropdownProps) {
  const options: DropdownOption[] = [
    ...(includeAllOption ? [{ value: '', label: 'All Priorities' }] : []),
    ...prioritiesSignal.value.map((p) => ({
      value: String(p.priority_id),
      label: p.name,
    })),
  ];

  const stringValue = value !== undefined ? String(value) : '';

  const handleChange = (val: string) => {
    if (!val) {
      onChange(undefined);
    } else {
      onChange(Number(val));
    }
  };

  const helperText = value !== undefined ? getPriorityDescription(value) : '';

  return (
    <div class="priority-dropdown-container">
      <Dropdown
        id={id}
        options={options}
        value={stringValue}
        onChange={handleChange}
        placeholder={includeAllOption ? 'All Priorities' : 'Select Priority'}
        ariaLabel="Priority"
      />
      {showHelper && helperText && (
        <span class="priority-helper" id="priority-helper">
          {helperText}
        </span>
      )}
    </div>
  );
}
