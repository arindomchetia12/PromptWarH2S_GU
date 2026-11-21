import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import { RhinoLogo } from './RhinoLogo';

export function AppHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState('en');

  const navItems = [
    { href: '/', label: 'Home', active: location === '/' },
    {
      href: '/browse',
      label: 'Browse schemes',
      active: location.startsWith('/browse') || location.startsWith('/schemes'),
    },
    { href: '/find', label: 'Find schemes for me', active: location.startsWith('/find') },
    { href: '/about', label: 'About', active: location.startsWith('/about') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1769AA]/15 bg-white/95 shadow-[0_1px_4px_rgba(18,62,103,0.06)] backdrop-blur">
      <div className="page-wrap flex h-[74px] items-center justify-between gap-4">
        {/* Brand lockup with official Suvidha rhino logo */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="inline-flex shrink-0 items-center gap-3 rounded-xl py-1 pr-2 whitespace-nowrap"
          data-testid="link-brand-home"
        >
          <RhinoLogo size={44} className="shrink-0 shadow-xs rounded-[11px]" />
          <span className="flex flex-col leading-none">
            <span className="text-[22px] font-extrabold tracking-tight text-[#1769AA]">
              Suvidha
            </span>
            <span className="mt-1 h-[2.5px] w-16 rounded-full bg-[#DCEFFA]" aria-hidden="true" />
          </span>
        </Link>

        {/* Desktop navigation — single-row, non-wrapping */}
        <div className="hidden items-center gap-2 lg:flex">
          <nav aria-label="Main navigation" className="flex items-center gap-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={`inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-xl px-4 text-[15px] font-bold transition-colors ${
                  item.active
                    ? 'bg-[#1769AA] text-white shadow-2xs'
                    : 'text-[#203040] hover:bg-[#DCEFFA] hover:text-[#123E67]'
                }`}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-2 pl-3 border-l border-[#1769AA]/15">
            <div className="relative inline-flex items-center">
              <Globe
                size={15}
                className="pointer-events-none absolute left-3 text-[#1769AA]"
                aria-hidden="true"
              />
              <label htmlFor="desktop-language-select" className="sr-only">
                Language selector
              </label>
              <select
                id="desktop-language-select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="h-10 w-[92px] cursor-pointer appearance-none rounded-xl border border-[#1769AA]/30 bg-[#F5F9FC] pl-8 pr-7 text-sm font-bold text-[#123E67] transition-colors hover:border-[#1769AA] hover:bg-[#DCEFFA]/50"
                data-testid="select-language"
              >
                <option value="en">EN</option>
                <option value="as" disabled>
                  অসমীয়া (Soon)
                </option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-2.5 text-[#1769AA]"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Mobile / tablet controls */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="relative inline-flex items-center">
            <Globe
              size={15}
              className="pointer-events-none absolute left-2.5 text-[#1769AA]"
              aria-hidden="true"
            />
            <label htmlFor="mobile-language-select" className="sr-only">
              Select language
            </label>
            <select
              id="mobile-language-select"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="h-10 w-[86px] cursor-pointer appearance-none rounded-xl border border-[#1769AA]/30 bg-[#F5F9FC] pl-8 pr-6 text-sm font-bold text-[#123E67]"
              aria-label="Language"
            >
              <option value="en">EN</option>
              <option value="as" disabled>
                অসমীয়া
              </option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2 text-[#1769AA]"
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#1769AA]/25 bg-[#F5F9FC] text-[#123E67] hover:bg-[#DCEFFA]"
            data-testid="button-toggle-navigation"
          >
            {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Collapsible mobile menu */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-[#1769AA]/15 bg-white px-4 py-3 shadow-lg lg:hidden"
        >
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={item.active ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center rounded-xl px-4 text-base font-bold transition-colors ${
                  item.active
                    ? 'bg-[#1769AA] text-white'
                    : 'text-[#203040] hover:bg-[#DCEFFA] hover:text-[#123E67]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
