import { Dropdown, type DropdownOption, SearchBar } from '@/shared/ui/index.ts';
import { PriorityDropdown } from '@/slices/priorities/index.ts';
import { TagFilterDropdown } from '@/slices/tags/index.ts';
import { filtersSignal, setFilter, setSearch } from '../../tasks.state.ts';
import './TaskFiltersBar.css';

const STATUS_OPTIONS: DropdownOption[] = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Completed' },
  { value: 'false', label: 'Pending' },
];

export function TaskFiltersBar() {
  const filters = filtersSignal.value;

  const handleStatusChange = (val: string) => {
    if (val === 'true') {
      setFilter('completed', true);
    } else if (val === 'false') {
      setFilter('completed', false);
    } else {
      setFilter('completed', undefined);
    }
  };

  const completedString =
    filters.completed === true ? 'true' : filters.completed === false ? 'false' : '';

  return (
    <div id="filters-bar" class="filters-bar" role="search" aria-label="Task filters">
      <div class="filter-group filter-group--search">
        <label for="search-title" class="filter-label">
          Search
        </label>
        <SearchBar
          id="search-title"
          value={filters.title || ''}
          placeholder="Search tasks..."
          ariaLabel="Search tasks"
          enableGlobalShortcut={true}
          shortcutHint="/"
          debounceMs={300}
          onSearch={(val) => setSearch(val, true)}
        />
      </div>

      <div class="filter-group">
        <label for="filter-completed" class="filter-label">
          Status
        </label>
        <Dropdown
          id="filter-completed"
          options={STATUS_OPTIONS}
          value={completedString}
          onChange={handleStatusChange}
          placeholder="All"
          ariaLabel="Filter by status"
        />
      </div>

      <div class="filter-group">
        <label for="filter-priority" class="filter-label">
          Priority
        </label>
        <PriorityDropdown
          id="filter-priority"
          value={filters.priority_id}
          onChange={(val) => setFilter('priority_id', val)}
          includeAllOption={true}
          showHelper={false}
        />
      </div>

      <div class="filter-group">
        <label for="filter-tag" class="filter-label">
          Tag
        </label>
        <TagFilterDropdown
          value={typeof filters.tag_ids === 'string' ? filters.tag_ids : undefined}
          onChange={(val) => setFilter('tag_ids', val)}
        />
      </div>
    </div>
  );
}
