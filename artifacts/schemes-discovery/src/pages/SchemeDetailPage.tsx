import { getGetSchemeQueryKey, useGetScheme, type Scheme } from '@workspace/api-client-react';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  FileText,
  Gift,
  ListChecks,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Link, useParams } from 'wouter';
import { OfficialSourceNotice } from '../components/OfficialSourceNotice';
import {
  categoryIcon,
  criteriaRows,
  formatVerified,
  levelLabel,
  schemeImage,
  schemeLocation,
  schemeSummary,
} from '../lib/schemes';

export default function SchemeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const validId = Number.isInteger(id) && id > 0;

  const query = useGetScheme(validId ? id : 0, {
    query: {
      queryKey: getGetSchemeQueryKey(validId ? id : 0),
      enabled: validId,
    },
  });

  const scheme = query.data;

  return (
    <div className="page-wrap py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-base font-bold text-[#1769AA] hover:text-[#123E67] hover:underline"
          data-testid="link-back-directory"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back to all schemes
        </Link>

        {!validId ? (
          <div className="mt-8 rounded-2xl border border-[#1769AA]/25 bg-white p-8 text-center">
            <CircleAlert size={34} className="mx-auto text-[#1769AA]" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-extrabold text-[#123E67]">Scheme not found</h1>
            <p className="mt-2 text-base text-[#203040]">This scheme address is not valid.</p>
            <Link
              href="/browse"
              className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#1769AA] px-5 py-2.5 text-base font-bold text-white hover:bg-[#123E67]"
            >
              Browse all schemes
            </Link>
          </div>
        ) : query.isLoading ? (
          <div className="mt-6 space-y-5 animate-pulse">
            <div className="h-56 rounded-2xl bg-[#DCEFFA]" />
            <div className="grid gap-5 md:grid-cols-2">
              <div className="h-52 rounded-2xl bg-white" />
              <div className="h-52 rounded-2xl bg-white" />
            </div>
          </div>
        ) : query.isError ? (
          <div className="mt-8 rounded-2xl border border-[#1769AA]/25 bg-white p-8 text-center">
            <CircleAlert size={34} className="mx-auto text-[#1769AA]" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-extrabold text-[#123E67]">
              We couldn’t load this scheme
            </h1>
            <p className="mt-2 text-base text-[#203040]">
              The scheme directory service may be temporarily unavailable.
            </p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1769AA] px-5 py-2.5 text-base font-bold text-white hover:bg-[#123E67]"
              data-testid="button-retry-scheme"
            >
              <RefreshCw size={17} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : !scheme ? (
          <div className="mt-8 rounded-2xl border border-[#1769AA]/25 bg-white p-8 text-center">
            <h1 className="text-2xl font-extrabold text-[#123E67]">Scheme not available</h1>
            <p className="mt-2 text-base text-[#203040]">
              This record is not currently active in the directory.
            </p>
          </div>
        ) : (
          <SchemeDetailContent scheme={scheme} />
        )}
      </div>
    </div>
  );
}

function SchemeDetailContent({ scheme }: { scheme: Scheme }) {
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
  const rows = criteriaRows(scheme.criteria);

  return (
    <div className="mt-6 space-y-6">
      {/* Header banner with authentic scheme image */}
      <section className="overflow-hidden rounded-2xl bg-[#123E67] text-white shadow-sm on-dark">
        <div className="grid md:grid-cols-[1.35fr_0.65fr]">
          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-extrabold text-[#123E67]">
                <Icon size={14} className="text-[#1769AA]" aria-hidden="true" />
                {scheme.category}
              </span>
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold text-white">
                {levelLabel(scheme.governmentLevel)}
              </span>
              {scheme.demoData && (
                <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-extrabold text-amber-950">
                  Demo record
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
              {scheme.name}
            </h1>

            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#DCEFFA]">
              {schemeSummary(scheme)}
            </p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/20 pt-4 text-sm font-semibold text-[#DCEFFA]">
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={16} aria-hidden="true" />
                  Applicable location: {location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarCheck2 size={16} aria-hidden="true" />
                Last verified: {verified ?? 'Not recorded'}
              </span>
            </div>
          </div>

          <div className="relative min-h-[200px] bg-[#1769AA]/30">
            <img
              src={visual.src}
              alt={visual.alt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#123E67]/80 via-transparent to-transparent md:bg-gradient-to-r md:from-[#123E67]/60 md:via-transparent" />
            <span className="absolute bottom-3 right-3 rounded-full bg-[#123E67]/85 px-3 py-1 text-xs font-bold text-[#DCEFFA]">
              {visual.caption}
            </span>
          </div>
        </div>
      </section>

      {/* Guidance note */}
      <OfficialSourceNotice />

      {/* Four core sections */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Who may be eligible */}
        <section
          aria-labelledby="eligible-heading"
          className="rounded-2xl border border-[#1769AA]/20 bg-white p-6 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEFFA] text-[#1769AA]">
              <Users size={20} aria-hidden="true" />
            </span>
            <h2 id="eligible-heading" className="text-xl font-extrabold text-[#123E67]">
              Who may be eligible
            </h2>
          </div>

          {scheme.intendedBeneficiaries?.length > 0 && (
            <ul className="mt-4 space-y-2 text-base leading-relaxed text-[#203040]">
              {scheme.intendedBeneficiaries.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={18}
                    className="mt-1 shrink-0 text-[#1769AA]"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {rows.length > 0 && (
            <dl className="mt-5 divide-y divide-[#1769AA]/15 rounded-xl bg-[#F5F9FC] px-4 py-1">
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 py-2.5 text-sm sm:grid-cols-[135px_1fr]"
                >
                  <dt className="font-extrabold text-[#123E67]">{label}</dt>
                  <dd className="font-medium text-[#203040]">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        {/* Benefits */}
        <section
          aria-labelledby="benefits-heading"
          className="rounded-2xl border border-[#1769AA]/20 bg-white p-6 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEFFA] text-[#1769AA]">
              <Gift size={20} aria-hidden="true" />
            </span>
            <h2 id="benefits-heading" className="text-xl font-extrabold text-[#123E67]">
              Benefits
            </h2>
          </div>
          {scheme.benefits?.length ? (
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-[#203040]">
              {scheme.benefits.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1769AA]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-base text-[#203040]">
              Check the official source for current benefit amounts.
            </p>
          )}
        </section>

        {/* Documents */}
        <section
          aria-labelledby="documents-heading"
          className="rounded-2xl border border-[#1769AA]/20 bg-white p-6 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEFFA] text-[#1769AA]">
              <FileText size={20} aria-hidden="true" />
            </span>
            <h2 id="documents-heading" className="text-xl font-extrabold text-[#123E67]">
              Documents
            </h2>
          </div>
          {scheme.requiredDocuments?.length ? (
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-[#203040]">
              {scheme.requiredDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1769AA]" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-base text-[#203040]">
              Confirm required documents on the official portal.
            </p>
          )}
        </section>

        {/* How to apply */}
        <section
          aria-labelledby="apply-heading"
          className="rounded-2xl border border-[#1769AA]/20 bg-white p-6 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEFFA] text-[#1769AA]">
              <ListChecks size={20} aria-hidden="true" />
            </span>
            <h2 id="apply-heading" className="text-xl font-extrabold text-[#123E67]">
              How to apply
            </h2>
          </div>
          {scheme.applicationSteps?.length ? (
            <ol className="mt-4 space-y-3 text-base leading-relaxed text-[#203040]">
              {scheme.applicationSteps.map((stepText, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DCEFFA] text-xs font-extrabold text-[#123E67]">
                    {idx + 1}
                  </span>
                  <span>{stepText}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-base text-[#203040]">
              Follow the official application instructions on the government portal.
            </p>
          )}
        </section>
      </div>

      {/* Distinct Official Source & Official Application buttons */}
      <section className="rounded-2xl border border-[#1769AA]/30 bg-white p-6 shadow-xs sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#123E67]">
              Official government links
            </h2>
            <p className="mt-1.5 max-w-xl text-base text-[#203040]">
              Confirm current requirements with the responsible government department before applying. Suvidha does not submit applications.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:min-w-[240px]">
            {scheme.informationUrl && (
              <a
                href={scheme.informationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#1769AA] bg-white px-5 py-2.5 text-base font-bold text-[#1769AA] hover:bg-[#DCEFFA] hover:text-[#123E67]"
                data-testid="link-official-information"
              >
                Official source info
                <ExternalLink size={17} aria-hidden="true" />
              </a>
            )}
            {scheme.applicationUrl && (
              <a
                href={scheme.applicationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1769AA] px-5 py-2.5 text-base font-bold text-white hover:bg-[#123E67]"
                data-testid="link-official-application"
              >
                Go to application portal
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
