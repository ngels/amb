'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/src/i18n/useTranslation';
import { signout } from '@/src/services/authService';

export const DashboardNav: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <nav className="w-full bg-white border-b py-3 px-4 flex items-center justify-between">
      <div className="text-lg font-semibold">Dashboard</div>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((s) => !s)}
          className="px-3 py-2 bg-blue-600 text-white rounded-md"
        >
          {t('dashboard.identification')}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
            <button
              onClick={() => go('/dashboard/identification/commencer')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              {t('identification.commencer')}
            </button>
            <button
              onClick={() => go('/dashboard/identification/voir-tout')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              {t('identification.voirTout')}
            </button>
              <div className="border-t mt-2" />
              <button
                onClick={async () => {
                  setOpen(false)
                  const confirmed = window.confirm(
                    t('auth.signout_confirm')
                  );
                  if (!confirmed) return;
                  try {
                    await signout();
                  } catch (e) {
                    // ignore errors, still navigate to sign-in
                  }
                  router.replace('/signin');
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                {t('auth.signout')}
              </button>
          </div>
        )}
      </div>
    </nav>
  );
};
