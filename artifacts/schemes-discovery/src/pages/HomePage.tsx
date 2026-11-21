import { useMemo, useState } from 'react';
import { useGetSchemeSummary, useListSchemes, getListSchemesQueryKey, getGetSchemeSummaryQueryKey } from '@workspace/api-client-react';
import type { ListSchemesParams } from '@workspace/api-client-react';
import { ArrowDown, ArrowRight, BookOpenCheck, CircleAlert, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'wouter';
import { SchemeCard } from '../components/SchemeCard';

const STATES = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [level, setLevel] = useState('');
  const params = useMemo<ListSchemesParams>(() => ({
    ...(query.trim() ? { q: query.trim() } : {}),
    ...(category ? { category } : {}),
    ...(state ? { state } : {}),
    ...(level ? { governmentLevel: level as 'central' | 'state' } : {}),
  }), [query, category, state, level]);
  const list = useListSchemes(params, { query: { queryKey: getListSchemesQueryKey(params) } });
  const summary = useGetSchemeSummary({ query: { queryKey: getGetSchemeSummaryQueryKey() } });
  const schemes = list.data ?? [];
  const clearFilters = () => { setQuery(''); setCategory(''); setState(''); setLevel(''); };

  return (
    <>
      <section className="relative overflow-hidden bg-[hsl(var(--secondary))]">
        <div className="paper-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="page-wrap relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-24">
          <div className="reveal">
            <p className="eyebrow mb-5">Government schemes, less complicated</p>
            <h1 className="display-font max-w-[720px] text-[clamp(3rem,7vw,5.7rem)] leading-[.98] tracking-[-.055em]">
              Find the support<br /><span className="text-primary">meant for you.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Browse public schemes by need, location or government level. Understand what the published criteria say before you take the next step.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/find" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-transform hover:translate-y-[-2px]" data-testid="link-start-questionnaire">
                Check possible matches <ArrowRight size={17} />
              </Link>
              <a href="#browse" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-background/70 px-5 text-sm font-bold hover:bg-background" data-testid="link-browse-catalogue">
                Browse the catalogue <ArrowDown size={16} />
              </a>
            </div>
          </div>
          <div className="reveal-delay relative mx-auto w-full max-w-[430px] lg:ml-auto">
            <div className="absolute -right-2 top-6 h-[80%] w-[88%] rotate-3 rounded-[2rem] border border-primary/20 bg-[hsl(var(--accent))]/20" />
            <div className="relative rounded-[2rem] border border-border bg-card p-6 shadow-xl sm:p-8">
              <div className="mb-8 flex items-center justify-between">
                <span className="eyebrow">A practical guide</span>
                <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wider">India</span>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 rounded-2xl bg-secondary/70 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary"><Search size={19} /></span>
                  <div><p className="text-sm font-bold">Start with your need</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Education, livelihood, health and more.</p></div>
                </div>
                <div className="flex gap-4 rounded-2xl bg-secondary/70 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary"><BookOpenCheck size={19} /></span>
                  <div><p className="text-sm font-bold">See criteria in plain language</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Know what matches—and what still needs checking.</p></div>
                </div>
              </div>
              <div className="mt-6 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                A possible match is a starting point, not a guarantee of eligibility or approval.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap -mt-1 py-8" aria-label="Catalogue overview">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4 sm:p-5">
          <div className="px-2 py-2"><p className="display-font text-3xl">{summary.isLoading ? '—' : summary.data?.activeCount ?? '—'}</p><p className="mt-1 text-xs text-muted-foreground">Active schemes listed</p></div>
          <div className="border-l border-border px-4 py-2"><p className="display-font text-3xl">{summary.isLoading ? '—' : summary.data?.categoryCount ?? '—'}</p><p className="mt-1 text-xs text-muted-foreground">Areas of support</p></div>
          <div className="border-l border-border px-4 py-2"><p className="display-font text-3xl">{summary.isLoading ? '—' : summary.data?.centralCount ?? '—'}</p><p className="mt-1 text-xs text-muted-foreground">Central schemes</p></div>
          <div className="border-l border-border px-4 py-2"><p className="display-font text-3xl">{summary.isLoading ? '—' : summary.data?.stateCount ?? '—'}</p><p className="mt-1 text-xs text-muted-foreground">State schemes</p></div>
        </div>
        {summary.isError && <p className="mt-3 text-xs text-muted-foreground" role="status">Catalogue overview is temporarily unavailable; scheme browsing may still work.</p>}
      </section>

      <section id="browse" className="page-wrap scroll-mt-6 pb-10 pt-9">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-3">Explore the directory</p>
            <h2 className="display-font text-4xl tracking-[-.035em] sm:text-5xl">Browse schemes</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Search the active directory. Use the official information link on each scheme to confirm current requirements.</p>
          </div>
          <Link href="/find" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-primary hover:underline" data-testid="link-questionnaire-from-browse">Not sure where to start? Check your matches <ArrowRight size={15} /></Link>
        </div>
        <div className="mb-7 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground"><SlidersHorizontal size={15} /> Refine your search</div>
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <label className="relative block">
              <span className="sr-only">Search by keyword</span>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a scheme or need" className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-3 text-sm outline-none transition focus:border-primary" data-testid="input-search-schemes" />
            </label>
            <label><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-primary" data-testid="select-category"><option value="">All categories</option>{(summary.data?.categories ?? []).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label><span className="sr-only">Filter by state or union territory</span><select value={state} onChange={(event) => setState(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-primary" data-testid="select-state"><option value="">All states & UTs</option>{STATES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label><span className="sr-only">Filter by government level</span><select value={level} onChange={(event) => setLevel(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-primary" data-testid="select-government-level"><option value="">All government levels</option><option value="central">Central</option><option value="state">State</option></select></label>
            <button type="button" onClick={clearFilters} className="h-12 rounded-xl px-4 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground" data-testid="button-clear-filters">Clear</button>
          </div>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold" aria-live="polite" data-testid="text-scheme-count">{list.isLoading ? 'Loading schemes…' : list.isError ? 'Schemes unavailable' : `${schemes.length} ${schemes.length === 1 ? 'scheme' : 'schemes'} found`}</p>
          {Object.values(params).some(Boolean) && <span className="text-xs text-muted-foreground">Filters applied</span>}
        </div>
        {list.isLoading ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading scheme results">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-border bg-card p-6"><div className="h-5 w-24 rounded bg-muted" /><div className="mt-6 h-8 w-4/5 rounded bg-muted" /><div className="mt-4 h-4 w-full rounded bg-muted" /><div className="mt-2 h-4 w-3/4 rounded bg-muted" /></div>)}</div>
          : list.isError ? <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center"><CircleAlert className="mx-auto text-accent" size={28} /><h3 className="mt-4 font-bold">We couldn’t load the scheme directory</h3><p className="mt-2 text-sm text-muted-foreground">Please check your connection and try again.</p><button onClick={() => list.refetch()} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground" data-testid="button-retry-schemes">Try again</button></div>
          : schemes.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center"><Search className="mx-auto text-muted-foreground" size={27} /><h3 className="mt-4 display-font text-2xl">No schemes found</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Try a broader keyword or clear one or more filters. The directory shows only records currently available from the service.</p><button onClick={clearFilters} className="mt-5 text-sm font-bold text-primary underline underline-offset-4" data-testid="button-reset-search">Clear all filters</button></div>
          : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{schemes.map((scheme) => <SchemeCard key={scheme.id} scheme={scheme} />)}</div>}
      </section>
      <section className="page-wrap py-8">
        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-primary px-6 py-8 text-primary-foreground sm:flex-row sm:items-center sm:px-9 sm:py-10">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] opacity-75">A little more guidance</p><h2 className="display-font mt-2 text-3xl sm:text-4xl">Compare your answers with the criteria.</h2><p className="mt-2 max-w-xl text-sm leading-6 opacity-80">A short, private questionnaire can help you decide what to explore next.</p></div>
          <Link href="/find" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-background px-5 text-sm font-bold text-foreground hover:bg-secondary" data-testid="link-find-support-cta">Start the check <ArrowRight size={16} /></Link>
        </div>
      </section>
    </>
  );
}
