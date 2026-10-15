import { Dropdown, type DropdownOption } from '@/shared/ui/index.ts';
import { tagsSignal } from '../../tags.state.ts';
import './TagFilterDropdown.css';

export interface TagFilterDropdownProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  id?: string;
}

export function TagFilterDropdown({ value, onChange, id = 'filter-tag' }: TagFilterDropdownProps) {
  const options: DropdownOption[] = [
    { value: '', label: 'All Tags' },
    ...tagsSignal.value.map((t) => ({
      value: String(t.tag_id),
      label: `#${t.name}`,
    })),
  ];

  return (
    <div class="tag-filter-dropdown-container">
      <Dropdown
        id={id}
        options={options}
        value={value || ''}
        onChange={(val) => onChange(val || undefined)}
        placeholder="All Tags"
        ariaLabel="Filter by tag"
      />
    </div>
  );
}
