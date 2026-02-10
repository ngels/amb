'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/src/i18n/useTranslation';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { signout } from '@/src/services/authService';

const parseStoredPermissions = (value: string | null): string | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      const first = parsed[0];
      return typeof first === 'string' ? first : null;
    }
    if (typeof parsed === 'string') return parsed;
    if (typeof parsed === 'object' && parsed !== null) {
      const maybeRole = (parsed as Record<string, any>).role || (parsed as Record<string, any>).name;
      return typeof maybeRole === 'string' ? maybeRole : null;
    }
  } catch (e) {
    // Ignore JSON parse errors and treat as plain string
  }
  return value;
};

export const DashboardNav: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState<string | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  const syncProfileCompletion = useCallback(() => {
    try {
      const completionValue = typeof window !== 'undefined' ? localStorage.getItem('profileCompleteStatus') : null;
      setProfileCompletion(completionValue);
    } catch (err) {
      console.error('Error reading profile completion from storage', err);
      setProfileCompletion(null);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
   
    try {
      const storedPermissions = parseStoredPermissions(localStorage.getItem('userPermissions'));
      if (storedPermissions) {
        setPermissions(storedPermissions);
      }
    } catch (err) {
      console.error('Error reading permissions from storage', err);
    }
    syncProfileCompletion();
  }, [syncProfileCompletion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleCustomEvent = () => syncProfileCompletion();
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'profileCompleteStatus') {
        syncProfileCompletion();
      }
    };

    window.addEventListener('profile-completion-changed', handleCustomEvent as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('profile-completion-changed', handleCustomEvent as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncProfileCompletion]);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const toggleMenu = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('userPermissions') : null;
      const parsed = parseStoredPermissions(raw);
      setPermissions(parsed);
    } catch (err) {
      console.error('Error refreshing permissions', err);
    }
    syncProfileCompletion();
    setOpen((prev) => !prev);
  };
  const isNormalUser = permissions === 'user';
  const shouldShowContinue = isNormalUser && (profileCompletion === '0' || profileCompletion === '2');
  const shouldDisableStart =
    isNormalUser && ['1', '3', '4'].includes(profileCompletion ?? '');
  const identificationStartLabel = shouldShowContinue
    ? t('identification.continuer') || 'Continuer'
    : t('identification.commencer');


  const handleSignOut = async () => {
    setOpen(false);
    const confirmed = window.confirm(t('auth.signout_confirm'));
    if (!confirmed) return;
    try {
      await signout();
    } catch (err) {
      // ignore signout errors
    }
    router.replace('/signin');
  };

  return (
    <nav className="w-full bg-white border-b py-3 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src="/amb_vers.png"  onClick={() => router.push('/dashboard')}alt="AMB" width={220} height={100} priority />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={ref}>
          <button
            onClick={toggleMenu}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium border-0"
          >
            {t('dashboard.identification')}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
              <button
                onClick={() => go('/dashboard/identification/commencer')}
                disabled={shouldDisableStart}
                className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                {identificationStartLabel}
              </button>
              {permissions && permissions !== 'user' && (
                <button
                  onClick={() => go('/dashboard/identification/voir-tout')}
                  className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100"
                >
                  {t('identification.voirTout')}
                </button>
              )}
              <div className="border-t mt-2" />
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                {t('auth.signout')}
              </button>
            </div>
          )}
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
};
