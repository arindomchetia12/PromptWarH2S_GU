import type { Scheme } from '@workspace/api-client-react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'wouter';

export function SchemeCard({ scheme }: { scheme: Scheme }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6" data-testid={`card-scheme-${scheme.id}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.08em] text-secondary-foreground">{scheme.category}</span>
        {scheme.demoData && <span className="rounded-full border border-[hsl(var(--accent))]/40 bg-[hsl(var(--accent))]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-foreground">Demo record</span>}
      </div>
      <h3 className="display-font mb-3 text-[1.65rem] leading-[1.14] tracking-[-.025em]">{scheme.name}</h3>
      <p className="mb-5 line-clamp-2 text-sm leading-6 text-muted-foreground">{scheme.intendedBeneficiaries?.join(' · ') || 'View the published eligibility information for this scheme.'}</p>
      <div className="mb-6 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{scheme.governmentLevel === 'central' ? 'Central government' : 'State government'}</span>
        <span>{scheme.regions?.length ? scheme.regions.join(', ') : 'Regions listed on official source'}</span>
      </div>
      <div className="mt-auto border-t border-border pt-4">
        <Link href={`/schemes/${scheme.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline" data-testid={`link-scheme-details-${scheme.id}`}>
          Explore this scheme <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
