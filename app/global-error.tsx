"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
          <div>
            <p className="text-sm font-semibold text-blue-600">Unexpected error</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Something went wrong</h1>
            <p className="mt-3 text-base text-gray-600">
              Our team has been notified. You can try again, or head back to the dashboard.
            </p>
            {error?.digest && (
              <p className="mt-2 text-xs text-gray-400">Reference: {error.digest}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700"
            >
              Try again
            </button>
            <a
              href="/dashboard"
              className="rounded border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Go to dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
