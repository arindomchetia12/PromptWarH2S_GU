import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="page-wrap py-16">
      <div className="mx-auto max-w-lg rounded-2xl border border-[#1769AA]/25 bg-white p-8 text-center shadow-xs">
        <AlertCircle size={40} className="mx-auto text-[#1769AA]" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-extrabold text-[#123E67]">Page not found</h1>
        <p className="mt-2 text-base text-[#203040]">
          We couldn’t find the page you were looking for.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1769AA] px-5 py-2.5 text-base font-bold text-white hover:bg-[#123E67]"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Go to Home
          </Link>
          <Link
            href="/browse"
            className="inline-flex min-h-11 items-center rounded-xl border border-[#1769AA] bg-white px-5 py-2.5 text-base font-bold text-[#1769AA] hover:bg-[#DCEFFA]"
          >
            Browse schemes
          </Link>
        </div>
      </div>
    </div>
  );
}
