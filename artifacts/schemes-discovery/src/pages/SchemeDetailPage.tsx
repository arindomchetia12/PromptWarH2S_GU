import { Link, useParams } from 'wouter';
import { useGetScheme, getGetSchemeQueryKey } from '@workspace/api-client-react';
import type { Scheme } from '@workspace/api-client-react';
import { ArrowLeft, ArrowUpRight, CalendarDays, CircleAlert, ExternalLink, FileText, MapPin, ShieldCheck } from 'lucide-react';

const readable = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

function DetailList({ title, items, icon: Icon }: { title: string; items: string[]; icon: typeof FileText }) {
  return <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary"><Icon size={17} /></span><h2 className="display-font text-2xl">{title}</h2></div>{items?.length ? <ul className="mt-5 space-y-3">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{item}</li>)}</ul> : <p className="mt-4 text-sm leading-6 text-muted-foreground">No details are listed here. Check the official information source for current guidance.</p>}</section>;
}

function Criteria({ scheme }: { scheme: Scheme }) {
  const criteria = scheme.criteria;
  const rows: [string, string][] = [];
  if (criteria.minAge != null || criteria.maxAge != null) rows.push(['Age', `${criteria.minAge != null ? `At least ${criteria.minAge}` : ''}${criteria.minAge != null && criteria.maxAge != null ? ' and ' : ''}${criteria.maxAge != null ? `up to ${criteria.maxAge}` : ''} years`]);
  if (criteria.states?.length) rows.push(['State or territory', criteria.states.join(', ')]);
  if (criteria.residences?.length) rows.push(['Residence', criteria.residences.map(readable).join(', ')]);
  if (criteria.studentStatuses?.length) rows.push(['Student status', criteria.studentStatuses.map(readable).join(', ')]);
  if (criteria.employmentStatuses?.length) rows.push(['Employment', criteria.employmentStatuses.map(readable).join(', ')]);
  if (criteria.socialCategories?.length) rows.push(['Social category', criteria.socialCategories.map(readable).join(', ')]);
  if (criteria.gender?.length) rows.push(['Gender', criteria.gender.map(readable).join(', ')]);
  return <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary"><ShieldCheck size={17} /></span><h2 className="display-font text-2xl">Published criteria</h2></div><p className="mt-2 text-sm leading-6 text-muted-foreground">These are the criteria recorded in this directory. Additional conditions may apply.</p>{rows.length ? <dl className="mt-5 divide-y divide-border">{rows.map(([label, value]) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-[175px_1fr]"><dt className="text-sm font-bold">{label}</dt><dd className="text-sm leading-6 text-muted-foreground">{value}</dd></div>)}</dl> : <p className="mt-5 rounded-xl bg-secondary/70 p-4 text-sm leading-6 text-muted-foreground">No structured eligibility criteria are listed in this record. Use the official information source to understand the current requirements.</p>}</section>;
}

export default function SchemeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const validId = Number.isInteger(id) && id > 0;
  const query = useGetScheme(validId ? id : 0, { query: { queryKey: getGetSchemeQueryKey(validId ? id : 0), enabled: validId } });
  const scheme = query.data;

  return <div className="page-wrap py-9 sm:py-12">
    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="link-back-directory"><ArrowLeft size={16} /> Scheme directory</Link>
    {!validId ? <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-border bg-card p-8 text-center"><CircleAlert className="mx-auto text-accent" size={28} /><h1 className="display-font mt-4 text-3xl">Scheme not found</h1><p className="mt-2 text-sm text-muted-foreground">This scheme address is not valid.</p><Link href="/" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground" data-testid="link-back-directory-invalid">Browse schemes</Link></div>
      : query.isLoading ? <div className="mx-auto mt-8 max-w-4xl animate-pulse"><div className="h-64 rounded-3xl bg-secondary" /><div className="mt-6 grid gap-4 md:grid-cols-2"><div className="h-52 rounded-2xl bg-secondary" /><div className="h-52 rounded-2xl bg-secondary" /></div></div>
      : query.isError ? <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-border bg-card p-8 text-center"><CircleAlert className="mx-auto text-accent" size={28} /><h1 className="display-font mt-4 text-3xl">We couldn’t load this scheme</h1><p className="mt-2 text-sm text-muted-foreground">The information service may be temporarily unavailable.</p><button onClick={() => query.refetch()} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground" data-testid="button-retry-scheme">Try again</button></div>
      : !scheme ? <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-border bg-card p-8 text-center"><h1 className="display-font text-3xl">Scheme not available</h1><p className="mt-2 text-sm text-muted-foreground">This record is not available in the directory.</p></div>
      : <SchemeContent scheme={scheme} />}
  </div>;
}

function SchemeContent({ scheme }: { scheme: Scheme }) {
  let verified = 'Date not provided';
  if (scheme.lastVerifiedAt && !Number.isNaN(Date.parse(scheme.lastVerifiedAt))) verified = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(scheme.lastVerifiedAt));
  return <div className="mx-auto mt-7 max-w-4xl">
    <section className="relative overflow-hidden rounded-3xl bg-primary px-6 py-8 text-primary-foreground sm:px-10 sm:py-11">
      <div className="paper-grid pointer-events-none absolute inset-0 opacity-10" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary-foreground/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.1em]">{scheme.category}</span><span className="rounded-full border border-primary-foreground/25 px-3 py-1.5 text-[11px] font-semibold">{scheme.governmentLevel === 'central' ? 'Central government' : 'State government'}</span>{scheme.demoData && <span className="rounded-full bg-[hsl(var(--accent))] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">Demo record</span>}</div>
        <h1 className="display-font mt-6 max-w-3xl text-4xl leading-[1.04] tracking-[-.04em] sm:text-6xl">{scheme.name}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 opacity-80">{scheme.intendedBeneficiaries?.length ? scheme.intendedBeneficiaries.join(' · ') : 'Review the published scheme information and criteria below.'}</p>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-primary-foreground/20 pt-5 text-xs opacity-80"><span className="inline-flex items-center gap-2"><MapPin size={14} />{scheme.regions?.length ? scheme.regions.join(', ') : 'Regions not listed'}</span><span className="inline-flex items-center gap-2"><CalendarDays size={14} />Information checked: {verified}</span></div>
      </div>
    </section>
    <div className="mt-5 flex gap-3 rounded-xl border border-[hsl(var(--accent))]/35 bg-[hsl(var(--accent))]/10 p-4 text-sm leading-6"><CircleAlert className="mt-0.5 shrink-0 text-accent" size={18} /><p>Results are for discovery guidance only and do not confirm eligibility. Scheme rules can change. Check the official government source before applying.</p></div>
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <DetailList title="What it offers" items={scheme.benefits} icon={ShieldCheck} />
      <Criteria scheme={scheme} />
      <DetailList title="Documents to prepare" items={scheme.requiredDocuments} icon={FileText} />
      <DetailList title="How to apply" items={scheme.applicationSteps} icon={ArrowUpRight} />
    </div>
    <section className="mt-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow">Continue with the source</p><h2 className="display-font mt-2 text-2xl">Check the latest official guidance</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Review details directly with the government department. This guide does not submit applications or collect application information.</p></div><div className="flex flex-col gap-2 sm:min-w-[210px]">
        {scheme.informationUrl && <a href={scheme.informationUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:bg-secondary" data-testid="link-official-information">Official information <ExternalLink size={15} /></a>}
        {scheme.applicationUrl && <a href={scheme.applicationUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90" data-testid="link-official-application">Visit application site <ArrowUpRight size={15} /></a>}
      </div></div>
      {(!scheme.informationUrl || !scheme.applicationUrl) && <p className="mt-4 text-xs text-muted-foreground">An official {scheme.informationUrl ? 'application' : scheme.applicationUrl ? 'information' : 'information and application'} link has not been provided in this record.</p>}
    </section>
    <p className="mt-4 text-xs text-muted-foreground">Directory record last checked: {verified}{scheme.demoData ? ' · This is marked as demo data.' : ''}</p>
  </div>;
}
