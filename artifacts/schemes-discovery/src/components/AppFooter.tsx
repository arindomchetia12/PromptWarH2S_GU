import { Link } from 'wouter';
import { RhinoLogo } from './RhinoLogo';

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-[#1769AA]/20 bg-white">
      <div className="page-wrap py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <RhinoLogo size={40} className="mt-0.5 shrink-0 rounded-[10px]" />
            <div>
              <p className="text-lg font-extrabold text-[#1769AA]">Suvidha</p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#203040]/80">
                Details are for discovery guidance. Confirm rules with the official department before applying.
              </p>
            </div>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base font-semibold">
            <Link href="/" className="whitespace-nowrap text-[#1769AA] hover:text-[#123E67] hover:underline">
              Home
            </Link>
            <Link href="/browse" className="whitespace-nowrap text-[#1769AA] hover:text-[#123E67] hover:underline">
              Browse schemes
            </Link>
            <Link href="/find" className="whitespace-nowrap text-[#1769AA] hover:text-[#123E67] hover:underline">
              Find schemes for me
            </Link>
            <Link
              href="/about"
              className="whitespace-nowrap text-[#1769AA] hover:text-[#123E67] hover:underline"
              data-testid="footer-link-about"
            >
              About this service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
