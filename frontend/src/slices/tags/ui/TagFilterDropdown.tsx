import { Dropdown, type DropdownOption } from '@/shared/ui/index.ts';
import { tagsSignal } from '../tags.state.ts';

export function TagFilterDropdown({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const options: DropdownOption[] = [
    { value: '', label: 'All Tags' },
    ...tagsSignal.value.map((t) => ({
      value: String(t.tag_id),
      label: `#${t.name}`,
    })),
  ];

  return (
    <Dropdown
      id="filter-tag"
      options={options}
      value={value || ''}
      onChange={(val) => onChange(val || undefined)}
      placeholder="All Tags"
      ariaLabel="Filter by tag"
    />
  );
}
