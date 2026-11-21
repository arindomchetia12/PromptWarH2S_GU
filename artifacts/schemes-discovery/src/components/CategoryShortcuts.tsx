import { categoryIcon } from '../lib/schemes';

export function CategoryShortcuts({
  categories,
  counts = {},
  selectedCategory = '',
  onSelectCategory,
}: {
  categories: string[];
  counts?: Record<string, number>;
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
}) {
  if (!categories.length) return null;

  return (
    <section aria-labelledby="explore-by-category-heading" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="explore-by-category-heading" className="text-2xl font-extrabold text-[#123E67]">
          Explore by category
        </h2>
        <span className="text-sm font-medium text-[#203040]/75">
          Showing categories with verified scheme records
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {categories.map((cat) => {
          const Icon = categoryIcon(cat);
          const active = selectedCategory.toLowerCase() === cat.toLowerCase();
          const count = counts[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(active ? '' : cat)}
              aria-pressed={active}
              className={`inline-flex min-h-12 items-center gap-3 rounded-2xl border px-5 py-3 text-base font-bold transition-all ${
                active
                  ? 'border-[#1769AA] bg-[#1769AA] text-white shadow-sm'
                  : 'border-[#1769AA]/25 bg-white text-[#123E67] hover:border-[#1769AA] hover:bg-[#DCEFFA]'
              }`}
              data-testid={`category-shortcut-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon
                size={20}
                className={active ? 'text-white' : 'text-[#1769AA]'}
                aria-hidden="true"
              />
              <span>{cat}</span>
              {typeof count === 'number' && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                    active ? 'bg-white/20 text-white' : 'bg-[#DCEFFA] text-[#123E67]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
