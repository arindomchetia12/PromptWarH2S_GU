import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import FindPage from './pages/FindPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import AboutPage from './pages/AboutPage';
import { SiteShell } from './components/SiteShell';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <RoutedErrorBoundary>
      <SiteShell>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/browse" component={BrowsePage} />
          <Route path="/find" component={FindPage} />
          <Route path="/schemes/:id" component={SchemeDetailPage} />
          <Route path="/about" component={AboutPage} />
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
