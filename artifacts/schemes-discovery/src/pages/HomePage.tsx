import { useMemo, useState } from 'react';
import {
  getListSchemesQueryKey,
  useListSchemes,
} from '@workspace/api-client-react';
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Compass,
  ExternalLink,
  LayoutGrid,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { CategoryShortcuts } from '../components/CategoryShortcuts';
import { DiscoveryChoiceCard } from '../components/DiscoveryChoiceCard';
import { HeroSearch } from '../components/HeroSearch';
import { OfficialSourceNotice } from '../components/OfficialSourceNotice';
import { SchemeCard } from '../components/SchemeCard';

const VISUAL_SPOTLIGHTS = [
  {
    title: 'Education & Scholarships',
    subtitle: 'Pragyan Bharati Scooty, Fee Waiver & Ishan Uday',
    image: '/images/assam-education.jpg',
    alt: 'Cotton College in Guwahati, Assam representing Assam education schemes',
    badge: '6 Schemes',
    href: '/browse?category=Education',
  },
  {
    title: 'PM-KISAN & Direct Support',
    subtitle: '₹6,000/year DBT & ₹5,000 MMKSSY Farm Tools',
    image: '/images/pm-kisan.jpg',
    alt: 'PM Kisan Samman Nidhi government agricultural support programme',
    badge: 'Agriculture',
    href: '/browse?category=Agriculture',
  },
  {
    title: 'Solar Irrigation (PM-KUSUM)',
    subtitle: 'Up to 85% subsidy on stand-alone solar pumps',
    image: '/images/solar-pump.jpg',
    alt: 'Solar water pumping photovoltaic arrays for rural farms',
    badge: '85% Subsidy',
    href: '/schemes/12',
  },
  {
    title: 'Assam Tea & Rural Credit',
    subtitle: 'Kisan Credit Card (4% interest) & AFCSS subsidy',
    image: '/images/assam-tea.jpg',
    alt: 'Workers harvesting tea in an Assam tea plantation',
    badge: 'Assam Focus',
    href: '/schemes/11',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Search or answer a few questions',
    description:
      'Type what you need or use our 1-minute private questionnaire. We never ask for Aadhaar or bank details.',
  },
  {
    step: '02',
    icon: CheckCircle2,
    title: 'See why schemes may fit you',
    description:
      'Transparent rule checks rank potential matches first and highlight which official criteria still need checking.',
  },
  {
    step: '03',
    icon: ExternalLink,
    title: 'Apply on official government portals',
    description:
      'Review document checklists, application steps, and last-verified dates before continuing to the department website.',
  },
];

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('');

  const allSchemesQuery = useListSchemes(undefined, {
    query: { queryKey: getListSchemesQueryKey(undefined) },
  });

  const allSchemes = allSchemesQuery.data ?? [];

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of allSchemes) {
      map[s.category] = (map[s.category] ?? 0) + 1;
    }
    return map;
  }, [allSchemes]);

  const categoriesWithRecords = useMemo(
    () => Object.keys(categoryCounts).sort(),
    [categoryCounts],
  );

  const featuredSchemes = useMemo(() => {
    const filtered = selectedCategory
      ? allSchemes.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase())
      : allSchemes;
    return filtered.slice(0, 6);
  }, [allSchemes, selectedCategory]);

  const handleHeroSearch = (query: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    setLocation(params.toString() ? `/browse?${params.toString()}` : '/browse');
  };

  return (
    <>
      <HeroSearch totalSchemes={allSchemes.length} onSearch={handleHeroSearch} />

      <div className="page-wrap py-8 sm:py-10">
        {/* Two main discovery choices */}
        <section aria-label="Choose how to discover schemes">
          <div className="grid gap-5 md:grid-cols-2">
            <DiscoveryChoiceCard
              eyebrow="Don't know where to start?"
              title="Find schemes for me"
              description="Answer a few questions about your needs to see schemes that may be relevant."
              buttonLabel="Start guided search"
              href="/find"
              icon={Compass}
              primary
              testId="link-start-questionnaire"
            />
            <DiscoveryChoiceCard
              eyebrow="Full Assam directory"
              title="Browse all schemes"
              description="Explore the scheme catalogue by category, location, or keyword."
              buttonLabel="Browse schemes"
              href="/browse"
              icon={LayoutGrid}
              testId="link-browse-catalogue"
            />
          </div>
        </section>

        {/* Visual Spotlight Gallery of Assam & Central Government Schemes */}
        <section aria-labelledby="spotlight-heading" className="mt-10 py-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1769AA]">
                Key Assam &amp; Central Programmes
              </span>
              <h2
                id="spotlight-heading"
                className="mt-1 text-2xl font-extrabold text-[#123E67] sm:text-3xl"
              >
                Government initiatives across Assam
              </h2>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1769AA] hover:text-[#123E67] hover:underline"
            >
              Explore full directory
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VISUAL_SPOTLIGHTS.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative flex h-60 flex-col justify-end overflow-hidden rounded-2xl border border-[#1769AA]/20 bg-[#123E67] shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#123E67]/95 via-[#123E67]/50 to-transparent" />
                <span className="absolute left-3.5 top-3.5 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-[#123E67] shadow-xs">
                  {item.badge}
                </span>
                <div className="relative p-4 text-white">
                  <h3 className="text-lg font-extrabold leading-snug">{item.title}</h3>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-[#DCEFFA]">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Explore by category (only categories with records) */}
        <div className="mt-6">
          <CategoryShortcuts
            categories={categoriesWithRecords}
            counts={categoryCounts}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Schemes to explore */}
        <section aria-labelledby="schemes-to-explore-heading" className="py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="schemes-to-explore-heading"
                className="text-2xl font-extrabold text-[#123E67] sm:text-3xl"
              >
                {selectedCategory ? `${selectedCategory} schemes` : 'Schemes to explore'}
              </h2>
              <p className="mt-1 text-base text-[#203040]/80">
                {allSchemesQuery.isLoading
                  ? 'Loading verified scheme records…'
                  : `Showing ${featuredSchemes.length} of ${
                      selectedCategory
                        ? categoryCounts[selectedCategory] ?? featuredSchemes.length
                        : allSchemes.length
                    } active schemes in the Suvidha catalogue.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className="text-sm font-bold text-[#1769AA] underline underline-offset-4 hover:text-[#123E67]"
                >
                  Show all categories
                </button>
              )}
              <Link
                href={
                  selectedCategory
                    ? `/browse?category=${encodeURIComponent(selectedCategory)}`
                    : '/browse'
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#1769AA]/30 bg-white px-4 py-2 text-base font-bold text-[#1769AA] hover:bg-[#DCEFFA] hover:text-[#123E67]"
                data-testid="link-view-all-schemes"
              >
                View all schemes
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="mt-6">
            {allSchemesQuery.isLoading ? (
              <div
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                aria-label="Loading schemes"
              >
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse rounded-2xl border border-[#1769AA]/15 bg-white"
                  >
                    <div className="h-40 w-full rounded-t-2xl bg-[#DCEFFA]" />
                    <div className="p-6">
                      <div className="h-6 w-4/5 rounded bg-[#DCEFFA]" />
                      <div className="mt-3 h-4 w-full rounded bg-[#F5F9FC]" />
                      <div className="mt-2 h-4 w-3/4 rounded bg-[#F5F9FC]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : allSchemesQuery.isError ? (
              <div className="rounded-2xl border border-[#1769AA]/25 bg-white p-8 text-center">
                <CircleAlert
                  size={32}
                  className="mx-auto text-[#1769AA]"
                  aria-hidden="true"
                />
                <h3 className="mt-3 text-xl font-extrabold text-[#123E67]">
                  Unable to load schemes right now
                </h3>
                <p className="mt-2 text-base text-[#203040]">
                  Please check that the database service is running and try again.
                </p>
                <button
                  type="button"
                  onClick={() => allSchemesQuery.refetch()}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1769AA] px-5 py-2.5 text-base font-bold text-white hover:bg-[#123E67]"
                  data-testid="button-retry-schemes"
                >
                  <RefreshCw size={17} aria-hidden="true" />
                  Try again
                </button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {featuredSchemes.map((scheme) => (
                  <SchemeCard key={scheme.id} scheme={scheme} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How Suvidha Works + Community Photo Banner */}
        <section
          aria-labelledby="how-suvidha-works-heading"
          className="mt-8 overflow-hidden rounded-3xl border border-[#1769AA]/20 bg-white shadow-xs"
        >
          <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
            <div className="p-6 sm:p-9">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1769AA]">
                Simple, transparent process
              </span>
              <h2
                id="how-suvidha-works-heading"
                className="mt-1.5 text-2xl font-extrabold text-[#123E67] sm:text-3xl"
              >
                How Suvidha helps citizens in Assam
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                {HOW_IT_WORKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.step}
                      className="rounded-2xl border border-[#1769AA]/15 bg-[#F5F9FC] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEFFA] text-[#1769AA]">
                          <Icon size={20} aria-hidden="true" />
                        </span>
                        <span className="text-xs font-extrabold text-[#1769AA]/70">
                          STEP {item.step}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-extrabold text-[#123E67]">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#203040]">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/find"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1769AA] px-6 py-2.5 text-base font-bold text-white hover:bg-[#123E67]"
                >
                  Start guided matching
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#1769AA]/30 bg-white px-5 py-2.5 text-base font-bold text-[#123E67] hover:bg-[#DCEFFA]"
                >
                  Learn more about Suvidha
                </Link>
              </div>
            </div>

            <div className="relative min-h-[260px] bg-[#123E67]">
              <img
                src="/images/women-shg.jpg"
                alt="Rural women community empowerment in India"
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#123E67]/90 via-[#123E67]/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#DCEFFA]">
                  Built for Every Citizen
                </p>
                <p className="mt-1 text-lg font-extrabold leading-snug">
                  Accessible, plain-language scheme guidance for students, farmers, and families across Assam.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust and guidance note */}
        <div className="mt-8">
          <OfficialSourceNotice showAboutLink />
        </div>
      </div>
    </>
  );
}
