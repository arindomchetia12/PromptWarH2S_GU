import { ArrowUpDown, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';

export type SortOption = 'relevance' | 'alphabetical';

export function SchemeFilters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories,
  state,
  onStateChange,
  level,
  onLevelChange,
  sortBy,
  onSortByChange,
  resultCount,
  isLoading,
  onClear,
}: {
  query: string;
  onQueryChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  categories: string[];
  state: string;
  onStateChange: (val: string) => void;
  level: string;
  onLevelChange: (val: string) => void;
  sortBy: SortOption;
  onSortByChange: (val: SortOption) => void;
  resultCount: number;
  isLoading: boolean;
  onClear: () => void;
}) {
  const hasActiveFilters = Boolean(query.trim() || category || state || level);

  return (
    <div className="rounded-2xl border border-[#1769AA]/20 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#1769AA]/10">
        <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[#123E67]">
          <SlidersHorizontal size={17} className="text-[#1769AA]" aria-hidden="true" />
          <span>Search & Filter Schemes</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-[#1769AA] hover:bg-[#DCEFFA] hover:text-[#123E67]"
            data-testid="button-clear-filters"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset filters
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <label htmlFor="filter-keyword" className="block text-xs font-bold uppercase tracking-wider text-[#123E67] mb-1.5">
            Keyword or need
          </label>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1769AA]"
              aria-hidden="true"
            />
            <input
              id="filter-keyword"
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search schemes or needs..."
              className="min-h-12 w-full rounded-xl border border-[#1769AA]/30 bg-[#F5F9FC] pl-10 pr-3 text-base text-[#203040] focus:border-[#1769AA] focus:bg-white"
              data-testid="input-search-schemes"
            />
          </div>
        </div>

        <div>
          <label htmlFor="filter-category" className="block text-xs font-bold uppercase tracking-wider text-[#123E67] mb-1.5">
            Category
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-[#1769AA]/30 bg-[#F5F9FC] px-3 text-base font-medium text-[#203040] focus:border-[#1769AA] focus:bg-white"
            data-testid="select-category"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-location" className="block text-xs font-bold uppercase tracking-wider text-[#123E67] mb-1.5">
            Location / State
          </label>
          <select
            id="filter-location"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-[#1769AA]/30 bg-[#F5F9FC] px-3 text-base font-medium text-[#203040] focus:border-[#1769AA] focus:bg-white"
            data-testid="select-state"
          >
            <option value="">Assam & All India</option>
            <option value="Assam">Assam</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-level" className="block text-xs font-bold uppercase tracking-wider text-[#123E67] mb-1.5">
            Government level
          </label>
          <select
            id="filter-level"
            value={level}
            onChange={(e) => onLevelChange(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-[#1769AA]/30 bg-[#F5F9FC] px-3 text-base font-medium text-[#203040] focus:border-[#1769AA] focus:bg-white"
            data-testid="select-government-level"
          >
            <option value="">State & Central</option>
            <option value="state">Assam State Government</option>
            <option value="central">Central Government</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1769AA]/10">
        <p
          className="text-base font-bold text-[#123E67]"
          aria-live="polite"
          data-testid="text-scheme-count"
        >
          {isLoading
            ? 'Loading schemes…'
            : `${resultCount} ${resultCount === 1 ? 'scheme' : 'schemes'} found`}
        </p>

        <div className="flex items-center gap-2">
          <ArrowUpDown size={16} className="text-[#1769AA]" aria-hidden="true" />
          <label htmlFor="sort-schemes" className="text-sm font-semibold text-[#203040]">
            Sort by:
          </label>
          <select
            id="sort-schemes"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortOption)}
            className="min-h-10 rounded-lg border border-[#1769AA]/30 bg-[#F5F9FC] px-3 text-sm font-bold text-[#123E67]"
            data-testid="select-sort"
          >
            <option value="relevance">Relevance</option>
            <option value="alphabetical">Alphabetical (A–Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
