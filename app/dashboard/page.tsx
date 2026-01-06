'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardNav } from '@/src/components/ui/DashboardNav';
import { BASE_URL } from '@/config';
import { useTranslation } from '@/src/i18n/useTranslation';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Simple auth guard: call backend to validate session. If unauthorized,
    // redirect to sign-in. Adjust endpoint as needed on backend.
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, { credentials: 'include' });
        if (!res.ok) {
          router.replace('/signin');
        }
      } catch (e) {
        router.replace('/signin');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">{t('dashboard.title') || 'Dashboard'}</h1>
        <p className="text-sm text-gray-600">{t('dashboard.welcome') || 'Welcome to your dashboard.'}</p>
      </main>
    </div>
  );
}
