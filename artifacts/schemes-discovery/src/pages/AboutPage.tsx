import {
  ArrowRight,
  CheckCircle2,
  Compass,
  ExternalLink,
  LayoutGrid,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'wouter';
import { OfficialSourceNotice } from '../components/OfficialSourceNotice';

export default function AboutPage() {
  return (
    <div className="page-wrap py-8 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-7">
        <section className="rounded-2xl bg-[#123E67] p-6 text-white sm:p-9 on-dark">
          <span className="inline-block rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#DCEFFA]">
            About Suvidha
          </span>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            Clear, trusted government scheme discovery for Assam
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#DCEFFA]">
            Suvidha brings Assam State and Central government schemes into one accessible, plain-language portal so citizens can easily see what support may fit their needs and go straight to official department portals.
          </p>
        </section>

        <OfficialSourceNotice />

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-[#1769AA]/20 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEFFA] text-[#1769AA]">
                <CheckCircle2 size={20} aria-hidden="true" />
              </span>
              <h2 className="text-xl font-extrabold text-[#123E67]">
                How Suvidha works
              </h2>
            </div>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-[#203040]">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1769AA]" />
                <span>
                  <strong>Search and browse:</strong> Find schemes by keyword, category, region, or government level.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1769AA]" />
                <span>
                  <strong>Guided matching:</strong> Answer a few plain-language questions to see which schemes appear to fit and which official rules still need checking.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1769AA]" />
                <span>
                  <strong>Direct official links:</strong> Every scheme lists benefits, required documents, application steps, last-verified date, and official links.
                </span>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[#1769AA]/20 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEFFA] text-[#1769AA]">
                <ShieldCheck size={20} aria-hidden="true" />
              </span>
              <h2 className="text-xl font-extrabold text-[#123E67]">
                Privacy &amp; verification standards
              </h2>
            </div>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-[#203040]">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1769AA]" />
                <span>
                  <strong>No sensitive personal data:</strong> Suvidha never asks for Aadhaar numbers, bank details, exact addresses, or account sign-ups.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1769AA]" />
                <span>
                  <strong>Official sources only:</strong> Scheme records reference official Assam department portals, myScheme, and central ministry websites with visible verification dates.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1769AA]" />
                <span>
                  <strong>Guidance, not approval:</strong> Applications are submitted directly on official government websites, and final eligibility is decided by the responsible department.
                </span>
              </li>
            </ul>
          </section>
        </div>

        <section className="rounded-2xl border border-[#1769AA]/25 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-[#123E67]">
                Ready to explore Assam schemes?
              </h2>
              <p className="mt-1 text-base text-[#203040]">
                Start with a quick guided check or browse the full verified catalogue.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/find"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1769AA] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#123E67]"
              >
                <Compass size={17} aria-hidden="true" />
                Start guided search
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/browse"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-[#1769AA] bg-white px-5 py-2.5 text-sm font-bold text-[#1769AA] hover:bg-[#DCEFFA] hover:text-[#123E67]"
              >
                <LayoutGrid size={17} aria-hidden="true" />
                Browse all schemes
              </Link>
              <a
                href="https://www.myscheme.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#1769AA]/25 bg-[#F5F9FC] px-4 py-2.5 text-sm font-bold text-[#123E67] hover:bg-[#DCEFFA]"
              >
                myScheme Portal
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
