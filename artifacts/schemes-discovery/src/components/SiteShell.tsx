import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F5F9FC] text-[#203040]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AppHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
