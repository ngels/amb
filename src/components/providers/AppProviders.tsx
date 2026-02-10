'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import { LanguageProvider } from '@/src/i18n/LanguageContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1d4ed8',
            borderRadius: 6,
            fontFamily: 'var(--font-geist-sans, sans-serif)',
          },
          components: {
            Button: {
              controlHeight: 36,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </LanguageProvider>
  );
}
