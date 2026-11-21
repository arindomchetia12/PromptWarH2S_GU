import { useEffect, useMemo, useState } from 'react';
import {
  getGetSchemeSummaryQueryKey,
  getListSchemesQueryKey,
  useGetSchemeSummary,
  useListSchemes,
  type ListSchemesParams,
} from '@workspace/api-client-react';
import { CircleAlert, Compass, RefreshCw, Search } from 'lucide-react';
import { Link, useSearch } from 'wouter';
import { OfficialSourceNotice } from '../components/OfficialSourceNotice';
import { SchemeCard } from '../components/SchemeCard';
import { SchemeFilters, type SortOption } from '../components/SchemeFilters';
import { relevanceScore } from '../lib/schemes';

export default function BrowsePage() {
  const searchString = useSearch();
  const initialParams = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const [query, setQuery] = useState(() => initialParams.get('q') ?? '');
  const [category, setCategory] = useState(() => initialParams.get('category') ?? '');
  const [state, setState] = useState(() => initialParams.get('state') ?? '');
  const [level, setLevel] = useState(() => initialParams.get('level') ?? '');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.has('q')) setQuery(params.get('q') ?? '');
    if (params.has('category')) setCategory(params.get('category') ?? '');
    if (params.has('state')) setState(params.get('state') ?? '');
    if (params.has('level')) setLevel(params.get('level') ?? '');
  }, [searchString]);

  const apiParams = useMemo<ListSchemesParams>(
    () => ({
      ...(query.trim() ? { q: query.trim() } : {}),
      ...(category ? { category } : {}),
      ...(state ? { state } : {}),
      ...(level ? { governmentLevel: level as 'central' | 'state' } : {}),
    }),
    [query, category, state, level],
  );

  const summary = useGetSchemeSummary({
    query: { queryKey: getGetSchemeSummaryQueryKey() },
  });

  const list = useListSchemes(apiParams, {
    query: { queryKey: getListSchemesQueryKey(apiParams) },
  });

  const sortedSchemes = useMemo(() => {
    const items = [...(list.data ?? [])];
    if (sortBy === 'alphabetical') {
      return items.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (query.trim()) {
      return items.sort((a, b) => {
        const diff = relevanceScore(b, query) - relevanceScore(a, query);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      });
    }
    return items;
  }, [list.data, sortBy, query]);

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setState('');
    setLevel('');
  };

  return (
    <div className="page-wrap py-8 sm:py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#1769AA]">
            Suvidha Scheme Directory
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#123E67] sm:text-4xl">
            Browse & search schemes
          </h1>
          <p className="mt-2 max-w-2xl text-base text-[#203040]">
            Search by scheme name, keyword, category, or government level. Always check the official source before applying.
          </p>
        </div>

        <Link
          href="/find"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#DCEFFA] px-5 py-2.5 text-base font-bold text-[#123E67] hover:bg-[#1769AA] hover:text-white transition-colors"
          data-testid="link-guided-from-browse"
        >
          <Compass size={19} aria-hidden="true" />
          Use guided search
        </Link>
      </div>

      <div className="mt-6">
        <SchemeFilters
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          categories={summary.data?.categories ?? []}
          state={state}
          onStateChange={setState}
          level={level}
          onLevelChange={setLevel}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          resultCount={sortedSchemes.length}
          isLoading={list.isLoading}
          onClear={clearFilters}
        />
      </div>

      <div className="mt-7">
        {list.isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading search results">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border border-[#1769AA]/15 bg-white p-6"
              >
                <div className="h-6 w-28 rounded-full bg-[#DCEFFA]" />
                <div className="mt-5 h-7 w-4/5 rounded bg-[#DCEFFA]" />
                <div className="mt-3 h-4 w-full rounded bg-[#F5F9FC]" />
                <div className="mt-2 h-4 w-3/4 rounded bg-[#F5F9FC]" />
              </div>
            ))}
          </div>
        ) : list.isError ? (
          <div className="rounded-2xl border border-[#1769AA]/25 bg-white p-10 text-center">
            <CircleAlert size={34} className="mx-auto text-[#1769AA]" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-extrabold text-[#123E67]">
              We couldn’t load the schemes right now
            </h2>
            <p className="mt-2 text-base text-[#203040]">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => list.refetch()}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1769AA] px-5 py-2.5 text-base font-bold text-white hover:bg-[#123E67]"
              data-testid="button-retry-schemes"
            >
              <RefreshCw size={17} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : sortedSchemes.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-dashed border-[#1769AA]/30 bg-white px-6 py-12 text-center"
            role="status"
          >
            <Search size={34} className="mx-auto text-[#1769AA]" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-extrabold text-[#123E67]">
              No schemes found for that search.
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-base text-[#203040]">
              No schemes found for that search. Try a different keyword or browse all schemes.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1769AA] px-6 py-2.5 text-base font-bold text-white hover:bg-[#123E67]"
              data-testid="button-reset-search"
            >
              Browse all schemes
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sortedSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <OfficialSourceNotice showAboutLink />
      </div>
    </div>
  );
}
