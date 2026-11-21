import type { Scheme } from '@workspace/api-client-react';
import { ArrowRight, CalendarCheck2, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import {
  categoryIcon,
  formatVerified,
  levelLabel,
  schemeImage,
  schemeLocation,
  schemeSummary,
} from '../lib/schemes';

export function SchemeCard({ scheme }: { scheme: Scheme }) {
  const Icon = categoryIcon(scheme.category);
  const location = schemeLocation(scheme);
  const visual = schemeImage(scheme);
  const verified = formatVerified(
    typeof scheme.lastVerifiedAt === 'string'
      ? scheme.lastVerifiedAt
      : scheme.lastVerifiedAt
        ? new Date(scheme.lastVerifiedAt).toISOString()
        : null,
  );

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#1769AA]/20 bg-white shadow-xs transition-all hover:border-[#1769AA]/50 hover:shadow-md"
      data-testid={`card-scheme-${scheme.id}`}
    >
      {/* Contextual Government Scheme Image Header */}
      <div className="relative h-40 w-full overflow-hidden bg-[#DCEFFA]">
        <img
          src={visual.src}
          alt={visual.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#123E67]/70 via-transparent to-[#123E67]/20" />
        <div className="absolute left-3 right-3 top-3 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-[#123E67] shadow-xs">
            <Icon size={14} className="text-[#1769AA]" aria-hidden="true" />
            {scheme.category}
          </span>
          <span className="rounded-full bg-[#123E67]/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
            {levelLabel(scheme.governmentLevel)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          {scheme.demoData && (
            <p className="mb-2 inline-block rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
              Demo record — sample data only
            </p>
          )}

          <h3 className="text-xl font-extrabold leading-snug text-[#123E67]">
            {scheme.name}
          </h3>

          <p className="mt-2.5 line-clamp-3 text-base leading-relaxed text-[#203040]">
            {schemeSummary(scheme)}
          </p>
        </div>

        <div className="mt-5 border-t border-[#1769AA]/15 pt-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-[#203040]/80">
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} className="text-[#1769AA]" aria-hidden="true" />
                {location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarCheck2 size={14} className="text-[#1769AA]" aria-hidden="true" />
              Last verified: {verified ?? 'Not recorded'}
            </span>
          </div>

          <div className="mt-4">
            <Link
              href={`/schemes/${scheme.id}`}
              aria-label={`View scheme details for ${scheme.name}`}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1769AA] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#123E67]"
              data-testid={`link-scheme-details-${scheme.id}`}
            >
              View scheme details
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
