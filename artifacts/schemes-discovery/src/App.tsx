import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getListSchemesQueryOptions } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import FindPage from './pages/FindPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import AboutPage from './pages/AboutPage';
import NotFound from '@/pages/not-found';
import { SiteShell } from './components/SiteShell';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Start fetching the scheme catalogue immediately at app startup so every route is instant
queryClient.prefetchQuery(getListSchemesQueryOptions(undefined));

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [location]);
  return null;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <ScrollToTop />
      <SiteShell>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/browse" component={BrowsePage} />
          <Route path="/browse/" component={BrowsePage} />
          <Route path="/find" component={FindPage} />
          <Route path="/find/" component={FindPage} />
          <Route path="/schemes/:id" component={SchemeDetailPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/about/" component={AboutPage} />
          <Route component={NotFound} />
        </Switch>
      </SiteShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
