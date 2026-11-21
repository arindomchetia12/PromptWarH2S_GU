import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Database,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { Link } from 'wouter';
import { OfficialSourceNotice } from '../components/OfficialSourceNotice';

interface SchemeSyncItem {
  id: number;
  name: string;
  category: string;
  governmentLevel: 'central' | 'state';
  informationUrl: string;
  applicationUrl: string;
  isApprovedOfficialSource: boolean;
  sourceDomain: string;
  lastVerifiedAt: string | null;
  daysSinceVerified: number | null;
  changeDetected: boolean;
  needsHumanReview: boolean;
  reviewReasons: string[];
}

interface SyncFlowReport {
  triggerType: 'scheduled' | 'manual';
  lastRunAt: string;
  nextScheduledRunAt: string;
  totalSchemesChecked: number;
  approvedSourcesCount: number;
  upToDateCount: number;
  flaggedForHumanReviewCount: number;
  pipelineSteps: {
    step: number;
    name: string;
    status: string;
    detail: string;
  }[];
  items: SchemeSyncItem[];
}

const WEBHOOK_FLOW_NODES = [
  { title: 'Website form', detail: 'Citizen answers guided questions on Suvidha' },
  { title: 'Webhook', detail: 'Receives answers securely at /api/webhook/match' },
  { title: 'Edit Fields', detail: 'Cleans, trims, and organizes profile answers' },
  { title: 'Database', detail: 'Fetches active scheme records from Supabase' },
  { title: 'Code / If', detail: 'Evaluates transparent, deterministic eligibility rules' },
  { title: 'Sort', detail: 'Ranks Potential matches first, then More information needed' },
  { title: 'Format', detail: 'Creates plain-language explanations and application steps' },
  { title: 'Respond to Webhook', detail: 'Returns structured guidance to the website' },
];

export default function AboutPage() {
  const [report, setReport] = useState<SyncFlowReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningSync, setRunningSync] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSyncStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/schemes/sync-status');
      if (!res.ok) throw new Error('Could not fetch sync status');
      setReport(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load sync report.');
    } finally {
      setLoading(false);
    }
  };

  const triggerManualSync = async () => {
    setRunningSync(true);
    setError(null);
    try {
      const res = await fetch('/api/schemes/sync-check', { method: 'POST' });
      if (!res.ok) throw new Error('Sync check failed');
      setReport(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to run sync check.');
    } finally {
      setRunningSync(false);
    }
  };

  useEffect(() => {
    loadSyncStatus();
  }, []);

  return (
    <div className="page-wrap py-8 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-2xl bg-[#123E67] p-6 text-white sm:p-9 on-dark">
          <span className="inline-block rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#DCEFFA]">
            About Suvidha
          </span>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            Clear, trusted government scheme discovery for Assam
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#DCEFFA]">
            Suvidha brings Assam State and Central government schemes into one accessible, plain-language portal. We explain why a scheme might fit and link directly to official department websites.
          </p>
        </section>

        <OfficialSourceNotice />

        {/* Two Workflow Pipelines */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Flow 1: Guided Matching Webhook Flow */}
          <section className="rounded-2xl border border-[#1769AA]/25 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEFFA] text-[#1769AA]">
                  <Workflow size={20} aria-hidden="true" />
                </span>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#1769AA]">
                    Flow 1 · Real-time
                  </span>
                  <h2 className="text-xl font-extrabold text-[#123E67]">
                    Guided Matching Webhook Flow
                  </h2>
                </div>
              </div>
            </div>

            <ol className="mt-5 space-y-2">
              {WEBHOOK_FLOW_NODES.map((node, index) => (
                <li key={node.title}>
                  <div className="rounded-xl border border-[#1769AA]/20 bg-[#F5F9FC] px-4 py-2.5">
                    <p className="text-sm font-extrabold text-[#123E67]">
                      {index + 1}. {node.title}
                    </p>
                    <p className="text-sm text-[#203040]">{node.detail}</p>
                  </div>
                  {index < WEBHOOK_FLOW_NODES.length - 1 && (
                    <div className="flex justify-center py-0.5 text-[#1769AA]" aria-hidden="true">
                      <ArrowDown size={15} />
                    </div>
                  )}
                </li>
              ))}
            </ol>

            <div className="mt-5">
              <Link
                href="/find"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1769AA] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#123E67]"
              >
                Try the guided matching flow
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>

          {/* Flow 2: Scheduled Official Source Sync & Human Review Flow */}
          <section className="rounded-2xl border border-[#1769AA]/25 bg-white p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEFFA] text-[#1769AA]">
                  <CalendarClock size={20} aria-hidden="true" />
                </span>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#1769AA]">
                    Flow 2 · Scheduled
                  </span>
                  <h2 className="text-xl font-extrabold text-[#123E67]">
                    Official Source Sync & Human Review
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={triggerManualSync}
                disabled={runningSync}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1769AA] px-4 py-2 text-sm font-bold text-white hover:bg-[#123E67] disabled:opacity-60"
                data-testid="button-run-sync-check"
              >
                <RefreshCw
                  size={15}
                  className={runningSync ? 'animate-spin' : ''}
                  aria-hidden="true"
                />
                {runningSync ? 'Checking sources…' : 'Run sync check'}
              </button>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">
                {error}
              </p>
            )}

            {loading && !report ? (
              <div className="mt-5 space-y-3 animate-pulse">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-[#F5F9FC]" />
                ))}
              </div>
            ) : (
              report && (
                <>
                  <ol className="mt-5 space-y-2">
                    {report.pipelineSteps.map((step, index) => (
                      <li key={step.step}>
                        <div className="rounded-xl border border-[#1769AA]/20 bg-[#F5F9FC] px-4 py-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-extrabold text-[#123E67]">
                              {step.step}. {step.name}
                            </p>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#DCEFFA] px-2.5 py-0.5 text-xs font-bold text-[#123E67]">
                              <CheckCircle2 size={12} className="text-[#1769AA]" />
                              Done
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-[#203040]">{step.detail}</p>
                        </div>
                        {index < report.pipelineSteps.length - 1 && (
                          <div className="flex justify-center py-0.5 text-[#1769AA]" aria-hidden="true">
                            <ArrowDown size={15} />
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-[#F5F9FC] p-3">
                      <p className="text-2xl font-extrabold text-[#123E67]">
                        {report.totalSchemesChecked}
                      </p>
                      <p className="text-xs font-semibold text-[#203040]">Checked</p>
                    </div>
                    <div className="rounded-xl bg-[#DCEFFA]/70 p-3">
                      <p className="text-2xl font-extrabold text-[#1769AA]">
                        {report.approvedSourcesCount}
                      </p>
                      <p className="text-xs font-semibold text-[#123E67]">Approved sources</p>
                    </div>
                    <div className="rounded-xl bg-[#F5F9FC] p-3">
                      <p className="text-2xl font-extrabold text-[#123E67]">
                        {report.flaggedForHumanReviewCount}
                      </p>
                      <p className="text-xs font-semibold text-[#203040]">Human review flags</p>
                    </div>
                  </div>
                </>
              )
            )}
          </section>
        </div>

        {/* Live Verification Audit Table */}
        {report && (
          <section className="rounded-2xl border border-[#1769AA]/25 bg-white p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Database size={20} className="text-[#1769AA]" aria-hidden="true" />
                <h2 className="text-xl font-extrabold text-[#123E67]">
                  Catalogue Official Source & Human Review Status
                </h2>
              </div>
              <p className="text-xs font-semibold text-[#203040]/75">
                Last checked: {new Date(report.lastRunAt).toLocaleString('en-IN')} ({report.triggerType})
              </p>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#1769AA]/20 text-xs font-extrabold uppercase tracking-wider text-[#123E67]">
                    <th className="py-3 pr-4">Scheme</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Official Source</th>
                    <th className="py-3 pr-4">Last Verified</th>
                    <th className="py-3">Review Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1769AA]/10">
                  {report.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F5F9FC]">
                      <td className="py-3 pr-4 font-bold text-[#123E67]">
                        <Link href={`/schemes/${item.id}`} className="hover:underline">
                          {item.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-[#203040]">{item.category}</td>
                      <td className="py-3 pr-4">
                        <a
                          href={item.informationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#1769AA] hover:underline"
                        >
                          {item.sourceDomain}
                          <ExternalLink size={13} aria-hidden="true" />
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-[#203040]">
                        {item.lastVerifiedAt ?? 'Not set'}
                      </td>
                      <td className="py-3">
                        {item.needsHumanReview ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
                            <AlertTriangle size={13} aria-hidden="true" />
                            Needs human review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCEFFA] px-3 py-1 text-xs font-extrabold text-[#123E67]">
                            <ShieldCheck size={13} className="text-[#1769AA]" aria-hidden="true" />
                            Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
