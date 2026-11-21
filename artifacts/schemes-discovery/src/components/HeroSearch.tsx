import { type FormEvent, useState } from 'react';
import { CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import { SUGGESTED_SEARCHES } from '../lib/schemes';

export function HeroSearch({
  initialQuery = '',
  totalSchemes,
  onSearch,
}: {
  initialQuery?: string;
  totalSchemes?: number;
  onSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  return (
    <section className="hero-bg border-b border-[#1769AA]/15 py-10 sm:py-14">
      <div className="page-wrap">
        <div className="grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-10">
          {/* Left column: Headline + Search */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1769AA]/20 bg-white px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#1769AA] shadow-2xs">
              Assam Government Scheme Discovery
            </span>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#123E67] sm:text-5xl sm:leading-[1.1]">
              Find support that fits your needs
            </h1>

            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#203040]">
              Explore Assam State and Central government schemes in one simple, trusted place—with clear eligibility rules and direct official portal links.
            </p>

            <form
              onSubmit={handleSubmit}
              role="search"
              aria-label="Search government schemes"
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <label htmlFor="hero-search-input" className="sr-only">
                  Search schemes or needs
                </label>
                <Search
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1769AA]"
                  aria-hidden="true"
                />
                <input
                  id="hero-search-input"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search schemes or needs (e.g., scholarship, farmer support)"
                  className="min-h-14 w-full rounded-2xl border-2 border-[#1769AA]/30 bg-white pl-12 pr-4 text-base text-[#203040] shadow-xs placeholder:text-[#203040]/55 focus:border-[#1769AA]"
                  data-testid="input-hero-search"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#1769AA] px-7 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#123E67]"
                data-testid="button-hero-search"
              >
                <Search size={18} aria-hidden="true" />
                Search
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-bold text-[#123E67]">Try:</span>
              {SUGGESTED_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    onSearch(item);
                  }}
                  className="inline-flex min-h-9 items-center rounded-full border border-[#1769AA]/25 bg-white px-3.5 py-1 text-sm font-semibold text-[#1769AA] transition-colors hover:border-[#1769AA] hover:bg-[#1769AA] hover:text-white"
                  data-testid={`button-suggested-${item.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-[#123E67]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={17} className="text-[#1769AA]" aria-hidden="true" />
                {typeof totalSchemes === 'number' && totalSchemes > 0
                  ? `${totalSchemes} verified active schemes`
                  : 'Verified Assam & Central schemes'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={17} className="text-[#1769AA]" aria-hidden="true" />
                No Aadhaar or login needed
              </span>
            </div>
          </div>

          {/* Right column: Authentic Assam & Government Scheme Photo Collage */}
          <div className="grid gap-3">
            <figure className="relative overflow-hidden rounded-2xl border-2 border-white bg-[#123E67] shadow-md">
              <img
                src="/images/assam-assembly.jpg"
                alt="Assam Legislative Assembly complex in Dispur, Guwahati"
                fetchPriority="high"
                decoding="async"
                className="h-48 w-full object-cover sm:h-56"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#123E67]/95 via-[#123E67]/65 to-transparent px-4 pb-3 pt-8 text-white">
                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#DCEFFA]">
                  Assam State &amp; Central Welfare
                </span>
                <span className="block text-sm font-bold">
                  Assam Legislative Assembly, Dispur · Official Scheme Sources
                </span>
              </figcaption>
            </figure>

            <div className="grid grid-cols-2 gap-3">
              <figure className="relative overflow-hidden rounded-2xl border-2 border-white bg-[#123E67] shadow-sm">
                <img
                  src="/images/assam-farmers.jpg"
                  alt="Assam rice farmers transplanting paddy seedlings in Golaghat"
                  className="h-32 w-full object-cover sm:h-36"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#123E67]/95 via-[#123E67]/60 to-transparent px-3 pb-2.5 pt-6 text-white">
                  <span className="block text-xs font-extrabold">Farmer Support</span>
                  <span className="block text-[11px] text-[#DCEFFA]">MMKSSY · PM-KISAN</span>
                </figcaption>
              </figure>

              <figure className="relative overflow-hidden rounded-2xl border-2 border-white bg-[#123E67] shadow-sm">
                <img
                  src="/images/student-award.jpg"
                  alt="Indian student receiving a government laptop merit award"
                  className="h-32 w-full object-cover sm:h-36"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#123E67]/95 via-[#123E67]/60 to-transparent px-3 pb-2.5 pt-6 text-white">
                  <span className="block text-xs font-extrabold">Education Awards</span>
                  <span className="block text-[11px] text-[#DCEFFA]">Pragyan Bharati · Ishan Uday</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
