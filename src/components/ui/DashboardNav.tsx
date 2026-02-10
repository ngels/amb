'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/src/i18n/useTranslation';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { signout } from '@/src/services/authService';
import { Button, Divider, Dropdown } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [permissions, setPermissions] = useState<string | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<string | null>(null);

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

  const refreshUserContext = useCallback(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('userPermissions') : null;
      const parsed = parseStoredPermissions(raw);
      setPermissions(parsed);
    } catch (err) {
      console.error('Error refreshing permissions', err);
    }
    syncProfileCompletion();
  }, [syncProfileCompletion]);

  const handleMenuOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      refreshUserContext();
    }
    setMenuOpen(nextOpen);
  };

  const go = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };
  const isNormalUser = permissions === 'user';
  const shouldShowContinue = isNormalUser && (profileCompletion === '0' || profileCompletion === '2');
  const shouldDisableStart =
    isNormalUser && ['1', '3', '4'].includes(profileCompletion ?? '');
  const identificationStartLabel = shouldShowContinue
    ? t('identification.continuer') || 'Continuer'
    : t('identification.commencer');


  const handleSignOut = async () => {
    setMenuOpen(false);
    const confirmed = window.confirm(t('auth.signout_confirm'));
    if (!confirmed) return;
    try {
      await signout();
    } catch (err) {
      // ignore signout errors
    }
    router.replace('/signin');
  };

  const dropdownContent = (
    <div className="w-56 bg-white border rounded shadow-md z-50 py-2">
      <Button
        type="text"
        block
        onClick={() => go('/dashboard/identification/commencer')}
        disabled={shouldDisableStart}
        className="flex justify-start px-4 py-2 text-gray-900"
      >
        {identificationStartLabel}
      </Button>
      {permissions && permissions !== 'user' && (
        <Button
          type="text"
          block
          onClick={() => go('/dashboard/identification/voir-tout')}
          className="flex justify-start px-4 py-2 text-gray-900"
        >
          {t('identification.voirTout')}
        </Button>
      )}
      <Divider className="my-2" style={{ margin: '8px 0' }} />
      <LanguageSwitcher variant="menu" />
      <Divider className="my-2" style={{ margin: '8px 0' }} />
      <Button
        type="text"
        danger
        block
        onClick={handleSignOut}
        className="flex justify-start px-4 py-2"
      >
        {t('auth.signout')}
      </Button>
    </div>
  );

  return (
    <nav className="w-full bg-white border-b py-3 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src="/amb_vers.png"  onClick={() => router.push('/dashboard')}alt="AMB" width={220} height={100} priority />
      </div>
      <div className="flex items-center gap-2">
        <Dropdown
          trigger={['click']}
          placement="bottomLeft"
          open={menuOpen}
          onOpenChange={handleMenuOpenChange}
          popupRender={() => dropdownContent}
        >
          <Button
            type="primary"
            icon={<MenuOutlined />}
            className="!px-3"
            aria-label={t('dashboard.openMenu') || 'Open menu'}
          />
        </Dropdown>
      </div>
    </nav>
  );
};
