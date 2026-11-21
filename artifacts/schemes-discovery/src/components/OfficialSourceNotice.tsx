import { Info } from 'lucide-react';
import { Link } from 'wouter';
import { GUIDANCE_NOTE } from '../lib/schemes';

export function OfficialSourceNotice({
  showAboutLink = false,
  className = '',
}: {
  showAboutLink?: boolean;
  className?: string;
}) {
  return (
    <aside
      aria-label="Guidance notice"
      className={`rounded-2xl border border-[#1769AA]/25 bg-[#DCEFFA]/65 px-5 py-4 text-[#123E67] ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Info size={20} className="mt-0.5 shrink-0 text-[#1769AA]" aria-hidden="true" />
          <p className="text-base leading-relaxed font-medium text-[#203040]">{GUIDANCE_NOTE}</p>
        </div>
        {showAboutLink && (
          <Link
            href="/about"
            className="inline-flex shrink-0 items-center font-bold text-[#1769AA] underline underline-offset-4 hover:text-[#123E67]"
            data-testid="link-notice-about"
          >
            About this service
          </Link>
        )}
      </div>
    </aside>
  );
}
