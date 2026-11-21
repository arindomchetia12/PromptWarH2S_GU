import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Link } from 'wouter';

export function DiscoveryChoiceCard({
  eyebrow,
  title,
  description,
  buttonLabel,
  href,
  icon: Icon,
  primary = false,
  testId,
}: {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  icon: LucideIcon;
  primary?: boolean;
  testId?: string;
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border p-6 shadow-xs transition-shadow hover:shadow-md sm:p-7 ${
        primary
          ? 'border-[#1769AA]/30 bg-white'
          : 'border-[#1769AA]/20 bg-white'
      }`}
    >
      <div>
        <div className="flex items-center gap-3">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              primary ? 'bg-[#1769AA] text-white' : 'bg-[#DCEFFA] text-[#1769AA]'
            }`}
          >
            <Icon size={24} aria-hidden="true" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">
            {eyebrow}
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-[#123E67]">{title}</h2>
        <p className="mt-2 text-base leading-relaxed text-[#203040]">{description}</p>
      </div>

      <div className="mt-6">
        <Link
          href={href}
          className={`inline-flex min-h-12 items-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition-colors ${
            primary
              ? 'bg-[#1769AA] text-white hover:bg-[#123E67]'
              : 'border-2 border-[#1769AA] bg-white text-[#1769AA] hover:bg-[#DCEFFA] hover:text-[#123E67]'
          }`}
          data-testid={testId}
        >
          {buttonLabel}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
