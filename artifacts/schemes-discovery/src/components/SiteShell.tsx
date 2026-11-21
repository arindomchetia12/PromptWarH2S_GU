import { Link, useLocation } from 'wouter';
import { ArrowUpRight, Landmark, Menu, Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export function SiteShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const homeActive = location === '/';
  const findActive = location === '/find';

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="border-b border-border bg-[hsl(var(--secondary))] px-4 py-2 text-center text-xs font-medium text-secondary-foreground">
        A clear starting point for public support. Always confirm details with the official source.
      </div>
      <header className="relative z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="page-wrap flex h-[76px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3 rounded-md" data-testid="link-brand-home">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Landmark size={20} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-bold tracking-[-0.03em]">SchemeSathi</span>
              <span className="block text-[11px] text-muted-foreground">Find support that fits</span>
            </span>
          </Link>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border md:hidden" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} data-testid="button-toggle-navigation">
            <Menu size={19} />
          </button>
          <nav aria-label="Main navigation" className={`${menuOpen ? 'absolute left-0 right-0 top-[76px] flex border-b border-border bg-background px-5 py-4 shadow-lg' : 'hidden'} flex-col gap-2 md:static md:flex md:flex-row md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            <Link href="/" onClick={() => setMenuOpen(false)} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${homeActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`} data-testid="link-browse-schemes">
              <Search size={16} /> Browse schemes
            </Link>
            <Link href="/find" onClick={() => setMenuOpen(false)} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${findActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`} data-testid="link-find-matches">
              Find my matches <ArrowUpRight size={15} />
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t border-border bg-[hsl(var(--secondary))]/55">
        <div className="page-wrap flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-foreground">SchemeSathi <span className="font-normal text-muted-foreground">· Public schemes, made clearer.</span></p>
          <p>Information can change. Verify eligibility and deadlines with the official department.</p>
        </div>
      </footer>
    </div>
  );
}
