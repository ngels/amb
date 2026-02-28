'use client';

import type { AppProps } from 'next/app';
import '../app/globals.css';
import { AppProviders } from '@/src/components/providers/AppProviders';

export default function AmbApp({ Component, pageProps }: AppProps) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
