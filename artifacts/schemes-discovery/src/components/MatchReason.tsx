import type { SchemeMatch } from '@workspace/api-client-react';
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  ListChecks,
} from 'lucide-react';
import { Link } from 'wouter';
import { formatVerified, levelLabel, schemeLocation, schemeSummary } from '../lib/schemes';

export function MatchReason({ match }: { match: SchemeMatch }) {
  const { scheme, status, matchedCriteria, criteriaToCheck } = match;
  const location = schemeLocation(scheme);
  const verified = formatVerified(
    typeof scheme.lastVerifiedAt === 'string'
      ? scheme.lastVerifiedAt
      : scheme.lastVerifiedAt
        ? new Date(scheme.lastVerifiedAt).toISOString()
        : null,
  );

  const statusConfig = {
    potential_match: {
      label: 'Potential match',
      badgeClass: 'border-[#1769AA] bg-[#1769AA] text-white',
      icon: CheckCircle2,
    },
    more_information_needed: {
      label: 'More information needed',
      badgeClass: 'border-[#1769AA]/40 bg-[#DCEFFA] text-[#123E67]',
      icon: HelpCircle,
    },
    does_not_appear_to_match: {
      label: 'Does not appear to match',
      badgeClass: 'border-slate-300 bg-slate-100 text-slate-700',
      icon: AlertCircle,
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <article
      className="rounded-2xl border border-[#1769AA]/25 bg-white p-6 shadow-xs"
      data-testid={`card-match-${scheme.id}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-extrabold ${statusConfig.badgeClass}`}
        >
          <StatusIcon size={17} aria-hidden="true" />
          {statusConfig.label}
        </span>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#123E67]">
          <span className="rounded-full bg-[#DCEFFA] px-3 py-1">{scheme.category}</span>
          <span className="rounded-full bg-[#F5F9FC] px-3 py-1 border border-[#1769AA]/15">
            {levelLabel(scheme.governmentLevel)}
          </span>
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-extrabold text-[#123E67]">{scheme.name}</h3>
      <p className="mt-2 text-base leading-relaxed text-[#203040]">{schemeSummary(scheme)}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {matchedCriteria.length > 0 && (
          <div className="rounded-xl border border-[#1769AA]/20 bg-[#F5F9FC] p-4">
            <h4 className="flex items-center gap-2 text-sm font-extrabold text-[#123E67]">
              <CheckCircle2 size={17} className="text-[#1769AA]" aria-hidden="true" />
              Answers that appear to fit
            </h4>
            <ul className="mt-2.5 space-y-2 text-sm leading-relaxed text-[#203040]">
              {matchedCriteria.map((item, idx) => (
                <li key={`${item}-${idx}`} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1769AA]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {criteriaToCheck.length > 0 && (
          <div className="rounded-xl border border-[#1769AA]/25 bg-[#DCEFFA]/50 p-4">
            <h4 className="flex items-center gap-2 text-sm font-extrabold text-[#123E67]">
              <HelpCircle size={17} className="text-[#1769AA]" aria-hidden="true" />
              Official criteria you still need to check
            </h4>
            <ul className="mt-2.5 space-y-2 text-sm leading-relaxed text-[#203040]">
              {criteriaToCheck.map((item, idx) => (
                <li key={`${item}-${idx}`} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#123E67]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {scheme.applicationSteps?.length > 0 && status !== 'does_not_appear_to_match' && (
        <div className="mt-4 rounded-xl border border-[#1769AA]/15 bg-[#F5F9FC] p-4">
          <h4 className="flex items-center gap-2 text-sm font-extrabold text-[#123E67]">
            <ListChecks size={17} className="text-[#1769AA]" aria-hidden="true" />
            Application steps summary
          </h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[#203040]">
            {scheme.applicationSteps.slice(0, 3).map((stepText, idx) => (
              <li key={idx}>{stepText}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#1769AA]/15 pt-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#203040]/80">
          {location && <span>Location: {location}</span>}
          <span className="inline-flex items-center gap-1">
            <CalendarCheck2 size={14} className="text-[#1769AA]" aria-hidden="true" />
            Last verified: {verified ?? 'Not recorded'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {scheme.applicationUrl && (
            <a
              href={scheme.applicationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#1769AA] bg-white px-4 py-2 text-sm font-bold text-[#1769AA] hover:bg-[#DCEFFA]"
            >
              Official portal
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          )}
          <Link
            href={`/schemes/${scheme.id}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1769AA] px-5 py-2 text-sm font-bold text-white hover:bg-[#123E67]"
            data-testid={`link-match-details-${scheme.id}`}
          >
            View scheme details
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
