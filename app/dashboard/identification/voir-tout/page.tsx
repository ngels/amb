'use client';

import React from 'react';
import { DashboardNav } from '@/src/components/ui/DashboardNav';
import { useTranslation } from '@/src/i18n/useTranslation';

export default function VoirToutPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="p-6">
        <h1 className="text-2xl font-bold">{t('identification.voirTout') || 'Voir tout'}</h1>
        <p className="mt-2 text-sm text-gray-600">{t('identification.listIntro') || 'View all identifications.'}</p>
      </main>
    </div>
  );
}
